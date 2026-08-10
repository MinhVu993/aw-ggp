const fs = require('fs');

const replacements = [
  {
    file: 'c:\\Users\\vu.huynh\\Desktop\\GGP\\src\\app\\(main)\\page.tsx',
    edits: [
      { from: 'toast.error("Không thể tải danh sách dữ liệu!");', to: 'toast.error(t("err_load_data"));' },
      { from: 'toast.error(t("please_fill_required_fields") || "Vui lòng điền Nơi mang đến!");', to: 'toast.error(t("please_fill_required_fields"));' },
      { from: 'toast.error(t("please_add_at_least_one_item") || "Vui lòng nhập ít nhất 1 vật liệu!");', to: 'toast.error(t("please_add_at_least_one_item"));' },
      { from: 'title: t("confirm_cancel_request") || "Xác nhận hủy đơn",', to: 'title: t("confirm_cancel_request"),' },
      { from: 'message: t("confirm_cancel_desc") || "Bạn có chắc chắn muốn hủy yêu cầu này không? Hành động này không thể hoàn tác.",', to: 'message: t("confirm_cancel_desc"),' },
      { from: 'confirmText: t("cancel") || "Hủy đơn",', to: 'confirmText: t("cancel"),' },
      { from: 'title: t("btn_approve") || "Phê duyệt yêu cầu",', to: 'title: t("btn_approve"),' },
      { from: 'message: t("confirm_approve_request") || "Bạn có chắc chắn muốn phê duyệt yêu cầu này?",', to: 'message: t("confirm_approve_request"),' },
      { from: 'confirmText: t("btn_approve") || "Phê duyệt",', to: 'confirmText: t("btn_approve"),' },
      { from: 'statusText = t("btn_approve") || "Đã duyệt";', to: 'statusText = t("btn_approve");' },
      { from: 'statusText = t("btn_reject") || "Từ chối";', to: 'statusText = t("btn_reject");' },
      { from: '{t("loading_data") || "Đang tải dữ liệu..."}', to: '{t("loading_data")}' },
      { from: '{t("others") || "vật khác"}', to: '{t("others")}' },
      { from: "{language === 'vi' ? 'LÝ DO TỪ CHỐI' : 'REJECTION REASON'}", to: '{t("rejection_reason")}' },
      { from: 'title={t("view_history") || "Xem lộ trình"}', to: 'title={t("view_history")}' },
      { from: 'title={t("export_csv") || "Xuất CSV"}', to: 'title={t("export_csv")}' },
      { from: '{t("export_csv") || "Xuất CSV"}', to: '{t("export_csv")}' }
    ]
  },
  {
    file: 'c:\\Users\\vu.huynh\\Desktop\\GGP\\src\\app\\(main)\\components\\ActionDropdown.tsx',
    edits: [
      { from: 'title="Thao tác"', to: 'title={t("col_action")}' },
      { from: '{t("btn_approve") || "Phê duyệt"}', to: '{t("btn_approve")}' },
      { from: '{t("btn_reject") || "Từ chối"}', to: '{t("btn_reject")}' },
      { from: '{t("details") || "Chi tiết"}', to: '{t("details")}' },
      { from: '{t("renew") || "Gia hạn"}', to: '{t("renew")}' },
      { from: '{t("print") || "In Phiếu"}', to: '{t("print")}' }
    ]
  },
  {
    file: 'c:\\Users\\vu.huynh\\Desktop\\GGP\\src\\app\\(main)\\components\\ConfirmModal.tsx',
    edits: [
      { from: '{t("cancel") || "Hủy"}', to: '{t("cancel")}' },
      { from: '{modal.confirmText || "Xác nhận"}', to: '{modal.confirmText || t("confirm")}' }
    ]
  },
  {
    file: 'c:\\Users\\vu.huynh\\Desktop\\GGP\\src\\app\\(main)\\components\\CreateRequestDrawer.tsx',
    edits: [
      { from: '{t("destination") || "Nơi mang đến"}', to: '{t("destination")}' },
      { from: 'placeholder="Nhập địa điểm mang đến"', to: 'placeholder={t("placeholder_destination")}' },
      { from: '{t("note") || "Ghi chú thêm"}', to: '{t("note")}' },
      { from: 'placeholder="Nhập ghi chú hoặc giải trình thêm (nếu có)..."', to: 'placeholder={t("placeholder_note")}' },
      { from: '{"Danh sách Vật liệu"}', to: '{t("items_list")}' },
      { from: 'placeholder={"Tên vật tư"}', to: 'placeholder={t("item_name")}' },
      { from: 'placeholder={"Số lượng"}', to: 'placeholder={t("quantity")}' },
      { from: 'placeholder={"Đơn vị"}', to: 'placeholder={t("unit")}' },
      { from: 'placeholder={"Mục đích"}', to: 'placeholder={t("purpose")}' }
    ]
  },
  {
    file: 'c:\\Users\\vu.huynh\\Desktop\\GGP\\src\\app\\(main)\\components\\DetailRequestDrawer.tsx',
    edits: [
      { from: '{t("access_request") || "Phiếu mang hàng"}', to: '{t("access_request")}' },
      { from: '{t("destination") || "Nơi mang đến"}', to: '{t("destination")}' },
      { from: '{t("note") || "Ghi chú thêm"}', to: '{t("note")}' },
      { from: 'Lý do yêu cầu sửa đổi', to: '{t("rejection_reason")}' },
      { from: 'Lý do từ chối', to: '{t("rejection_reason")}' },
      { from: '{t("items_list") || "Danh sách Vật liệu"}', to: '{t("items_list")}' },
      { from: '{t("item_name") || "Tên vật tư"}', to: '{t("item_name")}' },
      { from: '{t("unit") || "ĐVT"}', to: '{t("unit")}' },
      { from: '{t("purpose") || "Mục đích"}', to: '{t("purpose")}' },
      { from: 'Không có dữ liệu vật tư chi tiết', to: '{t("no_item_data")}' },
      { from: '{t("renewed_by") || "Đã gia hạn bởi"}', to: '{t("renewed_by")}' },
      { from: '{t("renew") || "Gia hạn / Copy đơn"}', to: '{t("renew")}' }
    ]
  },
  {
    file: 'c:\\Users\\vu.huynh\\Desktop\\GGP\\src\\app\\(main)\\components\\HistoryModal.tsx',
    edits: [
      { from: 'statusText = t("btn_approve") || "Đã duyệt";', to: 'statusText = t("btn_approve");' },
      { from: 'statusText = t("btn_reject") || "Từ chối";', to: 'statusText = t("btn_reject");' },
      { from: '{t("approval_history") || "Lộ trình & Lịch sử phê duyệt"}', to: '{t("approval_history")}' }
    ]
  },
  {
    file: 'c:\\Users\\vu.huynh\\Desktop\\GGP\\src\\app\\guard\\page.tsx',
    edits: [
      { from: 'toast.error("Mã QR đã hết hạn!");', to: 'toast.error(t("qr_expired"));' },
      { from: 'toast.error("Mã QR này đã được sử dụng trước đó!");', to: 'toast.error(t("qr_used"));' },
      { from: 'toast.success("Quét mã thành công!");', to: 'toast.success(t("qr_success"));' },
      { from: 'toast.success("Đã xác nhận cho qua cổng thành công!");', to: 'toast.success(t("gate_confirm_success"));' },
      { from: 'Cổng An Ninh - Kiểm soát Hàng ra', to: '{t("guard_title")}' },
      { from: 'Hướng camera vào mã QR trên Phiếu Mang Hàng', to: '{t("guard_subtitle")}' }
    ]
  },
  {
    file: 'c:\\Users\\vu.huynh\\Desktop\\GGP\\src\\app\\guard\\components\\QRScanner.tsx',
    edits: [
      { from: 'Đang xử lý...', to: '{t("processing")}' },
      { from: 'Chế độ Máy quét cầm tay', to: '{t("scanner_mode")}' },
      { from: 'Vui lòng cắm máy quét (USB/Bluetooth) và quét mã QR trên phiếu. Hệ thống đang lắng nghe...', to: '{t("scanner_hint")}' },
      { from: 'placeholder="Nhấp vào đây và dùng máy quét..."', to: 'placeholder={t("scanner_placeholder")}' }
    ]
  },
  {
    file: 'c:\\Users\\vu.huynh\\Desktop\\GGP\\src\\app\\guard\\components\\RequestDetailsPanel.tsx',
    edits: [
      { from: 'Chi tiết phiếu {data.requestCode}', to: '{t("ticket_details")} {data.requestCode}' },
      { from: 'HỢP LỆ', to: '{t("valid")}' },
      { from: 'KHÔNG HỢP LỆ', to: '{t("invalid")}' },
      { from: '>Người mang<', to: '>{t("applicant")}<' },
      { from: '>Nơi đến<', to: '>{t("destination")}<' },
      { from: '>Hạn mã QR<', to: '>{t("qr_expiry")}<' },
      { from: 'Danh sách vật tư', to: '{t("items_list")}' },
      { from: 'Mục đích: {item.purpose}', to: '{t("purpose")}: {item.purpose}' },
      { from: '>Hủy Bỏ<', to: '>{t("cancel")}<' },
      { from: '{loading ? "Đang xử lý..." : "XÁC NHẬN QUA CỔNG"}', to: '{loading ? t("processing") : t("confirm_gate")}' }
    ]
  }
];

replacements.forEach(r => {
  if (fs.existsSync(r.file)) {
    let content = fs.readFileSync(r.file, 'utf8');
    
    // Add useTranslation import if not exists
    if (!content.includes('useTranslation') && !r.file.includes('page.tsx')) { // page.tsx already imports it
       content = `import { useTranslation } from "@/context/LanguageContext";\n` + content;
    }
    
    // Check if `const { t } = useTranslation();` is declared inside component
    if (!content.includes('const { t }') && !content.includes('const { t, language }')) {
      // Find the component function declaration and inject it
      const funcRegex = /(export default function [a-zA-Z0-9]+\(.*?\) \{|const [a-zA-Z0-9]+ = \(.*?\) => \{)/;
      content = content.replace(funcRegex, (match) => {
        return match + '\n  const { t } = useTranslation();';
      });
    }

    r.edits.forEach(e => {
      content = content.split(e.from).join(e.to);
    });
    fs.writeFileSync(r.file, content, 'utf8');
  } else {
    console.log("File not found: ", r.file);
  }
});
console.log('Done replacing strings.');
