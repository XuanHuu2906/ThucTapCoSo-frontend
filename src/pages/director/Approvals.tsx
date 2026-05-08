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
import { formatDate } from "@/utils/date";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Button from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

  useEffect(() => {
    setLoading(true);
    Promise.all([
      offerService.getOffers({ status: "pending_approval" }),
      probationService.getProbationers({ status: "pending_evaluation" }),
    ])
      .then(([offers, probations]) => {
        // API đã filter sẵn, chỉ trả về offer đang chờ duyệt
        setOfferData(
          offers.map((offer) => ({
            id: Number(offer.id),
            candidate: offer.candidateName,
            position: offer.jobTitle,
            department: "",
            proposedSalary: `${Number(offer.baseSalary).toLocaleString("vi-VN")} ${offer.currency}`,
            recruiter: offer.createdBy,
            status: "Chờ duyệt",
            allowance: `${Number(offer.allowance || 0).toLocaleString("vi-VN")} VND`,
            startDate: formatDate(offer.startDate),
            email: offer.candidateEmail,
          }))
        );

        // API đã filter sẵn, chỉ trả về probation chờ Director duyệt
        setProbationData(
          probations.map((probation) => ({
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
      })
      .catch((err) => {
        console.error("[Approvals] Load error:", err);
        setError("Không thể tải dữ liệu phê duyệt. Vui lòng thử lại.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleApproveOffer = async (id: number) => {
    try {
      setProcessing(id);
      await offerService.approveOffer(String(id));
      setOfferData((prev) => prev.filter((item) => item.id !== id));
    } catch (e) {
      alert("Lỗi khi duyệt Offer");
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectOffer = async (id: number) => {
    try {
      setProcessing(id);
      await offerService.rejectOffer(String(id));
      setOfferData((prev) => prev.filter((item) => item.id !== id));
    } catch (e) {
      alert("Lỗi khi từ chối Offer");
    } finally {
      setProcessing(null);
    }
  };

  const handleApproveProbation = async (id: number) => {
    try {
      setProcessing(id);
      await probationService.reviewEvaluation(String(id), { decision: "approved" });
      setProbationData((prev) => prev.filter((item) => item.id !== id));
    } catch (e) {
      alert("Lỗi khi duyệt Thử việc");
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectProbation = async (id: number) => {
    try {
      setProcessing(id);
      await probationService.reviewEvaluation(String(id), { decision: "rejected" });
      setProbationData((prev) => prev.filter((item) => item.id !== id));
    } catch (e) {
      alert("Lỗi khi từ chối Thử việc");
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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary" />
          <p className="text-sm text-muted-foreground">Đang tải dữ liệu phê duyệt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Trung tâm Phê duyệt
          </h1>
          <p className="mt-2 text-sm md:text-base text-muted-foreground">
            Phê duyệt đề xuất offer và kết quả thử việc trên cùng một màn hình
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
            {error}
          </div>
        )}




        {/* 2 ô tóm tắt đầu trang */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Offer Đề xuất</p>
            <h3 className="mt-2 text-3xl font-bold text-card-foreground">
              {summary.offers}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Mức lương và chức danh đang chờ giám đốc phê duyệt
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Kết quả Thử việc</p>
            <h3 className="mt-2 text-3xl font-bold text-card-foreground">
              {summary.probation}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Hồ sơ probation đã đủ điều kiện để ra quyết định cuối
            </p>
          </div>
        </div>

        {/* Khối chính chứa tabs và nội dung */}
        <div className="rounded-2xl border border-border bg-card shadow-sm">
          {/* Thanh tabs */}
          <div className="border-b border-border p-4">
            <div className="inline-flex rounded-xl bg-muted p-1">
              <button
                onClick={() => setActiveTab("offers")}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${activeTab === "offers"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Offer Đề xuất (Offers)
              </button>

              <button
                onClick={() => setActiveTab("probation")}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${activeTab === "probation"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Kết quả Thử Việc (Probation)
              </button>
            </div>
          </div>

          <div className="p-4 md:p-6">
            {/* Nội dung tab Offer */}
            {activeTab === "offers" ? (
              <div className="overflow-x-auto rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ứng viên</TableHead>
                      <TableHead>Chức danh</TableHead>
                      <TableHead>Phòng ban</TableHead>
                      <TableHead>Mức đề xuất</TableHead>
                      <TableHead>Recruiter</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {offerData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Không có Offer nào cần phê duyệt.
                        </TableCell>
                      </TableRow>
                    ) : (
                      offerData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div className="rounded-full bg-muted p-2 text-foreground">
                                <FileText className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-semibold text-foreground">
                                  {item.candidate}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {item.status}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="font-semibold text-foreground">
                            {item.position}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {item.department}
                          </TableCell>
                          <TableCell className="font-semibold text-foreground">
                            {item.proposedSalary}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {item.recruiter}
                          </TableCell>

                          {/* Cột thao tác */}
                          <TableCell className="text-right">
                            <div className="flex flex-wrap items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                className="h-8 px-2 py-1 text-xs"
                                disabled={processing === item.id}
                                onClick={() => setSelectedOffer(item)}
                              >
                                <Eye className="mr-1 h-3.5 w-3.5" />
                                Xem
                              </Button>
                              <Button
                                className="h-8 px-2 py-1 text-xs"
                                onClick={() => handleApproveOffer(item.id)}
                                disabled={processing === item.id}
                              >
                                <Check className="mr-1 h-3.5 w-3.5" />
                                Phê Duyệt
                              </Button>
                              <Button
                                variant="danger"
                                className="h-8 px-2 py-1 text-xs"
                                onClick={() => handleRejectOffer(item.id)}
                                disabled={processing === item.id}
                              >
                                <CircleX className="mr-1 h-3.5 w-3.5" />
                                Hủy
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : (
              /* Nội dung tab Probation */
              <div className="overflow-x-auto rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nhân sự</TableHead>
                      <TableHead>Vị trí</TableHead>
                      <TableHead>Phòng ban</TableHead>
                      <TableHead>Hết hạn</TableHead>
                      <TableHead>Khuyến nghị</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {probationData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Không có kết quả thử việc nào cần phê duyệt.
                        </TableCell>
                      </TableRow>
                    ) : (
                      probationData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div>
                                <p className="font-semibold text-foreground">
                                  {item.employee}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="font-semibold text-foreground">
                            {item.position}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {item.department}
                          </TableCell>

                          <TableCell>
                            <div className="inline-flex items-center gap-2 text-muted-foreground">
                              <Clock3 className="h-4 w-4" />
                              {item.endDate}
                            </div>
                          </TableCell>

                          <TableCell>
                            <span className="inline-flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-600 dark:text-green-400">
                              <BadgeCheck className="h-3.5 w-3.5" />
                              Khuyến nghị từ Manager: {item.managerRecommendation}
                            </span>
                          </TableCell>

                          {/* Cột thao tác */}
                          <TableCell className="text-right">
                            <div className="flex flex-wrap items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                className="h-8 px-2 py-1 text-xs"
                                disabled={processing === item.id}
                                onClick={() => setSelectedProbation(item)}
                              >
                                <Eye className="mr-1 h-3.5 w-3.5" />
                                Xem
                              </Button>
                              <Button
                                className="h-8 px-2 py-1 text-xs"
                                onClick={() => handleApproveProbation(item.id)}
                                disabled={processing === item.id}
                              >
                                <Check className="mr-1 h-3.5 w-3.5" />
                                Phê Duyệt
                              </Button>
                              <Button
                                variant="danger"
                                className="h-8 px-2 py-1 text-xs"
                                onClick={() => handleRejectProbation(item.id)}
                                disabled={processing === item.id}
                              >
                                <CircleX className="mr-1 h-3.5 w-3.5" />
                                Hủy
                              </Button>
                            </div>
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
      </div>

      {/* Modal chi tiết Offer */}
      <Dialog open={selectedOffer !== null} onOpenChange={(open) => !open && setSelectedOffer(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <FileText className="text-blue-600 h-5 w-5" />
              Chi tiết đề xuất Offer
            </DialogTitle>
          </DialogHeader>
          {selectedOffer && (
            <div className="space-y-4 py-4 text-sm text-foreground">
              <div className="grid grid-cols-3 gap-y-3 gap-x-2 border-b border-border pb-4">
                <span className="text-muted-foreground font-medium">Ứng viên:</span>
                <span className="col-span-2 font-semibold text-foreground">{selectedOffer.candidate}</span>

                <span className="text-muted-foreground font-medium">Email:</span>
                <span className="col-span-2 text-foreground">{selectedOffer.email}</span>

                <span className="text-muted-foreground font-medium">Vị trí:</span>
                <span className="col-span-2 font-semibold text-foreground">{selectedOffer.position}</span>

                <span className="text-muted-foreground font-medium">Phòng ban:</span>
                <span className="col-span-2 text-foreground">{selectedOffer.department || "Chưa thiết lập"}</span>
              </div>

              <div className="grid grid-cols-3 gap-y-3 gap-x-2 pt-2">
                <span className="text-muted-foreground font-medium">Lương cơ bản:</span>
                <span className="col-span-2 font-semibold text-emerald-600 text-base">{selectedOffer.proposedSalary}</span>

                <span className="text-muted-foreground font-medium">Phụ cấp:</span>
                <span className="col-span-2 font-semibold text-foreground">{selectedOffer.allowance}</span>

                <span className="text-muted-foreground font-medium">Ngày bắt đầu:</span>
                <span className="col-span-2 text-foreground">{selectedOffer.startDate}</span>

                <span className="text-muted-foreground font-medium">Trạng thái:</span>
                <span className="col-span-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-xs font-semibold text-yellow-600">
                    <Clock3 className="h-3 w-3" />
                    Chờ duyệt
                  </span>
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-border">
                <Button variant="outline" onClick={() => setSelectedOffer(null)}>
                  Đóng
                </Button>
                <Button
                  variant="danger"
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
          )}
        </DialogContent>
      </Dialog>

      {/* Modal chi tiết kết quả thử việc */}
      <Dialog open={selectedProbation !== null} onOpenChange={(open) => !open && setSelectedProbation(null)}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <ShieldCheck className="text-blue-600 h-5 w-5" />
              Chi tiết đánh giá Thử việc
            </DialogTitle>
          </DialogHeader>
          {selectedProbation && (
            <div className="space-y-4 py-4 text-sm text-foreground">
              <div className="grid grid-cols-3 gap-y-3 gap-x-2 border-b border-border pb-4">
                <span className="text-muted-foreground font-medium">Nhân viên:</span>
                <span className="col-span-2 font-semibold text-foreground">{selectedProbation.employee}</span>

                <span className="text-muted-foreground font-medium">Liên hệ:</span>
                <span className="col-span-2 text-foreground">{selectedProbation.email} {selectedProbation.phone && `| ${selectedProbation.phone}`}</span>

                <span className="text-muted-foreground font-medium">Vị trí / Phòng:</span>
                <span className="col-span-2 font-semibold text-foreground">{selectedProbation.position} {selectedProbation.department && `(${selectedProbation.department})`}</span>

                <span className="text-muted-foreground font-medium">Người quản lý:</span>
                <span className="col-span-2 text-foreground font-medium">{selectedProbation.supervisorName}</span>
              </div>

              <div className="bg-muted/30 border border-border p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">Điểm đánh giá KPI:</span>
                  <span className="text-lg font-bold text-blue-600">{selectedProbation.kpiScore}/100</span>
                </div>

                <div className="flex flex-col gap-1.5 border-t border-border/60 pt-3">
                  <span className="text-muted-foreground font-medium">Khuyến nghị của Quản lý:</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-semibold text-green-600 dark:text-green-400 w-fit">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    {selectedProbation.managerRecommendation}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-muted-foreground font-medium">Nhận xét chi tiết:</span>
                  <p className="text-xs text-muted-foreground bg-white dark:bg-slate-900 border border-border/40 p-2.5 rounded-lg whitespace-pre-wrap leading-relaxed">
                    {selectedProbation.managerComment}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setSelectedProbation(null)}>
                  Đóng
                </Button>
                <Button
                  variant="danger"
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
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
