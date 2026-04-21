// job.ts – Kiểu dữ liệu vị trí tuyển dụng (UC-02)

/** Hình thức làm việc */
export type JobType =
  | "full-time"   // Toàn thời gian
  | "part-time"   // Bán thời gian
  | "internship"  // Thực tập
  | "freelance"   // Freelance / Cộng tác viên
  | "remote";     // Làm việc từ xa

/** Cấp độ kinh nghiệm yêu cầu */
export type ExperienceLevel =
  | "fresher"  // Mới ra trường, chưa có kinh nghiệm
  | "junior"   // Dưới 2 năm kinh nghiệm
  | "middle"   // 2–4 năm kinh nghiệm
  | "senior"   // 4+ năm kinh nghiệm
  | "lead"     // Lead / Tech Lead
  | "manager"; // Quản lý

/**
 * Trạng thái của một tin tuyển dụng (UC-02, REQ-004, REQ-005)
 * - draft: Lưu nháp, không hiển thị công khai (REQ-004 AC-3)
 * - published: Đăng công khai, ứng viên có thể thấy và nộp đơn (REQ-004 AC-1)
 * - closed: Đã đóng, không còn nhận hồ sơ (REQ-005 AC-2)
 * - filled: Đã tuyển đủ người
 */
export type JobStatus =
  | "draft"      // Bản nháp – lưu nhưng chưa đăng công khai
  | "published"  // Đang tuyển – hiển thị công khai cho ứng viên nộp đơn
  | "closed"     // Đã đóng – không còn nhận hồ sơ
  | "filled";    // Đã tuyển đủ người

/** Thông tin đầy đủ của một vị trí tuyển dụng */
export interface Job {
  id: string;                        // Mã định danh duy nhất
  title: string;                     // Tên vị trí (ví dụ: "Frontend Developer")
  department: string;                // Phòng ban (ví dụ: "Kỹ thuật", "Kế toán")
  location: string;                  // Địa điểm làm việc (ví dụ: "Hà Nội")
  type: JobType;                     // Hình thức làm việc
  experienceLevel: ExperienceLevel;  // Cấp độ kinh nghiệm yêu cầu
  description: string;               // Mô tả công việc chi tiết (REQ-004)
  requirements: string[];            // Danh sách yêu cầu – mỗi phần tử là một yêu cầu (REQ-004)
  benefits?: string[];               // Danh sách phúc lợi (không bắt buộc)
  salaryMin?: number;                // Lương tối thiểu (không bắt buộc – REQ-004)
  salaryMax?: number;                // Lương tối đa (không bắt buộc – REQ-004)
  currency?: string;                 // Đơn vị tiền tệ (ví dụ: "VND", "USD")
  headcount: number;                 // Số lượng cần tuyển
  deadline: string;                  // Hạn nộp hồ sơ – định dạng "2024-12-31" (REQ-004)
  status: JobStatus;                 // Trạng thái tin tuyển dụng
  applicants?: number;               // Số lượng người đã ứng tuyển (được tính toán từ bảng Application)
  createdBy: string;                 // ID của recruiter đã tạo tin này
  createdAt: string;                 // Ngày tạo tin
  updatedAt: string;                 // Ngày cập nhật gần nhất
}

/**
 * Dữ liệu gửi lên khi tạo hoặc chỉnh sửa tin tuyển dụng (REQ-004, REQ-005)
 * Không có trường status – server tự xác định dựa vào hành động ("Đăng tin" hoặc "Lưu nháp").
 */
export interface JobPayload {
  title: string;                     // Tên vị trí
  department: string;                // Phòng ban
  location: string;                  // Địa điểm làm việc
  type: JobType;                     // Hình thức làm việc
  experienceLevel: ExperienceLevel;  // Cấp độ kinh nghiệm
  description: string;               // Mô tả công việc
  requirements: string[];            // Danh sách yêu cầu
  benefits?: string[];               // Danh sách phúc lợi (không bắt buộc)
  salaryMin?: number;                // Lương tối thiểu (không bắt buộc)
  salaryMax?: number;                // Lương tối đa (không bắt buộc)
  currency?: string;                 // Đơn vị tiền tệ (không bắt buộc)
  headcount: number;                 // Số lượng cần tuyển
  deadline: string;                  // Hạn nộp hồ sơ – định dạng "2024-12-31"
  saveAsDraft?: boolean;             // true = "Lưu nháp" | false/undefined = "Đăng tin"
}

/** Bộ lọc dùng để tìm kiếm danh sách tin tuyển dụng */
export interface JobFilter {
  keyword?: string;                  // Tìm theo tên vị trí hoặc phòng ban (không bắt buộc)
  department?: string;               // Lọc theo phòng ban (không bắt buộc)
  type?: JobType;                    // Lọc theo hình thức làm việc (không bắt buộc)
  experienceLevel?: ExperienceLevel; // Lọc theo cấp độ kinh nghiệm (không bắt buộc)
  status?: JobStatus;                // Lọc theo trạng thái tin (không bắt buộc)
  location?: string;                 // Lọc theo địa điểm (không bắt buộc)
}
