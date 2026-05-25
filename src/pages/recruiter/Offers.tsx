import { useEffect, useState } from "react";
import {
  Plus,
  FileText,
  Check,
  Clock,
  XCircle,
  ChevronDown,
  ChevronUp,
  BadgeCheck,
  Eye,
} from "lucide-react";
import { offerService, applicationService } from "@/services";
import type { Offer, Application } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/utils/date";

// ─── Badge trạng thái Offer ───────────────────────────────────
const STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  pending_approval: {
    label: "Chờ duyệt",
    className: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  approved: {
    label: "Đã duyệt",
    className: "bg-blue-50 text-blue-700 border border-blue-200",
  },
  rejected: {
    label: "Bị từ chối",
    className: "bg-red-50 text-red-700 border border-red-200",
  },
  accepted: {
    label: "Ứng viên chấp nhận",
    className: "bg-green-50 text-green-700 border border-green-200",
  },
  declined: {
    label: "Ứng viên từ chối",
    className: "bg-zinc-100 text-zinc-600 border border-zinc-200",
  },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}

// ─── Form tạo Offer ──────────────────────────────────────────
interface CreateOfferFormProps {
  applications: Application[];
  onSuccess: () => void;
  onCancel: () => void;
}

function CreateOfferForm({ applications, onSuccess, onCancel }: CreateOfferFormProps) {
  const [form, setForm] = useState({
    applicationId: "",
    baseSalary: "",
    allowance: "",
    startDate: "",
    probationDays: "60",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Chỉ hiển thị application đã Pass phỏng vấn
  const eligibleApplications = applications.filter(
    (app) => app.status === "interview_passed"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.applicationId || !form.baseSalary || !form.startDate) {
      setError("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }
    try {
      setSubmitting(true);
      setError("");
      await offerService.createOffer({
        applicationId: form.applicationId,
        baseSalary: Number(form.baseSalary),
        allowance: form.allowance ? Number(form.allowance) : undefined,
        currency: "VND",
        startDate: form.startDate,
        probationDays: Number(form.probationDays),
      });
      onSuccess();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? "Không thể tạo Offer. Vui lòng thử lại."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-card-foreground mb-1">
        Tạo Offer mới
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        Chỉ ứng viên đã <strong>Pass phỏng vấn</strong> mới có thể nhận Offer.
      </p>

      {error && (
        <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Chọn ứng viên */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Ứng viên <span className="text-destructive">*</span>
          </label>
          {eligibleApplications.length === 0 ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
              Hiện chưa có ứng viên nào Pass phỏng vấn để tạo Offer.
            </div>
          ) : (
            <select
              value={form.applicationId}
              onChange={(e) => setForm({ ...form, applicationId: e.target.value })}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            >
              <option value="">-- Chọn ứng viên --</option>
              {eligibleApplications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.candidateName} — {app.jobTitle}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Lương cơ bản + Phụ cấp */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Lương cơ bản (VNĐ) <span className="text-destructive">*</span>
            </label>
            <input
              type="number"
              min={0}
              value={form.baseSalary}
              onChange={(e) => setForm({ ...form, baseSalary: e.target.value })}
              placeholder="Ví dụ: 15000000"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Phụ cấp (VNĐ)
            </label>
            <input
              type="number"
              min={0}
              value={form.allowance}
              onChange={(e) => setForm({ ...form, allowance: e.target.value })}
              placeholder="Không bắt buộc"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* Ngày bắt đầu + Số ngày thử việc */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Ngày bắt đầu dự kiến <span className="text-destructive">*</span>
            </label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Số ngày thử việc
            </label>
            <select
              value={form.probationDays}
              onChange={(e) => setForm({ ...form, probationDays: e.target.value })}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="30">30 ngày</option>
              <option value="60">60 ngày</option>
              <option value="90">90 ngày</option>
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={submitting || eligibleApplications.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {submitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Đang tạo...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Tạo Offer
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Trang chính ─────────────────────────────────────────────
export default function RecruiterOffers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [viewingReason, setViewingReason] = useState<{ candidateName: string; reason: string } | null>(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([offerService.getOffers(), applicationService.getApplications()])
      .then(([offerList, appList]) => {
        setOffers(offerList);
        setApplications(appList);
      })
      .catch(() => setError("Không thể tải dữ liệu. Vui lòng thử lại."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSuccess = () => {
    setShowForm(false);
    loadData();
  };

  // Thống kê nhanh
  const stats = {
    pending: offers.filter((o) => o.status === "pending_approval").length,
    approved: offers.filter((o) => o.status === "approved").length,
    accepted: offers.filter((o) => o.status === "accepted").length,
    rejected: offers.filter((o) => o.status === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Quản Lý Offer
            </h1>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all active:scale-95"
          >
            {showForm ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Đóng form
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Tạo Offer mới
              </>
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
            {error}
          </div>
        )}

        {/* Form tạo Offer */}
        {showForm && (
          <CreateOfferForm
            applications={applications}
            onSuccess={handleCreateSuccess}
            onCancel={() => setShowForm(false)}
          />
        )}

        {/* Stats cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Chờ Director duyệt", value: stats.pending, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Đã được duyệt", value: stats.approved, icon: BadgeCheck, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Ứng viên chấp nhận", value: stats.accepted, icon: Check, color: "text-green-600", bg: "bg-green-50" },
            { label: "Bị từ chối", value: stats.rejected, icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <h3 className="mt-2 text-3xl font-bold text-card-foreground">
                    {String(stat.value).padStart(1, "0")}
                  </h3>
                </div>
                <div className={`rounded-xl p-3 ${stat.bg} ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Danh sách Offers */}
        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-semibold text-card-foreground">
              Danh sách Offer
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {offers.length} offer đang được quản lý
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary" />
                <p className="text-sm text-muted-foreground">Đang tải...</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto p-1">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ứng viên</TableHead>
                    <TableHead>Vị trí</TableHead>
                    <TableHead>Lương đề xuất</TableHead>
                    <TableHead>Ngày bắt đầu</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ghi chú Director</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="py-12 text-center text-muted-foreground"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <FileText className="h-10 w-10 text-muted-foreground/40" />
                          <p className="font-medium">Chưa có Offer nào</p>
                          <p className="text-xs">
                            Nhấn "Tạo Offer mới" để bắt đầu sau khi ứng viên Pass phỏng vấn
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    offers.map((offer) => (
                      <TableRow key={offer.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground uppercase">
                              {offer.candidateName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">
                                {offer.candidateName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {offer.candidateEmail}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          {offer.jobTitle}
                        </TableCell>
                        <TableCell className="font-semibold text-foreground">
                          {Number(offer.baseSalary).toLocaleString("vi-VN")} {offer.currency}
                          {offer.allowance && offer.allowance > 0 && (
                            <span className="ml-1 text-xs text-muted-foreground">
                              + {Number(offer.allowance).toLocaleString("vi-VN")} PC
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(offer.startDate)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={offer.status} />
                            {offer.status === "declined" && offer.declineReason && (
                              <button
                                onClick={() => setViewingReason({ candidateName: offer.candidateName, reason: offer.declineReason! })}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                title="Xem lý do từ chối"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm italic max-w-[200px] truncate">
                          {offer.directorComment ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Modal xem lý do từ chối */}
      {viewingReason && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3.5 mb-4 text-destructive">
              <div className="rounded-xl bg-red-50 p-2.5 text-red-600">
                <XCircle className="h-6 w-6" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-foreground">Lý do từ chối Offer</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Ứng viên: {viewingReason.candidateName}</p>
              </div>
            </div>

            <div className="rounded-xl bg-muted/50 p-4 border border-border mb-6 text-left">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {viewingReason.reason}
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setViewingReason(null)}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all active:scale-95"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
