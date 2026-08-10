import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

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

    const approverName = body.approverName || String(approverId) || '';
    const approverRole = body.approverRole || '';

    // Log the action
    await client.query(`
      INSERT INTO goods_out_approval_logs (request_id, step_level, step_name, approver_empno, approver_name, approver_role, action, comment)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [requestId, stepLevel, stepName, String(approverId), approverName, approverRole, approve ? 'APPROVE' : 'REJECT', rejectReason || '']);

    let updateQuery = '';
    let params: any[] = [];

    if (approve) {
      updateQuery = `UPDATE goods_out_requests SET status = $1, current_lvl = $2 WHERE request_id = $3 RETURNING *`;
      params = [newStatus, nextLvl, requestId];
    } else {
      updateQuery = `UPDATE goods_out_requests SET status = $1, reject_reason = $2 WHERE request_id = $3 RETURNING *`;
      params = [newStatus, rejectReason, requestId];
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
