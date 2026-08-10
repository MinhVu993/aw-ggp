"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'vi' | 'en' | 'zh';

interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

export const TRANSLATIONS: Translations = {
  // Navigation & Common
  clear: { vi: 'Xóa nội dung', en: 'Clear search', zh: '清除搜索' },
  all: { vi: 'Tất cả', en: 'All', zh: '全部' },
  select_all: { vi: 'Chọn tất cả', en: 'Select All', zh: '全选' },
  in: { vi: 'VÀO', en: 'IN', zh: '进入' },
  out: { vi: 'RA', en: 'OUT', zh: '退出' },
  search: { vi: 'Tìm kiếm', en: 'Search', zh: '搜索' },
  status: { vi: 'Tình trạng', en: 'Status', zh: '状态' },
  created_at: { vi: 'Ngày tạo', en: 'Created At', zh: '创建时间' },
  confirm: { vi: 'Xác nhận', en: 'Confirm', zh: '确认' },
  loading: { vi: 'Đang tải...', en: 'Loading...', zh: '正在加载...' },
  loading_data: { vi: 'Đang tải dữ liệu...', en: 'Loading data...', zh: '正在加载数据...' },
  close: { vi: 'Đóng', en: 'Close', zh: '关闭' },
  cancel: { vi: 'Hủy', en: 'Cancel', zh: '取消' },
  save: { vi: 'Lưu thay đổi', en: 'Save Changes', zh: '保存更改' },
  dashboard: { vi: 'Bảng điều khiển', en: 'Dashboard', zh: '仪表板' },
  fac_facial_access_control: { vi: '[AW - GGP] - Phiếu Mang Hàng Ra Cổng', en: '[AW - GGP] - Good Gate Pass', zh: '[AW - GGP] - 物品攜出單' },
  col_action: { vi: 'Thao tác', en: 'Action', zh: '操作' },
  clear_filter: { vi: 'Xóa lọc', en: 'Clear Filter', zh: '清除筛选' },
  status_pending: { vi: 'Chưa xử lý', en: 'Pending', zh: '未处理' },

  // Dashboard Specific
  search_user_hint: { vi: 'Tìm theo tên, mã NV, bộ phận, khu vực...', en: 'Search name, ID, Dept, Area...', zh: '搜索姓名、工号、部门、区域...' },
  from: { vi: 'Từ', en: 'From', zh: '从' },
  to: { vi: 'Đến', en: 'To', zh: '至' },
  
  // Charts
  traffic_trend: { vi: 'Lưu lượng trong ngày', en: 'Traffic Trend', zh: '今日流量' },
  traffic_trend_desc: { vi: 'Số lượt ra/vào theo từng giờ', en: 'IN/OUT flow per hour', zh: '每小时进出次数' },
  auth_results: { vi: 'Kết quả nhận diện', en: 'Authentication Results', zh: '认证结果' },
  auth_results_desc: { vi: 'Tỷ lệ Thành công / Từ chối', en: 'Success vs Denied ratio', zh: '成功与拒绝比例' },
  status_success: { vi: 'Thành công', en: 'Success', zh: '成功' },
  status_denied: { vi: 'Từ chối', en: 'Denied', zh: '拒绝' },
  total: { vi: 'Tổng', en: 'Total', zh: '总额' },

  // System Notifications
  report: { vi: 'Báo cáo', en: 'Report', zh: '报告' },
  collapse: { vi: 'Thu gọn', en: 'Collapse', zh: '折叠' },
  success: { vi: 'Thành công', en: 'Success', zh: '已通过' },
  denied: { vi: 'Từ chối', en: 'Denied', zh: '已拒绝' },

  // Device Manager Specific
  all_areas: { vi: 'Tất cả khu vực', en: 'All Areas', zh: '所有区域' },
  device_name: { vi: 'Tên thiết bị', en: 'Device Name', zh: '设备名称' },
  time_start: { vi: 'Giờ bắt đầu', en: 'Start Time', zh: '开始时间' },
  time_end: { vi: 'Giờ kết thúc', en: 'End Time', zh: '结束时间' },
  conn_failed: { vi: 'Lỗi kết nối', en: 'Connection error', zh: '连接错误' },
  conn_server_failed: { vi: 'Không thể kết nối đến máy chủ API.', en: 'Could not connect to API server.', zh: '无法连接到 API 服务器。' },
  
  // Email Report Config

  // User Config Specific
  dept: { vi: 'Bộ phận', en: 'Department', zh: '部门' },
  resigned: { vi: 'Nghỉ việc', en: 'Resigned', zh: '离职' },
  emp_id: { vi: 'Mã NV', en: 'Empno', zh: '员工号' },
  note: { vi: 'Ghi chú', en: 'Note', zh: '备注' },
  permanent: { vi: 'Vĩnh viễn', en: 'Permanent', zh: '永久' },
  history_time: { vi: 'Thời gian', en: 'Time', zh: '时间' },

  // Bulk Permission Modal

  // Table Columns
  col_employee: { vi: 'Nhân viên', en: 'Name', zh: '员工' },
  col_dept: { vi: 'Bộ phận', en: 'Dept', zh: '部门' },
  col_device: { vi: 'Thiết bị', en: 'Device', zh: '设备' },
  renewed_by: { vi: 'Đã gia hạn bởi', en: 'Renewed by', zh: '已延长' },

  // Deny Reasons (Detailed)
  reason_unknown: { vi: 'Không nhận diện được', en: 'Unknown Face', zh: '未知面孔' },

  // Auth & Permissions

  // Report Modal
  export_config_desc: { vi: 'Cấu hình các tham số báo cáo trước khi xuất file', en: 'Configure report parameters before exporting', zh: '导出前配置报告参数' },
  export_format: { vi: 'Định dạng xuất', en: 'Export Format', zh: '导出格式' },
  export_now: { vi: 'Xuất báo cáo', en: 'Export', zh: '导出' },
  export_csv: { vi: 'Xuất CSV', en: 'Export CSV', zh: '导出 CSV' },

  // Area Users Modal
  area_access_list: { vi: 'Danh sách nhân sự được phép', en: 'Authorized Personnel List', zh: '授权人员名单' },
  no_users_found: { vi: 'Chưa có nhân sự nào được cấp quyền truy cập khu vực này.', en: 'No personnel have been granted access to this area yet.', zh: '尚未授权任何人员访问此区域。' },
  col_permission: { vi: 'Quyền hạn', en: 'Permissions', zh: '权限' },
  col_validity: { vi: 'Hiệu lực', en: 'Validity', zh: '有效期' },
  perm_in_out: { vi: 'Vào & Ra', en: 'In & Out', zh: '进 & 出' },
  perm_in_only: { vi: 'Chỉ vào', en: 'In Only', zh: '仅进' },
  perm_out_only: { vi: 'Chỉ ra', en: 'Out Only', zh: '仅出' },

  // Reason Modal

  // Human-in-the-loop manual audit
  audit_verification: { vi: 'Đối Soát Nhân Sự Thủ Công', en: 'Manual Audit Verification', zh: '人工审核验证' },
  audit_image_failed: { vi: 'Ảnh nhận diện sai (Hiện tại)', en: 'Incorrect Scan (Current)', zh: '识别错误图像 (当前)' },
  audit_similarity: { vi: 'Độ tương đồng', en: 'Similarity Rate', zh: '相似度' },
  audit_no_history: { vi: 'Không tìm thấy lịch sử nhận dạng thành công của người này.', en: 'No successful scan history found for this person.', zh: '未找到该人员的成功识别记录。' },
  audit_face8_not_found: { vi: 'Không tìm thấy dữ liệu trên Face 8', en: 'Data not found on Face 8', zh: '在 Face 8 上未找到数据' },
  audit_not_registered: { vi: 'Khuôn mặt chưa từng được đăng ký.', en: 'Face has not been registered yet.', zh: '该面孔尚未注册。' },
  audit_btn_correct: { vi: 'Đúng người (Bỏ qua)', en: 'Correct Person (Allow)', zh: '正确人员 (放行)' },
  audit_btn_wrong: { vi: 'Sai người (Cảnh báo)', en: 'Wrong Person (Alert)', zh: '错误人员 (警报)' },
  audit_loading: { vi: 'Đang tải dữ liệu đối soát...', en: 'Loading verification data...', zh: '正在加载审核 dữ liệu...' },
  audit_done: { vi: 'Đã Đối Soát', en: 'Audited', zh: '已审核' },
  audit_banner_prefix: { vi: 'Người này đã được đối soát: ', en: 'This person has been audited: ', zh: '此人已审核: ' },
  audit_status_correct: { vi: 'ĐÚNG NGƯỜI (Bỏ qua)', en: 'CORRECT PERSON (Allow)', zh: '正确人员 (放行)' },
  audit_status_wrong: { vi: 'SAI NGƯỜI (Cảnh báo)', en: 'WRONG PERSON (Alert)', zh: '错误人员 (警报)' },
  audit_at_time: { vi: ' vào lúc {time}', en: ' at {time}', zh: ' 于 {time}' },

  // Access Requests Specific translations
  access_request: { vi: 'Yêu cầu mới', en: 'New Request', zh: '新申请' },
  create_request: { vi: 'Tạo Yêu Cầu Mới', en: 'Create New Request', zh: '创建新申请' },
  status_draft: { vi: 'Bản nháp', en: 'Draft', zh: '草稿' },
  status_pending_appr: { vi: 'Chờ phê duyệt', en: 'Pending', zh: '待审批' },
  status_approved_appr: { vi: 'Đã phê duyệt', en: 'Approved', zh: '已批准' },
  status_rejected_appr: { vi: 'Từ chối', en: 'Rejected', zh: '已拒绝' },
  approver: { vi: 'Người duyệt', en: 'Approver', zh: '审批人' },
  reject_reason: { vi: 'Lý do từ chối', en: 'Reject Reason', zh: '拒绝原因' },
  btn_approve: { vi: 'Phê duyệt', en: 'Approve', zh: '批准' },
  btn_reject: { vi: 'Từ chối', en: 'Reject', zh: '拒绝' },
  others: { vi: 'vật tư khác', en: 'other items', zh: '项其他物品' },
  start_date: { vi: 'Ngày bắt đầu', en: 'Start Date', zh: '开始日期' },
  end_date: { vi: 'Ngày kết thúc', en: 'End Date', zh: '结束日期' },
  request_code: { vi: 'Mã đơn', en: 'Request ID', zh: '申请ID' },
  requester: { vi: 'Người tạo đơn', en: 'Requester', zh: '申请人' },
  refresh: { vi: 'Làm mới', en: 'Refresh', zh: '刷新' },
  details: { vi: 'Chi tiết', en: 'Details', zh: '详情' },
  remove_row: { vi: 'Xóa dòng', en: 'Remove row', zh: '删除行' },
  add_row: { vi: 'Thêm dòng', en: 'Add row', zh: '添加行' },
  btn_submit_request: { vi: 'Gửi yêu cầu', en: 'Submit', zh: '提交' },
  search_request_placeholder: { vi: 'Tìm kiếm theo tiêu đề, lý do...', en: 'Search by title, reason...', zh: '按标题、原因搜索...' },
  no_requests_found: { vi: 'Không có đơn yêu cầu', en: 'No requests found', zh: '未找到申请' },
  no_requests_found_desc: { vi: 'Chưa có đơn yêu cầu truy cập nào khớp với bộ lọc hoặc tìm kiếm.', en: 'No access requests found matching your filters or search.', zh: '未找到符合筛选或搜索条件的访问申请。' },
  request_create_success: { vi: 'Tạo đơn yêu cầu cấp quyền thành công!', en: 'Access request created successfully!', zh: '成功创建访问申请！' },
  request_create_failed: { vi: 'Gặp sự cố khi gửi đơn!', en: 'Problem occurred while submitting the request!', zh: '提交申请时发生问题！' },
  failed_to_load_details: { vi: 'Không thể tải chi tiết đơn!', en: 'Failed to load request details!', zh: '无法加载申请详情！' },
  confirm_approve_request: { vi: 'Bạn có chắc chắn muốn phê duyệt đơn này?', en: 'Are you sure you want to approve this request?', zh: '您确定要批准此申请吗？' },
  request_approve_success: { vi: 'Đã duyệt đơn và cấp quyền thành công!', en: 'Request approved and access granted successfully!', zh: '申请已批准，访问权限已成功授予！' },
  request_approve_failed: { vi: 'Gặp lỗi khi xử lý duyệt đơn!', en: 'Error occurred while processing approval!', zh: '处理审批时出错！' },
  please_enter_reject_reason: { vi: 'Vui lòng điền lý do từ chối đơn yêu cầu:', en: 'Please enter the reason for rejecting the request:', zh: '请输入拒绝申请的原因：' },
  request_reject_success: { vi: 'Đã từ chối đơn yêu cầu!', en: 'Request rejected successfully!', zh: '申请已成功拒绝！' },
  flow_loading: { vi: 'Đang tải lưu trình...', en: 'Loading approval flow...', zh: '正在加载审批流程...' },
  no_flow_data: { vi: 'Không có thông tin lưu trình ký duyệt', en: 'No approval flow information', zh: '无审批流程信息' },
  deputy_assigned: { vi: 'Ký thay', en: 'Deputy', zh: '授权给' },
  history_level: { vi: 'Cấp duyệt', en: 'Level', zh: '审批级别' },
  history_info: { vi: 'Thông tin người duyệt', en: 'Info', zh: '审批人信息' },
  history_comment: { vi: 'Ghi chú', en: 'Comment', zh: '意见/备注' },
  history: { vi: 'Lịch sử', en: 'History', zh: '历史' },
  // Overtime page translations
  area: { vi: 'Khu vực', en: 'Area', zh: '区域' },
  required: { vi: 'Bắt buộc', en: 'Required', zh: '必填' },
  notifications: { vi: 'Thông báo', en: 'Notifications', zh: '通知' },
  mark_all_read: { vi: 'Đã xem hết', en: 'Mark all as read', zh: '全部标为已读' },
  no_notifications: { vi: 'Không có thông báo mới', en: 'No new notifications', zh: '没有新通知' },

  // Missing Translations Added
  err_load_data: { vi: 'Không thể tải danh sách dữ liệu!', en: 'Failed to load data list!', zh: '无法加载数据列表！' },
  please_fill_required_fields: { vi: 'Vui lòng điền Nơi mang đến!', en: 'Please fill Destination!', zh: '请填写目的地！' },
  please_add_at_least_one_item: { vi: 'Vui lòng nhập ít nhất 1 vật liệu!', en: 'Please add at least 1 item!', zh: '请至少添加一件物品！' },

  carrier_info: { vi: 'Người mang hàng ra cổng', en: 'Carrier Information', zh: '携出人信息' },
  carrier_empno: { vi: 'Mã NV người mang', en: 'Carrier EmpNo', zh: '携出人工号' },
  carrier_name: { vi: 'Tên người mang', en: 'Carrier Name', zh: '携出人姓名' },
  date_range: { vi: 'Thời hạn (Start - End)', en: 'Validity (Start - End)', zh: '有效期 (开始 - 结束)' },
  rejection_reason: { vi: 'LÝ DO TỪ CHỐI', en: 'REJECTION REASON', zh: '拒绝原因' },
  view_history: { vi: 'Xem lộ trình', en: 'View History', zh: '查看历史' },
  renew: { vi: 'Gia hạn / Copy đơn', en: 'Renew / Copy Request', zh: '续签 / 复制请求' },
  print: { vi: 'In Phiếu', en: 'Print', zh: '打印' },
  destination: { vi: 'Nơi mang đến', en: 'Destination', zh: '目的地' },
  placeholder_destination: { vi: 'Nhập địa điểm mang đến', en: 'Enter destination', zh: '输入目的地' },
  placeholder_note: { vi: 'Nhập ghi chú hoặc giải trình thêm (nếu có)...', en: 'Enter notes or further explanations (if any)...', zh: '输入备注或进一步说明（如有）...' },
  items_list: { vi: 'Danh sách Vật liệu', en: 'Items List', zh: '物品清单' },
  item_name: { vi: 'Tên vật tư', en: 'Item Name', zh: '物品名称' },
  quantity: { vi: 'Số lượng', en: 'Quantity', zh: '数量' },
  unit: { vi: 'Đơn vị tính', en: 'Unit', zh: '单位' },
  purpose: { vi: 'Mục đích', en: 'Purpose', zh: '用途' },
  no_item_data: { vi: 'Không có dữ liệu vật tư chi tiết', en: 'No detailed item data', zh: '没有详细的物品数据' },
  approval_history: { vi: 'Lộ trình & Lịch sử phê duyệt', en: 'Approval History & Routing', zh: '审批历史和路由' },
  qr_expired: { vi: 'Mã QR đã hết hạn!', en: 'QR Code has expired!', zh: '二维码已过期！' },
  qr_used: { vi: 'Mã QR này đã được sử dụng trước đó!', en: 'This QR Code has been used before!', zh: '此二维码已被使用过！' },
  qr_success: { vi: 'Quét mã thành công!', en: 'QR Scanned successfully!', zh: '二维码扫描成功！' },
  gate_confirm_success: { vi: 'Đã xác nhận cho qua cổng thành công!', en: 'Gate confirmation successful!', zh: '放行确认成功！' },
  guard_title: { vi: 'Cổng Bảo Vệ - Kiểm soát mang hàng ra cổng', en: 'Security Gate - Goods Out Control', zh: '安检门 - 货物出门控制' },
  guard_subtitle: { vi: 'Hướng camera vào mã QR trên Phiếu Mang Hàng', en: 'Point camera at the QR code on the Goods Out Pass', zh: '将摄像头对准放行条上的二维码' },
  processing: { vi: 'Đang xử lý...', en: 'Processing...', zh: '处理中...' },
  scanner_mode: { vi: 'Chế độ Máy quét cầm tay', en: 'Handheld Scanner Mode', zh: '手持扫描仪模式' },
  scanner_hint: { vi: 'Vui lòng cắm máy quét (USB/Bluetooth) và quét mã QR trên phiếu. Hệ thống đang lắng nghe...', en: 'Please plug in the scanner (USB/Bluetooth) and scan the QR code. System is listening...', zh: '请插入扫描仪（USB/蓝牙）并扫描放行条上的二维码。系统正在监听...' },
  scanner_placeholder: { vi: 'Nhấp vào đây và dùng máy quét...', en: 'Click here and use scanner...', zh: '点击此处并使用扫描仪...' },
  ticket_details: { vi: 'Chi tiết phiếu', en: 'Ticket Details', zh: '工单详情' },
  valid: { vi: 'HỢP LỆ', en: 'VALID', zh: '有效' },
  invalid: { vi: 'KHÔNG HỢP LỆ', en: 'INVALID', zh: '无效' },
  applicant: { vi: 'Người mang', en: 'Applicant', zh: '申请人' },
  confirm_gate: { vi: 'XÁC NHẬN QUA CỔNG', en: 'CONFIRM GATE PASS', zh: '确认放行' },
  
  // Also missing ones from the image that I might not have caught initially
  ITEMS: { vi: 'Tên Vật tư', en: 'Items', zh: '物品' },
  DESTINATION: { vi: 'Nơi đến', en: 'Destination', zh: '目的地' },
  
  // Because they might have been written in uppercase or something:
  request_date: { vi: 'Ngày tạo', en: 'Request Date', zh: '请求日期' },
  items: { vi: 'Tên Vật tư', en: 'Items', zh: '物品' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, data?: Record<string, any>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('vi');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedLang = localStorage.getItem('app-language') as Language;
    if (savedLang && ['vi', 'en', 'zh'].includes(savedLang)) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
  };

  const safeLanguage = isMounted ? language : 'vi';

  const t = (key: string, data?: Record<string, any>) => {
    let str = TRANSLATIONS[key]?.[safeLanguage] || key;
    if (data) {
      Object.keys(data).forEach(k => {
        const regex = new RegExp(`{${k}}`, 'g');
        str = str.replace(regex, String(data[k]));
      });
    }
    return str;
  };

  return (
    <LanguageContext.Provider value={{ language: safeLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
