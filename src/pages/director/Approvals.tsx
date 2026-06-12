import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  BadgeCheck,
  Check,
  CircleX,
  Clock3,
  Eye,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { offerService, probationService } from "@/services";
import { unwrapResponse } from "@/services/api";
import { formatDate } from "@/utils/date";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import { X } from "lucide-react";

// Kiểu dữ liệu cho danh sách Offer chờ duyệt (mở rộng thông tin chi tiết)
type OfferItem = {
  id: number;
  candidate: string;
  position: string;
  department: string;
  proposedSalary: string;
  recruiter: string;
  status: string;
  allowance: string;
  startDate: string;
  email: string;
};

// Kiểu dữ liệu cho danh sách kết quả thử việc chờ duyệt (mở rộng thông tin chi tiết)
type ProbationItem = {
  id: number;
  employee: string;
  position: string;
  department: string;
  endDate: string;
  managerRecommendation: string;
  result: string;
  startDate: string;
  supervisorName: string;
  kpiScore: number;
  managerComment: string;
  email: string;
  phone: string;
};

// Chỉ định tab đang hoạt động
type TabKey = "offers" | "probation";

// Component chính: Trung tâm phê duyệt của Director
export default function Approvals() {
  const location = useLocation();
  // State lưu tab hiện tại (ưu tiên lấy từ state truyền sang)
  const [activeTab, setActiveTab] = useState<TabKey>(
    location.state?.activeTab || "offers"
  );
  const [offerData, setOfferData] = useState<OfferItem[]>([]);
  const [probationData, setProbationData] = useState<ProbationItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);

  // State phục vụ mở dialog chi tiết
  const [selectedOffer, setSelectedOffer] = useState<OfferItem | null>(null);
  const [selectedProbation, setSelectedProbation] = useState<ProbationItem | null>(null);

  const fetchApprovals = async () => {
    try {
      const [offers, probations] = await Promise.all([
        offerService.getOffers({ status: "pending_approval" }),
        probationService.getProbationers({ status: "pending_evaluation" }),
      ]);

      setOfferData(
        offers.map((offer: any) => ({
          id: Number(offer.id),
          candidate: offer.candidateName,
          position: offer.jobTitle,
          department: offer.department || "",
          proposedSalary: `${Number(offer.baseSalary).toLocaleString("vi-VN")} ${offer.currency}`,
          recruiter: offer.createdBy,
          status: "Chờ duyệt",
          allowance: `${Number(offer.allowance || 0).toLocaleString("vi-VN")} VND`,
          startDate: formatDate(offer.startDate),
          email: offer.candidateEmail,
        }))
      );

      setProbationData(
        probations.map((probation: any) => ({
          id: Number(probation.id),
          employee: probation.fullName,
          position: probation.jobTitle,
          department: probation.department,
          endDate: formatDate(probation.endDate),
          managerRecommendation: probation.evaluation?.recommendation === "terminate" ? "Chấm dứt thử việc" : "Ký hợp đồng chính thức",
          result: "Chờ phê duyệt Director",
          startDate: formatDate(probation.startDate),
          supervisorName: probation.supervisorName || "Không rõ",
          kpiScore: probation.evaluation?.kpiScore ?? 0,
          managerComment: probation.evaluation?.comment ?? "Không có nhận xét chi tiết",
          email: probation.email,
          phone: probation.phone,
        }))
      );
    } catch (err) {
      console.error("[Approvals] Load error:", err);
      setError("Không thể tải dữ liệu phê duyệt. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleApproveOffer = async (id: number) => {
    try {
      setProcessing(id);
      await offerService.approveOffer(String(id));
      toast.success("Đã duyệt Offer!");
      fetchApprovals();
    } catch (err) {
      toast.error("Lỗi khi duyệt Offer");
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectOffer = async (id: number) => {
    try {
      setProcessing(id);
      await offerService.rejectOffer(String(id));
      toast.success("Đã từ chối Offer!");
      fetchApprovals();
    } catch (err) {
      toast.error("Lỗi khi từ chối Offer");
    } finally {
      setProcessing(null);
    }
  };

  const handleApproveProbation = async (id: number) => {
    try {
      setProcessing(id);
      await probationService.reviewEvaluation(String(id), { decision: "approved" });
      toast.success("Đã duyệt Thử việc!");
      fetchApprovals();
    } catch (err) {
      toast.error("Lỗi khi duyệt Thử việc");
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectProbation = async (id: number) => {
    try {
      setProcessing(id);
      await probationService.reviewEvaluation(String(id), { decision: "rejected" });
      toast.success("Đã từ chối Thử việc!");
      fetchApprovals();
    } catch (err) {
      toast.error("Lỗi khi từ chối Thử việc");
    } finally {
      setProcessing(null);
    }
  };

  // Tính nhanh số lượng item cho từng nhóm
  const summary = {
    offers: offerData.length,
    probation: probationData.length,
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-blue-600" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Đang tải dữ liệu phê duyệt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50">
            Trung tâm Phê duyệt
          </h1>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-100 dark:border-rose-950/35 bg-rose-50 dark:bg-rose-950/15 p-4 text-sm font-semibold text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        {/* 2 ô tóm tắt đầu trang */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm group hover:scale-[1.02] transition-all">
            <p className="text-xs font-bold text-slate-450 uppercase tracking-widest">Offer Đề xuất</p>
            <h3 className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-50">
              {summary.offers}
            </h3>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Mức lương và chức danh đang chờ giám đốc phê duyệt
            </p>
          </div>

          <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm group hover:scale-[1.02] transition-all">
            <p className="text-xs font-bold text-slate-455 uppercase tracking-widest">Kết quả Thử việc</p>
            <h3 className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-50">
              {summary.probation}
            </h3>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Hồ sơ probation đã đủ điều kiện để ra quyết định cuối
            </p>
          </div>
        </div>

        {/* Khối chính chứa tabs và nội dung */}
        <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          {/* Thanh tabs */}
          <div className="border-b border-slate-100 dark:border-slate-800 p-4">
            <div className="inline-flex rounded-2xl bg-slate-100 dark:bg-slate-800/50 p-1">
              <button
                onClick={() => setActiveTab("offers")}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${activeTab === "offers"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
                  }`}
              >
                Offer Đề xuất (Offers)
              </button>

              <button
                onClick={() => setActiveTab("probation")}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${activeTab === "probation"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
                  }`}
              >
                Kết quả Thử Việc (Probation)
              </button>
            </div>
          </div>

          <div className="p-4 md:p-6">
            {/* Nội dung tab Offer */}
            {activeTab === "offers" ? (
              <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/30 font-bold uppercase text-[10px] tracking-widest">
                      <th className="px-6 py-4">Ứng viên</th>
                      <th className="px-6 py-4">Chức danh</th>
                      <th className="px-6 py-4">Phòng ban</th>
                      <th className="px-6 py-4">Mức đề xuất</th>
                      <th className="px-6 py-4">Recruiter</th>
                      <th className="px-6 py-4 text-right">Thao tác</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {offerData.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm">
                          Không có Offer nào cần phê duyệt.
                        </td>
                      </tr>
                    ) : (
                      offerData.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                          <td className="px-6 py-4 font-medium">
                            <div className="flex items-center gap-3">
                              <div className="rounded-full bg-slate-50 dark:bg-slate-800 p-2 text-slate-600 dark:text-slate-400">
                                <FileText className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-slate-50">
                                  {item.candidate}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {item.status}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-50">
                            {item.position}
                          </td>
                          <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                            {item.department}
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-50">
                            {item.proposedSalary}
                          </td>
                          <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                            {item.recruiter}
                          </td>

                          {/* Cột thao tác */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex flex-wrap items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                className="h-8 px-2 py-1 text-xs font-bold"
                                disabled={processing === item.id}
                                onClick={() => setSelectedOffer(item)}
                              >
                                <Eye className="mr-1 h-3.5 w-3.5" />
                                Xem
                              </Button>
                              <Button
                                className="h-8 px-2.5 py-1 text-xs font-bold bg-blue-600 text-white hover:bg-blue-500"
                                onClick={() => handleApproveOffer(item.id)}
                                disabled={processing === item.id}
                              >
                                <Check className="mr-1 h-3.5 w-3.5" />
                                Phê Duyệt
                              </Button>
                              <Button
                                variant="danger"
                                className="h-8 px-2.5 py-1 text-xs font-bold bg-rose-600 text-white hover:bg-rose-500"
                                onClick={() => handleRejectOffer(item.id)}
                                disabled={processing === item.id}
                              >
                                <CircleX className="mr-1 h-3.5 w-3.5" />
                                Hủy
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Nội dung tab Probation */
              <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/30 font-bold uppercase text-[10px] tracking-widest">
                      <th className="px-6 py-4">Nhân sự</th>
                      <th className="px-6 py-4">Vị trí</th>
                      <th className="px-6 py-4">Phòng ban</th>
                      <th className="px-6 py-4">Hết hạn</th>
                      <th className="px-6 py-4">Khuyến nghị</th>
                      <th className="px-6 py-4 text-right">Thao tác</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {probationData.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm">
                          Không có kết quả thử việc nào cần phê duyệt.
                        </td>
                      </tr>
                    ) : (
                      probationData.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                          <td className="px-6 py-4 font-medium">
                            <div className="flex items-center gap-3">
                              <div>
                                <p className="font-bold text-slate-900 dark:text-slate-50">
                                  {item.employee}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-50">
                            {item.position}
                          </td>
                          <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                            {item.department}
                          </td>

                          <td className="px-6 py-4">
                            <div className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400">
                              <Clock3 className="h-4 w-4" />
                              {item.endDate}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1 text-[10px] font-bold text-green-600 dark:text-green-400">
                              <BadgeCheck className="h-3.5 w-3.5" />
                              Khuyến nghị từ Manager: {item.managerRecommendation}
                            </span>
                          </td>

                          {/* Cột thao tác */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex flex-wrap items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                className="h-8 px-2 py-1 text-xs font-bold"
                                disabled={processing === item.id}
                                onClick={() => setSelectedProbation(item)}
                              >
                                <Eye className="mr-1 h-3.5 w-3.5" />
                                Xem
                              </Button>
                              <Button
                                className="h-8 px-2.5 py-1 text-xs font-bold bg-blue-600 text-white hover:bg-blue-500"
                                onClick={() => handleApproveProbation(item.id)}
                                disabled={processing === item.id}
                              >
                                <Check className="mr-1 h-3.5 w-3.5" />
                                Phê Duyệt
                              </Button>
                              <Button
                                variant="danger"
                                className="h-8 px-2.5 py-1 text-xs font-bold bg-rose-600 text-white hover:bg-rose-500"
                                onClick={() => handleRejectProbation(item.id)}
                                disabled={processing === item.id}
                              >
                                <CircleX className="mr-1 h-3.5 w-3.5" />
                                Hủy
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal chi tiết Offer */}
      {selectedOffer !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 dark:ring-1 dark:ring-slate-800 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                <FileText className="text-blue-600 h-5 w-5" />
                Chi tiết đề xuất Offer
              </h2>
              <button
                onClick={() => setSelectedOffer(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
              <div className="grid grid-cols-3 gap-y-3 gap-x-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                <span className="text-slate-400 dark:text-slate-500 font-bold">Ứng viên:</span>
                <span className="col-span-2 font-bold text-slate-900 dark:text-slate-50">{selectedOffer.candidate}</span>

                <span className="text-slate-400 dark:text-slate-500 font-bold">Email:</span>
                <span className="col-span-2 text-slate-800 dark:text-slate-200">{selectedOffer.email}</span>

                <span className="text-slate-400 dark:text-slate-500 font-bold">Vị trí:</span>
                <span className="col-span-2 font-bold text-slate-900 dark:text-slate-50">{selectedOffer.position}</span>

                <span className="text-slate-400 dark:text-slate-500 font-bold">Phòng ban:</span>
                <span className="col-span-2 text-slate-800 dark:text-slate-200">{selectedOffer.department || "Chưa thiết lập"}</span>
              </div>

              <div className="grid grid-cols-3 gap-y-3 gap-x-2 pt-2">
                <span className="text-slate-400 dark:text-slate-500 font-bold">Lương cơ bản:</span>
                <span className="col-span-2 font-black text-emerald-600 dark:text-emerald-400 text-base">{selectedOffer.proposedSalary}</span>

                <span className="text-slate-400 dark:text-slate-500 font-bold">Phụ cấp:</span>
                <span className="col-span-2 font-bold text-slate-800 dark:text-slate-200">{selectedOffer.allowance}</span>

                <span className="text-slate-400 dark:text-slate-500 font-bold">Ngày bắt đầu:</span>
                <span className="col-span-2 text-slate-800 dark:text-slate-200">{selectedOffer.startDate}</span>

                <span className="text-slate-400 dark:text-slate-500 font-bold">Trạng thái:</span>
                <span className="col-span-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-xs font-bold text-yellow-600 dark:text-yellow-400">
                    <Clock3 className="h-3 w-3" />
                    Chờ duyệt
                  </span>
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                <Button variant="outline" className="h-9 text-xs font-bold" onClick={() => setSelectedOffer(null)}>
                  Đóng
                </Button>
                <Button
                  variant="danger"
                  className="h-9 text-xs font-bold bg-rose-600 text-white hover:bg-rose-500"
                  onClick={() => {
                    handleRejectOffer(selectedOffer.id);
                    setSelectedOffer(null);
                  }}
                  disabled={processing === selectedOffer.id}
                >
                  <CircleX className="mr-1 h-4 w-4" />
                  Từ chối
                </Button>
                <Button
                  className="h-9 text-xs font-bold bg-blue-600 text-white hover:bg-blue-500"
                  onClick={() => {
                    handleApproveOffer(selectedOffer.id);
                    setSelectedOffer(null);
                  }}
                  disabled={processing === selectedOffer.id}
                >
                  <Check className="mr-1 h-4 w-4" />
                  Phê Duyệt
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal chi tiết kết quả thử việc */}
      {selectedProbation !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 dark:ring-1 dark:ring-slate-800 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                <ShieldCheck className="text-blue-600 h-5 w-5" />
                Chi tiết đánh giá Thử việc
              </h2>
              <button
                onClick={() => setSelectedProbation(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
              <div className="grid grid-cols-3 gap-y-3 gap-x-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                <span className="text-slate-400 dark:text-slate-500 font-bold">Nhân viên:</span>
                <span className="col-span-2 font-bold text-slate-900 dark:text-slate-50">{selectedProbation.employee}</span>

                <span className="text-slate-400 dark:text-slate-500 font-bold">Liên hệ:</span>
                <span className="col-span-2 text-slate-800 dark:text-slate-200">{selectedProbation.email} {selectedProbation.phone && `| ${selectedProbation.phone}`}</span>

                <span className="text-slate-400 dark:text-slate-500 font-bold">Vị trí / Phòng:</span>
                <span className="col-span-2 font-bold text-slate-900 dark:text-slate-50">{selectedProbation.position} {selectedProbation.department && `(${selectedProbation.department})`}</span>

                <span className="text-slate-400 dark:text-slate-500 font-bold">Người quản lý:</span>
                <span className="col-span-2 text-slate-800 dark:text-slate-200 font-medium">{selectedProbation.supervisorName}</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 dark:text-slate-500 font-bold">Điểm đánh giá KPI:</span>
                  <span className="text-lg font-black text-blue-600 dark:text-blue-400">{selectedProbation.kpiScore}/100</span>
                </div>

                <div className="flex flex-col gap-1.5 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span className="text-slate-400 dark:text-slate-500 font-bold">Khuyến nghị của Quản lý:</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-bold text-green-600 dark:text-green-400 w-fit">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    {selectedProbation.managerRecommendation}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-slate-400 dark:text-slate-500 font-bold">Nhận xét chi tiết:</span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2.5 rounded-xl whitespace-pre-wrap leading-relaxed">
                    {selectedProbation.managerComment}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button variant="outline" className="h-9 text-xs font-bold" onClick={() => setSelectedProbation(null)}>
                  Đóng
                </Button>
                <Button
                  variant="danger"
                  className="h-9 text-xs font-bold bg-rose-600 text-white hover:bg-rose-500"
                  onClick={() => {
                    handleRejectProbation(selectedProbation.id);
                    setSelectedProbation(null);
                  }}
                  disabled={processing === selectedProbation.id}
                >
                  <CircleX className="mr-1 h-4 w-4" />
                  Từ chối
                </Button>
                <Button
                  className="h-9 text-xs font-bold bg-blue-600 text-white hover:bg-blue-500"
                  onClick={() => {
                    handleApproveProbation(selectedProbation.id);
                    setSelectedProbation(null);
                  }}
                  disabled={processing === selectedProbation.id}
                >
                  <Check className="mr-1 h-4 w-4" />
                  Phê Duyệt
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
