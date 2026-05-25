import { useEffect, useState } from "react";
import { Users, Briefcase, FileCheck2, ClipboardCheck, TrendingUp, Activity } from "lucide-react";
import { statsService } from "@/services/stats.service";
import type { DirectorStats } from "@/services/stats.service";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<DirectorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setIsLoading(true);
    statsService.getDirectorStats()
      .then(setStats)
      .catch(() => setError("Không thể tải dữ liệu thống kê."))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  const overviewCards = [
    { label: "Tổng số công việc", value: stats?.overview.totalJobs ?? 0, icon: Briefcase, color: "text-blue-600 bg-blue-100" },
    { label: "Đang tuyển", value: stats?.overview.openJobs ?? 0, icon: TrendingUp, color: "text-green-600 bg-green-100" },
    { label: "Offer chờ duyệt", value: stats?.overview.pendingOffers ?? 0, icon: FileCheck2, color: "text-yellow-600 bg-yellow-100" },
    { label: "Offer đã chấp nhận", value: stats?.overview.acceptedOffers ?? 0, icon: FileCheck2, color: "text-emerald-600 bg-emerald-100" },
    { label: "Thử việc đang diễn ra", value: stats?.overview.activeProbations ?? 0, icon: ClipboardCheck, color: "text-purple-600 bg-purple-100" },
    { label: "Đã qua thử việc", value: stats?.overview.passedProbations ?? 0, icon: Activity, color: "text-indigo-600 bg-indigo-100" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Admin Dashboard</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {overviewCards.map((card) => (
          <div key={card.label} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${card.color}`}>
                <card.icon size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{card.label}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-50">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Hires */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">Lượng tuyển dụng theo tháng</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.monthlyHires ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="joined" name="Đã tuyển" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Department Distribution */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">Phân bố phòng ban</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats?.departments ?? []}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {(stats?.departments ?? []).map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
