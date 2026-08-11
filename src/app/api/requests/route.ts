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
          approvalLogs: row.approval_logs || [],
          qrCode: row.qr_code
        };
      });

      // Calculate next request code in format GGP-YYMM-0001 (e.g., GGP-2608-0001)
      const now = new Date();
      const yy = String(now.getFullYear()).slice(-2);
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const prefix = `GGP-${yy}${mm}-`;
      const nextCodeRes = await client.query(
        `SELECT request_no FROM goods_out_requests WHERE request_no LIKE $1 ORDER BY request_no DESC LIMIT 1`,
        [`${prefix}%`]
      );
      let nextSeq = 1;
      if (nextCodeRes.rows.length > 0 && nextCodeRes.rows[0].request_no) {
        const parts = nextCodeRes.rows[0].request_no.split('-');
        const lastNum = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(lastNum)) {
          nextSeq = lastNum + 1;
        }
      }
      const nextRequestCode = `${prefix}${nextSeq.toString().padStart(4, '0')}`;
      
      // Fetch master units list
      await client.query(`
        CREATE TABLE IF NOT EXISTS goods_out_units (
          unit_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          unit_name TEXT NOT NULL UNIQUE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);
      const unitsRes = await client.query(`SELECT unit_name FROM goods_out_units ORDER BY unit_name ASC`);
      const unitsList = unitsRes.rows.map(r => r.unit_name);

      return NextResponse.json({ success: true, data: mappedData, nextRequestCode, unitsList });
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
    
    // Generate request_no in format: GGP-YYMM-0001 (e.g., GGP-2608-0001)
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `GGP-${yy}${mm}-`;

    const maxRes = await client.query(
      `SELECT request_no FROM goods_out_requests WHERE request_no LIKE $1 ORDER BY request_no DESC LIMIT 1`,
      [`${prefix}%`]
    );
    let nextSeq = 1;
    if (maxRes.rows.length > 0 && maxRes.rows[0].request_no) {
      const parts = maxRes.rows[0].request_no.split('-');
      const lastNum = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastNum)) {
        nextSeq = lastNum + 1;
      }
    }
    const requestNo = `${prefix}${nextSeq.toString().padStart(4, '0')}`;
    
    const applicantEmpno = body.applicantEmpno || body.requesterEmpno || body.empno || '000000';
    const applicantName = body.applicantName || body.requesterName || body.full_name || body.name || 'Unknown';
    const applicantDept = body.applicantDept || body.requesterDept || body.dept || 'Unknown';
    
      // Ensure columns exist with default values
      await client.query('ALTER TABLE goods_out_requests ADD COLUMN IF NOT EXISTS flow_snapshot JSONB;');
      await client.query("ALTER TABLE goods_out_requests ADD COLUMN IF NOT EXISTS current_lvl VARCHAR(50) DEFAULT 'dept_manager';");
      await client.query('ALTER TABLE goods_out_requests ALTER COLUMN current_step SET DEFAULT 1;');

      const insertRequestQuery = `
        INSERT INTO goods_out_requests (
          request_no, applicant_empno, applicant_name, applicant_dept, destination,
          request_date, start_date, end_date, carrier_empno, carrier_name, status, flow_snapshot,
          current_step, current_lvl
        ) VALUES (
          $1, $2, $3, $4, $5,
          CURRENT_DATE, $6, $7, $8, $9, 'PENDING_DEPT', $10,
          1, 'dept_manager'
        ) RETURNING request_id
      `;
      
      const reqValues = [
        requestNo, applicantEmpno, applicantName, applicantDept, destination,
        startDate || new Date(), endDate || new Date(), carrierEmpno || '', carrierName || '',
        JSON.stringify(flowSnapshot || [])
      ];
    
    const requestRes = await client.query(insertRequestQuery, reqValues);
    const requestId = requestRes.rows[0].request_id;
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS goods_out_units (
        unit_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        unit_name TEXT NOT NULL UNIQUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    if (items && items.length > 0) {
      for (const item of items) {
        const uName = (item.unit || 'Cái').trim();
        await client.query(`
          INSERT INTO goods_out_items (request_id, item_name, quantity, unit, purpose)
          VALUES ($1, $2, $3, $4, $5)
        `, [requestId, item.name, parseFloat(item.quantity) || 1, uName, item.purpose || reason || '']);

        if (uName) {
          await client.query(`
            INSERT INTO goods_out_units (unit_name)
            VALUES ($1)
            ON CONFLICT (unit_name) DO NOTHING
          `, [uName]);
        }
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
