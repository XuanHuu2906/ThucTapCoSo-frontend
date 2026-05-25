# DOC 6.3-A: High-Fidelity UI Mockups

## Danh sách ảnh mockup cần chụp

> **Hướng dẫn:** Chụp ảnh màn hình từ ứng dụng thực tế, sau đó chèn ảnh vào các placeholder dưới đây. Xóa dòng `[Chụp ảnh từ ứng dụng]` và thay bằng ảnh thật.

---

### AUTH & PUBLIC

| # | Màn hình | Mô tả | Trạng thái |
|---|---|---|---|
| A1 | **Trang chủ (Landing Page)** | Trang giới thiệu, hiển thị danh sách tin tuyển dụng công khai | Default |
| A2 | **Đăng nhập** | Form đăng nhập với email + password | Default |
| A3 | **Đăng nhập - Lỗi validation** | Form đăng nhập hiển thị lỗi "Email hoặc mật khẩu không đúng" | Error |
| A4 | **Chi tiết tin tuyển dụng** | Hiển thị thông tin chi tiết công việc + nút "Nộp hồ sơ" | Default |
| A5 | **Form nộp hồ sơ ứng tuyển** | Form nhập họ tên, email, phone + upload CV | Default |
| A6 | **Form nộp hồ sơ - Lỗi file** | Hiển thị lỗi "File không hợp lệ. Upload PDF/DOC/DOCX <5MB" | Error |
| A7 | **Nộp hồ sơ thành công** | Thông báo "Nộp hồ sơ thành công! Email xác nhận đã gửi." | Success |
| A8 | **Phản hồi Offer (Public)** | Trang public cho ứng viên chấp nhận/từ chối Offer qua token | Default |

---

### RECRUITER

| # | Màn hình | Mô tả | Trạng thái |
|---|---|---|---|
| R1 | **Dashboard Recruiter** | Tổng quan: số lượng jobs, hồ sơ, offer, probation | Default |
| R2 | **Danh sách tin tuyển dụng** | Bảng danh sách jobs + search, filter | Default |
| R3 | **Tạo tin tuyển dụng** | Form tạo job mới (title, dept, mô tả, yêu cầu, lương, hạn) | Default |
| R4 | **Tạo tin tuyển dụng - Validation lỗi** | Form hiển thị lỗi các trường bắt buộc | Error |
| R5 | **Chỉnh sửa tin tuyển dụng** | Form edit job với dữ liệu đã có | Default |
| R6 | **Danh sách hồ sơ ứng viên** | Bảng candidates với tabs: Tất cả / Mới / Đã chọn / Đã tuyển / Đã loại | Default |
| R7 | **Tab "Mới" - Hồ sơ chưa xử lý** | Danh sách hồ sơ status="New" | Default |
| R8 | **Tab "Đã chọn" - Shortlisted** | Danh sách hồ sơ status="Shortlisted" | Default |
| R9 | **Chi tiết hồ sơ ứng viên** | Xem thông tin ứng viên + CV viewer | Default |
| R10 | **Xác nhận Shortlist** | Dialog xác nhận "Duyệt hồ sơ này?" | Dialog |
| R11 | **Xác nhận Reject** | Dialog xác nhận "Loại hồ sơ này?" + lý do | Dialog |
| R12 | **Danh sách Offer** | Bảng danh sách Offer với status | Default |
| R13 | **Tạo Offer mới** | Form tạo Offer (lương, phụ cấp, ngày bắt đầu) | Default |
| R14 | **Chi tiết Offer** | Xem thông tin Offer + lịch sử duyệt | Default |
| R15 | **Danh sách thử việc** | Bảng Probation với tên, phòng ban, ngày, số ngày còn lại | Default |
| R16 | **Xuất Excel thử việc** | Sau khi nhấn "Xuất Excel", dialog download | Success |
| R17 | **Báo cáo tuyển dụng** | Charts: tổng hồ sơ, lịch PV, Offer, tỷ lệ chấp nhận | Default |

---

### MANAGER (HIRING MANAGER)

| # | Màn hình | Mô tả | Trạng thái |
|---|---|---|---|
| M1 | **Dashboard Manager** | Tổng quan lịch phỏng vấn, đánh giá chờ xử lý | Default |
| M2 | **Lịch phỏng vấn** | Danh sách lịch PV của HM + filter | Default |
| M3 | **Chi tiết phỏng vấn** | Thông tin PV: ứng viên, thời gian, địa điểm | Default |
| M4 | **Xác nhận phỏng vấn** | Nút "Xác nhận tham gia" / "Từ chối" | Action |
| M5 | **Form đánh giá phỏng vấn** | Nhập điểm technical, soft, attitude + feedback + result | Default |
| M6 | **Đánh giá - Validation** | Form nhắc nhập đủ điểm trước khi gửi | Error |

---

### DIRECTOR

| # | Màn hình | Mô tả | Trạng thái |
|---|---|---|---|
| D1 | **Dashboard Director** | Biểu đồ điều hành: biên chế, ngân sách, time-to-fill | Default |
| D2 | **Phê duyệt Offer** | Danh sách Offer Pending Approval | Default |
| D3 | **Chi tiết + Duyệt Offer** | Form xem chi tiết + nhấn Duyệt / Từ chối + ghi chú | Action |
| D4 | **Phê duyệt thành công** | Toast "Offer Approved!" | Success |
| D5 | **Phê duyệt đánh giá thử việc** | Danh sách đánh giá Pending Approval | Default |
| D6 | **Chi tiết + Duyệt đánh giá** | Xem kết quả + nhấn Phê duyệt / Từ chối | Action |
| D7 | **Báo cáo tổng hợp** | Charts điều hành: biên chế, budget, turnover rate | Default |

---

### PROBATIONER

| # | Màn hình | Mô tả | Trạng thái |
|---|---|---|---|
| P1 | **Dashboard thử việc** | Xem thông tin thử việc: ngày bắt đầu/kết thúc, supervisor, status | Default |
| P2 | **Kết quả đánh giá** | Hiển thị kết quả cuối (Đạt/Không đạt) sau khi duyệt | Success |
| P3 | **Đang chờ đánh giá** | Thông báo "Đang chờ đánh giá" khi chưa có kết quả | Pending |

---

### SHARED COMPONENTS

| # | Component | Mô tả | Trạng thái |
|---|---|---|---|
| S1 | **Sidebar Navigation** | Menu trái theo role (Recruiter/Manager/Director/Probationer) | Default |
| S2 | **Sidebar - Active state** | Menu item đang được chọn | Active |
| S3 | **Header** | Logo + tên user + theme toggle + logout | Default |
| S4 | **Bảng dữ liệu (Table)** | Table với sort, filter, phân trang | Default |
| S5 | **Bảng - Rỗng (Empty state)** | Table hiển thị "Không có dữ liệu" | Empty |
| S6 | **Loading spinner** | Vòng quay loading khi đang tải dữ liệu | Loading |
| S7 | **Toast thông báo thành công** | Toast xanh "Thao tác thành công" | Success |
| S8 | **Toast thông báo lỗi** | Toast đỏ "Có lỗi xảy ra" | Error |
| S9 | **Dialog xác nhận** | Popup xác nhận trước khi thực hiện hành động | Dialog |
| S10 | **404 Not Found** | Trang báo lỗi không tìm thấy route | Error |

---

# DOC 6.3-B: UI Design System Documentation

## 1. Color System

| Token | Hex | Usage |
|---|---|---|
| **Primary** | `#2563EB` | Buttons, links, active states |
| **Primary Hover** | `#1D4ED8` | Button hover |
| **Primary Light** | `#DBEAFE` | Badge, background |
| **Secondary** | `#64748B` | Secondary text, icons |
| **Success** | `#10B981` | Toast success, badge |
| **Warning** | `#F59E0B` | Warning alert |
| **Error** | `#EF4444` | Toast error, validation |
| **Background** | `#F8FAFC` | Page background |
| **Surface** | `#FFFFFF` | Card, table, form |
| **Border** | `#E2E8F0` | Table rows, card borders |
| **Text Primary** | `#0F172A` | Main headings |
| **Text Secondary** | `#64748B` | Body text |

## 2. Typography

| Style | Font | Size | Weight | Line Height |
|---|---|---|---|---|
| **h1** | Geist Variable | 32px | 700 | 40px |
| **h2** | Geist Variable | 24px | 600 | 32px |
| **h3** | Geist Variable | 20px | 600 | 28px |
| **Body** | Geist Variable | 14px | 400 | 20px |
| **Small** | Geist Variable | 12px | 400 | 16px |
| **Label** | Geist Variable | 14px | 500 | 20px |

## 3. Spacing Scale

| Token | px | rem |
|---|---|---|
| `space-1` | 4px | 0.25rem |
| `space-2` | 8px | 0.5rem |
| `space-3` | 12px | 0.75rem |
| `space-4` | 16px | 1rem |
| `space-6` | 24px | 1.5rem |
| `space-8` | 32px | 2rem |
| `space-12` | 48px | 3rem |

## 4. Component Library

| Component | Specs |
|---|---|
| **Primary Button** | h-40px, px-4, rounded-lg, bg-primary, text-white |
| **Secondary Button** | h-40px, px-4, rounded-lg, border, bg-white |
| **Input** | h-40px, px-3, rounded-lg, border, focus:ring-2 |
| **Table** | rounded-lg, border, striped rows |
| **Card** | rounded-xl, bg-white, shadow-sm, p-6 |
| **Dialog** | rounded-xl, shadow-lg, max-w-md, p-6 |
| **Badge** | rounded-full, px-2, py-0.5, text-xs, font-medium |
| **Tab** | border-b, px-4, py-2, active:border-b-2 primary |

## 5. Icon Library

- **Library:** lucide-react
- **Size:** 20px (default), 16px (small), 24px (large)
- **Stroke Width:** 1.5px
