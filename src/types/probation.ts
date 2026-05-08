// probation.ts – Kiểu dữ liệu quản lý thử việc (UC-11, UC-12, UC-13, UC-14, UC-17)

/**
 * Trạng thái của nhân viên trong giai đoạn thử việc (UC-11, UC-13, UC-14, REQ-020)
 *
 * Luồng trạng thái:
 *   probating (Đang thử việc)
 *   → pending_evaluation (HM đã nộp đánh giá, chờ Director duyệt – REQ-023)
 *   → passed   (Director duyệt "Ký HĐ chính thức" → nhân viên chính thức – REQ-024)
 *   → failed   (Director duyệt "Chấm dứt" → đã nghỉ việc – REQ-024)
 */
export type ProbationStatus =
  | "probating"           // Đang trong thời gian thử việc
  | "pending_evaluation"  // HM đã nộp đánh giá, chờ Director phê duyệt (REQ-023, REQ-024)
  | "passed"              // Director duyệt: Nhân viên chính thức (REQ-024 AC-1)
  | "failed";             // Director duyệt: Chấm dứt / Đã nghỉ việc (REQ-024 AC-1)

/**
 * Thông tin nhân viên thử việc (UC-11, REQ-020, CRUD matrix: "Probationer")
 * Bản ghi này được tạo tự động khi ứng viên chấp nhận Offer (REQ-019).
 */
export interface Probationer {
  id: string;               // Mã định danh duy nhất
  userId: string;           // ID tài khoản hệ thống (role="probationer") – tạo tự động (REQ-019)
  candidateId: string;      // ID hồ sơ ứng viên gốc
  offerId: string;          // ID Offer đã chấp nhận

  // Thông tin cá nhân – chép từ Candidate để hiển thị nhanh (REQ-020)
  fullName: string;         // Họ và tên
  email: string;            // Email (cũng là username đăng nhập)
  phone: string;            // Số điện thoại
  avatar?: string;          // Ảnh đại diện (không bắt buộc)

  // Thông tin công việc (REQ-020)
  jobId: string;            // ID vị trí tuyển dụng
  jobTitle: string;         // Tên vị trí – chép từ Job để hiển thị
  department: string;       // Phòng ban – chép từ Job để lọc (REQ-020: "lọc theo phòng ban")

  // Thông tin thử việc (REQ-017, REQ-020)
  startDate: string;        // Ngày bắt đầu thử việc – định dạng "2024-12-31"
  endDate: string;          // Ngày kết thúc thử việc – định dạng "2024-12-31"
  supervisorId: string;     // ID Hiring Manager phụ trách (REQ-026: "người hướng dẫn")
  supervisorName: string;   // Tên Hiring Manager – chép để hiển thị

  status: ProbationStatus;  // Trạng thái thử việc hiện tại

  // Thông tin đánh giá (sau khi HM nộp – UC-13)
  evaluationId?: string;    // ID phiếu đánh giá thử việc (có sau khi HM nộp)
  evaluation?: ProbationEvaluation; // Chi tiết đánh giá từ database (KPI, nhận xét...)

  createdAt: string;        // Ngày tạo bản ghi thử việc
  updatedAt: string;        // Ngày cập nhật gần nhất
}

/**
 * Kết quả đánh giá thử việc do Hiring Manager nộp (UC-13, REQ-023)
 * Đây là thực thể "ProbationEval" trong CRUD matrix.
 * Sau khi HM nộp, trạng thái Probationer chuyển sang "pending_evaluation".
 */
export interface ProbationEvaluation {
  id: string;                 // Mã định danh duy nhất
  probationerId: string;      // ID nhân viên thử việc được đánh giá
  evaluatedBy: string;        // ID Hiring Manager thực hiện đánh giá

  // Nội dung đánh giá (REQ-023: "điểm KPI, nhận xét, đề xuất")
  kpiScore: number;           // Điểm KPI (ví dụ: 1–10)
  comment: string;            // Nhận xét về hiệu suất, thái độ trong thời gian thử việc

  /**
   * Đề xuất của Hiring Manager (REQ-023, UC-13 luồng chính)
   * - sign_contract: "Ký HĐ chính thức"
   * - terminate: "Không đạt – Chấm dứt thử việc"
   */
  recommendation: "sign_contract" | "terminate";

  submittedAt: string;        // Thời điểm HM nộp đánh giá

  // Phản hồi của Director sau khi duyệt (UC-14, REQ-024)
  directorDecision?: "approved" | "rejected"; // Director đồng ý hoặc không đồng ý với đề xuất
  directorComment?: string;   // Nhận xét của Director – bắt buộc khi rejected (REQ-024 AC-2)
  directorReviewedAt?: string; // Thời điểm Director phê duyệt
}

/**
 * Dữ liệu Hiring Manager gửi lên khi nộp đánh giá thử việc (UC-13, REQ-023)
 * Sau khi nộp, hệ thống tự gửi lên Director để phê duyệt (UC-14).
 */
export interface SubmitProbationEvaluationPayload {
  kpiScore: number;                               // Điểm KPI
  comment: string;                               // Nhận xét
  recommendation: "sign_contract" | "terminate"; // Đề xuất "Ký HĐ" hoặc "Chấm dứt"
}

/**
 * Dữ liệu Director gửi lên khi phê duyệt / từ chối đánh giá thử việc (UC-14, REQ-024)
 * - Nếu approved: cập nhật Probationer status theo recommendation (passed / failed)
 *                 gửi email thông báo kết quả cho nhân viên (REQ-025)
 * - Nếu rejected: trả đánh giá về HM kèm comment (REQ-024 AC-2)
 */
export interface ReviewProbationEvaluationPayload {
  decision: "approved" | "rejected"; // Quyết định của Director
  comment?: string;                  // Nhận xét / lý do từ chối (bắt buộc khi rejected)
}

/**
 * Bộ lọc tìm kiếm danh sách nhân viên thử việc (UC-11, REQ-020)
 * Recruiter có thể lọc theo phòng ban hoặc trạng thái để theo dõi tổng quan.
 */
export interface ProbationerFilter {
  keyword?: string;            // Tìm theo tên hoặc email (không bắt buộc)
  department?: string;         // Lọc theo phòng ban (REQ-020: "lọc theo phòng ban/trạng thái")
  status?: ProbationStatus;    // Lọc theo trạng thái thử việc (REQ-020)
  supervisorId?: string;       // Lọc theo Hiring Manager phụ trách (không bắt buộc)
  startFrom?: string;          // Lọc nhân viên bắt đầu từ ngày – định dạng "2024-01-01"
  endBefore?: string;          // Lọc nhân viên hết thử việc trước ngày – định dạng "2024-01-01"
}
