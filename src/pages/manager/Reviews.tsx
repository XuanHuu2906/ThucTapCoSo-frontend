import { useState } from "react";
import { X, Calendar } from "lucide-react";
import { useManager } from "@/context/ManagerContext.tsx";
import { Link } from "react-router-dom";
import { probationService } from "@/services/probation.service";
import toast from "react-hot-toast";

const ReviewDialog = ({ row, onReviewed }: { row: any; onReviewed: () => void }) => {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (recommendation: "terminate" | "sign_contract") => {
    try {
      setLoading(true);
      await probationService.submitEvaluationForProbation(String(row.id), {
        kpiScore: 95, // mocked KPI score
        comment,
        recommendation,
      });
      setOpen(false);
      onReviewed();
      toast.success("Đã gửi đánh giá thành công!");
    } catch (error) {
      console.error("Lỗi khi gửi đánh giá:", error);
      toast.error("Đã xảy ra lỗi khi gửi đánh giá.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition-all active:scale-95 shadow-sm shadow-blue-500/25"
      >
        Đánh giá
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 dark:ring-1 dark:ring-slate-800 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">Đánh giá năng lực: {row.name}</h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl">
                <p className="text-left text-xs font-bold text-slate-400 uppercase tracking-widest">KPI</p>
                <p className="text-left text-2xl font-black text-slate-900 dark:text-slate-50 mt-1">95%</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl">
                <p className="text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Chất lượng</p>
                <p className="text-left text-2xl font-black text-slate-900 dark:text-slate-50 mt-1">Tốt</p>
              </div>
            </div>

            {/* Comment box */}
            <div className="space-y-1.5">
              <label className="block text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Nhận xét của Quản lý</label>
              <textarea
                placeholder="Nhập nhận xét chi tiết về nhân viên..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full h-24 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-50 outline-none focus:border-blue-500 transition-all resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                disabled={loading}
                onClick={() => handleSubmit("terminate")}
                className="inline-flex items-center justify-center rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 px-4 py-2 text-xs font-bold dark:bg-rose-500/10 dark:text-rose-400 transition-all active:scale-95 disabled:opacity-50"
              >
                Chấm dứt
              </button>
              <button
                disabled={loading}
                onClick={() => handleSubmit("sign_contract")}
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 text-white px-5 py-2 text-xs font-bold hover:bg-blue-500 shadow-lg shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-50"
              >
                Đề xuất ký HĐ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const Reviews = () => {
  const { probation, setProbation } = useManager();

  // Chỉ lấy các nhân viên thử việc đang trong trạng thái 'probating'
  const ongoingProbations = probation.filter((p) => p.status === "probating");

  const handleReviewed = (id: number) => {
    // Đổi trạng thái thành 'pending_evaluation' (hoặc giá trị bất kỳ khác 'probating') thay vì xóa hẳn,
    // điều này giúp số lượng 'Nhân viên TV' tổng thể không bị giảm đi sai lệch.
    setProbation((prev: any[]) =>
      prev.map((p) => (p.id === id ? { ...p, status: "pending_evaluation" } : p))
    );
  };

  return (
    <div className="p-6 space-y-6">
      <Link to="/manager/dashboard">
        <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-all active:scale-95 mb-4">
          ← Quay lại Dashboard
        </button>
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Đánh giá Thử Việc
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Đánh giá năng lực của nhân viên thử việc khi sắp kết thúc giai đoạn thử việc
        </p>
      </div>

      <div className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/30 font-bold uppercase text-[10px] tracking-widest">
                <th className="px-6 py-4">Nhân viên</th>
                <th className="px-6 py-4">Chuyên môn</th>
                <th className="px-6 py-4">Ngày đáo hạn</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {ongoingProbations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-slate-400 dark:text-slate-500 font-semibold">
                    Không có nhân viên nào cần đánh giá.
                  </td>
                </tr>
              ) : (
                ongoingProbations.map((row) => (
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
                        {row.dueDate}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <ReviewDialog row={row} onReviewed={() => handleReviewed(row.id)} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
