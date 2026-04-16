import { useState } from "react";
import { Plus, Search, Edit, AlignLeft, Briefcase, MapPin, DollarSign, X } from "lucide-react";

// Thay đổi named export sang default export nếu App.tsx import kiểu default (ở đây ta giữ named export như cũ nhưng khai báo rõ ràng)
const MOCK_JOBS = [
  { id: 1, title: 'Senior Backend Developer', department: 'Engineering', salary_range: '30tr - 45tr', posted_at: '2026-04-10', status: 'Open', applicants: 12 },
  { id: 2, title: 'UX/UI Designer', department: 'Design', salary_range: '20tr - 35tr', posted_at: '2026-04-12', status: 'Closed', applicants: 45 },
  { id: 3, title: 'Product Manager', department: 'Product', salary_range: '40tr - 60tr', posted_at: '2026-04-14', status: 'Open', applicants: 8 },
];

const RecruiterJobs: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Quản lý tin tuyển dụng
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tạo mới và theo dõi các vị trí đang mở
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Tạo tin mới
        </button>
      </div>

      {/* Main Content Container */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800 overflow-hidden">

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm vị trí, phòng ban..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-50 dark:placeholder:text-slate-400 dark:focus:border-blue-500 dark:focus:bg-slate-800 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/30 dark:text-slate-400">
                <th className="px-6 py-4 font-semibold">Vị trí</th>
                <th className="px-6 py-4 font-semibold">Phòng ban</th>
                <th className="px-6 py-4 font-semibold">Mức lương</th>
                <th className="px-6 py-4 font-semibold">Ngày đăng</th>
                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                <th className="px-6 py-4 font-semibold text-center">Ứng viên</th>
                <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {MOCK_JOBS.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900 dark:text-slate-50">{job.title}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{job.department}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{job.salary_range}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{job.posted_at}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${job.status === 'Open'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 inline-flex ring-1 ring-inset ring-emerald-600/20 dark:ring-emerald-500/20'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 inline-flex ring-1 ring-inset ring-slate-500/20 dark:ring-slate-400/20'
                      }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center min-w-[2rem] bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-full px-2 py-1 text-xs font-medium">
                      {job.applicants}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/30 transition-colors">
                      <Edit className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Overlay & Dialog */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800 animate-in zoom-in-95 duration-200">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Đăng tin tuyển dụng mới</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <Briefcase className="h-4 w-4 text-slate-400" />
                    Tiêu đề công việc
                  </label>
                  <input type="text" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:focus:border-blue-500" placeholder="VD: Senior React Developer" />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <AlignLeft className="h-4 w-4 text-slate-400" />
                    Phòng ban
                  </label>
                  <input type="text" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:focus:border-blue-500" placeholder="VD: Engineering" />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <DollarSign className="h-4 w-4 text-slate-400" />
                    Mức lương
                  </label>
                  <input type="text" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:focus:border-blue-500" placeholder="VD: 30tr - 50tr" />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    Địa điểm
                  </label>
                  <input type="text" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:focus:border-blue-500" placeholder="VD: Hà Nội" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Mô tả công việc
                </label>
                <textarea
                  className="h-32 w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:focus:border-blue-500"
                  placeholder="Mô tả chi tiết năng lực, công việc..."
                ></textarea>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 rounded-b-2xl border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 px-6 py-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                Hủy
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
              >
                Đăng tin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecruiterJobs;