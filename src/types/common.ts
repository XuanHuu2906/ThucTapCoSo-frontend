// common.ts – Các kiểu dùng chung cho toàn bộ hệ thống

/** Trạng thái tài khoản người dùng (REQ-001) */
export type AccountStatus =
  | "active"    // Đang hoạt động
  | "inactive"  // Tạm ngừng hoạt động
  | "locked";   // Bị khóa – phải liên hệ Admin để mở (AC-3 REQ-001)

/** Chủ đề giao diện */
export type Theme =
  | "light" // Giao diện sáng
  | "dark";  // Giao diện tối

/**
 * Vai trò của người dùng trong hệ thống (REQ-002)
 * Mỗi vai trò sẽ được chuyển hướng đến Dashboard riêng sau khi đăng nhập.
 */
export type UserRole =
  | "recruiter"    // Chuyên viên Tuyển dụng – quản lý toàn bộ quy trình tuyển dụng
  | "manager"      // Trưởng bộ phận (Hiring Manager) – phỏng vấn chuyên môn, đánh giá thử việc
  | "director"     // Giám đốc – phê duyệt Offer và kết quả thử việc cuối cùng
  | "probationer"; // Nhân viên thử việc – chỉ đọc thông tin thử việc của bản thân (REQ-026)

/** Giới tính */
export type Gender =
  | "male"   // Nam
  | "female" // Nữ
  | "other"; // Khác

/**
 * Thông tin phân trang – dùng khi API trả về danh sách nhiều trang.
 * Ví dụ: trang 1, mỗi trang 10 bản ghi, tổng 50 bản ghi → 5 trang.
 */
export interface Pagination {
  page: number;       // Trang hiện tại (bắt đầu từ 1)
  pageSize: number;   // Số bản ghi mỗi trang
  total: number;      // Tổng số bản ghi
  totalPages: number; // Tổng số trang
}

/**
 * Cấu trúc response chuẩn từ API (không có phân trang).
 * T là kiểu dữ liệu thực tế trả về (ví dụ: User, Job...).
 */
export interface ApiResponse<T> {
  data: T;          // Dữ liệu trả về
  message: string;  // Thông báo từ server (ví dụ: "Tạo thành công")
  success: boolean; // true = thành công, false = thất bại
}

/**
 * Cấu trúc response từ API khi trả về danh sách có phân trang.
 * Dùng khi hiển thị bảng dữ liệu với nhiều trang.
 */
export interface PaginatedResponse<T> {
  data: T[];                // Danh sách dữ liệu của trang hiện tại
  pagination: Pagination;   // Thông tin phân trang
  message: string;          // Thông báo từ server
  success: boolean;         // true = thành công, false = thất bại
}

/** Một lựa chọn trong dropdown / combobox */
export interface SelectOption {
  label: string; // Tên hiển thị trên giao diện (ví dụ: "Hà Nội")
  value: string; // Giá trị thực gửi lên API (ví dụ: "ha-noi")
}

/** Khoảng thời gian – dùng cho bộ lọc từ ngày đến ngày */
export interface DateRange {
  from: string; // Từ ngày – định dạng "2024-01-01"
  to: string;   // Đến ngày – định dạng "2024-01-01"
}

/** Địa chỉ */
export interface Address {
  street?: string;   // Số nhà, tên đường
  district?: string; // Quận / Huyện
  city: string;      // Thành phố (bắt buộc)
  province?: string; // Tỉnh
  country?: string;  // Quốc gia
}
