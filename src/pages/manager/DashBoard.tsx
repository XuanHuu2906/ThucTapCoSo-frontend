import { useState } from "react";
import {
  Calendar,
  CheckCircle,
  ClipboardCheck,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useManager } from "@/context/ManagerContext";
import { getDaysLeft } from "@/utils/date";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "../../lib/utils";

const DashboardManager = () => {
  const { user } = useAuth();
  const managerName = user?.fullName ?? "Quản lý";
  const { interviews, probation } = useManager();

  // Pagination states
  const ITEMS_PER_PAGE = 6;
  const [interviewPage, setInterviewPage] = useState(1);
  const [probationPage, setProbationPage] = useState(1);

  // Chỉ lấy lịch phỏng vấn sắp tới (Chờ xác nhận)
  const upcomingInterviews = interviews.filter((item) => item.status === "Chờ xác nhận");

  const totalInterviewPages = Math.ceil(upcomingInterviews.length / ITEMS_PER_PAGE) || 1;
  const currentInterviews = upcomingInterviews.slice(
    (interviewPage - 1) * ITEMS_PER_PAGE,
    interviewPage * ITEMS_PER_PAGE
  );

  // Chỉ lấy các nhân viên có trạng thái 'probating' (đang thử việc chưa đánh giá)
  const ongoingProbations = probation.filter((item) => item.status === "probating");

  const totalProbationPages = Math.ceil(ongoingProbations.length / ITEMS_PER_PAGE) || 1;
  const currentProbation = ongoingProbations.slice(
    (probationPage - 1) * ITEMS_PER_PAGE,
    probationPage * ITEMS_PER_PAGE
  );

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Xin chào, {managerName}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Tổng quan công việc của bạn hôm nay
        </p>
      </div>

      {/* StatCards (Grid-cols-4) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "PV sắp tới", value: upcomingInterviews.length, icon: Calendar, color: "text-gray-600 dark:text-slate-400", bg: "bg-gray-100 dark:bg-slate-800" },
          { label: "Đã phỏng vấn", value: interviews.length - upcomingInterviews.length, icon: CheckCircle, color: "text-green-600 dark:text-emerald-400", bg: "bg-green-50 dark:bg-emerald-500/10" },
          { label: "Nhân viên TV", value: probation.length, icon: ClipboardCheck, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10" },
          { label: "Chờ đánh giá", value: ongoingProbations.length, icon: Clock, color: "text-yellow-600 dark:text-amber-400", bg: "bg-yellow-50 dark:bg-amber-500/10" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex items-center gap-4 shadow-sm"
          >
            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-50">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 2 Cột Nội Dung (Grid-cols-2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cột Trái: Lịch phỏng vấn sắp tới */}
        <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-50 uppercase tracking-wider">
              Lịch phỏng vấn sắp tới
            </h2>
            <Link to="/manager/interviews">
              <button className="text-xs font-bold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center">
                Xem tất cả <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 flex-1">
            {currentInterviews.length === 0 ? (
              <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm font-semibold">
                Không có lịch phỏng vấn sắp tới.
              </div>
            ) : (
              currentInterviews.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                >
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-50">{item.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{item.role}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          {/* Pagination Controls */}
          {totalInterviewPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <button
                disabled={interviewPage === 1}
                onClick={() => setInterviewPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-all disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Trước
              </button>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Trang {interviewPage} / {totalInterviewPages}
              </span>
              <button
                disabled={interviewPage === totalInterviewPages}
                onClick={() => setInterviewPage((p) => Math.min(totalInterviewPages, p + 1))}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-all disabled:opacity-50"
              >
                Sau <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          )}
        </div>

        {/* Cột Phải: Chờ đánh giá thử việc */}
        <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-50 uppercase tracking-wider">
              Chờ đánh giá thử việc
            </h2>
            <Link to="/manager/reviews">
              <button className="text-xs font-bold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center">
                Xem tất cả <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 flex-1">
            {currentProbation.length === 0 ? (
              <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm font-semibold">
                Không có nhân viên nào chờ đánh giá.
              </div>
            ) : (
              currentProbation.map((item) => {
                const daysLeft = getDaysLeft(item.dueDate);
                const isUrgent = daysLeft < 7;
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-50">{item.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                        {item.role}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "px-3 py-1 rounded-xl font-bold text-xs shadow-sm ring-1 ring-inset uppercase tracking-wider",
                        isUrgent
                          ? "bg-rose-50 text-rose-600 ring-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400"
                          : "bg-blue-50 text-blue-600 ring-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400"
                      )}
                    >
                      Còn {daysLeft} ngày
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {/* Pagination Controls */}
          {totalProbationPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <button
                disabled={probationPage === 1}
                onClick={() => setProbationPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-all disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Trước
              </button>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Trang {probationPage} / {totalProbationPages}
              </span>
              <button
                disabled={probationPage === totalProbationPages}
                onClick={() => setProbationPage((p) => Math.min(totalProbationPages, p + 1))}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-all disabled:opacity-50"
              >
                Sau <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardManager;
