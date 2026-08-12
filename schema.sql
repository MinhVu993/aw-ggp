-- =============================================================================
-- DATABASE SCHEMA: GOODS OUT MANAGEMENT SYSTEM (AW-GGP)
-- WORKFLOW: APPLICANT -> DEPT MANAGER -> DIVISION MANAGER (GENERATE QR) -> SECURITY GATE
-- FEATURES: 3 APPROVAL BUTTONS (APPROVE / RETURN / REJECT) + SECURITY QR CODE
-- Database Engine: PostgreSQL 15+
-- =============================================================================

-- Clean up existing tables if re-running
DROP TABLE IF EXISTS goods_out_units CASCADE;
DROP TABLE IF EXISTS goods_out_destinations CASCADE;
DROP TABLE IF EXISTS goods_out_gate_scans CASCADE;
DROP TABLE IF EXISTS goods_out_approval_logs CASCADE;
DROP TABLE IF EXISTS goods_out_items CASCADE;
DROP TABLE IF EXISTS goods_out_requests CASCADE;

-- -----------------------------------------------------------------------------
-- 1. BẢNG MASTER: PHIẾU MANG HÀNG RA NGOÀI (goods_out_requests)
-- Hỗ trợ 3 nút thao tác duyệt: DUYỆT (Approve) / TRẢ VỀ (Return) / TỪ CHỐI (Reject)
-- -----------------------------------------------------------------------------
CREATE TABLE goods_out_requests (
  request_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  request_no TEXT NOT NULL UNIQUE, -- Mã phiếu hiển thị (ví dụ: GGP-20231118-0001)
  
  -- Thông tin người nộp & đơn vị mang ra cổng (Auth Session)
  applicant_empno TEXT NOT NULL,      -- Mã nhân viên người tạo (ví dụ: '045231')
  applicant_name TEXT NOT NULL,       -- Họ tên người tạo (ví dụ: 'Nguyen Van A')
  applicant_dept TEXT NOT NULL,       -- Đơn vị mang ra cổng (攜出單位 - ví dụ: 'PCC')
  
  -- Địa điểm mang đến
  destination TEXT NOT NULL,          -- Địa điểm mang đến (攜往地方)
  
  -- ---------------------------------------------------------------------------
  -- TRẠNG THÁI LUỒNG DUYỆT (WORKFLOW STATUS)
  -- 1: PENDING_DEPT          (Chờ Chủ quản đơn vị duyệt)
  -- 2: PENDING_DIVISION      (Chờ Chủ quản cấp sở duyệt)
  -- 3: APPROVED_WAITING_GATE (Chủ quản cấp sở đã duyệt -> ĐÃ SINH MÃ QR -> CHỜ RA CỔNG)
  -- 4: COMPLETED             (Bảo vệ đã quét QR & xác nhận cho qua cổng)
  -- 5: RETURNED              (Người duyệt TRẢ VỀ yêu cầu người tạo sửa lại)
  -- 6: REJECTED              (Bị TỪ CHỐI hoàn toàn bởi người duyệt)
  -- ---------------------------------------------------------------------------
  status TEXT NOT NULL DEFAULT 'PENDING_DEPT' 
    CHECK (status IN ('DRAFT', 'PENDING_DEPT', 'PENDING_DIVISION', 'APPROVED_WAITING_GATE', 'COMPLETED', 'RETURNED', 'REJECTED')),
  current_step INT NOT NULL DEFAULT 1 CHECK (current_step BETWEEN 0 AND 4),
  
  -- Lý do Trả về / Từ chối
  return_reason TEXT,                 -- Lý do yêu cầu chỉnh sửa (Nút TRẢ VỀ)
  reject_reason TEXT,                 -- Lý do bác bỏ đơn (Nút TỪ CHỐI)
  resubmitted_at TIMESTAMPTZ,         -- Thời điểm người tạo gửi lại sau khi sửa đơn
  
  -- ---------------------------------------------------------------------------
  -- QUẢN LÝ MÃ QR CODE (Sinh tự động khi CHỦ QUẢN CẤP SỞ duyệt)
  -- ---------------------------------------------------------------------------
  qr_code_token TEXT UNIQUE,                 -- Token duy nhất của Mã QR (VD: QR-GGP-20231118-X8F9A)
  qr_generated_at TIMESTAMPTZ,               -- Mốc thời gian Cấp sở duyệt & sinh mã QR
  qr_expires_at TIMESTAMPTZ,                 -- Hạn sử dụng của Mã QR (ví dụ: 23:59 ngày đăng ký)
  
  -- Trạng thái quét mã tại cổng Bảo vệ
  is_qr_used BOOLEAN NOT NULL DEFAULT false, -- True khi Bảo vệ đã quét và duyệt qua cổng
  qr_used_at TIMESTAMPTZ,                    -- Mốc thời gian thực tế Bảo vệ quét xác nhận qua cổng
  gate_name TEXT,                            -- Tên cổng Bảo vệ xác nhận (ví dụ: Cổng chính Nhà máy 1)
  
  -- Thời gian
  request_date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Người mang hàng (Carrier)
  carrier_empno TEXT NOT NULL DEFAULT '',
  carrier_name TEXT NOT NULL DEFAULT '',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes tối ưu tra cứu nhanh
CREATE INDEX idx_goods_out_requests_applicant_empno ON goods_out_requests(applicant_empno);
CREATE INDEX idx_goods_out_requests_status ON goods_out_requests(status);
CREATE INDEX idx_goods_out_requests_qr_token ON goods_out_requests(qr_code_token) WHERE qr_code_token IS NOT NULL;
CREATE INDEX idx_goods_out_requests_created_at ON goods_out_requests(created_at DESC);

-- -----------------------------------------------------------------------------
-- 2. BẢNG DETAIL: CHI TIẾT VẬT LIỆU MANG RA (goods_out_items)
-- -----------------------------------------------------------------------------
CREATE TABLE goods_out_items (
  item_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  request_id BIGINT NOT NULL REFERENCES goods_out_requests(request_id) ON DELETE CASCADE,
  
  item_name TEXT NOT NULL,               -- Tên vật liệu (物品名稱)
  quantity NUMERIC(12, 3) NOT NULL CHECK (quantity > 0), -- Số lượng (數量)
  unit TEXT DEFAULT 'Cái',                -- Đơn vị tính (Cái, Bộ, Kg, Lô...)
  purpose TEXT NOT NULL,                  -- Mục đích (用途)
  images JSONB DEFAULT '[]'::jsonb,       -- Danh sách URL ảnh đính kèm nhiều góc chụp
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_goods_out_items_request_id ON goods_out_items(request_id);

-- -----------------------------------------------------------------------------
-- 3. BẢNG NHẬT KÝ PHÊ DUYỆT WORKFLOW (goods_out_approval_logs)
-- Ghi lại mọi lịch sử thao tác 3 Nút: DUYỆT (APPROVE), TRẢ VỀ (RETURN), TỪ CHỐI (REJECT) & GỬI LẠI (RESUBMIT)
-- -----------------------------------------------------------------------------
CREATE TABLE goods_out_approval_logs (
  log_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  request_id BIGINT NOT NULL REFERENCES goods_out_requests(request_id) ON DELETE CASCADE,
  
  -- Cấp duyệt: 0=Người tạo gửi lại, 1=Chủ quản đơn vị, 2=Chủ quản cấp sở, 3=Bảo vệ tại cổng
  step_level INT NOT NULL CHECK (step_level IN (0, 1, 2, 3)),
  step_name TEXT NOT NULL, -- 'NGƯỜI TẠO ĐƠN', 'CHỦ QUẢN ĐƠN VỊ', 'CHỦ QUẢN CẤP SỞ', 'BẢO VỆ XÁC NHẬN CỔNG'
  
  -- Thông tin người thực hiện duyệt từ Auth Session
  approver_empno TEXT NOT NULL,  -- Mã nhân viên người duyệt/người thao tác
  approver_name TEXT NOT NULL,   -- Họ tên người duyệt
  approver_role TEXT NOT NULL,   -- Chức danh
  
  -- Hành động thao tác (3 Nút Duyệt + Gửi lại)
  action TEXT NOT NULL CHECK (action IN ('APPROVE', 'RETURN', 'REJECT', 'RESUBMIT', 'GATE_CHECK_PASSED')),
  comment TEXT,                  -- Ý kiến chỉ đạo / Lý do trả về / Lý do từ chối
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_approval_logs_request_id ON goods_out_approval_logs(request_id);
CREATE INDEX idx_approval_logs_approver_empno ON goods_out_approval_logs(approver_empno);

-- -----------------------------------------------------------------------------
-- 4. BẢNG NHẬT KÝ QUÉT QR CODE TẠI CỔNG BẢO VỆ (goods_out_gate_scans)
-- -----------------------------------------------------------------------------
CREATE TABLE goods_out_gate_scans (
  scan_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  request_id BIGINT NOT NULL REFERENCES goods_out_requests(request_id) ON DELETE CASCADE,
  
  -- Thông tin Bảo vệ thực hiện quét (Auth Session)
  security_guard_empno TEXT NOT NULL,  -- Mã NV bảo vệ
  security_guard_name TEXT NOT NULL,   -- Họ tên bảo vệ
  
  gate_name TEXT NOT NULL,              -- Vị trí cổng (ví dụ: Cổng Chính - Nhà máy 1)
  scanned_qr_token TEXT NOT NULL,       -- Chuỗi Token đọc từ kính quét QR
  scan_result TEXT NOT NULL CHECK (scan_result IN ('PASSED', 'EXPIRED', 'ALREADY_USED', 'INVALID_TOKEN')),
  note TEXT,                            -- Ghi chú đối soát (ví dụ: Vật liệu đúng 100% theo phiếu)
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_gate_scans_request_id ON goods_out_gate_scans(request_id);
CREATE INDEX idx_gate_scans_guard_empno ON goods_out_gate_scans(security_guard_empno);
CREATE INDEX idx_gate_scans_scanned_at ON goods_out_gate_scans(scanned_at DESC);

-- -----------------------------------------------------------------------------
-- 5. BẢNG MASTER: DANH MỤC NƠI MANG ĐẾN (goods_out_destinations)
-- -----------------------------------------------------------------------------
CREATE TABLE goods_out_destinations (
  destination_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  destination_name TEXT NOT NULL UNIQUE,  -- Tên địa điểm mang đến (ví dụ: Nhà máy 2, Kho Cát Lái...)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed dữ liệu địa điểm mặc định
INSERT INTO goods_out_destinations (destination_name) VALUES
  ('Nhà máy 2 (NM2)'),
  ('Kho Ngoại quan Cát Lái'),
  ('Công ty TNHH Bao Bì Việt Nam'),
  ('Văn phòng đại diện TP.HCM')
ON CONFLICT (destination_name) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 6. BẢNG MASTER: DANH MỤC ĐƠN VỊ TÍNH (goods_out_units)
-- -----------------------------------------------------------------------------
CREATE TABLE goods_out_units (
  unit_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  unit_name TEXT NOT NULL UNIQUE,  -- Tên đơn vị tính (ví dụ: Cái, Bộ, Kg, Thùng...)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed dữ liệu đơn vị tính mặc định
INSERT INTO goods_out_units (unit_name) VALUES
  ('Cái'),
  ('Bộ'),
  ('Chiếc'),
  ('Kg'),
  ('Hộp'),
  ('Thùng'),
  ('Cuộn'),
  ('Thanh'),
  ('Tấm'),
  ('Bao'),
  ('Gói'),
  ('Chai'),
  ('Lít'),
  ('Mét'),
  ('PCS'),
  ('SET'),
  ('BOX'),
  ('ROLL'),
  ('KG')
ON CONFLICT (unit_name) DO NOTHING;



