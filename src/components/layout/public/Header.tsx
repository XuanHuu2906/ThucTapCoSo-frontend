import React from "react";
import { Link } from "react-router-dom";

const PublicHeader: React.FC = () => {
  return (
    <header className="h-16 bg-white/60 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 flex items-center justify-between px-8 shadow-sm">
      {/* Bên Trái: Logo */}
      <Link to="/" className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-sm">
          HR
        </div>
        <span className="font-extrabold text-gray-800 text-2xl tracking-tight">
          TalentFlow
        </span>
      </Link>

      {/* Bên Phải: Nút Đăng nhập */}
      <Link
        to="/login"
        className="px-6 py-2 text-blue-600 font-semibold border-2 border-blue-600 rounded-lg hover:bg-blue-200 transition-colors duration-300"
      >
        Đăng nhập
      </Link>
    </header>
  );
};

export default PublicHeader;
