import React, { useState } from "react";
import { 
  ClipboardCheck, Search, Filter, 
  Calendar, User, Building, Clock, 
  CheckCircle2, AlertTriangle, MoreVertical,
  Download
} from "lucide-react";
import { cn } from "../../lib/utils";

interface Probationer {
  id: string;
  name: string;
  position: string;
  department: string;
  startDate: string;
  endDate: string;
  status: "In Progress" | "Completed" | "Warning" | "Terminated";
  progress: number; // 0-100
}

const MOCK_PROBATIONERS: Probationer[] = [
  {
    id: "1",
    name: "Lê Thị Lan",
    position: "Frontend Developer",
    department: "Engineering",
    startDate: "2026-03-01",
    endDate: "2026-05-01",
    status: "In Progress",
    progress: 75
  },
  {
    id: "2",
    name: "Phạm Văn Minh",
    position: "QA Engineer",
    department: "QA",
    startDate: "2026-04-10",
    endDate: "2026-06-10",
    status: "In Progress",
    progress: 15
  },
  {
    id: "3",
    name: "Nguyễn Hải Đăng",
    position: "UI Designer",
    department: "Design",
    startDate: "2026-02-15",
    endDate: "2026-04-15",
    status: "Warning",
    progress: 98
  },
  {
    id: "4",
    name: "Đỗ Kim Ngân",
    position: "HR Specialist",
    department: "HR",
    startDate: "2026-01-01",
    endDate: "2026-03-01",
    status: "Completed",
    progress: 100
  }
];

const STATUS_CONFIG: Record<string, { label: string, color: string, icon: any }> = {
  "In Progress": { label: "Đang thử việc", color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10", icon: Clock },
  "Completed": { label: "Hoàn thành", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10", icon: CheckCircle2 },
  "Warning": { label: "Sắp hết hạn", color: "text-amber-600 bg-amber-50 dark:bg-amber-500/10", icon: AlertTriangle },
  "Terminated": { label: "Dừng thử việc", color: "text-rose-600 bg-rose-50 dark:bg-rose-500/10", icon: AlertTriangle }
};

const Probation: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Quản lý thử việc
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Theo dõi tiến độ và đánh giá nhân viên thử việc (UC-11)
          </p>
        </div>
        <button className="inline-flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 transition-all">
          <Download className="-ml-1 mr-2 h-4 w-4" />
          Xuất báo cáo Excel
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm tên nhân viên, vị trí..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {["Tất cả", "Đang thử việc", "Sắp hết hạn", "Hoàn thành"].map((f) => (
            <button key={f} className={cn(
              "px-4 py-1.5 rounded-full text-xs font-bold border transition-all whitespace-nowrap",
              f === "Tất cả" ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900" : "bg-white text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700"
            )}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/30 text-[10px] font-bold uppercase tracking-widest">
                <th className="px-6 py-4">Nhân viên</th>
                <th className="px-6 py-4">Phòng ban / Vị trí</th>
                <th className="px-6 py-4">Thời gian thử việc</th>
                <th className="px-6 py-4">Tiến độ</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {MOCK_PROBATIONERS.map((p) => {
                const StatusIcon = STATUS_CONFIG[p.status].icon;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center font-bold text-blue-600">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-50">{p.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">ID: PRB-{p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-700 dark:text-slate-200">{p.department}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{p.position}</p>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1.5"><Calendar size={12} className="text-slate-400" /> Bắt đầu: {p.startDate}</span>
                        <span className="flex items-center gap-1.5"><Calendar size={12} className="text-slate-400" /> Kết thúc: {p.endDate}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-32 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span className={cn(p.progress === 100 ? "text-emerald-600" : "text-slate-500")}>
                            {p.progress}%
                          </span>
                          <span className="text-slate-400">
                            {p.status === "Terminated" ? "Đã dừng" : p.progress === 100 ? "Xong" : "Đang chạy"}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              p.status === "Completed" ? "bg-emerald-500" : 
                              p.status === "Warning" ? "bg-amber-500" : 
                              "bg-blue-500"
                            )}
                            style={{ width: `${p.progress}%` }} 
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset uppercase tracking-widest",
                        STATUS_CONFIG[p.status].color
                      )}>
                        <StatusIcon size={12} />
                        {STATUS_CONFIG[p.status].label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Overview Cards (Premium touch) */}
      <div className="bg-slate-900 dark:bg-blue-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-500/20">
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            <AlertTriangle size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold">Lưu ý trong tuần</h3>
            <p className="text-white/70 text-sm">Có <span className="text-white font-bold">2 nhân viên</span> sắp hoàn thành thử việc trong 7 ngày tới.</p>
          </div>
        </div>
        <button className="px-8 py-3 rounded-2xl bg-white text-slate-900 font-bold hover:bg-slate-100 transition-all active:scale-95">Xem ngay</button>
      </div>
    </div>
  );
};

export default Probation;
