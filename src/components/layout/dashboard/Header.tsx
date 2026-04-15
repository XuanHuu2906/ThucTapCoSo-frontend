import { Bell } from "lucide-react";
import React from "react";
import ThemeToggle from "../../ui/ThemeToggle";
import { Link } from "react-router-dom";

const DashboardHeader: React.FC = () => {
  return (
    <header className="h-16 bg-white/60 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 flex items-center justify-between px-8 shadow-sm">
      {/* LEFT */}
      <Link to="/" className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-sm">
          HR
        </div>
        <span className="font-extrabold text-gray-800 text-2xl tracking-tight">
          TalentFlow
        </span>
      </Link>

      {/* RIGHT */}
      <div className="flex items-center justify-between gap-4">
        <button className="relative p-2 bg-blue-600 text-white cursor-pointer hover:bg-blue-200 hover:text-blue-600 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-[#2F86C6] rounded-full animate-pulse"></span>
        </button>

        {/* Nút chuyển Dark / Light mode */}
        <ThemeToggle />

        <div className="w-px h-6 bg-blue-400"></div>

        <div className="flex items-center gap-3 p-1 pr-2 rounded-md bg-blue-600 text-white cursor-pointer hover:bg-blue-200 hover:text-blue-600 transition-colors group">
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
    </header>
  );
};

export default DashboardHeader;
