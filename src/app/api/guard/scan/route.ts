import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  let client;
  try {
    const body = await request.json();
    const { qrToken } = body;

    if (!qrToken || typeof qrToken !== 'string' || !qrToken.trim()) {
      return NextResponse.json({ success: false, error: 'Mã QR không hợp lệ' }, { status: 400 });
    }

    const token = qrToken.trim();
    client = await pool.connect();

    // Query request by qr_code or request_no or qr_code_token
    const query = `
      SELECT 
        r.*,
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
        ) as items
      FROM goods_out_requests r
      WHERE r.qr_code = $1 OR r.request_no = $1 OR r.qr_code_token = $1
      LIMIT 1
    `;

    const result = await client.query(query, [token]);

    if (result.rows.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: `Không tìm thấy đơn hàng nào trong hệ thống khớp với mã: ${token}` 
      }, { status: 404 });
    }

    const row = result.rows[0];

    const mappedData = {
      id: parseInt(row.request_id, 10),
      requestCode: row.request_no,
      applicantName: row.applicant_name,
      applicantEmpno: row.applicant_empno,
      applicantDept: row.applicant_dept,
      destination: row.destination,
      status: row.status, // 'APPROVED_WAITING_GATE', 'COMPLETED', etc.
      startDate: row.start_date_str || (row.start_date ? String(row.start_date).split('T')[0] : ''),
      endDate: row.end_date_str || (row.end_date ? String(row.end_date).split('T')[0] : ''),
      carrierEmpno: row.carrier_empno || '',
      carrierName: row.carrier_name || '',
      items: row.items || [],
      qrExpiresAt: row.end_date_str ? `${row.end_date_str}T23:59:59Z` : (row.end_date ? new Date(row.end_date).toISOString() : new Date(Date.now() + 86400000).toISOString()),
      isQrUsed: row.status === 'COMPLETED' || row.is_qr_used === true
    };

    return NextResponse.json({ success: true, data: mappedData });
  } catch (error: any) {
    console.error('Error in POST /api/guard/scan:', error);
    return NextResponse.json({ success: false, error: 'Lỗi máy chủ: ' + error.message }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}
