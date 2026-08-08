# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2026-08-08

### Added
- **Trang dành cho Bảo vệ (Guard Page)**: Bổ sung route `/guard` với tính năng Quét mã QR.
  - Hỗ trợ trực tiếp các máy quét mã vạch vật lý cầm tay (Physical Barcode Scanner).
  - Hiển thị bảng tóm tắt thông tin tài sản, người mang ra cổng sau khi quét.
  - Hỗ trợ nút "Xác nhận qua cổng" để đổi trạng thái đơn.
- **Thanh điều hướng (Sidebar)**: Bổ sung menu "Quét mã Bảo vệ" (Guard Scanner) giúp truy cập nhanh vào trang kiểm soát của bảo vệ.
- **In Phiếu mang hàng ra ngoài**: Thêm tính năng in phiếu trực tiếp trên trình duyệt.
  - Xây dựng component `PrintTemplate.tsx` bám sát 100% mẫu thực tế của công ty (khổ A4 nằm ngang).
  - Sử dụng `@media print` CSS để loại bỏ các thành phần web thừa khi in.

### Changed
- **Giao diện Menu**: Đổi tên menu "Yêu cầu truy cập" thành "Yêu cầu mới" để thân thiện hơn với người dùng.
- **Form Tạo Đơn (Create Request Drawer)**:
  - Mở rộng tổng thể chiều ngang của form từ 960px lên 1100px.
  - Tăng tỷ lệ và độ rộng tối thiểu của trường nhập liệu "Tên vật tư" (gấp 3 lần ô số lượng) để dễ dàng nhập tên vật tư dài.
  - Cải tiến UI của 2 nút Thêm/Bớt vật tư (dấu + / -) thành dạng icon bo góc vuông, có màu nền nhạt và hiệu ứng hover thay vì viền thô cứng.
- **Cột Thao tác của Bảng (Actions Column)**:
  - Gom gọn toàn bộ các nút bấm (Phê duyệt, Từ chối, Chi tiết, Gia hạn, In Phiếu) vào một menu thả xuống (Dropdown `ActionDropdown.tsx`) chuyên nghiệp và tiết kiệm diện tích.
- **Xác thực và Đồng bộ User (AuthComp)**:
  - Bổ sung logic gọi API của IFM Tracking (`http://gmo021.cansportsvg.com:10003/api/ifm-tracking/managers/query`).
  - Tự động đồng bộ và ghi đè thông tin chính xác của người dùng (Phòng ban, Chức vụ, Họ Tên đầy đủ) trước khi khởi tạo phiên đăng nhập (Session) trên Next.js.
