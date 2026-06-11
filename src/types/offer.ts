// offer.ts – Kiểu dữ liệu đề xuất tuyển dụng / Offer (UC-08, UC-09, UC-10)

/**
 * Trạng thái của một Offer trong quy trình phê duyệt (UC-08, UC-09, UC-10)
 *
 * Luồng trạng thái:
 *   pending_approval (Recruiter tạo, chờ Director duyệt – REQ-015)
 *   → approved       (Director duyệt, hệ thống tự gửi email Offer – REQ-016, REQ-017)
 *   → rejected       (Director từ chối, trả về Recruiter kèm lý do – REQ-016 AC-2)
 *   → accepted       (Ứng viên chấp nhận → tạo tài khoản Probationer – REQ-018 AC-1, REQ-019)
 *   → declined       (Ứng viên từ chối – REQ-018 AC-2)
 */
export type OfferStatus =
  | "pending_approval"  // Chờ Director phê duyệt (REQ-015)
  | "approved"          // Director đã duyệt – thư mời được gửi cho ứng viên (REQ-016, REQ-017)
  | "rejected"          // Director từ chối – hồ sơ trả về Recruiter (REQ-016 AC-2)
  | "accepted"          // Ứng viên chấp nhận – kích hoạt tạo tài khoản (REQ-018 AC-1, REQ-019)
  | "declined";         // Ứng viên từ chối (REQ-018 AC-2)

/**
 * Thông tin đầy đủ của một đề xuất Offer (UC-08, CRUD matrix: "Offer")
 * Recruiter tạo sau khi ứng viên có status="interview_passed" (REQ-015).
 */
export interface Offer {
  id: string;                  // Mã định danh duy nhất
  applicationId: string;       // ID đơn ứng tuyển liên quan
  candidateId: string;         // ID ứng viên nhận Offer
  candidateName: string;       // Tên ứng viên – chép từ Candidate để hiển thị
  candidateEmail: string;      // Email ứng viên – dùng để gửi thư mời (REQ-017)
  jobId: string;               // ID vị trí tuyển dụng
  jobTitle: string;            // Tên vị trí – chép từ Job để hiển thị
  department?: string;         // Tên phòng ban tuyển dụng

  // Thông tin lương và đãi ngộ (UC-08 luồng chính, REQ-015)
  baseSalary: number;          // Lương cơ bản
  allowance?: number;          // Phụ cấp (không bắt buộc)
  currency: string;            // Đơn vị tiền tệ (ví dụ: "VND", "USD")
  startDate: string;           // Ngày bắt đầu làm việc dự kiến – định dạng "2024-12-31"
  probationDays: number;       // Số ngày thử việc (ví dụ: 60)
  benefits?: string;           // Mô tả thêm phúc lợi (không bắt buộc)
  terms?: string;              // Điều khoản bổ sung trong thư mời (không bắt buộc)

  status: OfferStatus;         // Trạng thái hiện tại của Offer

  // Thông tin phê duyệt (Director)
  createdBy: string;           // ID Recruiter tạo Offer
  reviewedBy?: string;         // ID Director đã xem xét (có sau khi Director hành động)
  reviewedAt?: string;         // Thời điểm Director phê duyệt / từ chối
  directorComment?: string;    // Nhận xét / lý do từ chối của Director (REQ-016 AC-2)

  // Phản hồi của ứng viên
  candidateResponse?: "accepted" | "declined"; // Phản hồi của ứng viên (REQ-018)
  candidateResponseAt?: string;                // Thời điểm ứng viên phản hồi
  declineReason?: string;                      // Lý do từ chối (nếu ứng viên declined)

  createdAt: string;           // Thời điểm tạo Offer
  updatedAt: string;           // Lần cập nhật gần nhất
}

/**
 * Dữ liệu Recruiter gửi lên khi tạo Offer (UC-08, REQ-015)
 * Chỉ được tạo khi Application status="interview_passed" (REQ-015 AC-2 cảnh báo nếu vi phạm).
 */
export interface CreateOfferPayload {
  applicationId: string;     // ID đơn ứng tuyển liên quan
  baseSalary: number;        // Lương cơ bản
  allowance?: number;        // Phụ cấp (không bắt buộc)
  currency: string;          // Đơn vị tiền tệ
  startDate: string;         // Ngày bắt đầu làm việc dự kiến – định dạng "2024-12-31"
  probationDays: number;     // Số ngày thử việc
  benefits?: string;         // Thông tin phúc lợi thêm (không bắt buộc)
  terms?: string;            // Điều khoản bổ sung (không bắt buộc)
}

/**
 * Dữ liệu Director gửi lên khi phê duyệt / từ chối Offer (UC-09, REQ-016)
 * - Nếu approved: hệ thống tự gửi email thư mời cho ứng viên (REQ-017)
 * - Nếu rejected: hồ sơ trả về Recruiter kèm comment (REQ-016 AC-2)
 */
export interface ReviewOfferPayload {
  decision: "approved" | "rejected"; // Quyết định của Director
  comment?: string;                  // Nhận xét / lý do từ chối (bắt buộc khi rejected)
}

/**
 * Dữ liệu ứng viên gửi lên khi phản hồi Offer qua link email (UC-10, REQ-018)
 * - Nếu accepted: hệ thống tạo tài khoản Probationer tự động (REQ-019)
 * - Nếu declined: thông báo Recruiter để có kế hoạch backup
 */
export interface RespondOfferPayload {
  token: string;                        // Token xác thực từ link email Offer
  response: "accepted" | "declined";    // Quyết định của ứng viên
  declineReason?: string;              // Lý do từ chối (không bắt buộc khi declined)
}

/** Bộ lọc tìm kiếm danh sách Offer */
export interface OfferFilter {
  candidateId?: string;    // Lọc theo ứng viên (không bắt buộc)
  jobId?: string;          // Lọc theo vị trí tuyển dụng (không bắt buộc)
  status?: OfferStatus;    // Lọc theo trạng thái Offer (không bắt buộc)
  createdBy?: string;      // Lọc theo Recruiter tạo (không bắt buộc)
  from?: string;           // Lọc từ ngày tạo – định dạng "2024-01-01"
  to?: string;             // Lọc đến ngày tạo – định dạng "2024-01-01"
}
