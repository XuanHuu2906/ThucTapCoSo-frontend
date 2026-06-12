import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
    Search, Mail, Phone, Calendar, FileText,
    CheckCircle2, ChevronDown, ListFilter, LayoutGrid,
    List, X, Clock, MapPin, User,
    DollarSign
} from "lucide-react";
import { cn } from "../../lib/utils";
import { applicationService, interviewService, userService } from "@/services";
import type { Application, ApplicationStatus, InterviewRound } from "@/types";
import { CANDIDATE_STATUS_COLORS, CANDIDATE_STATUS_LABELS, CANDIDATE_STATUS_TABS } from "@/lib/constants";
import { formatDate } from "@/utils/date";
import { downloadFile } from "@/utils/file";

type CandidateCard = {
    id: string;
    applicationId: string;
    name: string;
    title: string;
    email: string;
    phone: string;
    appliedAt: string;
    status: string;
    rawStatus: ApplicationStatus;
    cvUrl: string;
    jobId: string;
    department: string;
};

export default function Candidates() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("Tất cả");
    const [searchQuery, setSearchQuery] = useState("");
    const [positionFilter, setPositionFilter] = useState("Tất cả vị trí");
    const [viewMode, setViewMode] = useState<"card" | "table">("card");
    const [candidates, setCandidates] = useState<CandidateCard[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedCandidate, setSelectedCandidate] = useState<CandidateCard | null>(null);

    const [modalMode, setModalMode] = useState<"none" | "cv" | "interview" | "offer">("none");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [hiringManagers, setHiringManagers] = useState<{ id: string; name: string; department?: string }[]>([]);
    const [interviewForm, setInterviewForm] = useState({
        id: "", // Lưu interviewId nếu là sửa
        date: "",
        time: "",
        location: "",
        interviewerId: "2",
        round: "technical" as InterviewRound,
    });

    const filteredHiringManagers = useMemo(() => {
        if (!selectedCandidate?.department) return hiringManagers;
        const candidateDept = selectedCandidate.department.trim().toLowerCase();
        const filtered = hiringManagers.filter(hm => hm.department?.trim().toLowerCase() === candidateDept);
        return filtered.length > 0 ? filtered : hiringManagers;
    }, [hiringManagers, selectedCandidate]);

    const fetchCandidates = useCallback(async () => {
        setIsLoading(true);
        try {
            const applications = await applicationService.getApplications();
            setCandidates(
                applications.map((application) => {
                    let displayStatus = CANDIDATE_STATUS_LABELS[application.status];
                    if (application.status === "interviewing" && application.interviewConfirmStatus === "Confirmed") {
                        displayStatus = "Đã xác nhận";
                    }
                    return {
                        id: application.candidateId,
                        applicationId: application.id,
                        name: application.candidateName,
                        title: application.jobTitle,
                        email: application.candidateEmail,
                        phone: application.candidatePhone,
                        appliedAt: formatDate(application.appliedAt),
                        status: displayStatus,
                        rawStatus: application.status,
                        cvUrl: application.cvUrl,
                        jobId: application.jobId,
                        department: application.jobDepartment || "",
                    };
                })
            );
        } catch (e) {
            setError("Không thể tải danh sách ứng viên.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const fetchHiringManagers = async () => {
            try {
                const users = await userService.getHiringManagers();
                setHiringManagers(users.map(u => ({ id: String(u.id), name: u.fullName, department: u.department })));
                // Set default interviewer if available
                if (users.length > 0) {
                    setInterviewForm(prev => ({ ...prev, interviewerId: String(users[0].id) }));
                }
            } catch (err) {
                console.error("Failed to fetch hiring managers", err);
            }
        };
        fetchHiringManagers();
        fetchCandidates();
    }, [fetchCandidates]);

    const positions = useMemo(
        () => ["Tất cả vị trí", ...Array.from(new Set(candidates.map((candidate) => candidate.title)))],
        [candidates]
    );

    const openModal = async (candidate: CandidateCard, mode: "cv" | "interview" | "offer") => {
        setSelectedCandidate(candidate);
        setModalMode(mode);

        if (mode === "interview") {
            // Calculate filtered HMs right here for the candidate
            const candidateDept = candidate.department?.trim().toLowerCase();
            const filtered = hiringManagers.filter(hm => hm.department?.trim().toLowerCase() === candidateDept);
            const defaultHMId = filtered.length > 0 ? filtered[0].id : (hiringManagers[0]?.id || "2");

            setInterviewForm(prev => ({
                ...prev,
                interviewerId: defaultHMId
            }));

            // Nếu là phỏng vấn và đã có lịch thì lấy dữ liệu cũ
            if (candidate.rawStatus === "interviewing") {
                try {
                    const interviews = await interviewService.getInterviews({ candidateId: candidate.applicationId });
                    if (interviews.length > 0) {
                        const latest = interviews[0];
                        const dateObj = new Date(latest.scheduledAt);

                        const year = dateObj.getFullYear();
                        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                        const day = String(dateObj.getDate()).padStart(2, '0');
                        const hours = String(dateObj.getHours()).padStart(2, '0');
                        const minutes = String(dateObj.getMinutes()).padStart(2, '0');

                        setInterviewForm({
                            id: latest.id,
                            date: `${year}-${month}-${day}`,
                            time: `${hours}:${minutes}`,
                            location: latest.location || "",
                            interviewerId: latest.interviewerIds[0] || defaultHMId,
                            round: latest.round,
                        });
                    }
                } catch (error) {
                    console.error("Lỗi khi lấy lịch phỏng vấn:", error);
                }
            }
        }
    };

    const closeModal = () => {
        setModalMode("none");
        setSelectedCandidate(null);
        setShowSuccess(false);
        setInterviewForm({
            id: "",
            date: "",
            time: "",
            location: "",
            interviewerId: hiringManagers[0]?.id || "2",
            round: "technical",
        });
    };

    // Filter Data
    const filteredCandidates = candidates.filter((candidate) => {
        const matchesSearch =
            candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            candidate.email.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesTab = false;
        if (activeTab === "Tất cả") matchesTab = true;
        else if (activeTab === "Mới") matchesTab = candidate.status === "Mới";
        else if (activeTab === "Đã chọn") matchesTab = ["Đã chọn", "Qua PV", "Hẹn PV", "Đã xác nhận", "Chờ offer"].includes(candidate.status);
        else if (activeTab === "Đã tuyển") matchesTab = candidate.status === "Đã tuyển";
        else if (activeTab === "Đã loại") matchesTab = candidate.status === "Đã loại";

        const matchesPosition = positionFilter === "Tất cả vị trí" || candidate.title === positionFilter;
        return matchesSearch && matchesTab && matchesPosition;
    });

    const getTabCount = (tab: string) => {
        if (tab === "Tất cả") return candidates.length;
        if (tab === "Mới") return candidates.filter(c => c.status === "Mới").length;
        if (tab === "Đã chọn") return candidates.filter(c => ["Đã chọn", "Qua PV", "Hẹn PV", "Đã xác nhận", "Chờ offer"].includes(c.status)).length;
        if (tab === "Đã tuyển") return candidates.filter(c => c.status === "Đã tuyển").length;
        if (tab === "Đã loại") return candidates.filter(c => c.status === "Đã loại").length;
        return 0;
    };

    const getInitials = (name: string) => {
        const parts = name.split(" ");
        return parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : name.substring(0, 2).toUpperCase();
    };

    const getAvatarColor = (name: string) => {
        const colors = [
            "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
            "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
            "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
            "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
            "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
        ];
        const total = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[total % colors.length];
    };

    const handleDownload = async (url: string, name: string) => {
        const safeName = name.trim().replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_");
        await downloadFile(url, `CV_${safeName}.pdf`);
    };

    const handleUpdateStatus = async (appId: string, newStatus: ApplicationStatus) => {
        try {
            const updatedApp = await applicationService.updateStatus(appId, { status: newStatus });

            // Cập nhật lại state candidates để giao diện thay đổi ngay lập tức
            setCandidates(prev => prev.map(c =>
                c.applicationId === appId
                    ? { ...c, status: CANDIDATE_STATUS_LABELS[updatedApp.status], rawStatus: updatedApp.status }
                    : c
            ));

            // Nếu đang mở modal thì đóng lại
            if (selectedCandidate?.applicationId === appId) {
                closeModal();
            }
            toast.success("Đã cập nhật trạng thái ứng viên.");
        } catch (error: any) {
            const message = error.response?.data?.message || "Không thể cập nhật trạng thái.";
            toast.error(message);
        }
    };

    const handleScheduleInterview = async () => {
        if (!selectedCandidate) return;

        setIsSubmitting(true);
        try {
            // Tạo đối tượng Date từ input (mặc định là giờ địa phương)
            const localDate = new Date(`${interviewForm.date}T${interviewForm.time}`);
            const scheduledAt = localDate.toISOString();

            if (interviewForm.id) {
                // Cập nhật lịch cũ
                await interviewService.updateInterview(interviewForm.id, {
                    scheduledAt,
                    location: interviewForm.location,
                    interviewerIds: [interviewForm.interviewerId],
                });
            } else {
                // Tạo lịch mới
                await interviewService.scheduleInterview({
                    applicationId: selectedCandidate.applicationId,
                    candidateId: selectedCandidate.id,
                    jobId: selectedCandidate.jobId,
                    interviewerIds: [interviewForm.interviewerId],
                    scheduledAt,
                    location: interviewForm.location,
                    round: interviewForm.round,
                    mode: interviewForm.location.toLowerCase().includes("meet") ? "online" : "offline",
                    durationMinutes: 60,
                });
            }

            // Cập nhật trạng thái ứng viên trong danh sách
            if (!interviewForm.id) {
                setCandidates(prev => prev.map(c =>
                    c.applicationId === selectedCandidate.applicationId
                        ? { ...c, status: CANDIDATE_STATUS_LABELS["interviewing"], rawStatus: "interviewing" }
                        : c
                ));
            }

            setShowSuccess(true);
            setTimeout(() => {
                closeModal();
            }, 2000);
        } catch (error: any) {
            const message = error.response?.data?.message || "Không thể lưu lịch phỏng vấn.";
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                        Hồ sơ ứng viên
                    </h1>
                </div>

                <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                    <button
                        onClick={() => setViewMode("card")}
                        className={cn("p-1.5 rounded-md text-sm font-medium transition-colors", viewMode === "card" ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-50" : "text-slate-500 hover:text-slate-900 dark:text-slate-400")}
                    >
                        <LayoutGrid className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setViewMode("table")}
                        className={cn("p-1.5 rounded-md text-sm font-medium transition-colors", viewMode === "table" ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-50" : "text-slate-500 hover:text-slate-900 dark:text-slate-400")}
                    >
                        <List className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Filters Toolbar */}
            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                    {error}
                </div>
            )}

            {isLoading && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-500 dark:bg-slate-900 dark:border-slate-800">
                    Đang tải hồ sơ ứng viên...
                </div>
            )}

            <div className="flex flex-col gap-4">
                <div className="flex overflow-x-auto pb-1 hide-scrollbar">
                    <nav className="flex space-x-2">
                        {CANDIDATE_STATUS_TABS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap border",
                                    activeTab === tab
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800"
                                )}
                            >
                                {tab}
                                <span className={cn(
                                    "ml-2 inline-flex items-center justify-center min-w-[20px] h-5 rounded-full text-xs",
                                    activeTab === tab ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                                )}>
                                    {getTabCount(tab)}
                                </span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm tên, email ứng viên..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 transition-all"
                        />
                    </div>

                    <div className="relative">
                        <ListFilter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <select
                            value={positionFilter}
                            onChange={(e) => setPositionFilter(e.target.value)}
                            className="w-full sm:w-64 appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-10 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                        >
                            {positions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Content Area */}
            {viewMode === "card" ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filteredCandidates.map((candidate) => (
                        <div key={candidate.id} className="group relative flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 hover:shadow-lg transition-all dark:bg-slate-900 dark:ring-slate-800">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex gap-4">
                                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-bold text-lg rotate-3 group-hover:rotate-0 transition-transform ${getAvatarColor(candidate.name)}`}>
                                        {getInitials(candidate.name)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-slate-50 text-base group-hover:text-blue-600 transition-colors uppercase tracking-tight">{candidate.name}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{candidate.title}</p>
                                    </div>
                                </div>
                                <span className={cn(
                                    "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset uppercase tracking-widest",
                                    CANDIDATE_STATUS_COLORS[candidate.status]?.bg || "bg-slate-50",
                                    CANDIDATE_STATUS_COLORS[candidate.status]?.text || "text-slate-700",
                                    CANDIDATE_STATUS_COLORS[candidate.status]?.ring || "ring-slate-600/20"
                                )}>
                                    {candidate.status}
                                </span>
                            </div>

                            <div className="mt-5 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                                <div className="flex items-center gap-2"><Mail size={14} className="text-slate-400" /> <span className="truncate">{candidate.email}</span></div>
                                <div className="flex items-center gap-2"><Phone size={14} className="text-slate-400" /> <span>{candidate.phone}</span></div>
                                <div className="flex items-center gap-2"><Calendar size={14} className="text-slate-400" /> <span>{candidate.appliedAt}</span></div>
                            </div>

                            <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    onClick={() => openModal(candidate, "cv")}
                                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-all active:scale-95"
                                >
                                    <FileText size={14} /> CV
                                </button>

                                {candidate.rawStatus === "new" && (
                                    <>
                                        <button
                                            onClick={() => handleUpdateStatus(candidate.applicationId, "shortlisted")}
                                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-500 transition-all active:scale-95"
                                        >
                                            Duyệt
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(candidate.applicationId, "rejected")}
                                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 px-3 py-2 text-xs font-bold dark:bg-rose-500/10 transition-all active:scale-95"
                                        >
                                            Loại
                                        </button>
                                    </>
                                )}

                                {["Đã chọn", "Hẹn PV", "Đã xác nhận"].includes(candidate.status) && (
                                    <button
                                        onClick={() => openModal(candidate, "interview")}
                                        className="flex-[2] inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-500 transition-all active:scale-95"
                                    >
                                        <Calendar size={14} /> {["Hẹn PV", "Đã xác nhận"].includes(candidate.status) ? 'Đổi lịch PV' : 'Đặt lịch PV'}
                                    </button>
                                )}

                                {candidate.status === "Qua PV" && (
                                    <button
                                        onClick={() => navigate(`/recruiter/offers?applicationId=${candidate.applicationId}`)}
                                        className="flex-[2] inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-all active:scale-95"
                                    >
                                        <DollarSign size={14} /> Tạo Offer
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/30 font-bold uppercase text-[10px] tracking-widest">
                                    <th className="px-6 py-4">Ứng viên</th>
                                    <th className="px-6 py-4">Vị trí</th>
                                    <th className="px-6 py-4 text-center">Liên hệ</th>
                                    <th className="px-6 py-4">Ngày nộp</th>
                                    <th className="px-6 py-4">Trạng thái</th>
                                    <th className="px-6 py-4 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredCandidates.map(candidate => (
                                    <tr key={candidate.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-50">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-[10px] ${getAvatarColor(candidate.name)}`}>{getInitials(candidate.name)}</div>
                                                {candidate.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">{candidate.title}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1 text-[10px] text-slate-400">
                                                <span className="flex items-center gap-1"><Mail size={10} /> {candidate.email}</span>
                                                <span className="flex items-center gap-1"><Phone size={10} /> {candidate.phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">{candidate.appliedAt}</td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset uppercase tracking-widest",
                                                CANDIDATE_STATUS_COLORS[candidate.status]?.bg || "bg-slate-50",
                                                CANDIDATE_STATUS_COLORS[candidate.status]?.text || "text-slate-700"
                                            )}>{candidate.status}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openModal(candidate, "cv")}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-500/10 transition-all active:scale-95"
                                                >
                                                    Chi tiết
                                                </button>
                                                {candidate.rawStatus === "new" && (
                                                    <>
                                                        <button
                                                            onClick={() => handleUpdateStatus(candidate.applicationId, "shortlisted")}
                                                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all"
                                                            title="Duyệt hồ sơ"
                                                        >
                                                            <CheckCircle2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateStatus(candidate.applicationId, "rejected")}
                                                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
                                                            title="Loại hồ sơ"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal Logic */}
            {modalMode !== "none" && selectedCandidate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in transition-all">
                    <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl dark:bg-slate-900 dark:ring-1 dark:ring-slate-800 animate-in zoom-in-95 duration-200 overflow-hidden">

                        {showSuccess ? (
                            <div className="p-12 text-center space-y-4">
                                <div className="mx-auto w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Đặt lịch thành công!</h2>
                                <p className="text-slate-500 dark:text-slate-400">Thông báo phỏng vấn đã được gửi tới ứng viên và người phỏng vấn.</p>
                            </div>
                        ) : (
                            <>
                                {/* Header */}
                                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50/50 dark:bg-slate-800/50">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold ${getAvatarColor(selectedCandidate.name)}`}>{getInitials(selectedCandidate.name)}</div>
                                        <div>
                                            <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">{selectedCandidate.name}</h2>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{selectedCandidate.title}</p>
                                        </div>
                                    </div>
                                    <button onClick={closeModal} className="p-2 rounded-full hover:bg-white dark:hover:bg-slate-700 transition-colors"><X size={20} className="text-slate-400" /></button>
                                </div>

                                {/* Body Selection */}
                                <div className="p-6">
                                    {modalMode === "cv" && (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</p>
                                                    <p className="text-sm font-semibold truncate">{selectedCandidate.email}</p>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone</p>
                                                    <p className="text-sm font-semibold">{selectedCandidate.phone}</p>
                                                </div>
                                            </div>

                                            {selectedCandidate.cvUrl && (
                                                <div className="flex gap-3 px-1">
                                                    <a
                                                        href={selectedCandidate.cvUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-sm"
                                                    >
                                                        🔍 Xem CV toàn màn hình
                                                    </a>
                                                    <button
                                                        onClick={() => handleDownload(selectedCandidate.cvUrl, selectedCandidate.name)}
                                                        className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 transition-all shadow-sm"
                                                    >
                                                        ⬇️ Tải xuống
                                                    </button>
                                                </div>
                                            )}
                                            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800 h-[500px] relative group">
                                                {selectedCandidate.cvUrl ? (
                                                    <iframe
                                                        src={selectedCandidate.cvUrl}
                                                        className="w-full h-full border-none"
                                                        title={`CV - ${selectedCandidate.name}`}
                                                    />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center h-full gap-3">
                                                        <FileText size={40} className="text-slate-300" />
                                                        <p className="text-sm font-bold text-slate-400">Ứng viên chưa tải lên CV</p>
                                                    </div>
                                                )}
                                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <a
                                                        href={selectedCandidate.cvUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="bg-white/90 backdrop-blur shadow-sm p-2 rounded-lg text-slate-700 hover:text-blue-600 transition-colors block"
                                                        title="Mở trong tab mới"
                                                    >
                                                        <FileText size={18} />
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {modalMode === "interview" && (
                                        <div className="space-y-5">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Thời gian phỏng vấn</label>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="relative">
                                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                        <input
                                                            type="date"
                                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pl-10 text-sm dark:bg-slate-800/50 dark:border-slate-700 outline-none"
                                                            value={interviewForm.date}
                                                            onChange={e => setInterviewForm(prev => ({ ...prev, date: e.target.value }))}
                                                        />
                                                    </div>
                                                    <div className="relative">
                                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                        <input
                                                            type="time"
                                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pl-10 text-sm dark:bg-slate-800/50 dark:border-slate-700 outline-none"
                                                            value={interviewForm.time}
                                                            onChange={e => setInterviewForm(prev => ({ ...prev, time: e.target.value }))}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Địa điểm / Link họp</label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="VD: Phòng 302 hoặc Link Google Meet"
                                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pl-10 text-sm dark:bg-slate-800/50 dark:border-slate-700 outline-none"
                                                        value={interviewForm.location}
                                                        onChange={e => setInterviewForm(prev => ({ ...prev, location: e.target.value }))}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Người phỏng vấn (Manager)</label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                    <select
                                                        className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pl-10 text-sm dark:bg-slate-800/50 dark:border-slate-700 outline-none"
                                                        value={interviewForm.interviewerId}
                                                        onChange={e => setInterviewForm(prev => ({ ...prev, interviewerId: e.target.value }))}
                                                    >
                                                        {filteredHiringManagers.length > 0 ? (
                                                            filteredHiringManagers.map(hm => (
                                                                <option key={hm.id} value={hm.id}>
                                                                    {hm.name} {hm.department ? `(HM - ${hm.department})` : ''}
                                                                </option>
                                                            ))
                                                        ) : (
                                                            <>
                                                                <option value="2">Trần Thị B (HM - Engineering)</option>
                                                                <option value="3">Nguyễn Văn X (Lead - UI/UX)</option>
                                                            </>
                                                        )}
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                                </div>
                                                <p className="text-[10px] text-amber-600 font-bold mt-1 flex items-center gap-1 italic"><Clock size={10} /> Hệ thống đã kiểm tra: Manager không trùng lịch vào giờ này.</p>
                                            </div>
                                        </div>
                                    )}

                                    {modalMode === "offer" && (
                                        <div className="space-y-5">
                                            <div className="bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-2xl flex items-center gap-3 border border-emerald-100 dark:border-emerald-500/20 mb-4">
                                                <CheckCircle2 className="text-emerald-600 shrink-0" size={24} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Lương cơ bản (Gross)</label>
                                                    <div className="relative">
                                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                        <input type="number" placeholder="VD: 25,000,000" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pl-10 text-sm dark:bg-slate-800/50 dark:border-slate-700 outline-none" />
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Phụ cấp (nếu có)</label>
                                                    <input type="number" placeholder="VD: 2,000,000" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm dark:bg-slate-800/50 dark:border-slate-700 outline-none" />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Ngày bắt đầu dự kiến</label>
                                                <input type="date" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm dark:bg-slate-800/50 dark:border-slate-700 outline-none" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="bg-slate-50 dark:bg-slate-800 px-6 py-4 flex items-center justify-end gap-3">
                                    <button onClick={closeModal} className="px-5 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-white dark:hover:bg-slate-700 transition-all">Đóng</button>
                                    {modalMode === "interview" && (
                                        <button
                                            onClick={handleScheduleInterview}
                                            disabled={isSubmitting || !interviewForm.date || !interviewForm.time}
                                            className="px-6 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-lg shadow-blue-500/25 hover:bg-blue-500 transition-all active:scale-95 disabled:opacity-50"
                                        >
                                            {isSubmitting ? "Đang xử lý..." : "Xác nhận lịch"}
                                        </button>
                                    )}
                                    {modalMode === "offer" && (
                                        <button onClick={closeModal} className="px-6 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-500 transition-all active:scale-95">Gửi đề xuất Offer</button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
