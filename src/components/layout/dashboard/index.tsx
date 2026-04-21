import { useState } from "react";
import { Outlet } from "react-router-dom";
import DashboardHeader from "./Header";
import Sidebar from "./Sidebar";
import type { UserRole } from "../../../types";

// TODO: Thay bằng useAuth() sau khi có AuthContext
const MOCK_ROLE: UserRole = "recruiter";

// Danh sách các role cần hiện Header/Sidebar
const ROLES_WITH_HEADER: UserRole[] = [
  "recruiter",
  "manager",
  "director",
  "probationer",
];

const DashboardLayout = () => {
  const role = MOCK_ROLE;
  const [collapsed, setCollapsed] = useState(false);

  if (ROLES_WITH_HEADER.includes(role)) {
    return (
      <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
        {/* Sidebar */}
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

        {/* Right Content Area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Outlet />
    </main>
  );
};

export default DashboardLayout;
