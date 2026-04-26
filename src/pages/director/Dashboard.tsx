import { useEffect, useMemo, useState } from "react";
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
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#71717a]">{title}</p>
          <h3 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900">
            {value}
          </h3>
          <p className="mt-2 text-sm text-[#71717a]">{note}</p>
        </div>

        {/* Icon minh họa cho từng chỉ số */}
        <div className="rounded-xl bg-zinc-100 p-3 text-zinc-900">{icon}</div>
      </div>
    </div>
  );
}

// Kiểu dữ liệu cho item trong danh sách chờ duyệt
type PendingItemProps = {
  name: string;
  subtitle: string;
  type: "offer" | "probation";
};

// Component hiển thị 1 item trong danh sách Offer/Probation chờ duyệt
function PendingItem({ name, subtitle, type }: PendingItemProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
      <div className="flex items-center gap-3">
        {/* Icon thay đổi theo loại dữ liệu */}
        <div className="rounded-full bg-white p-2 text-zinc-900 shadow-sm">
          {type === "offer" ? (
            <Clock3 className="h-4 w-4" />
          ) : (
            <ShieldCheck className="h-4 w-4" />
          )}
        </div>

        <div>
          <p className="text-sm font-semibold text-zinc-900">{name}</p>
          <p className="text-xs text-[#71717a]">{subtitle}</p>
        </div>
      </div>

      <button className="text-sm font-medium text-zinc-900 hover:underline">
        Xem
      </button>
    </div>
  );
}

// Kiểu dữ liệu cho cột biểu đồ đứng
type VerticalBarProps = {
  label: string;
  value: number;
};

// Component mô phỏng 1 cột trong biểu đồ tăng trưởng nhân sự
function VerticalBar({ label, value }: VerticalBarProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-end gap-3">
      <div className="flex h-48 items-end">
        <div
          className="w-12 rounded-t-xl"
          style={{ height: `${value}%`, backgroundColor: "#18181b" }}
        />
      </div>
      <span className="text-sm text-[#71717a]">{label}</span>
    </div>
  );
}

// Kiểu dữ liệu cho thanh biểu đồ ngang
type HorizontalBarProps = {
  label: string;
  value: number;
};

// Component mô phỏng 1 thanh trong biểu đồ phân bổ theo phòng ban
function HorizontalBar({ label, value }: HorizontalBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-zinc-800">{label}</span>
        <span className="text-[#71717a]">{value}%</span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-zinc-100">
        <div
          className="h-full rounded-full"
          style={{ width: `${value}%`, backgroundColor: "#18181b" }}
        />
      </div>
    </div>
  );
}

// Component chính: Dashboard dành cho Director
export default function DirectorDashboard() {
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
  const departments = useMemo(() => {
    const counts = probations.reduce<Record<string, number>>((acc, probation) => {
      if (probation.department) acc[probation.department] = (acc[probation.department] ?? 0) + 1;
      return acc;
    }, {});
    const max = Math.max(...Object.values(counts), 1);
    return Object.entries(counts).map(([label, count]) => ({
      label,
      value: Math.max(10, Math.round((count / max) * 100)),
    }));
  }, [probations]);

  return (
    <div className="min-h-screen bg-zinc-50 p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header trang */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Dashboard Giám đốc
          </h1>
          <p className="mt-2 text-sm md:text-base text-[#71717a]">
            Tổng quan tuyển dụng &amp; nhân sự
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
            note="Hồ sơ sắp hết hạn đánh giá"
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
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900">
                  Offer chờ phê duyệt
                </h2>
                <p className="mt-1 text-sm text-[#71717a]">
                  Các đề xuất lương và vị trí đang chờ xác nhận
                </p>
              </div>

              <button className="inline-flex items-center gap-1 text-sm font-medium text-zinc-900 hover:underline">
                Xem tất cả <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              {pendingOffers.slice(0, 3).map((offer) => (
                <PendingItem
                  key={offer.id}
                  name={offer.candidateName}
                  subtitle={`${offer.jobTitle} • ${offer.baseSalary.toLocaleString("vi-VN")} ${offer.currency}`}
                  type="offer"
                />
              ))}
            </div>
          </div>

          {/* Danh sách kết quả thử việc chờ duyệt */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900">
                  Thử việc chờ duyệt
                </h2>
                <p className="mt-1 text-sm text-[#71717a]">
                  Các kết quả đánh giá cần phê duyệt cuối cùng
                </p>
              </div>

              <button className="inline-flex items-center gap-1 text-sm font-medium text-zinc-900 hover:underline">
                Xem tất cả <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              {pendingProbations.slice(0, 3).map((probation) => (
                <PendingItem
                  key={probation.id}
                  name={probation.fullName}
                  subtitle={`${probation.jobTitle} • Chờ kết luận chính thức`}
                  type="probation"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Khu vực mô phỏng biểu đồ */}
        <div className="grid gap-6 xl:grid-cols-2">
          {/* Biểu đồ cột đứng: tăng trưởng nhân sự theo tháng */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-zinc-900">
                Tăng trưởng nhân sự (Q1)
              </h2>
              <p className="mt-1 text-sm text-[#71717a]">
                Mô phỏng biểu đồ thanh theo tháng
              </p>
            </div>

            <div className="flex h-[280px] items-end gap-6">
              <VerticalBar label="Jan" value={45} />
              <VerticalBar label="Feb" value={68} />
              <VerticalBar label="Mar" value={82} />
            </div>
          </div>

          {/* Biểu đồ thanh ngang: phân bổ nhân sự theo phòng ban */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-zinc-900">
                Nhân sự theo phòng ban
              </h2>
              <p className="mt-1 text-sm text-[#71717a]">
                Tỷ lệ phân bổ hiện tại trong tổ chức
              </p>
            </div>

            <div className="space-y-5">
              {(departments.length > 0 ? departments : [{ label: "Chưa có dữ liệu", value: 0 }]).map((item) => (
                <HorizontalBar key={item.label} label={item.label} value={item.value} />
              ))}
            </div>

            <div className="mt-6 flex items-center gap-2 text-sm text-[#71717a]">
              <Building2 className="h-4 w-4" />
              Cập nhật gần nhất: 09:00 AM hôm nay
            </div>
          </div>
        </div>

        {/* Ghi chú cuối trang */}
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white/70 p-5 text-sm text-[#71717a]">
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-4 w-4 text-zinc-900" />
            Bảng điều hành này tập trung vào quyết định phê duyệt và xu hướng
            tăng trưởng nhân sự ở cấp quản trị.
          </div>
        </div>
      </div>
    </div>
  );
}
