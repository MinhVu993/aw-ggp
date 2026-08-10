import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

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
          (
            SELECT json_agg(
              json_build_object(
                'id', i.item_id,
                'name', i.item_name,
                'quantity', i.quantity,
                'unit', i.unit,
                'purpose', i.purpose
              )
            )
            FROM goods_out_items i
            WHERE i.request_id = r.request_id
          ) as items
        FROM goods_out_requests r
        WHERE r.request_id = $1
      `;
      
      const result = await client.query(query, [id]);
      
      if (result.rows.length === 0) {
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
        requestDate: new Date(row.request_date).toISOString().split('T')[0],
        startDate: new Date(row.start_date).toISOString().split('T')[0],
        endDate: new Date(row.end_date).toISOString().split('T')[0],
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
        approvalLogs: []
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
