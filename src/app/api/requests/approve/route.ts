import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  let client;
  try {
    const body = await request.json();
    const { requestId, approve, rejectReason, approverId } = body;

    if (!requestId) {
      return NextResponse.json({ success: false, error: 'requestId is required' }, { status: 400 });
    }

    client = await pool.connect();
    await client.query('BEGIN');

    // Update the request status
    await client.query('ALTER TABLE goods_out_requests ADD COLUMN IF NOT EXISTS flow_snapshot JSONB;');
    await client.query("ALTER TABLE goods_out_requests ADD COLUMN IF NOT EXISTS current_lvl VARCHAR(50) DEFAULT 'dept_manager'");
    await client.query('ALTER TABLE goods_out_requests ADD COLUMN IF NOT EXISTS qr_code VARCHAR(255);');

    let query = 'SELECT status, flow_snapshot, current_lvl FROM goods_out_requests WHERE request_id = $1';
    let reqRes = await client.query(query, [requestId]);
    
    if (reqRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    const row = reqRes.rows[0];
    const flowSnapshot = row.flow_snapshot || [];
    let currentLvl = row.current_lvl || 'dept_manager'; // Default fallback
    let newStatus = approve ? 'APPROVED_WAITING_GATE' : 'REJECTED';
    let nextLvl = currentLvl;

    let stepLevel = 1;
    let stepName = currentLvl;

    if (Array.isArray(flowSnapshot) && flowSnapshot.length > 0) {
      // Find current level index
      const currentIndex = flowSnapshot.findIndex((step: any) => step.lvl_code === currentLvl);
      if (currentIndex !== -1) {
        stepLevel = currentIndex + 1;
        stepName = flowSnapshot[currentIndex]?.lvl_name?.vi || flowSnapshot[currentIndex]?.lvl_name?.en || currentLvl;
        if (approve && currentIndex < flowSnapshot.length - 1) {
          // There is a next level
          nextLvl = flowSnapshot[currentIndex + 1].lvl_code;
          newStatus = 'PENDING_DEPT'; // Still pending approval
        }
      }
    }

    let approverEmpno = body.approverEmpno || body.empno || String(approverId || '');
    let approverName = body.approverName || body.name || '';
    let approverRole = body.approverRole || body.role || '';

    // Intelligently resolve full_name from flow_snapshot if approverName is missing or equal to empno
    if (Array.isArray(flowSnapshot) && flowSnapshot.length > 0) {
      const currentStepObj = flowSnapshot.find((step: any) => step.lvl_code === currentLvl) || flowSnapshot[stepLevel - 1];
      if (currentStepObj && Array.isArray(currentStepObj.managers) && currentStepObj.managers.length > 0) {
        const empQuery = approverEmpno.trim().toLowerCase();
        
        // Find matching manager or deputy
        const matchedManager = currentStepObj.managers.find((m: any) => 
          (m.empno && m.empno.toLowerCase() === empQuery) ||
          (m.group_empno && m.group_empno.toLowerCase() === empQuery) ||
          (m.name && m.name.toLowerCase() === empQuery) ||
          (m.deputies && m.deputies.some((d: any) => 
            (d.empno && d.empno.toLowerCase() === empQuery) ||
            (d.deputy_empno && d.deputy_empno.toLowerCase() === empQuery)
          ))
        );

        if (matchedManager) {
          approverName = matchedManager.full_name || matchedManager.name || approverName;
          approverEmpno = matchedManager.empno || matchedManager.group_empno || approverEmpno;
        } else if (!approverName || approverName === approverEmpno || approverName === 'Approver') {
          // Fallback to first manager in the current step
          approverName = currentStepObj.managers[0].full_name || currentStepObj.managers[0].name || approverName;
          if (!approverEmpno || approverEmpno === 'admin') {
            approverEmpno = currentStepObj.managers[0].empno || currentStepObj.managers[0].group_empno || approverEmpno;
          }
        }
      }
    }

    if (!approverName) approverName = approverEmpno || 'Approver';

    let updateQuery = '';
    let params: any[] = [];
    let qrToken = null;

    if (body.action === 'return') {
      newStatus = 'RETURNED';
      updateQuery = `UPDATE goods_out_requests SET status = $1, return_reason = $2 WHERE request_id = $3 RETURNING *`;
      params = [newStatus, body.returnReason || body.reason, requestId];
      
      await client.query(`
        INSERT INTO goods_out_approval_logs (request_id, step_level, step_name, approver_empno, approver_name, approver_role, action, comment)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [requestId, stepLevel, currentLvl, approverEmpno, approverName, approverRole, 'RETURN', body.returnReason || body.reason || '']);
    } else if (approve) {
      if (newStatus === 'APPROVED_WAITING_GATE') {
        qrToken = randomUUID();
        updateQuery = `UPDATE goods_out_requests SET status = $1, current_lvl = $2, qr_code = $3 WHERE request_id = $4 RETURNING *`;
        params = [newStatus, nextLvl, qrToken, requestId];
      } else {
        updateQuery = `UPDATE goods_out_requests SET status = $1, current_lvl = $2 WHERE request_id = $3 RETURNING *`;
        params = [newStatus, nextLvl, requestId];
      }

      await client.query(`
        INSERT INTO goods_out_approval_logs (request_id, step_level, step_name, approver_empno, approver_name, approver_role, action, comment)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [requestId, stepLevel, currentLvl, approverEmpno, approverName, approverRole, 'APPROVE', '']);
    } else {
      updateQuery = `UPDATE goods_out_requests SET status = $1, reject_reason = $2 WHERE request_id = $3 RETURNING *`;
      params = [newStatus, rejectReason || body.reason, requestId];

      await client.query(`
        INSERT INTO goods_out_approval_logs (request_id, step_level, step_name, approver_empno, approver_name, approver_role, action, comment)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [requestId, stepLevel, currentLvl, approverEmpno, approverName, approverRole, 'REJECT', rejectReason || body.reason || '']);
    }

    const result = await client.query(updateQuery, params);

    await client.query('COMMIT');
    
    return NextResponse.json({ success: true, message: 'Processed successfully', data: result.rows[0] });

  } catch (error: any) {
    if (client) await client.query('ROLLBACK');
    console.error('Error in POST /api/requests/approve:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error: ' + error.message, stack: error.stack }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}
