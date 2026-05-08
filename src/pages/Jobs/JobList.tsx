import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { jobService } from "@/services";
import type { Job } from "@/types";

const JobList: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Cấu hình phân trang
  const ITEMS_PER_PAGE = 3;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    jobService
      .getJobs({ status: "published" })
      .then(setJobs)
      .catch(() => setError("Không thể tải danh sách việc làm."))
      .finally(() => setIsLoading(false));
  }, []);

  // Tính toán các tin hiển thị trên trang hiện tại
  const totalPages = Math.ceil(jobs.length / ITEMS_PER_PAGE) || 1;
  const currentJobs = jobs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    // Bọc ngoài cùng với một chút màu nền gradient nhẹ để nổi bật các card trắng
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-8 text-gray-900 tracking-tight">
          Cơ hội nghề nghiệp
        </h1>

        {isLoading && (
          <div className="rounded-2xl border border-[#cccdfa] bg-white/80 p-6 text-sm font-semibold text-gray-500">
            Đang tải danh sách việc làm...
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-5">
          {currentJobs.map((job) => (
            <div
              key={job.id}
              className="group bg-white/90 border border-[#cccdfa] rounded-2xl p-6 shadow-lg hover:shadow-[#cccdfa] hover:border-[#cccdfa] transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                    {job.title}
                  </h2>
                  <p className="text-gray-500 mt-1.5 font-medium">
                    {job.department}
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

        {/* Premium Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 px-4 py-2 bg-white border border-[#cccdfa] rounded-xl font-semibold text-gray-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Trước
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-10 h-10 rounded-xl font-bold transition-all duration-200 shadow-sm ${currentPage === page
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : "bg-white border border-[#cccdfa] text-gray-700 hover:bg-blue-50"
                  }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 px-4 py-2 bg-white border border-[#cccdfa] rounded-xl font-semibold text-gray-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            >
              Sau
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobList;
