import { useEffect, useState } from "react";
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

// Kiểu dữ liệu cho danh sách Offer chờ duyệt
type OfferItem = {
  id: number;
  candidate: string;
  position: string;
  department: string;
  proposedSalary: string;
  recruiter: string;
  status: string;
};

// Kiểu dữ liệu cho danh sách kết quả thử việc chờ duyệt
type ProbationItem = {
  id: number;
  employee: string;
  position: string;
  department: string;
  endDate: string;
  managerRecommendation: string;
  result: string;
};

// Chỉ định tab đang hoạt động
type TabKey = "offers" | "probation";

// Component chính: Trung tâm phê duyệt của Director
export default function Approvals() {
  // State lưu tab hiện tại
  const [activeTab, setActiveTab] = useState<TabKey>("offers");
  const [offerData, setOfferData] = useState<OfferItem[]>([]);
  const [probationData, setProbationData] = useState<ProbationItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([offerService.getOffers(), probationService.getProbationers()])
      .then(([offers, probations]) => {
        setOfferData(
          offers
            .filter((offer) => offer.status === "pending_approval")
            .map((offer) => ({
              id: Number(offer.id),
              candidate: offer.candidateName,
              position: offer.jobTitle,
              department: "",
              proposedSalary: `${offer.baseSalary.toLocaleString("vi-VN")} ${offer.currency}`,
              recruiter: offer.createdBy,
              status: "Chờ duyệt",
            }))
        );

        setProbationData(
          probations
            .filter((probation) => probation.status === "pending_evaluation")
            .map((probation) => ({
              id: Number(probation.id),
              employee: probation.fullName,
              position: probation.jobTitle,
              department: probation.department,
              endDate: formatDate(probation.endDate),
              managerRecommendation: "Đạt",
              result: "Chờ phê duyệt",
            }))
        );
      })
      .catch(() => setError("Không thể tải dữ liệu phê duyệt."));
  }, []);

  // Tính nhanh số lượng item cho từng nhóm
  const summary = {
    offers: offerData.length,
    probation: probationData.length,
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Trung tâm Phê duyệt
          </h1>
          <p className="mt-2 text-sm md:text-base text-[#71717a]">
            Phê duyệt đề xuất offer và kết quả thử việc trên cùng một màn hình
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* 2 ô tóm tắt đầu trang */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-[#71717a]">Offer Đề xuất</p>
            <h3 className="mt-2 text-3xl font-bold text-zinc-900">
              {summary.offers}
            </h3>
            <p className="mt-2 text-sm text-[#71717a]">
              Mức lương và chức danh đang chờ giám đốc phê duyệt
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-[#71717a]">Kết quả Thử việc</p>
            <h3 className="mt-2 text-3xl font-bold text-zinc-900">
              {summary.probation}
            </h3>
            <p className="mt-2 text-sm text-[#71717a]">
              Hồ sơ probation đã đủ điều kiện để ra quyết định cuối
            </p>
          </div>
        </div>

        {/* Khối chính chứa tabs và nội dung */}
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
          {/* Thanh tabs */}
          <div className="border-b border-zinc-200 p-4">
            <div className="inline-flex rounded-xl bg-zinc-100 p-1">
              <button
                onClick={() => setActiveTab("offers")}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  activeTab === "offers"
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-[#71717a] hover:text-zinc-900"
                }`}
              >
                Offer Đề xuất (Offers)
              </button>

              <button
                onClick={() => setActiveTab("probation")}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  activeTab === "probation"
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-[#71717a] hover:text-zinc-900"
                }`}
              >
                Kết quả Thử Việc (Probation)
              </button>
            </div>
          </div>

          <div className="p-4 md:p-6">
            {/* Nội dung tab Offer */}
            {activeTab === "offers" ? (
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-left text-sm text-[#71717a]">
                      <th className="px-4 py-2 font-medium">Ứng viên</th>
                      <th className="px-4 py-2 font-medium">Chức danh</th>
                      <th className="px-4 py-2 font-medium">Phòng ban</th>
                      <th className="px-4 py-2 font-medium">Mức đề xuất</th>
                      <th className="px-4 py-2 font-medium">Recruiter</th>
                      <th className="px-4 py-2 font-medium">Thao tác</th>
                    </tr>
                  </thead>

                  <tbody>
                    {offerData.map((item) => (
                      <tr
                        key={item.id}
                        className="rounded-2xl bg-zinc-50 text-sm text-zinc-800 shadow-sm"
                      >
                        <td className="rounded-l-2xl px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="rounded-full bg-white p-2 text-zinc-900">
                              <FileText className="h-4 w-4" />
                            </div>

                            <div>
                              <p className="font-semibold text-zinc-900">
                                {item.candidate}
                              </p>
                              <p className="text-xs text-[#71717a]">
                                {item.status}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 font-semibold text-zinc-900">
                          {item.position}
                        </td>
                        <td className="px-4 py-4 text-[#71717a]">
                          {item.department}
                        </td>
                        <td className="px-4 py-4 font-semibold text-zinc-900">
                          {item.proposedSalary}
                        </td>
                        <td className="px-4 py-4 text-[#71717a]">
                          {item.recruiter}
                        </td>

                        {/* Cột thao tác */}
                        <td className="rounded-r-2xl px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-900 hover:bg-zinc-100">
                              <Eye className="h-4 w-4" />
                              Xem
                            </button>

                            <button className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-800">
                              <Check className="h-4 w-4" />
                              Phê Duyệt
                            </button>

                            <button className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100">
                              <CircleX className="h-4 w-4" />
                              Hủy
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Nội dung tab Probation */
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-left text-sm text-[#71717a]">
                      <th className="px-4 py-2 font-medium">Nhân sự</th>
                      <th className="px-4 py-2 font-medium">Vị trí</th>
                      <th className="px-4 py-2 font-medium">Phòng ban</th>
                      <th className="px-4 py-2 font-medium">Hết hạn</th>
                      <th className="px-4 py-2 font-medium">Khuyến nghị</th>
                      <th className="px-4 py-2 font-medium">Thao tác</th>
                    </tr>
                  </thead>

                  <tbody>
                    {probationData.map((item) => (
                      <tr
                        key={item.id}
                        className="rounded-2xl bg-zinc-50 text-sm text-zinc-800 shadow-sm"
                      >
                        <td className="rounded-l-2xl px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="rounded-full bg-white p-2 text-zinc-900">
                              <ShieldCheck className="h-4 w-4" />
                            </div>

                            <div>
                              <p className="font-semibold text-zinc-900">
                                {item.employee}
                              </p>
                              <p className="text-xs text-[#71717a]">
                                {item.result}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 font-semibold text-zinc-900">
                          {item.position}
                        </td>
                        <td className="px-4 py-4 text-[#71717a]">
                          {item.department}
                        </td>

                        <td className="px-4 py-4">
                          <div className="inline-flex items-center gap-2 text-[#71717a]">
                            <Clock3 className="h-4 w-4" />
                            {item.endDate}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                            <BadgeCheck className="h-3.5 w-3.5" />
                            Khuyến nghị từ Manager: {item.managerRecommendation}
                          </span>
                        </td>

                        {/* Cột thao tác */}
                        <td className="rounded-r-2xl px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-900 hover:bg-zinc-100">
                              <Eye className="h-4 w-4" />
                              Xem
                            </button>

                            <button className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-800">
                              <Check className="h-4 w-4" />
                              Phê Duyệt
                            </button>

                            <button className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100">
                              <CircleX className="h-4 w-4" />
                              Hủy
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
