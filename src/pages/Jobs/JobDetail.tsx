import React from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
const jobs = [
  {
    id: 1,
    title: "Chuyên viên Quản lý sản phẩm",
    description: "Chịu trách nhiệm phát triển sản phẩm...",
    location: "Hà Nội",
    salary: "Thỏa thuận",
  },
  {
    id: 2,
    title: "Designer UI/UX",
    description: "Thiết kế giao diện người dùng...",
    location: "TP.HCM",
    salary: "1000$",
  },
  {
    id: 3,
    title: "FullStack Developer",
    description: "Phát triển hệ thống web...",
    location: "Đà Nẵng",
    salary: "1500$",
  },
];
const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const job = jobs.find((j) => j.id === Number(id));

  if (!job) {
    return <div>Job not found</div>;
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm min-h-[60vh]">
      {/* Nút quay lại */}
      <Link
        to="/jobs"
        className="text-gray-500 hover:text-blue-600 flex items-center gap-2 mb-6"
      >
        ← Quay lại danh sách
      </Link>
      <h2 className="text-xl font-semibold text-blue-600 mb-6">{job.title}</h2>

      <div className="bg-slate-50 p-6 rounded-lg border border-gray-100">
        <p>
          <strong>Mô tả:</strong> {job.description}
        </p>
        <p>
          <strong>Địa điểm:</strong> {job.location}
        </p>
        <p>
          <strong>Mức lương:</strong> {job.salary}
        </p>
      </div>
    </div>
  );
};

export default JobDetail;
