import { useState } from "react";
import {
  Plus, Search, Edit, AlignLeft, Briefcase, MapPin,
  DollarSign, X, Calendar, Users as UsersIcon,
  CheckCircle2, AlertCircle, Clock, Trash2
} from "lucide-react";
import { cn } from "../../lib/utils";
import type { Job, JobStatus, JobType, ExperienceLevel } from "../../types/job";

const MOCK_JOBS: Job[] = [
  {
    id: "1",
    title: 'Senior Backend Developer',
    department: 'Engineering',
    location: 'Hà Nội',
    type: 'full-time',
    experienceLevel: 'senior',
    salaryMin: 30000000,
    salaryMax: 45000000,
    currency: 'VND',
    createdAt: '2026-04-10',
    deadline: '2026-05-10',
    status: 'published',
    headcount: 2,
    applicants: 12,
    requirements: ["Node.js", "PostgreSQL", "AWS"],
    description: "Xây dựng hệ thống backend hiệu năng cao..."
  } as any, // Cast temporarily to avoid missing fields error in mock
  {
    id: "2",
    title: 'UX/UI Designer',
    department: 'Design',
    location: 'HCM',
    type: 'full-time',
    experienceLevel: 'junior',
    salaryMin: 20000000,
    salaryMax: 35000000,
    status: 'closed',
    createdAt: '2026-04-12',
    deadline: '2026-04-20',
    applicants: 45,
    requirements: ["Figma", "Adobe XD"]
  } as any,
];

const JOB_TYPE_LABELS: Record<JobType, string> = {
  "full-time": "Toàn thời gian",
  "part-time": "Bán thời gian",
  "internship": "Thực tập",
  "freelance": "Freelance",
  "remote": "Remote"
};

const EXP_LEVEL_LABELS: Record<ExperienceLevel, string> = {
  "fresher": "Fresher",
  "junior": "Junior",
  "middle": "Middle",
  "senior": "Senior",
  "lead": "Lead",
  "manager": "Manager"
};

const RecruiterJobs: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS as any);

  const handleCloseJob = (id: string) => {
    setJobs(prev => prev.map(job => job.id === id ? { ...job, status: 'closed' } : job));
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Quản lý tin tuyển dụng
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Quản lý vòng đời bài đăng tuyển dụng (UC-02)
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all active:scale-95"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Tạo tin mới
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600">
            <Briefcase size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Đang mở</p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-50">{jobs.filter(j => j.status === 'published').length}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl text-amber-600">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Bản nháp</p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-50">{jobs.filter(j => j.status === 'draft').length}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600">
            <UsersIcon size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Tổng ứng viên</p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-50">{jobs.reduce((acc, curr) => acc + (curr.applicants || 0), 0)}</p>
          </div>
        </div>
      </div>

      {/* Toolbar & Table */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm vị trí, phòng ban..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-50 dark:focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/30 dark:text-slate-400 uppercase text-xs tracking-wider">
                <th className="px-6 py-4 font-bold">Vị trí</th>
                <th className="px-6 py-4 font-bold">Phòng ban / Địa điểm</th>
                <th className="px-6 py-4 font-bold">Mức lương</th>
                <th className="px-6 py-4 font-bold">Hạn nộp</th>
                <th className="px-6 py-4 font-bold">Trạng thái</th>
                <th className="px-6 py-4 font-bold text-center">Ứng viên</th>
                <th className="px-6 py-4 font-bold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900 dark:text-slate-50">{job.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{EXP_LEVEL_LABELS[job.experienceLevel as ExperienceLevel] || 'Cấp độ'} • {JOB_TYPE_LABELS[job.type as JobType] || 'Loại'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-900 dark:text-slate-200">{job.department}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{job.status === 'published' ? 'Hà Nội' : job.location}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {(job.salaryMin && job.salaryMax) ? `${(job.salaryMin / 1000000).toFixed(0)}tr - ${(job.salaryMax / 1000000).toFixed(0)}tr` : 'Thỏa thuận'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <Calendar size={14} className="text-slate-400" />
                      {job.deadline}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
                      job.status === 'published' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400' :
                        job.status === 'draft' ? 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400' :
                          'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-400'
                    )}>
                      {job.status === 'published' ? 'Đang tuyển' : job.status === 'draft' ? 'Bản nháp' : 'Đã đóng'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center min-w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                      {job.applicants}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/30 transition-all">
                        <Edit size={16} />
                      </button>
                      {job.status === 'published' && (
                        <button
                          onClick={() => handleCloseJob(job.id)}
                          title="Đóng tin"
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-900/30 transition-all">
                          <AlertCircle size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in transition-all">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl dark:bg-slate-900 dark:ring-1 dark:ring-slate-800 animate-in zoom-in-95 duration-200 scrollbar-hide">

            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-8 py-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Đăng tin tuyển dụng mới</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Hoàn thiện thông tin để thu hút ứng viên tiềm năng</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-8">
              {/* Section: Basic Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Thông tin bản tin</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tiêu đề vị trí</label>
                    <input type="text" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm dark:bg-slate-800/50 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="VD: Senior React Developer" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Phòng ban</label>
                    <input type="text" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm dark:bg-slate-800/50 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="VD: Engineering" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Hình thức làm việc</label>
                    <select className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm dark:bg-slate-800/50 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                      {Object.entries(JOB_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Cấp độ kinh nghiệm</label>
                    <select className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm dark:bg-slate-800/50 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                      {Object.entries(EXP_LEVEL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section: Compensation & Deadline */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Đãi ngộ & Thời hạn</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Lương tối thiểu (VND)</label>
                    <input type="number" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm dark:bg-slate-800/50 dark:border-slate-700 outline-none" placeholder="VD: 15,000,000" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Lương tối đa (VND)</label>
                    <input type="number" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm dark:bg-slate-800/50 dark:border-slate-700 outline-none" placeholder="VD: 30,000,000" />
                  </div>
                  <div className="space-y-1.5 relative">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Hạn nộp hồ sơ</label>
                    <input type="date" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm dark:bg-slate-800/50 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                  </div>
                </div>
              </div>

              {/* Section: Detailed Requirements */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Mô tả công việc</label>
                  <textarea rows={4} className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-sm dark:bg-slate-800/50 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none" placeholder="Chi tiết trách nhiệm và công việc..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Yêu cầu chuyên môn</label>
                  <textarea rows={4} className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-sm dark:bg-slate-800/50 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none" placeholder="VD: Tối thiểu 2 năm kinh nghiệm React, kỹ năng Git tốt..." />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-slate-50/95 dark:bg-slate-800/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 px-8 py-5 flex items-center justify-end gap-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                Hủy
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition-all">
                Lưu nháp
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-8 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white shadow-lg shadow-blue-500/25 hover:bg-blue-500 active:scale-95 transition-all">
                Đăng tin công khai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export default RecruiterJobs;