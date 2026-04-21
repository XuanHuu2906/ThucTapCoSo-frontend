import { Bell, LogOut } from "lucide-react";
import React, { useState } from "react";
import ThemeToggle from "../../ui/ThemeToggle";
import { Link } from "react-router-dom";
import logo from "../../../assets/images/Logo.png";
import useClickOutside from "../../../hooks/useClickOutside";

const DashboardHeader: React.FC = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Áp dụng Custom Hook để dọn dẹp logic
  const profileRef = useClickOutside<HTMLDivElement>(() => setIsProfileOpen(false));

  return (
    <header className="h-18 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 flex items-center justify-between px-8 shadow-sm">
      {/* LEFT - Empty or Breadcrumbs can go here */}
      <div className="flex-1"></div>

      {/* RIGHT */}
      <div className="flex items-center justify-between gap-4">
        <button className="relative p-2 cursor-pointer rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 border-2 rounded-full animate-pulse"></span>
        </button>

        {/* Nút chuyển Dark / Light mode */}
        <ThemeToggle />

        <div className="w-px h-6 bg-black"></div>

        {/* PROFILE UI WITH DROPDOWN */}
        <div className="relative" ref={profileRef}>
          <div
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1.5 pr-3 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group select-none"
          >
            <div className="text-right">
              <p className="text-sm font-semibold leading-tight text-slate-900 dark:text-slate-100">
                Trần Thị B
              </p>
              <p className="text-xs leading-tight text-slate-500 dark:text-slate-400">
                Hiring Manager
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-blue-600 font-bold text-sm shadow-sm border border-slate-200 dark:border-slate-700">
              TT
            </div>
          </div>

          {/* DROPDOWN MENU */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 dark:border-slate-800 p-4 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
              <div className="flex items-start gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg bg-blue-50 dark:bg-slate-800/50 shadow-inner shrink-0">
                  TT
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">Trần Thị B</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">Hiring Manager</p>
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500 truncate mt-1">Phòng Nhân sự</p>
                </div>
              </div>

              <div className="py-3 space-y-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Vai trò</span>
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 text-xs font-semibold rounded-full ring-1 ring-inset ring-blue-600/20 dark:ring-blue-500/20">
                    Hiring Manager
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Trạng thái</span>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 text-xs font-semibold rounded-full ring-1 ring-inset ring-emerald-600/20 dark:ring-emerald-500/20 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 relative">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
                    </span>
                    Đang làm việc
                  </span>
                </div>
              </div>

              <div className="pt-3">
                <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-xl transition-colors">
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
