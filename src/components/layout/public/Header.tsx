import React from "react";
import { Link } from "react-router-dom";
import logo from "../../../assets/images/Logo.png";

const PublicHeader: React.FC = () => {
  return (
    <header className="h-18 bg-white/60 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 flex items-center justify-between px-8 shadow-sm">
      <Link
        to="/"
        className="flex items-center gap-2.5 group duration-300"
      >
        <img
          src={logo}
          alt="Logo"
          className="w-auto h-19 object-contain"
        />
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
