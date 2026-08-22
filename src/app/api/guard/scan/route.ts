import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  let client;
  try {
    const body = await request.json();
    const { qrToken, securityGuardEmpno, securityGuardName, gateName } = body;

    if (!qrToken || typeof qrToken !== 'string' || !qrToken.trim()) {
      return NextResponse.json({ success: false, error: 'Mã QR không hợp lệ' }, { status: 400 });
    }

    const token = qrToken.trim();
    
    // Tracking API Call (Non-blocking)
    try {
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
      fetch('http://gmo021.cansportsvg.com:10001/api/barcodes/scan', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          raw_content: token,
          source: 'AW-GGP',
          client_id: securityGuardEmpno || null,
          client_ip: ip,
          scan_source: request.headers.get('referer') || request.url
        }),
        signal: AbortSignal.timeout(5000)
      }).catch(e => {
        console.error('[QR SCAN] Barcode scan failed', e.message, { token });
      });
    } catch (e) {
      // Ignore sync errors during fetch setup
    }
    client = await pool.connect();

    // Ensure schema constraints are up-to-date
    await client.query(`
      CREATE TABLE IF NOT EXISTS goods_out_gate_scans (
        scan_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        request_id BIGINT NOT NULL REFERENCES goods_out_requests(request_id) ON DELETE CASCADE,
        security_guard_empno TEXT NOT NULL,
        security_guard_name TEXT NOT NULL,
        gate_name TEXT NOT NULL,
        scanned_qr_token TEXT NOT NULL,
        scan_result TEXT NOT NULL,
        note TEXT,
        scanned_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      ALTER TABLE goods_out_gate_scans DROP CONSTRAINT IF EXISTS goods_out_gate_scans_scan_result_check;
      ALTER TABLE goods_out_approval_logs DROP CONSTRAINT IF EXISTS goods_out_approval_logs_action_check;
    `);

    // Query request by qr_code or request_no or qr_code_token
    const query = `
      SELECT 
        r.*,
        to_char(r.start_date, 'YYYY-MM-DD') as start_date_str,
        to_char(r.end_date, 'YYYY-MM-DD') as end_date_str,
        to_char(CURRENT_DATE, 'YYYY-MM-DD') as today_str,
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
    const guardEmpno = securityGuardEmpno || '000000';
    const guardName = securityGuardName || 'Bảo vệ trực ca';
    const gate = gateName || 'Cổng Bảo Vệ';

    const isExpired = Boolean(row.end_date_str && row.end_date_str < row.today_str);
    const isTooEarly = Boolean(row.start_date_str && row.start_date_str > row.today_str);
    const isAlreadyPassed = row.status === 'COMPLETED' || row.is_qr_used === true;
    const isUnapproved = row.status !== 'APPROVED_WAITING_GATE';

    // Auto-record DENY LOG in database if the pass is not valid
    if (isExpired || isTooEarly || isAlreadyPassed || isUnapproved) {
      let denyReason = '';
      let scanResult = 'DENIED';

      if (isExpired) {
        denyReason = `TỪ CHỐI CHO QUA: Đơn đã hết hạn (Hạn chót: ${row.end_date_str})`;
        scanResult = 'EXPIRED';
      } else if (isTooEarly) {
        denyReason = `TỪ CHỐI CHO QUA: Chưa đến ngày hiệu lực (Bắt đầu từ: ${row.start_date_str})`;
        scanResult = 'TOO_EARLY';
      } else if (isAlreadyPassed) {
        denyReason = `TỪ CHỐI CHO QUA: Đơn đã được xác nhận qua cổng trước đó`;
        scanResult = 'ALREADY_USED';
      } else if (isUnapproved) {
        denyReason = `TỪ CHỐI CHO QUA: Đơn chưa hoàn tất phê duyệt (${row.status})`;
        scanResult = 'UNAPPROVED';
      }

      // Check if we logged the exact same deny within the last 30 seconds to prevent log spam
      const recentLogCheck = await client.query(`
        SELECT log_id FROM goods_out_approval_logs 
        WHERE request_id = $1 
          AND action = 'GATE_CHECK_DENIED' 
          AND created_at > NOW() - INTERVAL '30 seconds'
        LIMIT 1
      `, [row.request_id]);

      if (recentLogCheck.rows.length === 0) {
        // Insert to approval logs
        await client.query(`
          INSERT INTO goods_out_approval_logs (
            request_id, step_level, step_name, approver_empno, approver_name, approver_role, action, comment
          )
          VALUES ($1, 3, 'gate_check', $2, $3, 'SECURITY_GUARD', 'GATE_CHECK_DENIED', $4)
        `, [row.request_id, guardEmpno, guardName, denyReason]);

        // Insert to gate scans history
        await client.query(`
          INSERT INTO goods_out_gate_scans (
            request_id, security_guard_empno, security_guard_name, gate_name, scanned_qr_token, scan_result, note
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [row.request_id, guardEmpno, guardName, gate, token, scanResult, denyReason]);
      }
    }

    const mappedData = {
      id: parseInt(row.request_id, 10),
      requestCode: row.request_no,
      applicantName: row.applicant_name,
      applicantEmpno: row.applicant_empno,
      applicantDept: row.applicant_dept,
      destination: row.destination,
      status: row.status,
      startDate: row.start_date_str || (row.start_date ? String(row.start_date).split('T')[0] : ''),
      endDate: row.end_date_str || (row.end_date ? String(row.end_date).split('T')[0] : ''),
      carrierEmpno: row.carrier_empno || '',
      carrierName: row.carrier_name || '',
      items: row.items || [],
      qrExpiresAt: row.end_date_str ? `${row.end_date_str}T23:59:59Z` : (row.end_date ? new Date(row.end_date).toISOString() : new Date(Date.now() + 86400000).toISOString()),
      isQrUsed: isAlreadyPassed
    };

    return NextResponse.json({ success: true, data: mappedData });
  } catch (error: any) {
    console.error('Error in POST /api/guard/scan:', error);
    return NextResponse.json({ success: false, error: 'Lỗi máy chủ: ' + error.message }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}
