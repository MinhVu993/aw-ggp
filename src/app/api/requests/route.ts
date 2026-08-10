import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const empno = searchParams.get('empno');
    
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
        ORDER BY r.created_at DESC
        LIMIT 100
      `;
      
      const result = await client.query(query);
      
      const mappedData = result.rows.map(row => {
        let statusNum = 1;
        if (row.status === 'APPROVED_WAITING_GATE') statusNum = 2;
        if (row.status === 'REJECTED') statusNum = 3;
        if (row.status === 'RETURNED') statusNum = 4;
        if (row.status === 'COMPLETED') statusNum = 5;
        
        return {
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
      });

      return NextResponse.json({ success: true, data: mappedData });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error in GET /api/requests:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let client;
  try {
    const body = await request.json();
    const { 
      requesterId, 
      requesterEmpno,
      requesterName,
      requesterDept,
      destination, 
      startDate, 
      endDate, 
      carrierEmpno, 
      carrierName, 
      items,
      flowSnapshot,
      title,
      reason
    } = body;

    client = await pool.connect();
    
    // Start transaction
    await client.query('BEGIN');
    
    // Generate request_no (e.g., GGP-20231118-0001)
    const dateStr = new Date().toISOString().replace(/-/g, '').slice(0, 8);
    const countRes = await client.query(`SELECT COUNT(*) FROM goods_out_requests WHERE request_no LIKE $1`, [`GGP-${dateStr}-%`]);
    const count = parseInt(countRes.rows[0].count, 10) + 1;
    const requestNo = `GGP-${dateStr}-${count.toString().padStart(4, '0')}`;
    
    const applicantEmpno = requesterEmpno || '000000';
    const applicantName = requesterName || 'Unknown';
    const applicantDept = requesterDept || 'Unknown';
    
      // Ensure column exists
      await client.query('ALTER TABLE goods_out_requests ADD COLUMN IF NOT EXISTS flow_snapshot JSONB;');

      const insertRequestQuery = `
        INSERT INTO goods_out_requests (
          request_no, applicant_empno, applicant_name, applicant_dept, destination,
          request_date, start_date, end_date, carrier_empno, carrier_name, status, flow_snapshot
        ) VALUES (
          $1, $2, $3, $4, $5,
          CURRENT_DATE, $6, $7, $8, $9, 'PENDING_DEPT', $10
        ) RETURNING request_id
      `;
      
      const reqValues = [
        requestNo, applicantEmpno, applicantName, applicantDept, destination,
        startDate || new Date(), endDate || new Date(), carrierEmpno || '', carrierName || '',
        JSON.stringify(flowSnapshot || [])
      ];
    
    const requestRes = await client.query(insertRequestQuery, reqValues);
    const requestId = requestRes.rows[0].request_id;
    
    if (items && items.length > 0) {
      for (const item of items) {
        await client.query(`
          INSERT INTO goods_out_items (request_id, item_name, quantity, unit, purpose)
          VALUES ($1, $2, $3, $4, $5)
        `, [requestId, item.name, parseFloat(item.quantity) || 1, item.unit || 'Cái', item.purpose || reason || '']);
      }
    }
    
    await client.query(`
      INSERT INTO goods_out_destinations (destination_name)
      VALUES ($1)
      ON CONFLICT (destination_name) DO NOTHING
    `, [destination]);

    await client.query('COMMIT');
    
    return NextResponse.json({ success: true, requestId });
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error('Error in POST /api/requests:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}
