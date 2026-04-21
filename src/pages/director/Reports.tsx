import React, { useState } from "react";
import {
  BarChart3, TrendingUp, TrendingDown, Users, Target,
  Download, Filter, Calendar, ArrowUpRight, ArrowDownRight,
  PieChart as PieChartIcon, Activity, Building2, Briefcase,
  CheckCircle2, Clock, UserCheck, FileCheck2
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
  AreaChart, Area, Legend
} from "recharts";
import { cn } from "../../lib/utils";

// ─── Dữ liệu giả lập ────────────────────────────────────────

/** Tổng quan chi phí & hiệu suất tuyển dụng theo quý */
const QUARTERLY_DATA = [
  { quarter: "Q1/25", hired: 18, budget: 120, spent: 95 },
  { quarter: "Q2/25", hired: 24, budget: 130, spent: 115 },
  { quarter: "Q3/25", hired: 20, budget: 125, spent: 108 },
  { quarter: "Q4/25", hired: 28, budget: 140, spent: 128 },
  { quarter: "Q1/26", hired: 32, budget: 150, spent: 135 },
];

/** Nhân sự theo phòng ban */
const DEPARTMENT_DATA = [
  { name: "Engineering", headcount: 48, openPositions: 6 },
  { name: "Product", headcount: 18, openPositions: 3 },
  { name: "Design", headcount: 12, openPositions: 2 },
  { name: "HR", headcount: 8, openPositions: 1 },
  { name: "Marketing", headcount: 15, openPositions: 2 },
  { name: "Finance", headcount: 10, openPositions: 1 },
];

/** Phân bổ trạng thái tuyển dụng */
const RECRUITMENT_STATUS = [
  { name: "Đã tuyển", value: 32, color: "#10b981" },
  { name: "Đang phỏng vấn", value: 18, color: "#3b82f6" },
  { name: "Chờ offer", value: 8, color: "#f59e0b" },
  { name: "Đã từ chối", value: 12, color: "#ef4444" },
];

/** Xu hướng nhân sự 12 tháng */
const MONTHLY_TREND = [
  { month: "T5", joined: 5, left: 1 },
  { month: "T6", joined: 7, left: 2 },
  { month: "T7", joined: 4, left: 1 },
  { month: "T8", joined: 6, left: 3 },
  { month: "T9", joined: 8, left: 1 },
  { month: "T10", joined: 5, left: 2 },
  { month: "T11", joined: 9, left: 1 },
  { month: "T12", joined: 6, left: 2 },
  { month: "T1", joined: 7, left: 1 },
  { month: "T2", joined: 4, left: 2 },
  { month: "T3", joined: 10, left: 1 },
  { month: "T4", joined: 8, left: 2 },
];

/** Thời gian tuyển dụng trung bình theo vị trí */
const TIME_TO_HIRE = [
  { position: "Developer", days: 22 },
  { position: "Designer", days: 18 },
  { position: "PM", days: 28 },
  { position: "QA", days: 15 },
  { position: "HR", days: 12 },
  { position: "Marketing", days: 20 },
];

// ─── Kiểu tab ────────────────────────────────────────────────
type TabKey = "overview" | "recruitment" | "workforce";

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Tổng quan" },
  { key: "recruitment", label: "Tuyển dụng" },
  { key: "workforce", label: "Nhân sự" },
];

// ─── Component chính ─────────────────────────────────────────
const DirectorReports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Báo cáo tổng hợp
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Phân tích hiệu quả tuyển dụng & nhân sự cấp quản trị
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all">
            <Filter className="mr-2 h-4 w-4" />
            Bộ lọc
          </button>
          <button className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all active:scale-95">
            <Download className="mr-2 h-4 w-4" />
            Xuất PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Tổng nhân sự",
            val: "126",
            trend: "+8.2%",
            trendUp: true,
            icon: Users,
            iconBg: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
          },
          {
            label: "Đã tuyển (Q1/26)",
            val: "32",
            trend: "+14.3%",
            trendUp: true,
            icon: UserCheck,
            iconBg: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
          },
          {
            label: "Vị trí đang tuyển",
            val: "15",
            trend: "-2",
            trendUp: false,
            icon: Briefcase,
            iconBg: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
          },
          {
            label: "Chi phí TB / tuyển",
            val: "4.2tr",
            trend: "-5.1%",
            trendUp: true,
            icon: TrendingDown,
            iconBg: "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400",
          },
        ].map((kpi, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm group hover:scale-[1.02] transition-all"
          >
            <div className="flex justify-between items-start">
              <div className={cn("p-3 rounded-2xl", kpi.iconBg)}>
                <kpi.icon size={22} />
              </div>
              <span
                className={cn(
                  "text-[10px] font-bold px-2 py-1 rounded-lg",
                  kpi.trendUp
                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10"
                    : "bg-rose-50 text-rose-600 dark:bg-rose-500/10"
                )}
              >
                {kpi.trend}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">
                {kpi.label}
              </p>
              <p className="text-3xl font-black text-slate-900 dark:text-slate-50 mt-1">
                {kpi.val}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 dark:border-slate-800 p-4">
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition",
                  activeTab === tab.key
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* ── Tab Tổng quan ───────────────────────────── */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Chi phí & Tuyển dụng theo quý */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                  <div className="mb-6">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2 uppercase tracking-wider">
                      <BarChart3 size={16} className="text-blue-500" />
                      Chi phí & Số tuyển theo quý
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Đơn vị chi phí: triệu VNĐ
                    </p>
                  </div>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={QUARTERLY_DATA} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="quarter" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "16px",
                            border: "none",
                            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                            backgroundColor: "#fff",
                          }}
                        />
                        <Bar dataKey="budget" name="Ngân sách" fill="#e2e8f0" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="spent" name="Đã chi" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="hired" name="Đã tuyển" fill="#10b981" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Phân bổ trạng thái tuyển dụng */}
                <div className="lg:col-span-2">
                  <div className="mb-6">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2 uppercase tracking-wider">
                      <PieChartIcon size={16} className="text-blue-500" />
                      Trạng thái tuyển dụng
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Phân bổ ứng viên hiện tại
                    </p>
                  </div>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={RECRUITMENT_STATUS}
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={6}
                          cornerRadius={8}
                          dataKey="value"
                        >
                          {RECRUITMENT_STATUS.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                    {RECRUITMENT_STATUS.map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                            {item.name}
                          </span>
                        </div>
                        <span className="text-xs font-black text-slate-900 dark:text-slate-50">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Growth Card */}
              <div className="bg-slate-900 dark:bg-blue-600 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">
                      Tỷ lệ hoàn thành mục tiêu Q1/2026
                    </p>
                    <h3 className="text-4xl font-black">87%</h3>
                    <p className="text-white/80 text-sm mt-3 font-bold leading-relaxed max-w-md">
                      Đã tuyển 32/37 vị trí theo kế hoạch. 5 vị trí còn lại đang
                      trong giai đoạn phỏng vấn cuối.
                    </p>
                  </div>
                  <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-all backdrop-blur-md px-5 py-3 rounded-2xl w-fit font-bold text-sm">
                    Xem chi tiết <ArrowUpRight size={18} />
                  </button>
                </div>
                <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-[-20%] left-[-5%] w-48 h-48 bg-blue-500/20 rounded-full blur-2xl" />
              </div>
            </div>
          )}

          {/* ── Tab Tuyển dụng ────────────────────────── */}
          {activeTab === "recruitment" && (
            <div className="space-y-6">
              {/* Thời gian tuyển dụng trung bình */}
              <div>
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2 uppercase tracking-wider">
                    <Clock size={16} className="text-blue-500" />
                    Thời gian tuyển dụng trung bình (ngày)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Từ lúc mở vị trí đến khi ứng viên nhận offer
                  </p>
                </div>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={TIME_TO_HIRE} layout="vertical" barSize={20}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                      <YAxis dataKey="position" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }} width={90} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "16px",
                          border: "none",
                          boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                          backgroundColor: "#fff",
                        }}
                      />
                      <Bar dataKey="days" name="Số ngày" fill="#6366f1" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bảng chi tiết phòng ban */}
              <div>
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2 uppercase tracking-wider">
                    <Building2 size={16} className="text-blue-500" />
                    Tuyển dụng theo phòng ban
                  </h3>
                </div>
                <div className="overflow-x-auto rounded-2xl ring-1 ring-slate-100 dark:ring-slate-800">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/30 text-[10px] font-bold uppercase tracking-widest">
                        <th className="px-6 py-4">Phòng ban</th>
                        <th className="px-6 py-4">Nhân sự hiện tại</th>
                        <th className="px-6 py-4">Vị trí đang tuyển</th>
                        <th className="px-6 py-4">Tỷ lệ lấp đầy</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {DEPARTMENT_DATA.map((dept) => {
                        const fillRate = Math.round(
                          (dept.headcount / (dept.headcount + dept.openPositions)) * 100
                        );
                        return (
                          <tr
                            key={dept.name}
                            className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center font-bold text-blue-600 text-sm">
                                  {dept.name.charAt(0)}
                                </div>
                                <span className="font-bold text-slate-900 dark:text-slate-50">
                                  {dept.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200">
                              {dept.headcount}
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold text-amber-600 ring-1 ring-inset ring-amber-200/50">
                                {dept.openPositions} vị trí
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="w-32 space-y-1.5">
                                <div className="flex items-center justify-between text-[10px] font-bold">
                                  <span className="text-slate-500">{fillRate}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                  <div
                                    className={cn(
                                      "h-full rounded-full transition-all duration-500",
                                      fillRate >= 90
                                        ? "bg-emerald-500"
                                        : fillRate >= 70
                                        ? "bg-blue-500"
                                        : "bg-amber-500"
                                    )}
                                    style={{ width: `${fillRate}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── Tab Nhân sự ───────────────────────────── */}
          {activeTab === "workforce" && (
            <div className="space-y-6">
              {/* Biến động nhân sự 12 tháng */}
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2 uppercase tracking-wider">
                      <Activity size={16} className="text-blue-500" />
                      Biến động nhân sự 12 tháng
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Số nhân viên vào – ra theo tháng
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="text-[10px] text-slate-400 font-bold">
                        Vào
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-rose-500" />
                      <span className="text-[10px] text-slate-400 font-bold">
                        Ra
                      </span>
                    </div>
                  </div>
                </div>

                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MONTHLY_TREND}>
                      <defs>
                        <linearGradient id="colorJoined" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorLeft" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "16px",
                          border: "none",
                          boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                          backgroundColor: "#fff",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="joined"
                        name="Vào"
                        stroke="#10b981"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorJoined)"
                      />
                      <Area
                        type="monotone"
                        dataKey="left"
                        name="Ra"
                        stroke="#ef4444"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorLeft)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Phân bổ nhân sự theo phòng ban (bar ngang) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="mb-6">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2 uppercase tracking-wider">
                      <Building2 size={16} className="text-blue-500" />
                      Phân bổ nhân sự
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {DEPARTMENT_DATA.map((dept) => {
                      const maxVal = Math.max(...DEPARTMENT_DATA.map((d) => d.headcount));
                      const width = (dept.headcount / maxVal) * 100;
                      return (
                        <div key={dept.name} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-600 dark:text-slate-400">
                              {dept.name}
                            </span>
                            <span className="font-black text-slate-900 dark:text-slate-50">
                              {dept.headcount}
                            </span>
                          </div>
                          <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full transition-all duration-700"
                              style={{ width: `${width}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tổng hợp nhanh */}
                <div className="space-y-4">
                  {[
                    {
                      label: "Tỷ lệ nghỉ việc",
                      value: "3.2%",
                      desc: "Thấp hơn trung bình ngành (5.8%)",
                      icon: TrendingDown,
                      color: "text-emerald-600",
                      bg: "bg-emerald-50 dark:bg-emerald-500/10",
                    },
                    {
                      label: "Nhân viên thử việc",
                      value: "8",
                      desc: "4 sắp hết hạn trong 2 tuần",
                      icon: Clock,
                      color: "text-amber-600",
                      bg: "bg-amber-50 dark:bg-amber-500/10",
                    },
                    {
                      label: "Offer đã gửi (tháng)",
                      value: "12",
                      desc: "Tỷ lệ chấp nhận: 83%",
                      icon: FileCheck2,
                      color: "text-blue-600",
                      bg: "bg-blue-50 dark:bg-blue-500/10",
                    },
                    {
                      label: "Đánh giá thử việc",
                      value: "5",
                      desc: "3 chờ Director phê duyệt",
                      icon: CheckCircle2,
                      color: "text-violet-600",
                      bg: "bg-violet-50 dark:bg-violet-500/10",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <div className={cn("p-3 rounded-2xl", item.bg, item.color)}>
                        <item.icon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          {item.label}
                        </p>
                        <p className="text-xl font-black text-slate-900 dark:text-slate-50 mt-0.5">
                          {item.value}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DirectorReports;
