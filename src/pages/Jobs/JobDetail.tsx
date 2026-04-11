import React from "react";
import { Link } from "react-router-dom";

const JobDetail: React.FC = () => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm min-h-[60vh]">
      {/* Nút quay lại */}
      <Link
        to="/"
        className="text-gray-500 hover:text-blue-600 flex items-center gap-2 mb-6"
      >
        ← Quay lại danh sách
      </Link>
      <h2 className="text-xl font-semibold text-blue-600 mb-6">
        Chuyên viên Quản lý sản phẩm
      </h2>

      <div className="bg-slate-50 p-6 rounded-lg border border-gray-100">
        <p>
          <strong>Mô tả:</strong> Chịu trách nhiệm phát triển sản phẩm...
        </p>
        <p>
          <strong>Địa điểm:</strong> Hà Nội
        </p>
        <p>
          <strong>Mức lương:</strong> Thỏa thuận
        </p>
      </div>
    </div>
  );
};

export default JobDetail;
