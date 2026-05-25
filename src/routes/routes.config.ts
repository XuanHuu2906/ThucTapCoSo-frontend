import {
  BarChart3,
  Briefcase,
  ClipboardCheck,
  FileCheck2,
  GraduationCap,
  LayoutDashboard,
  Users,
  Settings,
  UserCog,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { UserRole } from "@/types";

export const ROUTES = {
  home: "/",
  login: "/login",
  resetPassword: "/reset-password/:token",
  jobDetail: "/jobs/:id",
  recruiter: {
    dashboard: "/recruiter/dashboard",
    jobs: "/recruiter/jobs",
    candidates: "/recruiter/candidates",
    offers: "/recruiter/offers",
    probation: "/recruiter/probation",
    reports: "/recruiter/reports",
  },
  manager: {
    dashboard: "/manager/dashboard",
    interviews: "/manager/interviews",
    reviews: "/manager/reviews",
  },
  director: {
    dashboard: "/director/dashboard",
    approvals: "/director/approvals",
    reports: "/director/reports",
  },
  probationer: {
    dashboard: "/probationer/dashboard",
  },
  admin: {
    dashboard: "/admin/dashboard",
    users: "/admin/users",
    config: "/admin/config",
  },
} as const;

export const getJobDetailPath = (id: string | number) => `/jobs/${id}`;

export const ROLE_DASHBOARD: Record<UserRole, string> = {
  admin: ROUTES.admin.dashboard,
  recruiter: ROUTES.recruiter.dashboard,
  manager: ROUTES.manager.dashboard,
  director: ROUTES.director.dashboard,
  probationer: ROUTES.probationer.dashboard,
};

export type DashboardNavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
};

export const DASHBOARD_NAV_ITEMS: Record<UserRole, DashboardNavItem[]> = {
  admin: [
    { to: ROUTES.admin.dashboard, label: "Dashboard", icon: LayoutDashboard },
    { to: ROUTES.admin.users, label: "Quản lý người dùng", icon: UserCog },
    { to: ROUTES.admin.config, label: "Cấu hình hệ thống", icon: Settings },
  ],
  recruiter: [
    { to: ROUTES.recruiter.dashboard, label: "Dashboard", icon: LayoutDashboard },
    { to: ROUTES.recruiter.jobs, label: "Tin tuyển dụng", icon: Briefcase },
    { to: ROUTES.recruiter.candidates, label: "Hồ sơ ứng viên", icon: Users },
    { to: ROUTES.recruiter.offers, label: "Quản lý Offer", icon: FileCheck2 },
    { to: ROUTES.recruiter.probation, label: "Quản lý thử việc", icon: ClipboardCheck },
    { to: ROUTES.recruiter.reports, label: "Báo cáo", icon: BarChart3 },
  ],
  manager: [
    { to: ROUTES.manager.dashboard, label: "Dashboard", icon: LayoutDashboard },
    { to: ROUTES.manager.interviews, label: "Lịch phỏng vấn", icon: Briefcase },
    { to: ROUTES.manager.reviews, label: "Đánh giá", icon: ClipboardCheck },
  ],
  director: [
    { to: ROUTES.director.dashboard, label: "Dashboard", icon: LayoutDashboard },
    { to: ROUTES.director.approvals, label: "Phê duyệt", icon: FileCheck2 },
    { to: ROUTES.director.reports, label: "Báo cáo", icon: BarChart3 },
  ],
  probationer: [
    { to: ROUTES.probationer.dashboard, label: "Thử việc", icon: GraduationCap },
  ],
};
