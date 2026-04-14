import { Bell, Menu } from "lucide-react";
import React from "react";
import ThemeToggle from "../../ui/ThemeToggle";
import { Link, useLocation } from "react-router-dom";

interface HeaderProps {
  onMenuClick?: () => void;
}

const DashboardHeader: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const location = useLocation();

  return (
    <header className="h-16 bg-[#2F86C6] border-b border-blue-400 flex items-center justify-between px-6 sticky top-0 z-50 shadow-sm">
      {/* LEFT */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-1.5 text-white hover:bg-blue-600 rounded-md transition-colors cursor-pointer block lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="text-sm flex items-center">
          {/* Trang chủ */}
          <Link
            to="/"
            className={`transition-all duration-300 px-2 py-1 rounded-md ${location.pathname === "/"
                ? "bg-white text-[#2F86C6] font-semibold"
                : "text-blue-100 hover:text-white"
              }`}
          >
            Trang chủ
          </Link>

          <span className="mx-2 text-blue-300">/</span>

          {/* Jobs */}
          <Link
            to="/jobs"
            className={`transition-all duration-300 px-2 py-1 rounded-md ${location.pathname.startsWith("/jobs")
                ? "bg-white text-[#2F86C6] font-semibold"
                : "text-blue-100 hover:text-white"
              }`}
          >
            Danh sách công việc
          </Link>

          {/* Create */}
        </div>
      </div>

<<<<<<< HEAD:src/components/layout/dashboard/Header.tsx
  {/* PHẢI: Bell + Profile (giữ nguyên) */ }
=======
      {/* RIGHT */}
>>>>>>> origin/main:src/components/layout/DashboardHeader.tsx
  <div className="flex items-center gap-4">
    <button className="relative p-2 text-white cursor-pointer hover:bg-blue-600 rounded-full transition-colors">
      <Bell className="w-5 h-5" />
      <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-[#2F86C6] rounded-full animate-pulse"></span>
    </button>

    {/* Nút chuyển Dark / Light mode */}
    <ThemeToggle />

    <div className="w-px h-6 bg-blue-400"></div>

    <div className="flex items-center gap-3 p-1 pr-2 rounded-md cursor-pointer hover:bg-blue-600 transition-colors group">
      <div className="text-right">
        <p className="text-sm font-semibold text-white leading-tight">
          Trần Thị B
        </p>
        <p className="text-xs text-blue-100 leading-tight">
          Hiring Manager
        </p>
      </div>
      <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#2F86C6] font-bold text-sm shadow-sm border border-blue-200">
        TT
      </div>
    </div>
  </div>
    </header >
  );
};

export default DashboardHeader;
