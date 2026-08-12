import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

function formatDateSafe(val: any): string {
  if (!val) return '';
  if (typeof val === 'string') {
    return val.split('T')[0];
  }
  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return String(val);
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Request ID is required' }, { status: 400 });
    }

    const client = await pool.connect();
    
    try {
      const query = `
        SELECT 
          r.*,
          to_char(r.request_date, 'YYYY-MM-DD') as request_date_str,
          to_char(r.start_date, 'YYYY-MM-DD') as start_date_str,
          to_char(r.end_date, 'YYYY-MM-DD') as end_date_str,
          (
            SELECT json_agg(
              json_build_object(
                'id', i.item_id,
                'name', i.item_name,
                'quantity', i.quantity,
                'unit', i.unit,
                'purpose', i.purpose,
                'images', COALESCE(i.images, '[]'::jsonb)
              )
            )
            FROM goods_out_items i
            WHERE i.request_id = r.request_id
          ) as items,
          (
            SELECT json_agg(
              json_build_object(
                'id', l.log_id,
                'stepLevel', l.step_level,
                'stepName', l.step_name,
                'lvlCode', l.step_name,
                'approverEmpno', l.approver_empno,
                'approverName', l.approver_name,
                'approverRole', l.approver_role,
                'action', l.action,
                'note', l.comment,
                'actedAt', to_char(l.created_at, 'YYYY-MM-DD HH24:MI:SS')
              )
              ORDER BY l.log_id ASC
            )
            FROM goods_out_approval_logs l
            WHERE l.request_id = r.request_id
          ) as approval_logs
        FROM goods_out_requests r
        WHERE r.request_id = $1
      `;
      
      const result = await client.query(query, [id]);
      
      if (result.rowCount === 0) {
        return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
      }

      const row = result.rows[0];
      
      let statusNum = 1;
      if (row.status === 'APPROVED_WAITING_GATE') statusNum = 2;
      if (row.status === 'REJECTED') statusNum = 3;
      if (row.status === 'RETURNED') statusNum = 4;
      if (row.status === 'COMPLETED') statusNum = 5;
      
      const mappedData = {
        id: parseInt(row.request_id, 10),
        requestCode: row.request_no,
        title: `Xin mang hàng ra cổng ${row.destination}`,
        reason: '', 
        requester_id: 0, 
        status: statusNum,
        requestDate: row.request_date_str || formatDateSafe(row.request_date),
        startDate: row.start_date_str || formatDateSafe(row.start_date),
        endDate: row.end_date_str || formatDateSafe(row.end_date),
        carrierEmpno: row.carrier_empno,
        carrierName: row.carrier_name,
        rejectReason: row.reject_reason,
        returnReason: row.return_reason,
        createdAt: row.created_at,
        requesterName: row.applicant_name,
        requesterEmpno: row.applicant_empno,
        requesterDept: row.applicant_dept,
        destination: row.destination,
        itemCount: row.items ? row.items.length : 0,
        items: row.items || [],
        currentLvlCode: row.current_lvl || (row.status === 'PENDING_DEPT' ? 'dept_manager' : 'ps_manager'), 
        flowSnapshot: row.flow_snapshot || [], 
        approvalLogs: row.approval_logs || [],
        qrCode: row.qr_code
      };

      return NextResponse.json({ success: true, data: mappedData });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`Error in GET /api/requests/[id]:`, error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  let client;
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Request ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const {
      destination, startDate, endDate, carrierEmpno, carrierName, reason,
      items, flowSnapshot
    } = body;

    client = await pool.connect();
    await client.query('BEGIN');

    // Check if the request exists and is RETURNED
    const checkRes = await client.query('SELECT status FROM goods_out_requests WHERE request_id = $1', [id]);
    if (checkRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    // Update the request
    const updateQuery = `
      UPDATE goods_out_requests
      SET 
        destination = $1,
        start_date = $2,
        end_date = $3,
        carrier_empno = $4,
        carrier_name = $5,
        status = 'PENDING_DEPT',
        return_reason = NULL,
        reject_reason = NULL,
        resubmitted_at = NOW(),
        flow_snapshot = $6,
        current_lvl = 'dept_manager'
      WHERE request_id = $7
    `;
    await client.query(updateQuery, [
      destination, startDate, endDate, carrierEmpno, carrierName, 
      JSON.stringify(flowSnapshot || []), id
    ]);

    // Update items
    await client.query('DELETE FROM goods_out_items WHERE request_id = $1', [id]);
    
    if (items && items.length > 0) {
      for (const item of items) {
        await client.query(`
          INSERT INTO goods_out_items (request_id, item_name, quantity, unit, purpose)
          VALUES ($1, $2, $3, $4, $5)
        `, [id, item.name, parseFloat(item.quantity) || 1, item.unit || 'Cái', item.purpose || reason || '']);
      }
    }

    await client.query(`
      INSERT INTO goods_out_destinations (destination_name)
      VALUES ($1)
      ON CONFLICT (destination_name) DO NOTHING
    `, [destination]);

    await client.query('COMMIT');
    
    return NextResponse.json({ success: true, message: 'Updated and resubmitted successfully' });
  } catch (error: any) {
    if (client) await client.query('ROLLBACK');
    console.error('Error in PUT /api/requests/[id]:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error: ' + error.message }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}

