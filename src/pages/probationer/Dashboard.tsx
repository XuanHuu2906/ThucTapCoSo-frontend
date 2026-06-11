import React, { useEffect, useState } from "react";
import {
  Calendar, Clock, CheckCircle2, Circle,
  User, Building2, Mail, Phone, Star,
  ClipboardCheck, MessageSquare, Target,
  ArrowUpRight, TrendingUp, BookOpen
} from "lucide-react";
import { cn } from "../../lib/utils";
import { probationService } from "@/services";
import type { ProbationEvaluation } from "@/types";
import { useAuth } from "@/hooks/useAuth";

const STATUS_LABELS: Record<string, string> = {
  probating: "Đang thử việc",
  pending_evaluation: "Chờ phê duyệt",
  passed: "Chính thức",
  failed: "Đã chấm dứt",
};

const STATUS_DESCRIPTIONS: Record<string, string> = {
  probating: "Bạn đang trong quá trình thử việc. Hãy tập trung hoàn thành tốt các nhiệm vụ.",
  pending_evaluation: "Đánh giá thử việc của bạn đã được gửi và đang chờ Giám đốc phê duyệt.",
  passed: "Chúc mừng! Bạn đã xuất sắc trở thành nhân viên chính thức của công ty.",
  failed: "Thời gian thử việc đã kết thúc. Cảm ơn sự đồng hành và nỗ lực của bạn.",
};

// ─── Dữ liệu giả lập ────────────────────────────────────────

/** Thông tin cá nhân thử việc mặc định */
const DEFAULT_PROBATIONER_INFO = {
  name: "Chưa cập nhật",
  email: "Chưa cập nhật",
  phone: "Chưa cập nhật",
  position: "Chưa cập nhật",
  department: "Chưa cập nhật",
  supervisor: "Chưa phân công",
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date().toISOString().slice(0, 10),
  daysRemaining: 0,
  totalDays: 1,
  daysPassed: 0,
  status: "probating",
};

/** Nhiệm vụ / mục tiêu trong thời gian thử việc */
interface ProbationTask {
  id: string;
  title: string;
  description: string;
  status: "completed" | "in_progress" | "pending";
  dueDate: string;
}

const TASKS: ProbationTask[] = [
  {
    id: "1",
    title: "Setup môi trường phát triển",
    description: "Cài đặt IDE, clone repo, cấu hình Docker & chạy thành công local",
    status: "completed",
    dueDate: "2026-03-05",
  },
  {
    id: "2",
    title: "Hoàn thành onboarding training",
    description: "Tham gia các buổi đào tạo quy trình, tìm hiểu codebase và conventions",
    status: "completed",
    dueDate: "2026-03-10",
  },
  {
    id: "3",
    title: "Fix 10 bugs từ backlog",
    description: "Sửa lỗi giao diện và logic nhỏ, merge PR được duyệt",
    status: "completed",
    dueDate: "2026-03-25",
  },
  {
    id: "4",
    title: "Phát triển feature Dashboard Probationer",
    description: "Thiết kế và code trang Dashboard cho nhân viên thử việc",
    status: "in_progress",
    dueDate: "2026-04-15",
  },
  {
    id: "5",
    title: "Viết unit test cho module Auth",
    description: "Đạt coverage tối thiểu 80% cho module AuthContext & ProtectedRoute",
    status: "pending",
    dueDate: "2026-04-25",
  },
  {
    id: "6",
    title: "Code review & knowledge sharing",
    description: "Tham gia review PR của đồng nghiệp và chia sẻ kiến thức 1 buổi tech talk",
    status: "pending",
    dueDate: "2026-04-30",
  },
];

// ─── Helper components ───────────────────────────────────────

const TASK_STATUS_CONFIG: Record<
  ProbationTask["status"],
  { label: string; color: string; icon: React.FC<{ size?: number }> }
> = {
  completed: {
    label: "Hoàn thành",
    color:
      "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 ring-emerald-200/50",
    icon: CheckCircle2,
  },
  in_progress: {
    label: "Đang làm",
    color:
      "text-blue-600 bg-blue-50 dark:bg-blue-500/10 ring-blue-200/50",
    icon: Clock,
  },
  pending: {
    label: "Chưa bắt đầu",
    color:
      "text-slate-500 bg-slate-50 dark:bg-slate-500/10 ring-slate-200/50",
    icon: Circle,
  },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          className={cn(
            i <= rating
              ? "text-amber-400 fill-amber-400"
              : "text-slate-200 dark:text-slate-700"
          )}
        />
      ))}
    </div>
  );
}

// ─── Page component ──────────────────────────────────────────
const ProbationerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [probationerInfo, setProbationerInfo] = useState(() => ({
    ...DEFAULT_PROBATIONER_INFO,
    name: user?.fullName || DEFAULT_PROBATIONER_INFO.name,
    email: user?.email || DEFAULT_PROBATIONER_INFO.email,
    phone: user?.phone || DEFAULT_PROBATIONER_INFO.phone,
  }));
  const [evaluation, setEvaluation] = useState<ProbationEvaluation | null>(null);

  useEffect(() => {
    probationService
      .getMyProbation()
      .then((probation) => {
        const startDate = new Date(probation.startDate);
        const endDate = new Date(probation.endDate);
        const today = new Date();
        const totalDays = Math.max(
          1,
          Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000)
        );
        const daysPassed = Math.min(
          totalDays,
          Math.max(0, Math.ceil((today.getTime() - startDate.getTime()) / 86400000))
        );

        setProbationerInfo({
          name: probation.fullName,
          email: probation.email,
          phone: probation.phone || "Chưa cập nhật",
          position: probation.jobTitle,
          department: probation.department,
          supervisor: probation.supervisorName || "Chưa phân công",
          startDate: startDate.toISOString().slice(0, 10),
          endDate: endDate.toISOString().slice(0, 10),
          daysRemaining: Math.max(0, totalDays - daysPassed),
          totalDays,
          daysPassed,
          status: probation.status,
        });

        if (probation.evaluation) {
          setEvaluation(probation.evaluation);
        }
      })
      .catch(() => undefined);
  }, []);

  const PROBATIONER_INFO = probationerInfo;
  const progressPercent = Math.round(
    (PROBATIONER_INFO.daysPassed / PROBATIONER_INFO.totalDays) * 100
  );
  const completedTasks = TASKS.filter((t) => t.status === "completed").length;
  const totalTasks = TASKS.length;
  const taskPercent = Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Xin chào, {PROBATIONER_INFO.name}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Theo dõi tiến trình thử việc và nhiệm vụ của bạn
        </p>
      </div>

      {/* ── Row 1: Thẻ thông tin + Tiến trình ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thông tin cá nhân */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 uppercase tracking-wider mb-5 flex items-center gap-2">
            <User size={16} className="text-blue-500" />
            Thông tin thử việc
          </h3>

          <div className="space-y-4">
            {[
              { icon: Building2, label: "Vị trí", value: PROBATIONER_INFO.position },
              { icon: Building2, label: "Phòng ban", value: PROBATIONER_INFO.department },
              { icon: User, label: "Người hướng dẫn", value: PROBATIONER_INFO.supervisor },
              { icon: Mail, label: "Email", value: PROBATIONER_INFO.email },
              { icon: Phone, label: "Điện thoại", value: PROBATIONER_INFO.phone },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400">
                  <item.icon size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {item.label}
                  </p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tiến trình thử việc */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card: Thời gian */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Calendar size={22} />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-bold px-2 py-1 rounded-lg",
                    PROBATIONER_INFO.daysRemaining <= 14
                      ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10"
                      : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10"
                  )}
                >
                  Còn {PROBATIONER_INFO.daysRemaining} ngày
                </span>
              </div>
              <div className="mt-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Tiến trình thời gian
                </p>
                <p className="text-3xl font-black text-slate-900 dark:text-slate-50 mt-1">
                  {progressPercent}%
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700",
                    progressPercent >= 90
                      ? "bg-amber-500"
                      : progressPercent >= 50
                        ? "bg-blue-500"
                        : "bg-emerald-500"
                  )}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-400">
                <span>{PROBATIONER_INFO.startDate}</span>
                <span>{PROBATIONER_INFO.endDate}</span>
              </div>
            </div>
          </div>

          {/* Card: Nhiệm vụ */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Target size={22} />
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10">
                  {completedTasks}/{totalTasks}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Nhiệm vụ hoàn thành
                </p>
                <p className="text-3xl font-black text-slate-900 dark:text-slate-50 mt-1">
                  {taskPercent}%
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${taskPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-400">
                <span>{completedTasks} xong</span>
                <span>{totalTasks - completedTasks} còn lại</span>
              </div>
            </div>
          </div>

          {/* Card: Đánh giá thử việc */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Star size={22} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Đánh giá thử việc
                </p>
                {evaluation ? (
                  <>
                    <p className="text-3xl font-black text-slate-900 dark:text-slate-50 mt-1">
                      {evaluation.kpiScore}
                      <span className="text-lg text-slate-400 font-medium">/100 KPI</span>
                    </p>
                    <p className="text-xs text-amber-600 font-semibold mt-1">
                      Đề xuất: {evaluation.recommendation === "sign_contract" ? "Ký HĐ chính thức" : "Dừng thử việc"}
                    </p>
                  </>
                ) : (
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-2">
                    Chưa có đánh giá chính thức
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4">
              <StarRating
                rating={evaluation ? Math.round(evaluation.kpiScore / 20) : 0}
              />
              <p className="text-[10px] text-slate-400 mt-1.5">
                {evaluation ? "Đã đánh giá bởi Supervisor" : "Chờ quản lý đánh giá khi hết hạn"}
              </p>
            </div>
          </div>

          {/* Card: Trạng thái */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400">
                  <ClipboardCheck size={22} />
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 text-[10px] font-bold text-blue-600 ring-1 ring-inset ring-blue-200/50 uppercase tracking-widest">
                  <Clock size={10} />
                  {STATUS_LABELS[PROBATIONER_INFO.status] || "Đang thử việc"}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Trạng thái tổng
                </p>
                <p className="text-lg font-black text-slate-900 dark:text-slate-50 mt-1">
                  {STATUS_LABELS[PROBATIONER_INFO.status] || "Đang thử việc"}
                </p>
              </div>
            </div>
            <p className="mt-4 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {STATUS_DESCRIPTIONS[PROBATIONER_INFO.status] || "Bạn đang trong quá trình thử việc."}
            </p>
          </div>
        </div>
      </div>

      {/* ── Row 2: Danh sách nhiệm vụ ─────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 uppercase tracking-wider flex items-center gap-2">
            <BookOpen size={16} className="text-blue-500" />
            Nhiệm vụ thử việc
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Các mục tiêu cần đạt được trong thời gian thử việc
          </p>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {TASKS.map((task) => {
            const config = TASK_STATUS_CONFIG[task.status];
            const StatusIcon = config.icon;
            return (
              <div
                key={task.id}
                className="px-6 py-4 flex items-start gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <div
                  className={cn(
                    "mt-0.5 p-1.5 rounded-lg",
                    task.status === "completed"
                      ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600"
                      : task.status === "in_progress"
                        ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-400"
                  )}
                >
                  <StatusIcon size={16} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p
                      className={cn(
                        "font-bold text-sm",
                        task.status === "completed"
                          ? "text-slate-400 line-through"
                          : "text-slate-900 dark:text-slate-50"
                      )}
                    >
                      {task.title}
                    </p>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold ring-1 ring-inset uppercase tracking-widest",
                        config.color
                      )}
                    >
                      {config.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {task.description}
                  </p>
                </div>

                <div className="text-right hidden sm:block shrink-0">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Calendar size={12} />
                    <span className="font-medium">{task.dueDate}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Row 3: Nhận xét từ người hướng dẫn ────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 uppercase tracking-wider flex items-center gap-2">
            <MessageSquare size={16} className="text-blue-500" />
            Nhận xét từ người hướng dẫn
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Đánh giá định kỳ từ {PROBATIONER_INFO.supervisor}
          </p>
        </div>

        <div className="p-6">
          {evaluation ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 text-[10px] font-bold text-blue-600 ring-1 ring-inset ring-blue-200/50 uppercase tracking-widest">
                  Đánh giá chính thức
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-400">KPI: {evaluation.kpiScore}/100</span>
                  <StarRating rating={Math.round(evaluation.kpiScore / 20)} />
                </div>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                "{evaluation.comment}"
              </p>

              {evaluation.directorDecision && (
                <div className="mt-4 p-4 rounded-2xl border bg-violet-50/50 dark:bg-violet-500/5 border-violet-100 dark:border-violet-800/50 text-left">
                  <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 mb-1">
                    <CheckCircle2 size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Phản hồi từ Giám đốc</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Quyết định: <strong className="text-violet-700 dark:text-violet-300">{evaluation.directorDecision === "approved" ? "Phê duyệt đề xuất" : "Từ chối đề xuất"}</strong>
                  </p>
                  {evaluation.directorComment && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">
                      Ghi chú từ Giám đốc: "{evaluation.directorComment}"
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 dark:text-slate-500">
              <MessageSquare className="h-10 w-10 mx-auto opacity-30 mb-2" />
              <p className="text-sm font-medium">Chưa có đánh giá hay nhận xét chính thức nào</p>
              <p className="text-xs mt-1">Người hướng dẫn sẽ tiến hành đánh giá năng lực của bạn khi thời hạn thử việc sắp kết thúc.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Lưu ý cuối trang ──────────────────────────────── */}
      <div className="bg-slate-900 dark:bg-blue-600 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <TrendingUp size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Bạn đang làm rất tốt!</h3>
              <p className="text-white/70 text-sm mt-1 max-w-md">
                Còn <span className="text-white font-bold">{PROBATIONER_INFO.daysRemaining} ngày</span> nữa
                là kết thúc giai đoạn thử việc. Hãy hoàn thành{" "}
                <span className="text-white font-bold">{totalTasks - completedTasks} nhiệm vụ</span> còn
                lại để có kết quả tốt nhất.
              </p>
            </div>
          </div>
          <button className="px-8 py-3 rounded-2xl bg-white text-slate-900 font-bold hover:bg-slate-100 transition-all active:scale-95 flex items-center gap-2 shrink-0">
            Xem lộ trình <ArrowUpRight size={18} />
          </button>
        </div>
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-5%] w-48 h-48 bg-blue-500/20 rounded-full blur-2xl" />
      </div>
    </div>
  );
};

export default ProbationerDashboard;
