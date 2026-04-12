import React from "react";
import { Link } from "react-router-dom";

const jobs = [
  { id: 1, title: "Chuyên viên Quản lý sản phẩm" },
  { id: 2, title: "Designer UI/UX" },
  { id: 3, title: "FullStack Developer" },
];
const JobList: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Cơ hội nghề nghiệp
      </h1>
      {jobs.map((job) => (
        <div key={job.id} className="space-y-4">
          <div className="border-b-2 border-x border-l-chart-1 rounded-2xl border-gray-700  ">
            <h2 className="text-xl font-semibold text-blue-600 mx-2">
              {job.title}
            </h2>
            <p className="text-gray-500 mb-4 mx-2">
              Công ty Cổ phần VinSmart Future
            </p>

            {/* Nút này sẽ đổi URL sang /jobs/1 mà không tải lại trang */}
            <Link
              to={`/jobs/${job.id}`}
              className="inline-block mx-2 px-4 py-2  text-blue-600 rounded-md font-medium hover:bg-blue-100"
            >
              Xem chi tiết công việc
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default JobList;
