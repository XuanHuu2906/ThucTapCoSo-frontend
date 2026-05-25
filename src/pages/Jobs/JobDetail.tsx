import { ArrowLeft, BadgeDollarSign, MapPin, FileText, X, Upload, CheckCircle2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import NotFound from "../NotFound";
import Button from "@/components/ui/Button";
import { applicationService, jobService } from "@/services";
import type { Job, SubmitApplicationPayload } from "@/types";
import toast from "react-hot-toast";

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applyResult, setApplyResult] = useState<"success" | "error" | null>(null);
  const [applyErrorMsg, setApplyErrorMsg] = useState("");
  const [applyForm, setApplyForm] = useState<Omit<SubmitApplicationPayload, "jobId" | "cvUrl">>({
    fullName: "",
    email: "",
    phone: "",
  });
  const [cvFile, setCvFile] = useState<File | null>(null);

  useEffect(() => {
    if (!id) return;

    jobService
      .getJobById(id)
      .then(setJob)
      .catch(() => setError("Không tìm thấy công việc."))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !cvFile) return;

    setIsApplying(true);
    try {
      await applicationService.apply({
        jobId: id,
        ...applyForm,
        cvUrl: cvFile,
      });
      setApplyResult("success");
      setTimeout(() => {
        setShowApplyModal(false);
        setApplyResult(null);
        setApplyForm({ fullName: "", email: "", phone: "" });
        setCvFile(null);
      }, 2000);
    } catch (err: any) {
      const message = err.response?.data?.message || "Có lỗi xảy ra khi nộp đơn. Vui lòng thử lại.";

      if (err.response?.status === 409 || message.includes("already applied")) {
        setApplyErrorMsg("Email này đã được sử dụng để ứng tuyển cho vị trí này!");
        setApplyResult("error");
        setTimeout(() => {
          setShowApplyModal(false);
          setApplyResult(null);
          setApplyErrorMsg("");
          setApplyForm({ fullName: "", email: "", phone: "" });
          setCvFile(null);
        }, 3000);
      } else {
        toast.error(message);
      }
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 md:p-12 flex justify-center items-start">
        <div className="max-w-3xl w-full bg-white/95 p-8 rounded-3xl shadow-xl border border-gray-100 text-sm font-semibold text-gray-500">
          Đang tải chi tiết công việc...
        </div>
      </div>
    );
  }

  if (error || !job) {
    return <NotFound />;
  }

  return (
    // Background đồng bộ với trang danh sách
    <div className="min-h-screen p-6 md:p-12 flex justify-center items-start">
      <div className="max-w-3xl w-full bg-white/95 backdrop-blur-sm p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100">
        {/* Nút quay lại với hiệu ứng trượt mũi tên */}
        <Link
          to="/"
          className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-6 h-6 mr-2 transform group-hover:translate-x-1 transition duration-300" />
          Quay lại danh sách
        </Link>

        {/* Tiêu đề chính */}
        <div className="border-b border-gray-100 pb-8 mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
            {job.title}
          </h1>
          <p className="text-lg text-blue-600 font-medium">
            {job.department}
          </p>
        </div>

        {/* Các khối thông tin nổi bật (Grid Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          {/* Khối Địa điểm */}
          <div className="flex items-center p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100">
            <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-600 mr-4">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium mb-0.5">
                Địa điểm làm việc
              </p>
              <p className="text-lg font-bold text-gray-800">{job.location}</p>
            </div>
          </div>

          {/* Khối Mức lương */}
          <div className="flex items-center p-5 bg-green-50/50 rounded-2xl border border-green-100">
            <div className="p-3 bg-white rounded-xl shadow-sm text-green-600 mr-4">
              <BadgeDollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium mb-0.5">
                Mức lương
              </p>
              <p className="text-lg font-bold text-gray-800">
                {job.salaryMin && job.salaryMax
                  ? `${job.salaryMin.toLocaleString("vi-VN")} - ${job.salaryMax.toLocaleString("vi-VN")} ${job.currency ?? "VND"}`
                  : "Thỏa thuận"}
              </p>
            </div>
          </div>
        </div>

        {/* Phần Mô tả chi tiết */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-500" />
            Mô tả công việc
          </h3>
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-gray-600 leading-relaxed text-justify">
            {job.description}
          </div>
        </div>

        {job.requirements.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-500" />
              Yêu cầu
            </h3>
            <ul className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-gray-600 leading-relaxed list-disc pl-10">
              {job.requirements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Nút Call-to-action */}
        <div className="mt-10 flex justify-end">
          <Button onClick={() => setShowApplyModal(true)}>Ứng tuyển ngay</Button>
        </div>
      </div>

      {/* Modal Ứng tuyển */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in transition-all">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {applyResult === "success" ? (
              <div className="p-12 text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Nộp đơn thành công!</h2>
                <p className="text-slate-500">Cảm ơn bạn đã quan tâm. Nhà tuyển dụng sẽ sớm liên hệ với bạn.</p>
              </div>
            ) : applyResult === "error" ? (
              <div className="p-12 text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                  <X size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Nộp đơn thất bại!</h2>
                <p className="text-slate-500">{applyErrorMsg}</p>
              </div>
            ) : (
              <>
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">Ứng tuyển vị trí này</h2>
                  <button
                    onClick={() => setShowApplyModal(false)}
                    className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                  >
                    <X size={20} className="text-slate-500" />
                  </button>
                </div>

                <form onSubmit={handleApply} className="p-8 space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Họ và tên</label>
                    <input
                      type="text"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      value={applyForm.fullName}
                      onChange={e => setApplyForm(prev => ({ ...prev, fullName: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Email</label>
                      <input
                        type="email"
                        required
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        value={applyForm.email}
                        onChange={e => setApplyForm(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Số điện thoại</label>
                      <input
                        type="tel"
                        required
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        value={applyForm.phone}
                        onChange={e => setApplyForm(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Tải lên CV (PDF/Word)</label>
                    <div className="relative group">
                      <input
                        type="file"
                        required
                        accept=".pdf,.doc,.docx"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={e => setCvFile(e.target.files?.[0] || null)}
                      />
                      <div className="flex flex-col items-center justify-center py-8 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 group-hover:border-blue-400 group-hover:bg-blue-50 transition-all">
                        <Upload size={24} className={cvFile ? "text-blue-500" : "text-slate-400"} />
                        <p className="mt-2 text-xs font-medium text-slate-600">
                          {cvFile ? cvFile.name : "Kéo thả hoặc nhấn để chọn file"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      className="w-full justify-center py-3"
                      disabled={isApplying}
                    >
                      {isApplying ? "Đang gửi hồ sơ..." : "Xác nhận nộp đơn"}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetail;
