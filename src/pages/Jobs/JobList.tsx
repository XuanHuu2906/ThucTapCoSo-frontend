import React from "react";
import { Link } from "react-router-dom";

const JobList: React.FC = () => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm min-h-[60vh]">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Cơ hội nghề nghiệp
      </h1>

      <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
        <h2 className="text-xl font-semibold text-blue-600">
          Chuyên viên Quản lý sản phẩm
        </h2>
        <p className="text-gray-500 mb-4">Công ty Cổ phần VinSmart Future</p>

        {/* Nút này sẽ đổi URL sang /jobs/1 mà không tải lại trang */}
        <Link
          to="/jobs/1"
          className="inline-block px-4 py-2 bg-blue-50 text-blue-600 rounded-md font-medium hover:bg-blue-100"
        >
          Xem chi tiết công việc
        </Link>
      </div>
    </div>
  );
};

export default JobList;
