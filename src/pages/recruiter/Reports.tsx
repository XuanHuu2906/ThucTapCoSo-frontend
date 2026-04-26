import React, { useEffect, useMemo, useState } from "react";
import { 
  BarChart3, TrendingUp, Users, Target, 
  Download, Filter, ArrowUpRight,
  PieChart as PieChartIcon, Activity
} from "lucide-react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
  AreaChart, Area
} from "recharts";
import { cn } from "../../lib/utils";
import { applicationService } from "@/services";
import type { Application } from "@/types";

const FUNNEL_DATA = [
  { name: 'Ứng tuyển', value: 450, fill: '#3b82f6' },
  { name: 'Sàng lọc', value: 180, fill: '#6366f1' },
  { name: 'Phỏng vấn', value: 65, fill: '#8b5cf6' },
  { name: 'Offer', value: 24, fill: '#a855f7' },
  { name: 'Tuyển dụng', value: 20, fill: '#10b981' },
];

const SOURCE_DATA = [
  { name: 'LinkedIn', value: 40 },
  { name: 'Facebook', value: 25 },
  { name: 'Referral', value: 20 },
  { name: 'Website', value: 15 },
];

const MONTHLY_DATA = [
  { month: 'Jan', total: 45, hired: 10 },
  { month: 'Feb', total: 52, hired: 12 },
  { month: 'Mar', total: 48, hired: 15 },
  { month: 'Apr', total: 61, hired: 18 },
  { month: 'May', total: 55, hired: 20 },
  { month: 'Jun', total: 67, hired: 22 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const Reports: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [funnelData, setFunnelData] = useState(FUNNEL_DATA);
  const [monthlyData, setMonthlyData] = useState(MONTHLY_DATA);

  useEffect(() => {
    applicationService
      .getApplications()
      .then((data) => {
        setApplications(data);
        setFunnelData([
          { name: "Ứng tuyển", value: data.length, fill: "#3b82f6" },
          {
            name: "Sàng lọc",
            value: data.filter((item) =>
              ["shortlisted", "interviewing", "interview_passed", "offered", "hired"].includes(item.status)
            ).length,
            fill: "#6366f1",
          },
          {
            name: "Phỏng vấn",
            value: data.filter((item) =>
              ["interviewing", "interview_passed", "offered", "hired"].includes(item.status)
            ).length,
            fill: "#8b5cf6",
          },
          {
            name: "Offer",
            value: data.filter((item) => ["offered", "hired"].includes(item.status)).length,
            fill: "#a855f7",
          },
          { name: "Tuyển dụng", value: data.filter((item) => item.status === "hired").length, fill: "#10b981" },
        ]);

        const monthMap = data.reduce<Record<string, { month: string; total: number; hired: number }>>(
          (acc, item) => {
            const date = new Date(item.appliedAt);
            const key = `${date.getFullYear()}-${date.getMonth()}`;
            acc[key] ??= {
              month: date.toLocaleDateString("vi-VN", { month: "short" }),
              total: 0,
              hired: 0,
            };
            acc[key].total += 1;
            if (item.status === "hired") acc[key].hired += 1;
            return acc;
          },
          {}
        );
        const derivedMonthlyData = Object.values(monthMap).slice(-6);
        if (derivedMonthlyData.length > 0) setMonthlyData(derivedMonthlyData);
      })
      .catch(() => undefined);
  }, []);

  const hiredCount = applications.filter((item) => item.status === "hired").length;
  const hiringRate = useMemo(
    () => (applications.length > 0 ? ((hiredCount / applications.length) * 100).toFixed(1) : "0.0"),
    [applications.length, hiredCount]
  );

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Báo cáo tuyển dụng
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Phân tích hiệu quả và tối ưu hóa quy trình (UC-15)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all">
            <Filter className="mr-2 h-4 w-4" />
            Lọc dữ liệu
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
          { label: "Tổng ứng viên", val: String(applications.length), trend: "+0%", icon: Users, color: "blue" },
          { label: "Tỷ lệ tuyển", val: `${hiringRate}%`, trend: "+0%", icon: Target, color: "emerald" },
          { label: "Thời gian tuyển", val: "18d", trend: "-2d", icon: Activity, color: "amber" },
          { label: "Chi phí/Hồ sơ", val: "$120", trend: "+$5", icon: TrendingUp, color: "rose" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm group hover:scale-[1.02] transition-all">
            <div className="flex justify-between items-start">
              <div className={cn("p-3 rounded-2xl", `bg-${kpi.color}-50 dark:bg-${kpi.color}-500/10 text-${kpi.color}-600 dark:text-${kpi.color}-400`)}>
                <kpi.icon size={22} />
              </div>
              <span className={cn("text-[10px] font-bold px-2 py-1 rounded-lg", kpi.trend.startsWith('+') ? "bg-emerald-50 text-emerald-600 text-emerald-600" : "bg-rose-50 text-rose-600 text-rose-600")}>
                {kpi.trend}
              </span>
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
                        {funnelData[i - 1].value > 0 ? ((item.value / funnelData[i-1].value) * 100).toFixed(0) : 0}%
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
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
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
        {/* Source Analysis */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center flex-col md:flex-row">
          <div className="flex-1 w-full">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2 uppercase tracking-wider mb-6">
              <PieChartIcon size={16} className="text-blue-500" /> Nguồn ứng viên
            </h3>
            <div className="space-y-4">
              {SOURCE_DATA.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{item.name}</span>
                  </div>
                  <span className="text-xs font-black text-slate-900 dark:text-slate-50">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="h-[200px] w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={SOURCE_DATA}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  cornerRadius={10}
                  dataKey="value"
                >
                  {SOURCE_DATA.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Growth Card */}
        <div className="bg-blue-600 dark:bg-slate-800 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
               <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Tăng trưởng năm nay</p>
               <h3 className="text-4xl font-black">+32%</h3>
               <p className="text-white/80 text-sm mt-4 font-bold leading-relaxed max-w-[280px]">Tuyệt vời! Hiệu suất tuyển dụng của bạn đang vượt xa mục tiêu đề ra cho Q2.</p>
            </div>
            <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-all backdrop-blur-md px-5 py-3 rounded-2xl w-fit font-bold text-sm mt-8">
              Chi tiết mục tiêu <ArrowUpRight size={18} />
            </button>
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
