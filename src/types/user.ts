// user.ts – Kiểu dữ liệu người dùng hệ thống (UC-01)
import type { UserRole, AccountStatus, Gender, Address } from "./common.ts";

/** Thông tin đầy đủ của một người dùng trong hệ thống */
export interface User {
  id: string;              // Mã định danh duy nhất
  email: string;           // Email – dùng làm username để đăng nhập (REQ-006)
  fullName: string;        // Họ và tên đầy đủ
  phone?: string;          // Số điện thoại (không bắt buộc)
  avatar?: string;         // Đường dẫn ảnh đại diện (không bắt buộc)
  gender?: Gender;         // Giới tính (không bắt buộc)
  dateOfBirth?: string;    // Ngày sinh – định dạng "1999-12-31" (không bắt buộc)
  address?: Address;       // Địa chỉ (không bắt buộc)
  role: UserRole;          // Vai trò trong hệ thống (REQ-002)
  status: AccountStatus;   // Trạng thái tài khoản (active | inactive | locked)
  createdAt: string;       // Ngày tạo tài khoản
  updatedAt: string;       // Ngày cập nhật gần nhất
}

/** Dữ liệu gửi lên khi đăng nhập (UC-01, REQ-001) */
export interface LoginPayload {
  email: string;    // Email đã đăng ký
  password: string; // Mật khẩu
}

/**
 * Dữ liệu trả về sau khi đăng nhập thành công.
 * Hệ thống tự động tạo tài khoản với role="probationer" khi ứng viên chấp nhận Offer (REQ-019).
 */
export interface AuthResponse {
  user: User;           // Thông tin người dùng vừa đăng nhập
  accessToken: string;  // Token dùng để gọi API (hạn ngắn)
  refreshToken: string; // Token dùng để lấy accessToken mới khi hết hạn
}

/** Dữ liệu gửi lên khi yêu cầu đặt lại mật khẩu (REQ-003) */
export interface ForgotPasswordPayload {
  email: string; // Email đã đăng ký để nhận link đặt lại mật khẩu
}

/** Dữ liệu gửi lên khi đặt lại mật khẩu mới (REQ-003) */
export interface ResetPasswordPayload {
  token: string;       // Token nhận từ link email
  newPassword: string; // Mật khẩu mới (≥12 ký tự, hỗn hợp – REQ-019 AC-2)
}

/** Dữ liệu gửi lên khi cập nhật thông tin cá nhân */
export interface UpdateProfilePayload {
  fullName?: string;    // Họ và tên mới
  phone?: string;       // Số điện thoại mới
  avatar?: string;      // Đường dẫn ảnh đại diện mới
  gender?: Gender;      // Giới tính
  dateOfBirth?: string; // Ngày sinh – định dạng "1999-12-31"
  address?: Address;    // Địa chỉ mới
}
