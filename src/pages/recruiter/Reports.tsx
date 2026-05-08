import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3, TrendingUp, Users, Target,
  Download, Filter,
  PieChart as PieChartIcon, Activity
} from "lucide-react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
  AreaChart, Area
} from "recharts";
import { cn } from "../../lib/utils";
import { applicationService, jobService, offerService, interviewService } from "@/services";
import type { Application, Job, Offer, Interview } from "@/types";
import { useExportPDF } from "@/hooks/useExportPDF";
import { ReportPDF } from "@/components/pdf/ReportPDF";

type FunnelItem = { name: string; value: number; fill: string };
type MonthlyItem = { month: string; total: number; hired: number };
type DeptItem = { name: string; value: number };

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Reports: React.FC = () => {
  const [rawApplications, setRawApplications] = useState<Application[]>([]);
  const [timeFilter, setTimeFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const applications = useMemo(() => {
    return rawApplications.filter((app) => {
      const d = new Date(app.appliedAt);
      const now = new Date();
      if (timeFilter === "this_month") {
        if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return false;
      } else if (timeFilter === "last_month") {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        if (d.getMonth() !== lastMonth.getMonth() || d.getFullYear() !== lastMonth.getFullYear()) return false;
      } else if (timeFilter === "this_year") {
        if (d.getFullYear() !== now.getFullYear()) return false;
      }

      if (jobFilter !== "all" && (app.jobTitle || "Khác") !== jobFilter) {
        return false;
      }
      return true;
    });
  }, [rawApplications, timeFilter, jobFilter]);

  const uniqueJobs = useMemo(() => {
    const jobList = new Set(rawApplications.map((a) => a.jobTitle || "Khác"));
    return Array.from(jobList);
  }, [rawApplications]);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      applicationService.getApplications(),
      jobService.getJobs(),
      offerService.getOffers(),
      interviewService.getInterviews(),
    ])
      .then(([appData, jobData, offerData, interviewData]) => {
        setRawApplications(appData);
        setJobs(jobData);
        setOffers(offerData);
        setInterviews(interviewData);
      })
      .catch(() => undefined)
      .finally(() => setIsLoading(false));
  }, []);

  // === Derived data ===

  const hiredCount = applications.filter((a) => a.status === "hired").length;
  const hiringRate = applications.length > 0 ? ((hiredCount / applications.length) * 100).toFixed(1) : "0.0";

  // Average time-to-hire: from appliedAt to updatedAt for hired applications
  const avgTimeToHire = useMemo(() => {
    const hiredApps = applications.filter((a) => a.status === "hired");
    if (hiredApps.length === 0) return "—";

    const totalDays = hiredApps.reduce((sum, app) => {
      const applied = new Date(app.appliedAt).getTime();
      const updated = new Date(app.updatedAt).getTime();
      const diff = Math.max(1, Math.round((updated - applied) / (1000 * 60 * 60 * 24)));
      return sum + diff;
    }, 0);

    return `${Math.round(totalDays / hiredApps.length)}d`;
  }, [applications]);

  // Funnel data
  const funnelData: FunnelItem[] = useMemo(() => [
    { name: "Ứng tuyển", value: applications.length, fill: "#3b82f6" },
    {
      name: "Sàng lọc",
      value: applications.filter((a) =>
        ["shortlisted", "interviewing", "interview_passed", "offered", "hired"].includes(a.status)
      ).length,
      fill: "#6366f1",
    },
    {
      name: "Phỏng vấn",
      value: applications.filter((a) =>
        ["interviewing", "interview_passed", "offered", "hired"].includes(a.status)
      ).length,
      fill: "#8b5cf6",
    },
    {
      name: "Offer",
      value: applications.filter((a) => ["offered", "hired"].includes(a.status)).length,
      fill: "#a855f7",
    },
    { name: "Tuyển dụng", value: hiredCount, fill: "#10b981" },
  ], [applications, hiredCount]);

  // Monthly trend
  const monthlyData: MonthlyItem[] = useMemo(() => {
    // Khởi tạo trục X với 6 tháng gần nhất (bao gồm cả tháng hiện tại)
    const last6Months: Record<string, MonthlyItem> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      last6Months[key] = {
        month: `Tháng ${d.getMonth() + 1}`,
        total: 0,
        hired: 0,
      };
    }

    // Đổ dữ liệu ứng viên vào mảng tháng
    applications.forEach((app) => {
      const d = new Date(app.appliedAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (last6Months[key]) {
        last6Months[key].total += 1;
        if (app.status === "hired") last6Months[key].hired += 1;
      }
    });

    return Object.values(last6Months);
  }, [applications]);

  // Department/position distribution (dữ liệu thực thay cho SOURCE_DATA)
  const deptData: DeptItem[] = useMemo(() => {
    const deptMap = applications.reduce<Record<string, number>>((acc, app) => {
      const dept = app.jobTitle || "Khác";
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(deptMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [applications]);

  // Growth: compare current month vs previous month
  const growth = useMemo(() => {
    const now = new Date();
    const thisMonth = rawApplications.filter((a) => {
      const d = new Date(a.appliedAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonth = rawApplications.filter((a) => {
      const d = new Date(a.appliedAt);
      return d.getMonth() === prevDate.getMonth() && d.getFullYear() === prevDate.getFullYear();
    }).length;

    if (prevMonth === 0) return { pct: thisMonth > 0 ? "+100" : "0", positive: thisMonth > 0 };
    const pct = Math.round(((thisMonth - prevMonth) / prevMonth) * 100);
    return { pct: pct >= 0 ? `+${pct}` : String(pct), positive: pct >= 0 };
  }, [rawApplications]);

  // KPI trends
  const kpiTrends = useMemo(() => {
    const now = new Date();
    const thisMonth = rawApplications.filter((a) => {
      const d = new Date(a.appliedAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonth = rawApplications.filter((a) => {
      const d = new Date(a.appliedAt);
      return d.getMonth() === prevDate.getMonth() && d.getFullYear() === prevDate.getFullYear();
    });

    const totalDiff = thisMonth.length - prevMonth.length;
    const totalTrend = totalDiff >= 0 ? `+${totalDiff}` : String(totalDiff);

    const thisHired = thisMonth.filter((a) => a.status === "hired").length;
    const prevHired = prevMonth.filter((a) => a.status === "hired").length;
    const thisRate = thisMonth.length > 0 ? (thisHired / thisMonth.length) * 100 : 0;
    const prevRate = prevMonth.length > 0 ? (prevHired / prevMonth.length) * 100 : 0;
    const rateDiff = thisRate - prevRate;
    const rateTrend = rateDiff >= 0 ? `+${rateDiff.toFixed(1)}%` : `${rateDiff.toFixed(1)}%`;

    return { totalTrend, rateTrend };
  }, [rawApplications]);

  // Growth message
  const growthMessage = useMemo(() => {
    const pctNum = parseInt(growth.pct);
    if (rawApplications.length === 0) return "Chưa có dữ liệu ứng tuyển để so sánh.";
    if (pctNum > 20) return "Tuyệt vời! Số lượng ứng tuyển tháng này tăng đáng kể so với tháng trước.";
    if (pctNum > 0) return "Số lượng ứng tuyển tháng này có tăng nhẹ so với tháng trước.";
    if (pctNum === 0) return "Số lượng ứng tuyển ổn định so với tháng trước.";
    return "Số lượng ứng tuyển tháng này giảm so với tháng trước. Hãy xem xét mở rộng nguồn tuyển dụng.";
  }, [rawApplications.length, growth.pct]);

  const { exportPDF, isExporting } = useExportPDF();

  const handleExportPDF = () => {
    const timeLabels: Record<string, string> = {
      all: "Tất cả thời gian",
      this_month: "Tháng này",
      last_month: "Tháng trước",
      this_year: "Năm nay"
    };

    const pdfData = {
      totalApplications: applications.length,
      hiredCount,
      hiringRate,
      avgTimeToHire,
      openJobsCount: jobs.filter(j => j.status === 'published').length,
      deptData,
      timeFilterLabel: timeLabels[timeFilter] || timeFilter,
      jobFilterLabel: jobFilter === 'all' ? 'Tất cả vị trí' : jobFilter
    };

    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const fileName = `BaoCao_TuyenDung_${dateStr}.pdf`;

    exportPDF(<ReportPDF data={pdfData} />, fileName);
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Báo cáo tuyển dụng
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 h-[38px] transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
            <Filter className="ml-2 h-3.5 w-3.5 text-slate-400" />
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-slate-600 dark:text-slate-300 outline-none focus:ring-0 pl-2 pr-6 py-1 cursor-pointer w-[140px]"
            >
              <option value="all">Tất cả thời gian</option>
              <option value="this_month">Tháng này</option>
              <option value="last_month">Tháng trước</option>
              <option value="this_year">Năm nay</option>
            </select>
          </div>

          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 h-[38px] transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
            <select
              value={jobFilter}
              onChange={(e) => setJobFilter(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-slate-600 dark:text-slate-300 outline-none focus:ring-0 pl-2 pr-6 py-1 cursor-pointer w-[140px]"
            >
              <option value="all">Tất cả vị trí</option>
              {uniqueJobs.map((job) => (
                <option key={job} value={job}>
                  {job}
                </option>
              ))}
            </select>
          </div>

          <button 
            onClick={handleExportPDF}
            disabled={isExporting}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 h-[38px] text-xs font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang tạo...
              </span>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Xuất PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-500 dark:bg-slate-900 dark:border-slate-800">
          Đang tải dữ liệu báo cáo...
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tổng ứng viên", val: String(applications.length), trend: kpiTrends.totalTrend, icon: Users, color: "blue" },
          { label: "Tỷ lệ tuyển", val: `${hiringRate}%`, trend: kpiTrends.rateTrend, icon: Target, color: "emerald" },
          { label: "Thời gian tuyển TB", val: avgTimeToHire, trend: "", icon: Activity, color: "amber" },
          { label: "Tổng tin tuyển dụng", val: String(jobs.length), trend: `${jobs.filter((j) => j.status === "published").length} đang mở`, icon: TrendingUp, color: "rose" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm group hover:scale-[1.02] transition-all">
            <div className="flex justify-between items-start">
              <div className={cn("p-3 rounded-2xl", `bg-${kpi.color}-50 dark:bg-${kpi.color}-500/10 text-${kpi.color}-600 dark:text-${kpi.color}-400`)}>
                <kpi.icon size={22} />
              </div>
              {kpi.trend && (
                <span className={cn("text-[10px] font-bold px-2 py-1 rounded-lg", kpi.trend.startsWith('+') || kpi.trend.startsWith('0') ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                  {kpi.trend}
                </span>
              )}
            </div>
            <div className="mt-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">{kpi.label}</p>
              <p className="text-3xl font-black text-slate-900 dark:text-slate-50 mt-1">{kpi.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recruitment Funnel */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2 uppercase tracking-wider">
              <TrendingUp size={16} className="text-blue-500" /> Phễu tuyển dụng
            </h3>
          </div>
          <div className="space-y-4">
            {funnelData.map((item, i) => {
              const maxWidth = 100;
              const width = funnelData[0].value > 0 ? (item.value / funnelData[0].value) * maxWidth : 0;
              return (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500">
                    <span>{item.name}</span>
                    <span className="text-slate-900 dark:text-slate-400">{item.value}</span>
                  </div>
                  <div className="h-6 w-full bg-slate-50 dark:bg-slate-800/50 rounded-lg overflow-hidden relative">
                    <div
                      className="h-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${width}%`,
                        backgroundColor: item.fill,
                        opacity: 0.8
                      }}
                    />
                    {i > 0 && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400">
                        {funnelData[i - 1].value > 0 ? ((item.value / funnelData[i - 1].value) * 100).toFixed(0) : 0}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2 uppercase tracking-wider">
              <BarChart3 size={16} className="text-blue-500" /> Xu hướng tuyển dụng
            </h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-blue-500"></div><span className="text-[10px] text-slate-400 font-bold">Ứng tuyển</span></div>
              <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-emerald-500"></div><span className="text-[10px] text-slate-400 font-bold">Thành công</span></div>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#fff' }}
                />
                <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="hired" stroke="#10b981" strokeWidth={3} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Analytics Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Position Distribution */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center flex-col md:flex-row">
          <div className="flex-1 w-full">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2 uppercase tracking-wider mb-6">
              <PieChartIcon size={16} className="text-blue-500" /> Phân bố theo vị trí
            </h3>
            <div className="space-y-4">
              {deptData.length > 0 ? deptData.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 truncate max-w-[160px]">{item.name}</span>
                  </div>
                  <span className="text-xs font-black text-slate-900 dark:text-slate-50">{item.value}</span>
                </div>
              )) : (
                <p className="text-xs text-slate-400">Chưa có dữ liệu</p>
              )}
            </div>
          </div>
          <div className="h-[200px] w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deptData.length > 0 ? deptData : [{ name: "Trống", value: 1 }]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  cornerRadius={10}
                  dataKey="value"
                >
                  {(deptData.length > 0 ? deptData : [{ name: "Trống", value: 1 }]).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={deptData.length > 0 ? COLORS[index % COLORS.length] : '#e2e8f0'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Growth Card */}
        <div className={cn("rounded-3xl p-8 text-white relative overflow-hidden", growth.positive ? "bg-blue-600 dark:bg-slate-800" : "bg-slate-700 dark:bg-slate-800")}>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">So với tháng trước</p>
              <h3 className="text-4xl font-black">{growth.pct}%</h3>
              <p className="text-white/80 text-sm mt-4 font-bold leading-relaxed max-w-[280px]">{growthMessage}</p>
            </div>
            <div className="flex gap-4 mt-8 text-[10px] font-bold text-white/70">
              <span>Tổng offer: {offers.length}</span>
              <span>·</span>
              <span>Phỏng vấn: {interviews.length}</span>
            </div>
          </div>
          {/* Abstract Bg decorations */}
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-[-20%] left-[-5%] w-48 h-48 bg-blue-500/20 rounded-full blur-2xl" />
        </div>
      </div>
    </div>
  );
};

export default Reports;
