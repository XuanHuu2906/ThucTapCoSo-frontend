import type { ApplicationStatus, JobStatus, OfferStatus, ProbationStatus, UserRole } from "@/types";

export const APP_NAME = "TalentFlow";
const rawApiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
export const API_URL = rawApiUrl.endsWith("/api/v1") ? rawApiUrl : `${rawApiUrl}/api/v1`;
export const AUTH_TOKEN_KEY = "rms_access_token";
export const AUTH_REFRESH_TOKEN_KEY = "rms_refresh_token";

export const ROLE_LABELS: Record<UserRole, string> = {
  recruiter: "Chuyên viên tuyển dụng",
  manager: "Hiring Manager",
  director: "Giám đốc",
  probationer: "Nhân viên thử việc",
};

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  draft: "Bản nháp",
  published: "Đang tuyển",
  closed: "Đã đóng",
  filled: "Đã tuyển đủ",
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  new: "Mới",
  shortlisted: "Đã chọn",
  interviewing: "Đang phỏng vấn",
  interview_passed: "Qua phỏng vấn",
  interview_failed: "Không đạt phỏng vấn",
  offered: "Đã offer",
  hired: "Đã tuyển",
  rejected: "Đã loại",
  withdrawn: "Đã rút đơn",
};

export const OFFER_STATUS_LABELS: Record<OfferStatus, string> = {
  pending_approval: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
  accepted: "Ứng viên nhận offer",
  declined: "Ứng viên từ chối",
};

export const PROBATION_STATUS_LABELS: Record<ProbationStatus, string> = {
  probating: "Đang thử việc",
  pending_evaluation: "Chờ đánh giá",
  passed: "Đạt thử việc",
  failed: "Không đạt",
};

export const CANDIDATE_STATUS_LABELS: Record<ApplicationStatus, string> = {
  new: "Mới",
  shortlisted: "Đã chọn",
  interviewing: "Hẹn PV",
  interview_passed: "Qua PV",
  interview_failed: "Đã loại",
  offered: "Chờ offer",
  hired: "Đã tuyển",
  rejected: "Đã loại",
  withdrawn: "Đã loại",
};

export const CANDIDATE_STATUS_TABS = ["Tất cả", "Mới", "Đã chọn", "Đã tuyển", "Đã loại"];

export const CANDIDATE_STATUS_COLORS: Record<string, { bg: string; text: string; ring: string }> = {
  "Mới": { bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-700 dark:text-blue-400", ring: "ring-blue-600/20 dark:ring-blue-500/20" },
  "Đã chọn": { bg: "bg-indigo-50 dark:bg-indigo-500/10", text: "text-indigo-700 dark:text-indigo-400", ring: "ring-indigo-600/20 dark:ring-indigo-500/20" },
  "Qua PV": { bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", ring: "ring-emerald-600/20 dark:ring-emerald-500/20" },
  "Hẹn PV": { bg: "bg-purple-50 dark:bg-purple-500/10", text: "text-purple-700 dark:text-purple-400", ring: "ring-purple-600/20 dark:ring-purple-500/20" },
  "Chờ offer": { bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-700 dark:text-amber-400", ring: "ring-amber-600/20 dark:ring-amber-500/20" },
  "Đã tuyển": { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-700 dark:text-slate-200", ring: "ring-slate-400/20 dark:ring-slate-500/20" },
  "Đã loại": { bg: "bg-rose-50 dark:bg-rose-500/10", text: "text-rose-700 dark:text-rose-400", ring: "ring-rose-600/20 dark:ring-rose-500/20" },
};

