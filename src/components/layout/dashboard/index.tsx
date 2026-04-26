import { useState } from "react";
import { Outlet } from "react-router-dom";
import DashboardHeader from "./Header";
import Sidebar from "./Sidebar";
import { useAuth } from "@/hooks/useAuth";

const DashboardLayout = () => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Outlet />
      </main>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} role={user.role} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
