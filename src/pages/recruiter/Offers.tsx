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
import { useSearchParams } from "react-router-dom";
import type { Offer, Application } from "@/types";
import { formatDate } from "@/utils/date";

// ─── Badge trạng thái Offer ───────────────────────────────────
const STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  pending_approval: {
    label: "Chờ duyệt",
    className: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  },
  approved: {
    label: "Đã duyệt",
    className: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  },
  rejected: {
    label: "Bị từ chối",
    className: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
  },
  accepted: {
    label: "Ứng viên chấp nhận",
    className: "bg-green-50 text-green-700 border border-green-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  },
  declined: {
    label: "Ứng viên từ chối",
    className: "bg-zinc-100 text-zinc-600 border border-zinc-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
  },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
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
  defaultApplicationId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

function CreateOfferForm({ applications, defaultApplicationId, onSuccess, onCancel }: CreateOfferFormProps) {
  const [form, setForm] = useState({
    applicationId: defaultApplicationId || "",
    baseSalary: "",
    allowance: "",
    startDate: "",
    probationDays: "60",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (defaultApplicationId) {
      setForm((prev) => ({ ...prev, applicationId: defaultApplicationId }));
    }
  }, [defaultApplicationId]);

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
    <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-1">
        Tạo Offer mới
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Chỉ ứng viên đã <strong>Pass phỏng vấn</strong> mới có thể nhận Offer.
      </p>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-500/10 dark:border-rose-500/20 p-3 text-sm text-rose-600 dark:text-rose-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Chọn ứng viên */}
        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest ml-1">
            Ứng viên <span className="text-rose-500">*</span>
          </label>
          {eligibleApplications.length === 0 ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-500/10 dark:border-amber-500/20 p-3 text-sm text-amber-700 dark:text-amber-400">
              Hiện chưa có ứng viên nào Pass phỏng vấn để tạo Offer.
            </div>
          ) : (
            <div className="relative">
              <select
                value={form.applicationId}
                onChange={(e) => setForm({ ...form, applicationId: e.target.value })}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-50 outline-none focus:border-blue-500 transition-all"
                required
              >
                <option value="">-- Chọn ứng viên --</option>
                {eligibleApplications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.candidateName} — {app.jobTitle}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          )}
        </div>

        {/* Lương cơ bản + Phụ cấp */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest ml-1">
              Lương cơ bản (VNĐ) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min={0}
              value={form.baseSalary}
              onChange={(e) => setForm({ ...form, baseSalary: e.target.value })}
              placeholder="Ví dụ: 15000000"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-50 outline-none focus:border-blue-500 transition-all"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest ml-1">
              Phụ cấp (VNĐ)
            </label>
            <input
              type="number"
              min={0}
              value={form.allowance}
              onChange={(e) => setForm({ ...form, allowance: e.target.value })}
              placeholder="Không bắt buộc"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-50 outline-none focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Ngày bắt đầu + Số ngày thử việc */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest ml-1">
              Ngày bắt đầu dự kiến <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-50 outline-none focus:border-blue-500 transition-all"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest ml-1">
              Số ngày thử việc
            </label>
            <div className="relative">
              <select
                value={form.probationDays}
                onChange={(e) => setForm({ ...form, probationDays: e.target.value })}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-50 outline-none focus:border-blue-500 transition-all"
              >
                <option value="30">30 ngày</option>
                <option value="60">60 ngày</option>
                <option value="90">90 ngày</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-all"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={submitting || eligibleApplications.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white px-5 py-2 text-xs font-bold hover:bg-blue-500 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Đang tạo...
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" />
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

  const [searchParams, setSearchParams] = useSearchParams();
  const appIdParam = searchParams.get("applicationId") || searchParams.get("appId");

  useEffect(() => {
    if (appIdParam) {
      setShowForm(true);
    }
  }, [appIdParam]);

  const handleCancel = () => {
    setShowForm(false);
    if (searchParams.has("applicationId") || searchParams.has("appId")) {
      setSearchParams({}, { replace: true });
    }
  };

  const handleCreateSuccess = () => {
    setShowForm(false);
    if (searchParams.has("applicationId") || searchParams.has("appId")) {
      setSearchParams({}, { replace: true });
    }
    loadData();
  };

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

  // Thống kê nhanh
  const stats = {
    pending: offers.filter((o) => o.status === "pending_approval").length,
    approved: offers.filter((o) => o.status === "approved").length,
    accepted: offers.filter((o) => o.status === "accepted").length,
    rejected: offers.filter((o) => o.status === "rejected").length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Quản lý Offer
          </h1>
        </div>
        <button
          onClick={() => {
            if (showForm) {
              handleCancel();
            } else {
              setShowForm(true);
            }
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-500 transition-all active:scale-95"
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
        <div className="rounded-2xl border border-rose-200 bg-rose-50 dark:bg-rose-500/10 dark:border-rose-500/20 p-4 text-sm font-semibold text-rose-700 dark:text-rose-400">
          {error}
        </div>
      )}

      {/* Form tạo Offer */}
      {showForm && (
        <CreateOfferForm
          applications={applications}
          defaultApplicationId={appIdParam || undefined}
          onSuccess={handleCreateSuccess}
          onCancel={handleCancel}
        />
      )}

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Chờ Director duyệt", value: stats.pending, icon: Clock, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10" },
          { label: "Đã được duyệt", value: stats.approved, icon: BadgeCheck, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10" },
          { label: "Ứng viên chấp nhận", value: stats.accepted, icon: Check, color: "text-green-600 dark:text-emerald-400", bg: "bg-green-50 dark:bg-emerald-500/10" },
          { label: "Bị từ chối", value: stats.rejected, icon: XCircle, color: "text-red-600 dark:text-rose-400", bg: "bg-red-50 dark:bg-rose-500/10" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-50">
                  {String(stat.value).padStart(1, "0")}
                </h3>
              </div>
              <div className={`rounded-2xl p-3 ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Danh sách Offers */}
      <div className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-50 uppercase tracking-wider">
            Danh sách Offer
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {offers.length} offer đang được quản lý
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-blue-600" />
              <p className="text-sm text-slate-500">Đang tải...</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/30 font-bold uppercase text-[10px] tracking-widest">
                  <th className="px-6 py-4">Ứng viên</th>
                  <th className="px-6 py-4">Vị trí</th>
                  <th className="px-6 py-4">Lương đề xuất</th>
                  <th className="px-6 py-4">Ngày bắt đầu</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4">Ghi chú Director</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {offers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-slate-500 dark:text-slate-400 font-semibold"
                    >
                      <div className="flex flex-col items-center justify-center gap-3">
                        <FileText className="h-10 w-10 text-slate-400/40" />
                        <p className="font-medium">Chưa có Offer nào</p>
                        <p className="text-xs">
                          Nhấn "Tạo Offer mới" để bắt đầu sau khi ứng viên Pass phỏng vấn
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  offers.map((offer) => (
                    <tr key={offer.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 text-xs font-bold uppercase">
                            {offer.candidateName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-slate-50">
                              {offer.candidateName}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              {offer.candidateEmail}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200">
                        {offer.jobTitle}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-50">
                        {Number(offer.baseSalary).toLocaleString("vi-VN")} {offer.currency}
                        {offer.allowance && offer.allowance > 0 && (
                          <span className="ml-1 text-xs text-slate-500 dark:text-slate-400">
                            + {Number(offer.allowance).toLocaleString("vi-VN")} PC
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">
                        {formatDate(offer.startDate)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={offer.status} />
                          {offer.status === "declined" && offer.declineReason && (
                            <button
                              onClick={() => setViewingReason({ candidateName: offer.candidateName, reason: offer.declineReason! })}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                              title="Xem lý do từ chối"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm italic max-w-[200px] truncate">
                        {offer.directorComment ?? "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal xem lý do từ chối */}
      {viewingReason && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 dark:ring-1 dark:ring-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3.5 mb-4">
              <div className="rounded-2xl bg-rose-50 dark:bg-rose-500/10 p-2.5 text-rose-600">
                <XCircle className="h-6 w-6" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">Lý do từ chối Offer</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Ứng viên: {viewingReason.candidateName}</p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-100 dark:border-slate-800 mb-6 text-left">
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {viewingReason.reason}
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setViewingReason(null)}
                className="rounded-xl bg-blue-600 text-white px-5 py-2 text-xs font-bold hover:bg-blue-500 transition-all active:scale-95"
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
