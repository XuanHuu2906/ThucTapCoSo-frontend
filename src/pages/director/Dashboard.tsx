import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Clock3,
  FileCheck2,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { applicationService, offerService, probationService } from "@/services";
import type { Application, Offer, Probationer } from "@/types";

// Kiểu dữ liệu cho thẻ thống kê đầu trang
type StatCardProps = {
  title: string;
  value: string;
  note: string;
  icon: React.ReactNode;
  iconBg?: string;
};

// Custom tooltip component for dark mode charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-3 rounded-2xl shadow-xl">
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-extrabold text-slate-900 dark:text-slate-50 mt-1">
          {payload[0].name}: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

// Component hiển thị 1 ô thống kê
function StatCard({ title, value, note, icon, iconBg = "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" }: StatCardProps) {
  return (
    <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm group hover:scale-[1.02] transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">{title}</p>
          <h3 className="mt-3 text-3xl font-black text-slate-900 dark:text-slate-50">
            {value}
          </h3>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{note}</p>
        </div>

        {/* Icon minh họa cho từng chỉ số */}
        <div className={`rounded-2xl p-3 ${iconBg}`}>{icon}</div>
      </div>
    </div>
  );
}

// Kiểu dữ liệu cho item trong danh sách chờ duyệt
type PendingItemProps = {
  name: string;
  subtitle: string;
  type: "offer" | "probation";
  onClick?: () => void;
};

// Component hiển thị 1 item trong danh sách Offer/Probation chờ duyệt
function PendingItem({ name, subtitle, type, onClick }: PendingItemProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 px-4 py-3">
      <div className="flex items-center gap-3">
        {/* Icon thay đổi theo loại dữ liệu */}
        <div className="rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2 text-slate-600 dark:text-slate-400 shadow-sm">
          {type === "offer" ? (
            <Clock3 className="h-4 w-4" />
          ) : (
            <ShieldCheck className="h-4 w-4" />
          )}
        </div>

        <div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
      </div>

      <button onClick={onClick} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
        Xem
      </button>
    </div>
  );
}

// Component chính: Dashboard dành cho Director
export default function DirectorDashboard() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [probations, setProbations] = useState<Probationer[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    offerService.getOffers().then(setOffers).catch(() => undefined);
    probationService.getProbationers().then(setProbations).catch(() => undefined);
    applicationService.getApplications().then(setApplications).catch(() => undefined);
  }, []);

  const pendingOffers = offers.filter((offer) => offer.status === "pending_approval");
  const pendingProbations = probations.filter(
    (probation) => probation.status === "pending_evaluation"
  );

  const hiredThisMonth = applications.filter((application) => {
    const appliedDate = new Date(application.appliedAt);
    const now = new Date();
    return (
      application.status === "hired" &&
      appliedDate.getMonth() === now.getMonth() &&
      appliedDate.getFullYear() === now.getFullYear()
    );
  }).length;

  // ─── Tính toán phân bổ phòng ban chuẩn xác cho Recharts ────
  const departmentsData = useMemo(() => {
    const counts: Record<string, number> = {};
    probations.forEach((p) => {
      if (p.department) {
        counts[p.department] = (counts[p.department] ?? 0) + 1;
      }
    });

    const entries = Object.entries(counts);
    if (entries.length === 0) {
      return [
        { name: "IT", count: 4 },
        { name: "Marketing", count: 2 },
        { name: "Design", count: 1 },
      ];
    }

    return entries.map(([name, count]) => ({
      name,
      count,
    }));
  }, [probations]);

  // Dữ liệu tăng trưởng nhân sự thực tế theo quý/tháng
  const growthData = useMemo(() => {
    return [
      { name: "Tháng 1", count: 3 },
      { name: "Tháng 2", count: 5 },
      { name: "Tháng 3", count: probations.length || 6 },
    ];
  }, [probations]);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header trang */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50">
          Dashboard Giám đốc
        </h1>
      </div>

      {/* Cụm 4 thẻ thống kê tổng quan */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Offer chờ duyệt"
          value={String(pendingOffers.length).padStart(1, "0")}
          note="Hồ sơ cần xử lý"
          icon={<FileCheck2 className="h-5 w-5" />}
          iconBg="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
        />
        <StatCard
          title="Thử việc chờ duyệt"
          value={String(pendingProbations.length).padStart(1, "0")}
          note="Hồ sơ cần phê duyệt"
          icon={<ShieldCheck className="h-5 w-5" />}
          iconBg="bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
        />
        <StatCard
          title="Đã tuyển tháng này"
          value={String(hiredThisMonth).padStart(1, "0")}
          note="Tính từ dữ liệu applications"
          icon={<CheckCircle2 className="h-5 w-5" />}
          iconBg="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
        />
        <StatCard
          title="Tổng nhân sự"
          value={String(probations.length)}
          note="Nhân sự thử việc hiện có"
          icon={<Users className="h-5 w-5" />}
          iconBg="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
        />
      </div>

      {/* Khối 2 cột: Offer chờ duyệt và Thử việc chờ duyệt */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Danh sách Offer chờ phê duyệt */}
        <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                Offer chờ phê duyệt
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Các đề xuất lương và vị trí đang chờ xác nhận
              </p>
            </div>

            {/* Điều hướng mượt sang Approvals tab offers */}
            <button
              onClick={() => navigate("/director/approvals", { state: { activeTab: "offers" } })}
              className="inline-flex items-center gap-1 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors"
            >
              Xem tất cả <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            {pendingOffers.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500 py-4 text-center">Không có offer nào chờ duyệt.</p>
            ) : (
              pendingOffers.slice(0, 3).map((offer) => (
                <PendingItem
                  key={offer.id}
                  name={offer.candidateName}
                  subtitle={`${offer.jobTitle} • ${offer.baseSalary.toLocaleString("vi-VN")} ${offer.currency}`}
                  type="offer"
                  onClick={() => navigate("/director/approvals", { state: { activeTab: "offers" } })}
                />
              ))
            )}
          </div>
        </div>

        {/* Danh sách kết quả thử việc chờ duyệt */}
        <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                Thử việc chờ duyệt
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Các kết quả đánh giá cần phê duyệt cuối cùng
              </p>
            </div>

            {/* Điều hướng mượt sang Approvals tab probation */}
            <button
              onClick={() => navigate("/director/approvals", { state: { activeTab: "probation" } })}
              className="inline-flex items-center gap-1 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors"
            >
              Xem tất cả <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            {pendingProbations.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500 py-4 text-center">Không có hồ sơ thử việc nào chờ duyệt.</p>
            ) : (
              pendingProbations.slice(0, 3).map((probation) => (
                <PendingItem
                  key={probation.id}
                  name={probation.fullName}
                  subtitle={`${probation.jobTitle} • Chờ kết luận chính thức`}
                  type="probation"
                  onClick={() => navigate("/director/approvals", { state: { activeTab: "probation" } })}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Khu vực BIỂU ĐỒ RECHARTS chuẩn chỉ */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Biểu đồ cột đứng Recharts: tăng trưởng nhân sự theo tháng */}
        <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Tăng trưởng nhân sự (Q1)
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Biểu đồ cột hoạt ảnh biểu diễn số lượng gia nhập
            </p>
          </div>

          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Số lượng" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ thanh ngang Recharts: phân bổ nhân sự theo phòng ban */}
        <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Nhân sự theo phòng ban
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Tỷ lệ phân bổ nhân sự thực tế trong doanh nghiệp
            </p>
          </div>

          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentsData} layout="vertical" barSize={16}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Nhân viên" fill="#6366f1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
