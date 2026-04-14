import { ArrowLeft, BadgeDollarSign, MapPin, FileText } from "lucide-react";
import React from "react";
import { Link, useParams } from "react-router-dom";
import NotFound from "../NotFound";

const jobs = [
  {
    id: 1,
    title: "Chuyên viên Quản lý sản phẩm",
    description:
      "Chịu trách nhiệm phát triển sản phẩm, lên kế hoạch chiến lược, nghiên cứu thị trường và phối hợp với các đội ngũ kỹ thuật để đưa sản phẩm ra mắt thành công.",
    location: "Hà Nội",
    salary: "Thỏa thuận",
  },
  {
    id: 2,
    title: "Designer UI/UX",
    description:
      "Thiết kế giao diện người dùng, tối ưu hóa trải nghiệm khách hàng trên các nền tảng web và mobile. Thực hiện wireframe, prototype và user flow.",
    location: "TP.HCM",
    salary: "1000$",
  },
  {
    id: 3,
    title: "FullStack Developer",
    description:
      "Phát triển hệ thống web từ Frontend (ReactJS) đến Backend (NodeJS/Java). Thiết kế cơ sở dữ liệu và đảm bảo hiệu suất, bảo mật cho ứng dụng.",
    location: "Đà Nẵng",
    salary: "1500$",
  },
];

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const job = jobs.find((j) => j.id === Number(id));

  // Giao diện khi nhập sai ID hoặc không tìm thấy công việc
  if (!job) {
    return <NotFound />;
  }

  return (
    // Background đồng bộ với trang danh sách
    <div className="min-h-screen p-6 md:p-12 flex justify-center items-start">
      <div className="max-w-3xl w-full bg-white/95 backdrop-blur-sm p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100">
        {/* Nút quay lại với hiệu ứng trượt mũi tên */}
        <Link
          to="/"
          className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-6 h-6 mr-2 transform group-hover:translate-x-1 transition duration-300" />
          Quay lại danh sách
        </Link>

        {/* Tiêu đề chính */}
        <div className="border-b border-gray-100 pb-8 mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
            {job.title}
          </h1>
          <p className="text-lg text-blue-600 font-medium">
            Công ty Cổ phần VinSmart Future
          </p>
        </div>

        {/* Các khối thông tin nổi bật (Grid Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          {/* Khối Địa điểm */}
          <div className="flex items-center p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100">
            <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-600 mr-4">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium mb-0.5">
                Địa điểm làm việc
              </p>
              <p className="text-lg font-bold text-gray-800">{job.location}</p>
            </div>
          </div>

          {/* Khối Mức lương */}
          <div className="flex items-center p-5 bg-green-50/50 rounded-2xl border border-green-100">
            <div className="p-3 bg-white rounded-xl shadow-sm text-green-600 mr-4">
              <BadgeDollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium mb-0.5">
                Mức lương
              </p>
              <p className="text-lg font-bold text-gray-800">{job.salary}</p>
            </div>
          </div>
        </div>

        {/* Phần Mô tả chi tiết */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-500" />
            Mô tả công việc
          </h3>
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-gray-600 leading-relaxed text-justify">
            {job.description}
          </div>
        </div>

        {/* Nút Call-to-action (Thêm vào để UI trông hoàn thiện hơn) */}
        <div className="mt-10 flex justify-end">
          <button className="w-full md:w-auto px-8 py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all duration-300 transform hover:-translate-y-1">
            Ứng tuyển ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
