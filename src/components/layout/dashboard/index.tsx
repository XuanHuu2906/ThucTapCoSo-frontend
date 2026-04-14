// DashboardLayout.tsx – Layout dành cho các trang nội bộ (sau khi đăng nhập)
// Hiện/ẩn Header theo role:
// - recruiter / manager / director / probationer → có Header
// - Role không xác định → chỉ hiện nội dung
import { Outlet } from "react-router-dom";
import DashboardHeader from "./Header";
import type { UserRole } from "../../../types";

// TODO: Thay bằng useAuth() sau khi có AuthContext
const MOCK_ROLE: UserRole = "recruiter";

// Danh sách các role cần hiện Header
const ROLES_WITH_HEADER: UserRole[] = [
  "recruiter",
  "manager",
  "director",
  "probationer",
];

const DashboardLayout = () => {
  const role = MOCK_ROLE;

  if (ROLES_WITH_HEADER.includes(role)) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
        <DashboardHeader />
        <main>
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <Outlet />
    </main>
  );
};

export default DashboardLayout;
