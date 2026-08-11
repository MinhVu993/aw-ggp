import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  let client;
  try {
    const body = await request.json();
    const { requestId, securityGuardEmpno, securityGuardName, gateName } = body;

    if (!requestId) {
      return NextResponse.json({ success: false, error: 'Thiếu mã đơn hàng (requestId)' }, { status: 400 });
    }

    client = await pool.connect();
    await client.query('BEGIN');

    // Check request exists and is in APPROVED_WAITING_GATE state
    const checkRes = await client.query(
      `SELECT request_id, request_no, status FROM goods_out_requests WHERE request_id = $1`,
      [requestId]
    );

    if (checkRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ success: false, error: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }

    const currentReq = checkRes.rows[0];
    if (currentReq.status === 'COMPLETED') {
      await client.query('ROLLBACK');
      return NextResponse.json({ success: false, error: 'Đơn hàng này đã được xác nhận qua cổng trước đó rồi' }, { status: 400 });
    }

    // Ensure columns exist
    await client.query(`
      ALTER TABLE goods_out_requests 
      ADD COLUMN IF NOT EXISTS is_qr_used BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS qr_used_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS gate_name TEXT;
    `);

    // Update request to COMPLETED
    await client.query(`
      UPDATE goods_out_requests 
      SET 
        status = 'COMPLETED',
        is_qr_used = true,
        qr_used_at = NOW(),
        gate_name = $1,
        updated_at = NOW()
      WHERE request_id = $2
    `, [gateName || 'Cổng Bảo Vệ', requestId]);

    // Insert approval / audit log
    const guardEmpno = securityGuardEmpno || '000000';
    const guardName = securityGuardName || 'Bảo vệ trực ca';

    await client.query(`
      INSERT INTO goods_out_approval_logs (
        request_id, step_level, step_name, approver_empno, approver_name, approver_role, action, comment
      )
      VALUES ($1, 3, 'gate_check', $2, $3, 'SECURITY_GUARD', 'GATE_CHECK_PASSED', 'Bảo vệ xác nhận hàng đã xuất qua cổng an toàn')
    `, [requestId, guardEmpno, guardName]);

    await client.query('COMMIT');

    return NextResponse.json({ 
      success: true, 
      message: `Xác nhận cho qua cổng thành công (Đơn ${currentReq.request_no})` 
    });
  } catch (error: any) {
    if (client) await client.query('ROLLBACK');
    console.error('Error in POST /api/guard/confirm:', error);
    return NextResponse.json({ success: false, error: 'Lỗi máy chủ: ' + error.message }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}
