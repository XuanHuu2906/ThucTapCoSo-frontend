// application.ts – Kiểu dữ liệu đơn ứng tuyển (UC-03, UC-04)
import type { CandidateSource } from "./candidate.ts";

/**
 * Trạng thái của đơn ứng tuyển trong quy trình xét duyệt (UC-04, REQ-009, REQ-010, REQ-014)
 *
 * Luồng trạng thái chính:
 *   new → shortlisted → interview_passed → (sang Offer)
 *   new → rejected
 *   shortlisted → rejected
 *   interviewing → interview_passed
 *   interviewing → interview_failed
 */
export type ApplicationStatus =
  | "new"               // Mới nộp – chờ recruiter xem xét (REQ-009 AC-1: status="New")
  | "shortlisted"       // Đã duyệt – chuyển vào danh sách phỏng vấn (REQ-009 AC-1)
  | "interviewing"      // Đang trong vòng phỏng vấn
  | "interview_passed"  // Đạt phỏng vấn – được phép tạo Offer (REQ-014 AC-2, REQ-015)
  | "interview_failed"  // Không đạt phỏng vấn – không thể tạo Offer (REQ-014 AC-3)
  | "offered"           // Đã có Offer được Director duyệt và gửi đi
  | "hired"             // Ứng viên chấp nhận Offer – kích hoạt tạo tài khoản (REQ-018 AC-1, REQ-019)
  | "rejected"          // Bị từ chối – hệ thống tự gửi email từ chối (REQ-010)
  | "withdrawn";        // Ứng viên tự rút đơn

/** Thông tin đầy đủ của một đơn ứng tuyển */
export interface Application {
  id: string;                  // Mã định danh duy nhất
  jobId: string;               // ID vị trí tuyển dụng
  jobTitle: string;            // Tên vị trí – chép từ Job để hiển thị không cần gọi thêm API
  candidateId: string;         // ID ứng viên
  candidateName: string;       // Tên ứng viên – chép từ Candidate để hiển thị
  candidateEmail: string;      // Email ứng viên – chép từ Candidate để hiển thị
  candidatePhone: string;      // SĐT ứng viên – chép từ Candidate để liên hệ nhanh
  cvUrl: string;               // Đường dẫn file CV ứng viên đã upload (REQ-008)
  coverLetter?: string;        // Thư xin việc (không bắt buộc)
  source?: CandidateSource;    // Biết tin tuyển dụng qua kênh nào (phục vụ báo cáo – REQ-027)
  status: ApplicationStatus;   // Trạng thái hiện tại của đơn
  rejectionReason?: string;    // Lý do từ chối – ghi chú nội bộ khi status="rejected" (UC-04)
  appliedAt: string;           // Thời điểm nộp đơn – định dạng "2024-12-31T09:00:00Z"
  updatedAt: string;           // Lần cuối cập nhật trạng thái
  note?: string;               // Ghi chú nội bộ của recruiter – ứng viên không nhìn thấy
  interviewIds?: string[];     // Danh sách ID các buổi phỏng vấn thuộc đơn này
  interviewConfirmStatus?: string; // Trạng thái xác nhận của buổi phỏng vấn
}

/**
 * Dữ liệu gửi lên khi ứng viên nộp đơn ứng tuyển (UC-03, REQ-006)
 * Recruiter cũng có thể nhập thay cho ứng viên trong một số trường hợp.
 */
export interface SubmitApplicationPayload {
  jobId: string;              // ID vị trí muốn ứng tuyển
  candidateId?: string;       // ID ứng viên (nếu đã tồn tại trong hệ thống)
  // Nếu candidateId không có thì cần các trường dưới để tạo Candidate mới:
  fullName?: string;          // Họ và tên ứng viên
  email?: string;             // Email ứng viên (kiểm tra trùng lặp – REQ-006 AC-3)
  phone?: string;             // Số điện thoại ứng viên
  cvUrl: string | File;       // Đường dẫn CV (string) hoặc File object khi upload (REQ-006 AC-2)
  coverLetter?: string;       // Thư xin việc (không bắt buộc)
  source?: CandidateSource;   // Biết tin qua kênh nào (không bắt buộc)
}

/**
 * Dữ liệu gửi lên khi recruiter cập nhật trạng thái đơn (UC-04, REQ-009, REQ-010)
 * Ví dụ: shortlist (duyệt) hoặc reject (loại).
 */
export interface UpdateApplicationStatusPayload {
  status: ApplicationStatus; // Trạng thái mới muốn chuyển sang
  rejectionReason?: string;  // Lý do từ chối – bắt buộc khi status="rejected" (UC-04)
  note?: string;             // Ghi chú thêm (không bắt buộc)
}

/** Bộ lọc dùng để tìm kiếm danh sách đơn ứng tuyển */
export interface ApplicationFilter {
  keyword?: string;              // Tìm theo tên ứng viên hoặc tên vị trí (không bắt buộc)
  jobId?: string;                // Lọc theo vị trí tuyển dụng cụ thể (không bắt buộc)
  candidateId?: string;          // Lọc theo ứng viên cụ thể (không bắt buộc)
  status?: ApplicationStatus;    // Lọc theo trạng thái đơn (không bắt buộc)
  source?: CandidateSource;      // Lọc theo kênh nộp đơn (không bắt buộc)
  appliedFrom?: string;          // Lọc đơn nộp từ ngày – định dạng "2024-01-01"
  appliedTo?: string;            // Lọc đơn nộp đến ngày – định dạng "2024-01-01"
}
