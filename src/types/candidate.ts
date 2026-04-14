// candidate.ts – Kiểu dữ liệu ứng viên (UC-03)
import type { Gender, Address } from "./common.ts";

/**
 * Nguồn mà ứng viên biết đến và nộp đơn (REQ-027 – báo cáo theo nguồn)
 * Recruiter có thể lọc và xem báo cáo hiệu quả theo từng kênh.
 */
export type CandidateSource =
  | "website"    // Nộp qua website công ty
  | "linkedin"   // Qua LinkedIn
  | "referral"   // Được nhân viên nội bộ giới thiệu
  | "job-board"  // Qua các trang tuyển dụng (VietnamWorks, TopCV, ITViec...)
  | "headhunt"   // Được recruiter chủ động tìm và liên hệ
  | "other";     // Nguồn khác

/** Kỹ năng của ứng viên */
export interface Skill {
  name: string;    // Tên kỹ năng (ví dụ: "React", "Figma", "Python")
  level?:          // Mức độ thành thạo (không bắt buộc)
    | "beginner"       // Mới học, biết cơ bản
    | "intermediate"   // Biết dùng, làm được việc
    | "advanced"       // Thành thạo, có thể tự xử lý vấn đề phức tạp
    | "expert";        // Chuyên gia, có thể dạy người khác
}

/** Một lần kinh nghiệm làm việc trước đây */
export interface WorkExperience {
  company: string;      // Tên công ty
  position: string;     // Chức vụ / vị trí đảm nhận
  startDate: string;    // Ngày bắt đầu – định dạng "2022-06" (năm-tháng)
  endDate?: string;     // Ngày kết thúc – để trống nếu đang làm tại đây
  description?: string; // Mô tả công việc / thành tích (không bắt buộc)
}

/** Thông tin học vấn */
export interface Education {
  school: string;  // Tên trường
  major: string;   // Chuyên ngành
  degree:          // Bằng cấp
    | "high-school" // Tốt nghiệp THPT
    | "associate"   // Cao đẳng
    | "bachelor"    // Đại học
    | "master"      // Thạc sĩ
    | "phd"         // Tiến sĩ
    | "other";      // Bằng cấp khác
  startDate: string;  // Năm bắt đầu – định dạng "2020-09" (năm-tháng)
  endDate?: string;   // Năm tốt nghiệp – để trống nếu đang học
  gpa?: number;       // Điểm GPA (không bắt buộc)
}

/**
 * Hồ sơ đầy đủ của một ứng viên (UC-03, REQ-006)
 * Ứng viên không cần tạo tài khoản – thông tin được thu thập qua form nộp đơn.
 * Email được dùng làm username nếu sau này ứng viên được tuyển (REQ-006, REQ-019).
 */
export interface Candidate {
  id: string;                        // Mã định danh duy nhất
  fullName: string;                  // Họ và tên đầy đủ (bắt buộc – REQ-006)
  email: string;                     // Email – dùng làm username nếu được tuyển (bắt buộc – REQ-006)
  phone: string;                     // Số điện thoại (bắt buộc – REQ-006)
  avatar?: string;                   // Đường dẫn ảnh đại diện (không bắt buộc)
  gender?: Gender;                   // Giới tính (không bắt buộc)
  dateOfBirth?: string;              // Ngày sinh – định dạng "1999-12-31" (không bắt buộc)
  address?: Address;                 // Địa chỉ (không bắt buộc)
  skills?: Skill[];                  // Danh sách kỹ năng (không bắt buộc lúc nộp)
  workExperiences?: WorkExperience[]; // Danh sách kinh nghiệm làm việc (không bắt buộc)
  educations?: Education[];          // Danh sách học vấn (không bắt buộc)
  cvUrl: string;                     // Đường dẫn file CV đã upload – PDF/DOC/DOCX <5MB (bắt buộc – REQ-006)
  portfolioUrl?: string;             // Link portfolio / website cá nhân (không bắt buộc)
  linkedinUrl?: string;              // Link hồ sơ LinkedIn (không bắt buộc)
  source?: CandidateSource;          // Biết đến qua kênh nào (không bắt buộc)
  note?: string;                     // Ghi chú nội bộ của recruiter – ứng viên không nhìn thấy
  createdAt: string;                 // Ngày tạo hồ sơ
  updatedAt: string;                 // Ngày cập nhật gần nhất
}

/**
 * Dữ liệu ứng viên tự điền khi nộp đơn (UC-03, REQ-006)
 * Hệ thống sẽ kiểm tra email và SĐT trùng lặp sau khi nhận form này (REQ-006 AC-3).
 */
export interface SubmitCandidatePayload {
  fullName: string;          // Họ và tên đầy đủ
  email: string;             // Email (làm username sau này nếu được tuyển)
  phone: string;             // Số điện thoại
  cvUrl: string;             // Đường dẫn CV đã upload lên server – PDF/DOC/DOCX <5MB
  source?: CandidateSource;  // Biết tin qua kênh nào (không bắt buộc)
  coverLetter?: string;      // Thư xin việc (không bắt buộc)
}

/** Bộ lọc dùng để tìm kiếm danh sách ứng viên (REQ-011 – lọc nâng cao) */
export interface CandidateFilter {
  keyword?: string;          // Tìm theo tên hoặc email (không bắt buộc)
  source?: CandidateSource;  // Lọc theo nguồn ứng tuyển (không bắt buộc)
  skills?: string[];         // Lọc theo kỹ năng (ví dụ: ["React", "TypeScript"])
}
