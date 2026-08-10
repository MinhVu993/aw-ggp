const fs = require('fs');

const contextPath = 'c:\\Users\\vu.huynh\\Desktop\\GGP\\src\\context\\LanguageContext.tsx';
let content = fs.readFileSync(contextPath, 'utf8');

const newTranslations = `
  // Missing Translations Added
  err_load_data: { vi: 'Không thể tải danh sách dữ liệu!', en: 'Failed to load data list!', zh: '无法加载数据列表！' },
  please_fill_required_fields: { vi: 'Vui lòng điền Nơi mang đến!', en: 'Please fill Destination!', zh: '请填写目的地！' },
  please_add_at_least_one_item: { vi: 'Vui lòng nhập ít nhất 1 vật liệu!', en: 'Please add at least 1 item!', zh: '请至少添加一件物品！' },
  confirm_cancel_request: { vi: 'Xác nhận hủy đơn', en: 'Confirm Cancel Request', zh: '确认取消请求' },
  confirm_cancel_desc: { vi: 'Bạn có chắc chắn muốn hủy yêu cầu này không? Hành động này không thể hoàn tác.', en: 'Are you sure you want to cancel this request? This action cannot be undone.', zh: '您确定要取消此请求吗？此操作无法撤销。' },
  btn_approve: { vi: 'Phê duyệt', en: 'Approve', zh: '批准' },
  btn_reject: { vi: 'Từ chối', en: 'Reject', zh: '拒绝' },
  confirm_approve_request: { vi: 'Bạn có chắc chắn muốn phê duyệt yêu cầu này?', en: 'Are you sure you want to approve this request?', zh: '您确定要批准此请求吗？' },
  others: { vi: 'vật khác', en: 'others', zh: '其他' },
  rejection_reason: { vi: 'LÝ DO TỪ CHỐI', en: 'REJECTION REASON', zh: '拒绝原因' },
  view_history: { vi: 'Xem lộ trình', en: 'View History', zh: '查看历史' },
  export_csv: { vi: 'Xuất CSV', en: 'Export CSV', zh: '导出 CSV' },
  details: { vi: 'Chi tiết', en: 'Details', zh: '详情' },
  renew: { vi: 'Gia hạn / Copy đơn', en: 'Renew / Copy Request', zh: '续签 / 复制请求' },
  print: { vi: 'In Phiếu', en: 'Print', zh: '打印' },
  destination: { vi: 'Nơi mang đến', en: 'Destination', zh: '目的地' },
  placeholder_destination: { vi: 'Nhập địa điểm mang đến', en: 'Enter destination', zh: '输入目的地' },
  note: { vi: 'Ghi chú thêm', en: 'Additional Note', zh: '附加备注' },
  placeholder_note: { vi: 'Nhập ghi chú hoặc giải trình thêm (nếu có)...', en: 'Enter notes or further explanations (if any)...', zh: '输入备注或进一步说明（如有）...' },
  items_list: { vi: 'Danh sách Vật liệu', en: 'Items List', zh: '物品清单' },
  item_name: { vi: 'Tên vật tư', en: 'Item Name', zh: '物品名称' },
  quantity: { vi: 'Số lượng', en: 'Quantity', zh: '数量' },
  unit: { vi: 'Đơn vị tính', en: 'Unit', zh: '单位' },
  purpose: { vi: 'Mục đích', en: 'Purpose', zh: '用途' },
  no_item_data: { vi: 'Không có dữ liệu vật tư chi tiết', en: 'No detailed item data', zh: '没有详细的物品数据' },
  renewed_by: { vi: 'Đã gia hạn bởi', en: 'Renewed by', zh: '续签者' },
  approval_history: { vi: 'Lộ trình & Lịch sử phê duyệt', en: 'Approval History & Routing', zh: '审批历史和路由' },
  qr_expired: { vi: 'Mã QR đã hết hạn!', en: 'QR Code has expired!', zh: '二维码已过期！' },
  qr_used: { vi: 'Mã QR này đã được sử dụng trước đó!', en: 'This QR Code has been used before!', zh: '此二维码已被使用过！' },
  qr_success: { vi: 'Quét mã thành công!', en: 'QR Scanned successfully!', zh: '二维码扫描成功！' },
  gate_confirm_success: { vi: 'Đã xác nhận cho qua cổng thành công!', en: 'Gate confirmation successful!', zh: '放行确认成功！' },
  guard_title: { vi: 'Cổng An Ninh - Kiểm soát Hàng ra', en: 'Security Gate - Goods Out Control', zh: '安检门 - 货物出门控制' },
  guard_subtitle: { vi: 'Hướng camera vào mã QR trên Phiếu Mang Hàng', en: 'Point camera at the QR code on the Goods Out Pass', zh: '将摄像头对准放行条上的二维码' },
  processing: { vi: 'Đang xử lý...', en: 'Processing...', zh: '处理中...' },
  scanner_mode: { vi: 'Chế độ Máy quét cầm tay', en: 'Handheld Scanner Mode', zh: '手持扫描仪模式' },
  scanner_hint: { vi: 'Vui lòng cắm máy quét (USB/Bluetooth) và quét mã QR trên phiếu. Hệ thống đang lắng nghe...', en: 'Please plug in the scanner (USB/Bluetooth) and scan the QR code. System is listening...', zh: '请插入扫描仪（USB/蓝牙）并扫描放行条上的二维码。系统正在监听...' },
  scanner_placeholder: { vi: 'Nhấp vào đây và dùng máy quét...', en: 'Click here and use scanner...', zh: '点击此处并使用扫描仪...' },
  ticket_details: { vi: 'Chi tiết phiếu', en: 'Ticket Details', zh: '工单详情' },
  valid: { vi: 'HỢP LỆ', en: 'VALID', zh: '有效' },
  invalid: { vi: 'KHÔNG HỢP LỆ', en: 'INVALID', zh: '无效' },
  applicant: { vi: 'Người mang', en: 'Applicant', zh: '申请人' },
  qr_expiry: { vi: 'Hạn mã QR', en: 'QR Expiry', zh: '二维码有效期' },
  confirm_gate: { vi: 'XÁC NHẬN QUA CỔNG', en: 'CONFIRM GATE PASS', zh: '确认放行' },
`;

// Insert the new translations before the end of the TRANSLATIONS object
content = content.replace('};\\n\\ninterface LanguageContextType', newTranslations + '};\\n\\ninterface LanguageContextType');
fs.writeFileSync(contextPath, content, 'utf8');
console.log('Language context updated');
