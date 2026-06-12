import { useState } from "react";
import {
  Star,
  Loader2,
  X,
  XCircle,
  CheckCircle,
  Calendar,
} from "lucide-react";
import { useManager } from "@/context/ManagerContext";
import { interviewService } from "@/services";
import toast from "react-hot-toast";
import { cn } from "../../lib/utils";

const EvaluateDialog = ({ row, onEvaluated }: { row: any, onEvaluated: (status: string) => void }) => {
  const [open, setOpen] = useState(false);
  const [techScore, setTechScore] = useState(8);
  const [softScore, setSoftScore] = useState(7);
  const [attitudeScore, setAttitudeScore] = useState(9);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (result: "passed" | "failed") => {
    setIsLoading(true);
    try {
      await interviewService.submitResult(String(row.id), {
        technicalScore: techScore,
        softSkillScore: softScore,
        attitudeScore: attitudeScore,
        comment: "",
        result,
      });
      toast.success("Đánh giá thành công!");
      setOpen(false);
      onEvaluated(result === "passed" ? "Hoàn thành" : "Không đạt");
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi chấm điểm.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition-all active:scale-95 shadow-sm shadow-blue-500/25"
      >
        Chấm điểm
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 dark:ring-1 dark:ring-slate-800 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">Đánh giá ứng viên</h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Candidate Info */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl mb-6">
              <p className="font-bold text-slate-900 dark:text-slate-50 text-base">{row.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">Ứng tuyển: {row.role}</p>
            </div>

            {/* Scores (Sliders) */}
            <div className="space-y-6">
              {[
                { label: "Kỹ năng chuyên môn", val: techScore, setVal: setTechScore },
                { label: "Kỹ năng mềm", val: softScore, setVal: setSoftScore },
                { label: "Thái độ văn hoá", val: attitudeScore, setVal: setAttitudeScore },
              ].map((slider) => (
                <div key={slider.label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{slider.label}</span>
                    <span className="text-sm font-black text-slate-900 dark:text-slate-50">{slider.val}/10</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={slider.val}
                    onChange={(e) => slider.setVal(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              ))}
            </div>

            {/* Decision Buttons */}
            <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Kết quả đánh giá</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleSubmit("passed")}
                  disabled={isLoading}
                  className="flex flex-col items-center justify-center gap-1.5 h-16 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 font-bold text-sm transition-all"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                  Đạt
                </button>
                <button
                  onClick={() => handleSubmit("failed")}
                  disabled={isLoading}
                  className="flex flex-col items-center justify-center gap-1.5 h-16 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-500/20 font-bold text-sm transition-all"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <XCircle className="h-5 w-5" />}
                  Không đạt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const Interviews = () => {
  const { interviews, setInterviews } = useManager();
  const [activeTab, setActiveTab] = useState<"upcoming" | "scored" | "all">("upcoming");

  function getStatusBadge(status: string) {
    if (status === "Chờ xác nhận") {
      return (
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20">
          {status}
        </span>
      );
    }

    if (status === "Đã xác nhận") {
      return (
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
          {status}
        </span>
      );
    }

    if (status === "Đã từ chối" || status === "Không đạt") {
      return (
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20">
          {status}
        </span>
      );
    }

    if (status === "Hoàn thành") {
      return (
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20">
          {status}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
        {status}
      </span>
    );
  }

  const upcomingInterviews = interviews.filter(
    (row) => row.status === "Chờ xác nhận" || row.status === "Đã xác nhận"
  );
  const scoredInterviews = interviews.filter(
    (row) => row.status === "Hoàn thành" || row.status === "Không đạt"
  );

  const getFilteredData = () => {
    if (activeTab === "upcoming") return upcomingInterviews;
    if (activeTab === "scored") return scoredInterviews;
    return interviews;
  };

  const renderTable = (data: typeof interviews, showAction = true) => (
    <div className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/30 font-bold uppercase text-[10px] tracking-widest">
              <th className="px-6 py-4">Ứng viên</th>
              <th className="px-6 py-4">Vị trí</th>
              <th className="px-6 py-4">Ngày PV</th>
              <th className="px-6 py-4">Trạng thái</th>
              {showAction && <th className="px-6 py-4 text-right">Thao tác</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.length === 0 ? (
              <tr>
                <td colSpan={showAction ? 5 : 4} className="text-center py-12 text-slate-400 dark:text-slate-500 font-semibold">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                        {row.name.charAt(0)}
                      </div>
                      {row.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-semibold">{row.role}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-slate-400" />
                      {row.date}
                    </span>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(row.status)}</td>
                  {showAction && (
                    <td className="px-6 py-4 text-right">
                      {row.status === "Chờ xác nhận" || row.status === "Đã xác nhận" ? (
                        <EvaluateDialog
                          row={row}
                          onEvaluated={(newStatus) => {
                            setInterviews((prev) =>
                              prev.map((item) => (item.id === row.id ? { ...item, status: newStatus } : item))
                            );
                          }}
                        />
                      ) : (
                        <button
                          disabled
                          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-600 transition-all cursor-not-allowed"
                        >
                          Đã đánh giá
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Lịch Phỏng Vấn
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Danh sách và kết quả phỏng vấn các ứng viên ứng tuyển
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-col gap-4">
        <div className="flex space-x-2 overflow-x-auto pb-1 hide-scrollbar">
          {[
            { label: "Sắp tới", value: "upcoming" },
            { label: "Đã chấm", value: "scored" },
            { label: "Tất cả", value: "all" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value as any)}
              className={cn(
                "inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap border",
                activeTab === tab.value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content table */}
        <div>
          {renderTable(getFilteredData(), activeTab !== "scored")}
        </div>
      </div>
    </div>
  );
};

export default Interviews;
