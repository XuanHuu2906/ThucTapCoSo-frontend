import { Bell, Menu } from "lucide-react"; // Bổ sung icon Menu
import React from "react";
import { Link } from "react-router-dom";
interface HeaderProps {
  onMenuClick?: () => void;
}

// Bổ sung destructuring { onMenuClick } ở đây
const DashboardHeader: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="h-16 bg-[#2F86C6] border-b border-blue-400 flex items-center justify-between px-6 sticky top-0 z-50 shadow-sm">
      {/* PHẦN BÊN TRÁI: Nút Menu + Breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Nút bấm để mở/đóng Sidebar */}
        <button
          onClick={onMenuClick}
          className="p-1.5 text-white hover:bg-blue-600 rounded-md transition-colors cursor-pointer block lg:hidden" // Ẩn trên màn hình to, hiện trên mobile/tablet
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="text-sm">
          <span className="cursor-pointer text-blue-100 hover:text-white transition-colors duration-300">
            <Link to="/">Trang chủ</Link>
          </span>
          <span className="mx-2 text-blue-300">/</span>
          <span className="font-semibold text-white">
            <Link to="/jobs">Danh sách công việc</Link>
          </span>
        </div>
      </div>

      {/* PHẦN BÊN PHẢI: Bell + Profile (Giữ nguyên của bạn vì đã quá chuẩn) */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-white cursor-pointer hover:bg-blue-600 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-[#2F86C6] rounded-full animate-pulse"></span>
        </button>

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
    </header>
  );
};

export default DashboardHeader;
