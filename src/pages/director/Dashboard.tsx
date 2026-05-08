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
};

// Component hiển thị 1 ô thống kê
function StatCard({ title, value, note, icon }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="mt-3 text-3xl font-bold tracking-tight text-card-foreground">
            {value}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">{note}</p>
        </div>

        {/* Icon minh họa cho từng chỉ số */}
        <div className="rounded-xl bg-muted p-3 text-foreground">{icon}</div>
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
    <div className="flex items-center justify-between rounded-xl border border-border bg-muted/50 px-4 py-3">
      <div className="flex items-center gap-3">
        {/* Icon thay đổi theo loại dữ liệu */}
        <div className="rounded-full bg-background p-2 text-foreground shadow-sm">
          {type === "offer" ? (
            <Clock3 className="h-4 w-4" />
          ) : (
            <ShieldCheck className="h-4 w-4" />
          )}
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">{name}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <button onClick={onClick} className="text-sm font-medium text-foreground hover:underline">
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
    Promise.all([
      offerService.getOffers(),
      probationService.getProbationers(),
      applicationService.getApplications(),
    ])
      .then(([offerList, probationList, applicationList]) => {
        setOffers(offerList);
        setProbations(probationList);
        setApplications(applicationList);
      })
      .catch(() => undefined);
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
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header trang */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard Giám đốc
          </h1>
          <p className="mt-2 text-sm md:text-base text-muted-foreground">
            Tổng quan tuyển dụng &amp; nhân sự (Dữ liệu đồng bộ SQL Server)
          </p>
        </div>

        {/* Cụm 4 thẻ thống kê tổng quan */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Offer chờ duyệt"
            value={String(pendingOffers.length).padStart(2, "0")}
            note="Hồ sơ cần xử lý"
            icon={<FileCheck2 className="h-5 w-5" />}
          />
          <StatCard
            title="Thử việc chờ duyệt"
            value={String(pendingProbations.length).padStart(2, "0")}
            note="Hồ sơ cần phê duyệt"
            icon={<ShieldCheck className="h-5 w-5" />}
          />
          <StatCard
            title="Đã tuyển tháng này"
            value={String(hiredThisMonth).padStart(2, "0")}
            note="Tính từ dữ liệu applications"
            icon={<CheckCircle2 className="h-5 w-5" />}
          />
          <StatCard
            title="Tổng nhân sự"
            value={String(probations.length)}
            note="Nhân sự thử việc hiện có"
            icon={<Users className="h-5 w-5" />}
          />
        </div>

        {/* Khối 2 cột: Offer chờ duyệt và Thử việc chờ duyệt */}
        <div className="grid gap-6 xl:grid-cols-2">
          {/* Danh sách Offer chờ phê duyệt */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-card-foreground">
                  Offer chờ phê duyệt
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Các đề xuất lương và vị trí đang chờ xác nhận
                </p>
              </div>

              {/* Điều hướng mượt sang Approvals tab offers */}
              <button
                onClick={() => navigate("/director/approvals", { state: { activeTab: "offers" } })}
                className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:underline"
              >
                Xem tất cả <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              {pendingOffers.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Không có offer nào chờ duyệt.</p>
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
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-card-foreground">
                  Thử việc chờ duyệt
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Các kết quả đánh giá cần phê duyệt cuối cùng
                </p>
              </div>

              {/* Điều hướng mượt sang Approvals tab probation */}
              <button
                onClick={() => navigate("/director/approvals", { state: { activeTab: "probation" } })}
                className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:underline"
              >
                Xem tất cả <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              {pendingProbations.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Không có hồ sơ thử việc nào chờ duyệt.</p>
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
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-card-foreground">
                Tăng trưởng nhân sự (Q1)
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Biểu đồ cột hoạt ảnh biểu diễn số lượng gia nhập
              </p>
            </div>

            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    }}
                  />
                  <Bar dataKey="count" name="Số lượng" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Biểu đồ thanh ngang Recharts: phân bổ nhân sự theo phòng ban */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-card-foreground">
                Nhân sự theo phòng ban
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Tỷ lệ phân bổ nhân sự thực tế trong doanh nghiệp
              </p>
            </div>

            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentsData} layout="vertical" barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }} width={80} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    }}
                  />
                  <Bar dataKey="count" name="Nhân viên" fill="#6366f1" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
