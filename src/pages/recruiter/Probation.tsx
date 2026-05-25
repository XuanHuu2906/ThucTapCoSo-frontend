import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
  Eye,
  Pencil,
  Bell,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import { probationService, userService } from "@/services";
import type { HiringManagerOption } from "@/services/user.service";
import type { Probationer as ApiProbationer, ProbationStatus } from "@/types";
import { formatDate, getDaysLeft } from "@/utils/date";

interface ProbationerRow {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  supervisorId: string;
  supervisorName: string;
  startDate: string;
  endDate: string;
  status: ProbationStatus;
  progress: number;
  daysLeft: number;
}

type DisplayStatus = ProbationStatus | "ending_soon";
type StatusFilter = "all" | DisplayStatus;
type ModalMode = "none" | "detail" | "edit";

type EditForm = {
  supervisorId: string;
  startDate: string;
  endDate: string;
};

const STATUS_CONFIG: Record<DisplayStatus, { label: string; color: string; icon: LucideIcon }> = {
  probating: {
    label: "Đang thử việc",
    color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10 ring-blue-600/20",
    icon: Clock,
  },
  ending_soon: {
    label: "Sắp hết hạn",
    color: "text-amber-600 bg-amber-50 dark:bg-amber-500/10 ring-amber-600/20",
    icon: AlertTriangle,
  },
  pending_evaluation: {
    label: "Chờ duyệt đánh giá",
    color: "text-violet-600 bg-violet-50 dark:bg-violet-500/10 ring-violet-600/20",
    icon: AlertTriangle,
  },
  passed: {
    label: "Hoàn thành",
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 ring-emerald-600/20",
    icon: CheckCircle2,
  },
  failed: {
    label: "Dừng thử việc",
    color: "text-rose-600 bg-rose-50 dark:bg-rose-500/10 ring-rose-600/20",
    icon: AlertTriangle,
  },
};

const STATUS_FILTERS: Array<{ label: string; value: StatusFilter }> = [
  { label: "Tất cả", value: "all" },
  { label: "Đang thử việc", value: "probating" },
  { label: "Sắp hết hạn", value: "ending_soon" },
  { label: "Chờ duyệt đánh giá", value: "pending_evaluation" },
  { label: "Hoàn thành", value: "passed" },
  { label: "Dừng thử việc", value: "failed" },
];

const normalizeDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

const toDateInputValue = (value: string) => {
  const date = normalizeDate(value);
  if (!date) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const calculateProgress = (startDate: string, endDate: string, status: ProbationStatus) => {
  if (status === "passed" || status === "failed") return 100;

  const start = normalizeDate(startDate)?.getTime();
  const end = normalizeDate(endDate)?.getTime();
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (!start || !end || end <= start) return 0;

  return Math.min(100, Math.max(0, Math.round(((now.getTime() - start) / (end - start)) * 100)));
};

const mapProbationer = (item: ApiProbationer): ProbationerRow => ({
  id: item.id,
  name: item.fullName,
  email: item.email,
  position: item.jobTitle,
  department: item.department || "Chưa cập nhật",
  supervisorId: item.supervisorId,
  supervisorName: item.supervisorName || "Chưa phân công",
  startDate: item.startDate,
  endDate: item.endDate,
  status: item.status,
  progress: calculateProgress(item.startDate, item.endDate, item.status),
  daysLeft: getDaysLeft(item.endDate),
});

const getDisplayStatus = (item: ProbationerRow): DisplayStatus => {
  if (item.status === "probating" && item.daysLeft >= 0 && item.daysLeft <= 7) {
    return "ending_soon";
  }

  return item.status;
};

const formatDaysLeft = (daysLeft: number, status: ProbationStatus) => {
  if (status === "passed") return "Đã hoàn thành";
  if (status === "failed") return "Đã dừng";
  if (daysLeft < 0) return `Quá hạn ${Math.abs(daysLeft)} ngày`;
  if (daysLeft === 0) return "Hết hạn hôm nay";
  return `Còn ${daysLeft} ngày`;
};

const escapeCsvValue = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;

const Probation: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [probationers, setProbationers] = useState<ProbationerRow[]>([]);
  const [hiringManagers, setHiringManagers] = useState<HiringManagerOption[]>([]);
  const [selectedProbationer, setSelectedProbationer] = useState<ProbationerRow | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>("none");
  const [editForm, setEditForm] = useState<EditForm>({ supervisorId: "", startDate: "", endDate: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingManagers, setIsLoadingManagers] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const [managerError, setManagerError] = useState("");
  const [endingSoonCount, setEndingSoonCount] = useState(0);

  const loadProbationers = () => {
    setIsLoading(true);
    setError("");

    probationService
      .getProbationers()
      .then((data) => setProbationers(data.map(mapProbationer)))
      .catch(() => setError("Không thể tải danh sách thử việc."))
      .finally(() => setIsLoading(false));
  };

  const loadHiringManagers = () => {
    setIsLoadingManagers(true);
    setManagerError("");

    userService
      .getHiringManagers()
      .then(setHiringManagers)
      .catch(() => setManagerError("Không thể tải danh sách Hiring Manager."))
      .finally(() => setIsLoadingManagers(false));
  };

  useEffect(() => {
    loadProbationers();
    loadHiringManagers();

    probationService
      .getEndingSoon()
      .then((data) => setEndingSoonCount(data.length))
      .catch(() => setEndingSoonCount(0));
  }, []);

  const departments = useMemo(
    () => Array.from(new Set(probationers.map((item) => item.department))).filter(Boolean),
    [probationers]
  );

  const filteredProbationers = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();

    return probationers.filter((item) => {
      const displayStatus = getDisplayStatus(item);
      const matchesSearch =
        !keyword ||
        item.name.toLowerCase().includes(keyword) ||
        item.email.toLowerCase().includes(keyword) ||
        item.position.toLowerCase().includes(keyword) ||
        item.department.toLowerCase().includes(keyword) ||
        item.supervisorName.toLowerCase().includes(keyword);
      const matchesDepartment = departmentFilter === "all" || item.department === departmentFilter;
      const matchesStatus = statusFilter === "all" || displayStatus === statusFilter;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [departmentFilter, probationers, searchQuery, statusFilter]);


  const hiringManagerOptions = useMemo(() => {
    const options = [...hiringManagers];

    if (
      modalMode === "edit" &&
      selectedProbationer?.supervisorId &&
      !options.some((manager) => manager.id === selectedProbationer.supervisorId)
    ) {
      options.unshift({
        id: selectedProbationer.supervisorId,
        fullName: selectedProbationer.supervisorName || `Hiring Manager #${selectedProbationer.supervisorId}`,
        email: "",
        role: "HiringManager",
        status: "Active",
      });
    }

    return options;
  }, [hiringManagers, modalMode, selectedProbationer]);

  // endingSoonCount is now fetched from API in useEffect

  const closeModal = () => {
    setModalMode("none");
    setSelectedProbationer(null);
    setEditForm({ supervisorId: "", startDate: "", endDate: "" });
  };

  const openDetail = (item: ProbationerRow) => {
    setSelectedProbationer(item);
    setModalMode("detail");
  };

  const openEdit = (item: ProbationerRow) => {
    setSelectedProbationer(item);
    setEditForm({
      supervisorId: item.supervisorId,
      startDate: toDateInputValue(item.startDate),
      endDate: toDateInputValue(item.endDate),
    });
    setModalMode("edit");
  };

  const handleReminder = (item: ProbationerRow) => {
    if (getDisplayStatus(item) !== "ending_soon") return;

    toast("Backend chưa có API gửi email nhắc đánh giá. UI đã ghi nhận thao tác này.", {
      icon: "⏳",
    });
  };

  const handleUpdateProbation = async () => {
    if (!selectedProbationer) return;
    if (!editForm.startDate || !editForm.endDate) {
      toast.error("Vui lòng nhập ngày bắt đầu và ngày kết thúc.");
      return;
    }

    const startDate = normalizeDate(editForm.startDate);
    const endDate = normalizeDate(editForm.endDate);
    if (!startDate || !endDate || endDate <= startDate) {
      toast.error("Ngày kết thúc phải sau ngày bắt đầu.");
      return;
    }

    setIsUpdating(true);
    try {
      const updated = await probationService.updateProbation(selectedProbationer.id, editForm);
      const updatedRow = mapProbationer(updated);
      setProbationers((prev) => prev.map((item) => (item.id === updatedRow.id ? updatedRow : item)));
      toast.success("Đã cập nhật thông tin thử việc.");
      closeModal();
    } catch (err: any) {
      const message = err.response?.data?.message || "Không thể cập nhật thông tin thử việc.";
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  };

  const exportToExcel = () => {
    if (filteredProbationers.length === 0) return;

    const headers = [
      "ID",
      "Nhân viên",
      "Email",
      "Phòng ban",
      "Vị trí",
      "Người hướng dẫn",
      "Ngày bắt đầu",
      "Ngày kết thúc",
      "Số ngày còn lại",
      "Trạng thái",
      "Tiến độ (%)",
    ];

    const rows = filteredProbationers.map((item) => {
      const displayStatus = getDisplayStatus(item);
      return [
        `PRB-${item.id}`,
        item.name,
        item.email,
        item.department,
        item.position,
        item.supervisorName,
        formatDate(item.startDate),
        formatDate(item.endDate),
        item.daysLeft,
        STATUS_CONFIG[displayStatus].label,
        item.progress,
      ];
    });

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\n");
    const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `probationers-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Quản Lý Thử Việc
          </h1>
        </div>
        <button
          onClick={exportToExcel}
          disabled={filteredProbationers.length === 0}
          className="inline-flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 transition-all disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="-ml-1 mr-2 h-4 w-4" />
          Xuất báo cáo Excel
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-500 dark:bg-slate-900 dark:border-slate-800">
          Đang tải danh sách thử việc...
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm tên, email, vị trí, người hướng dẫn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 shadow-sm"
            />
          </div>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="w-full sm:w-64 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 shadow-sm"
          >
            <option value="all">Tất cả phòng ban</option>
            {departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-bold border transition-all whitespace-nowrap",
                statusFilter === filter.value
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "bg-white text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

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
              {filteredProbationers.map((p) => {
                const displayStatus = getDisplayStatus(p);
                const statusConfig = STATUS_CONFIG[displayStatus];
                const StatusIcon = statusConfig.icon;
                const canUpdate = p.status !== "passed" && p.status !== "failed";
                const canRemind = displayStatus === "ending_soon";

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
                          {p.email && <p className="text-[10px] text-slate-400">{p.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-700 dark:text-slate-200">{p.department}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{p.position}</p>
                      <p className="text-[10px] text-slate-400">HM: {p.supervisorName}</p>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1.5"><Calendar size={12} className="text-slate-400" /> Bắt đầu: {formatDate(p.startDate)}</span>
                        <span className="flex items-center gap-1.5"><Calendar size={12} className="text-slate-400" /> Kết thúc: {formatDate(p.endDate)}</span>
                        <span className={cn(
                          "flex items-center gap-1.5 font-bold",
                          p.daysLeft <= 7 && p.status === "probating" ? "text-amber-600" : "text-slate-500"
                        )}>
                          <Clock size={12} /> {formatDaysLeft(p.daysLeft, p.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-32 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span className={cn(p.progress === 100 ? "text-emerald-600" : "text-slate-500")}>{p.progress}%</span>
                          <span className="text-slate-400">
                            {p.status === "failed" ? "Đã dừng" : p.progress === 100 ? "Xong" : "Đang chạy"}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              displayStatus === "passed" ? "bg-emerald-500" :
                                displayStatus === "ending_soon" || displayStatus === "pending_evaluation" ? "bg-amber-500" :
                                  displayStatus === "failed" ? "bg-rose-500" : "bg-blue-500"
                            )}
                            style={{ width: `${p.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset uppercase tracking-widest",
                        statusConfig.color
                      )}>
                        <StatusIcon size={12} />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openDetail(p)}
                          title="Xem chi tiết"
                          className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all"
                        >
                          <Eye size={16} />
                        </button>
                        {canUpdate && (
                          <button
                            onClick={() => openEdit(p)}
                            title="Cập nhật thử việc"
                            className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all"
                          >
                            <Pencil size={16} />
                          </button>
                        )}
                        {canRemind && (
                          <button
                            onClick={() => handleReminder(p)}
                            title="Nhắc đánh giá"
                            className="p-2 rounded-lg text-amber-500 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-all"
                          >
                            <Bell size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!isLoading && filteredProbationers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm font-semibold text-slate-500">
                    Không có nhân viên thử việc phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {endingSoonCount > 0 && (
        <div className="bg-slate-900 dark:bg-blue-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-500/20">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <AlertTriangle size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Lưu ý trong tuần</h3>
              <p className="text-white/70 text-sm">
                Có <span className="text-white font-bold">{endingSoonCount} nhân viên</span> sắp hoàn thành thử việc trong 7 ngày tới.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter("ending_soon")}
            className="px-8 py-3 rounded-2xl bg-white text-slate-900 font-bold hover:bg-slate-100 transition-all active:scale-95"
          >
            Xem ngay
          </button>
        </div>
      )}

      {modalMode !== "none" && selectedProbationer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900 dark:ring-1 dark:ring-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                  {modalMode === "detail" ? "Chi tiết thử việc" : "Cập nhật thử việc"}
                </h2>
                <p className="text-xs font-semibold text-slate-500">{selectedProbationer.name}</p>
              </div>
              <button onClick={closeModal} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={20} />
              </button>
            </div>

            {modalMode === "detail" ? (
              <div className="grid gap-4 p-6 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Email</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{selectedProbationer.email || "Chưa cập nhật"}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Người hướng dẫn</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{selectedProbationer.supervisorName}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Phòng ban</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{selectedProbationer.department}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Vị trí</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{selectedProbationer.position}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Bắt đầu</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{formatDate(selectedProbationer.startDate)}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Kết thúc</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{formatDate(selectedProbationer.endDate)}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Thời hạn</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{formatDaysLeft(selectedProbationer.daysLeft, selectedProbationer.status)}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Trạng thái</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{STATUS_CONFIG[getDisplayStatus(selectedProbationer)].label}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 p-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Hiring Manager</label>
                  <select
                    value={editForm.supervisorId}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, supervisorId: e.target.value }))}
                    disabled={isLoadingManagers && hiringManagerOptions.length === 0}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-800/50"
                  >
                    <option value="">{isLoadingManagers ? "Đang tải Hiring Manager..." : "Chưa phân công"}</option>
                    {hiringManagerOptions.map((manager) => (
                      <option key={manager.id} value={manager.id}>
                        {manager.email ? `${manager.fullName} (${manager.email})` : manager.fullName}
                      </option>
                    ))}
                  </select>
                  {managerError && (
                    <p className="text-xs font-medium text-amber-600">
                      {managerError} Có thể giữ người phụ trách hiện tại nếu đã có trong hồ sơ.
                    </p>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Ngày bắt đầu</label>
                    <input
                      type="date"
                      value={editForm.startDate}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, startDate: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Ngày kết thúc</label>
                    <input
                      type="date"
                      value={editForm.endDate}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, endDate: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800/50"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/50">
              <button onClick={closeModal} className="rounded-xl px-5 py-2 text-xs font-bold text-slate-500 hover:bg-white dark:hover:bg-slate-700">
                Đóng
              </button>
              {modalMode === "edit" && (
                <button
                  onClick={handleUpdateProbation}
                  disabled={isUpdating}
                  className="rounded-xl bg-blue-600 px-6 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-500 disabled:opacity-50"
                >
                  {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Probation;
