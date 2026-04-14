import { ArrowRight } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const jobs = [
  { id: 1, title: "Chuyên viên Quản lý sản phẩm" },
  { id: 2, title: "Designer UI/UX" },
  { id: 3, title: "FullStack Developer" },
];

const JobList: React.FC = () => {
  return (
    // Bọc ngoài cùng với một chút màu nền gradient nhẹ để nổi bật các card trắng
    <div className="min-h-screen  p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-8 text-gray-900 tracking-tight">
          Cơ hội nghề nghiệp
        </h1>

        {/* Chuyển khoảng cách gap vào container cha */}
        <div className="flex flex-col gap-5">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="group bg-white/90 border border-violet-700 rounded-2xl p-6 shadow-lg hover:shadow-violet-500 hover:border-violet-500 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                    {job.title}
                  </h2>
                  <p className="text-gray-500 mt-1.5 font-medium">
                    Công ty Cổ phần VinSmart Future
                  </p>
                </div>

                <Link
                  to={`/jobs/${job.id}`}
                  className="inline-flex items-center justify-center px-6 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-semibold hover:bg-blue-600 hover:text-white transition-colors duration-300 whitespace-nowrap"
                >
                  Xem chi tiết công việc
                  {/* Thêm một icon mũi tên nhỏ để nút trông xịn hơn */}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobList;
