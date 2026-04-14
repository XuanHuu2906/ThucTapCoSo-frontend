// interview.ts – Kiểu dữ liệu lịch phỏng vấn (UC-05, UC-06, UC-07)

/** Hình thức phỏng vấn */
export type InterviewMode =
  | "online"   // Qua video call (Google Meet, Zoom...)
  | "offline"  // Trực tiếp tại văn phòng
  | "phone";   // Qua điện thoại

/** Vòng phỏng vấn */
export type InterviewRound =
  | "screening"  // Vòng sàng lọc sơ bộ – thường qua điện thoại
  | "technical"  // Vòng kỹ thuật / chuyên môn (do Hiring Manager dẫn – UC-07)
  | "hr"         // Vòng HR – trao đổi về văn hoá, lương, phúc lợi
  | "director"   // Vòng gặp Giám đốc
  | "final";     // Vòng cuối trước khi ra quyết định tuyển

/**
 * Trạng thái của một buổi phỏng vấn (UC-05, UC-06, REQ-011, REQ-013)
 *
 * Luồng trạng thái:
 *   scheduled
 *   → confirmed (ứng viên xác nhận – REQ-013 AC-1)
 *   → declined  (ứng viên từ chối – REQ-013 AC-2)
 *   → done      (buổi đã diễn ra, Hiring Manager nộp đánh giá – UC-07)
 *   → cancelled (huỷ lịch – UC phụ "Hủy lịch phỏng vấn")
 */
export type InterviewStatus =
  | "scheduled"   // Đã đặt lịch, chờ ứng viên xác nhận (REQ-012: email gửi ngay sau khi tạo)
  | "confirmed"   // Ứng viên đã xác nhận tham gia (REQ-013 AC-1)
  | "declined"    // Ứng viên từ chối – Recruiter cần sắp xếp lại (REQ-013 AC-2)
  | "done"        // Buổi phỏng vấn đã diễn ra xong
  | "cancelled";  // Lịch bị huỷ

/** Thông tin đầy đủ của một buổi phỏng vấn */
export interface Interview {
  id: string;                   // Mã định danh duy nhất
  applicationId: string;        // ID đơn ứng tuyển liên quan
  candidateId: string;          // ID của ứng viên được phỏng vấn
  candidateName: string;        // Tên ứng viên – chép từ Candidate để hiển thị
  jobId: string;                // ID vị trí tuyển dụng liên quan
  jobTitle: string;             // Tên vị trí – chép từ Job để hiển thị
  round: InterviewRound;        // Đây là vòng phỏng vấn nào
  mode: InterviewMode;          // Hình thức tổ chức
  scheduledAt: string;          // Thời gian bắt đầu – định dạng "2024-12-31T09:00:00Z"
  durationMinutes: number;      // Thời lượng dự kiến tính bằng phút (ví dụ: 60)
  location?: string;            // Phòng họp / địa chỉ – dùng khi hình thức offline
  meetingUrl?: string;          // Link Google Meet / Zoom – dùng khi hình thức online
  interviewerIds: string[];     // Danh sách ID Hiring Manager tham gia phỏng vấn (REQ-011)
  status: InterviewStatus;      // Trạng thái buổi phỏng vấn
  note?: string;                // Ghi chú thêm (không bắt buộc)
  createdAt: string;            // Ngày tạo lịch
  updatedAt: string;            // Ngày cập nhật gần nhất
}

/**
 * Đánh giá phỏng vấn của Hiring Manager sau buổi phỏng vấn (UC-07, REQ-014)
 * Đây là thực thể "InterviewEval" trong CRUD matrix.
 * Tách riêng khỏi Interview để HM có thể submit sau khi buổi kết thúc.
 */
export interface InterviewEvaluation {
  id: string;                // Mã định danh duy nhất
  interviewId: string;       // ID buổi phỏng vấn được đánh giá
  applicationId: string;     // ID đơn ứng tuyển liên quan
  candidateId: string;       // ID ứng viên được đánh giá
  evaluatedBy: string;       // ID của Hiring Manager thực hiện đánh giá

  // Điểm 3 tiêu chí (REQ-014 AC-1: "điểm 3 tiêu chí + nhận xét")
  technicalScore: number;    // Điểm kỹ năng chuyên môn (ví dụ: 1–10)
  softSkillScore: number;    // Điểm kỹ năng mềm (ví dụ: 1–10)
  attitudeScore: number;     // Điểm thái độ (ví dụ: 1–10)

  comment?: string;          // Nhận xét thêm (không bắt buộc)

  /**
   * Kết quả cuối cùng của buổi phỏng vấn (REQ-014 AC-2, AC-3)
   * - passed: cập nhật Application status="interview_passed", cho phép tạo Offer
   * - failed: cập nhật Application status="interview_failed", không thể tạo Offer
   */
  result: "passed" | "failed";

  submittedAt: string;       // Thời điểm nộp đánh giá
}

/**
 * Dữ liệu gửi lên khi đặt lịch phỏng vấn mới (UC-05, REQ-011, REQ-012)
 * Hệ thống sẽ kiểm tra xung đột lịch của Hiring Manager (REQ-011).
 * Sau khi tạo thành công, hệ thống tự gửi email mời ứng viên và thông báo HM (REQ-012).
 */
export interface ScheduleInterviewPayload {
  applicationId: string;    // ID đơn ứng tuyển liên quan
  candidateId: string;      // ID ứng viên được phỏng vấn
  jobId: string;            // ID vị trí tuyển dụng
  round: InterviewRound;    // Vòng phỏng vấn
  mode: InterviewMode;      // Hình thức tổ chức
  scheduledAt: string;      // Thời gian bắt đầu – định dạng "2024-12-31T09:00:00Z"
  durationMinutes: number;  // Thời lượng dự kiến (phút)
  location?: string;        // Địa điểm – điền khi hình thức offline
  meetingUrl?: string;      // Link họp – điền khi hình thức online
  interviewerIds: string[]; // Danh sách ID Hiring Manager – server kiểm tra xung đột
  note?: string;            // Ghi chú thêm (không bắt buộc)
}

/**
 * Dữ liệu ứng viên gửi lên khi phản hồi lịch phỏng vấn (UC-06, REQ-013)
 * Ứng viên nhấn link trong email → gọi API này.
 */
export interface ConfirmInterviewPayload {
  token: string;                  // Token xác thực từ link email
  response: "confirmed" | "declined"; // Đồng ý tham gia hoặc từ chối
}

/**
 * Dữ liệu HM gửi lên khi nộp đánh giá phỏng vấn (UC-07, REQ-014)
 */
export interface SubmitInterviewEvaluationPayload {
  technicalScore: number;         // Điểm kỹ năng chuyên môn
  softSkillScore: number;         // Điểm kỹ năng mềm
  attitudeScore: number;          // Điểm thái độ
  comment?: string;               // Nhận xét thêm (không bắt buộc)
  result: "passed" | "failed";    // Đạt / Không đạt
}

/** Bộ lọc tìm kiếm lịch phỏng vấn */
export interface InterviewFilter {
  candidateId?: string;       // Lọc theo ứng viên (không bắt buộc)
  jobId?: string;             // Lọc theo vị trí tuyển dụng (không bắt buộc)
  interviewerId?: string;     // Lọc theo Hiring Manager (không bắt buộc)
  status?: InterviewStatus;   // Lọc theo trạng thái (không bắt buộc)
  round?: InterviewRound;     // Lọc theo vòng phỏng vấn (không bắt buộc)
  from?: string;              // Lọc từ ngày – định dạng "2024-01-01"
  to?: string;                // Lọc đến ngày – định dạng "2024-01-01"
}
