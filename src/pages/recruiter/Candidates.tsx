import { useState } from "react";
import { 
    Search, Mail, Phone, Calendar, FileText, 
    CheckCircle2, ChevronDown, ListFilter, LayoutGrid, 
    List, X, Clock, MapPin, User, ChevronRight, 
    DollarSign, Briefcase
} from "lucide-react";
import { cn } from "../../lib/utils";

// Mock Data
const MOCK_CANDIDATES = [
    { id: 1, name: "Nguyễn Văn A", title: "Senior React Developer", email: "nva@gmail.com", phone: "0912345678", appliedAt: "2026-04-15", status: "Mới" },
    { id: 2, name: "Trần Thị B", title: "UX/UI Designer", email: "ttb@gmail.com", phone: "0987654321", appliedAt: "2026-04-14", status: "Đã chọn" },
    { id: 3, name: "Lê Văn C", title: "Product Manager", email: "lvc@gmail.com", phone: "0901234567", appliedAt: "2026-04-13", status: "Qua PV" },
    { id: 4, name: "Phạm Thị D", title: "Senior React Developer", email: "ptd@gmail.com", phone: "0911223344", appliedAt: "2026-04-12", status: "Hẹn PV" },
    { id: 5, name: "Hoàng Văn E", title: "Backend Engineer", email: "hve@gmail.com", phone: "0922334455", appliedAt: "2026-04-10", status: "Chờ offer" },
    { id: 6, name: "Vũ Thị F", title: "Frontend Developer", email: "vtf@gmail.com", phone: "0933445566", appliedAt: "2026-04-09", status: "Đã tuyển" },
    { id: 7, name: "Đặng Văn G", title: "QA Engineer", email: "dvg@gmail.com", phone: "0944556677", appliedAt: "2026-04-08", status: "Đã loại" },
];

const POSITIONS = ["Tất cả vị trí", "Senior React Developer", "UX/UI Designer", "Product Manager", "Backend Engineer", "Frontend Developer", "QA Engineer"];
const STATUS_TABS = ["Tất cả", "Mới", "Đã chọn", "Đã tuyển", "Đã loại"];

const STATUS_COLORS: Record<string, { bg: string, text: string, ring: string }> = {
    "Mới": { bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-700 dark:text-blue-400", ring: "ring-blue-600/20 dark:ring-blue-500/20" },
    "Đã chọn": { bg: "bg-indigo-50 dark:bg-indigo-500/10", text: "text-indigo-700 dark:text-indigo-400", ring: "ring-indigo-600/20 dark:ring-indigo-500/20" },
    "Qua PV": { bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", ring: "ring-emerald-600/20 dark:ring-emerald-500/20" },
    "Hẹn PV": { bg: "bg-purple-50 dark:bg-purple-500/10", text: "text-purple-700 dark:text-purple-400", ring: "ring-purple-600/20 dark:ring-purple-500/20" },
    "Chờ offer": { bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-700 dark:text-amber-400", ring: "ring-amber-600/20 dark:ring-amber-500/20" },
    "Đã tuyển": { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-700 dark:text-slate-200", ring: "ring-slate-400/20 dark:ring-slate-500/20" },
    "Đã loại": { bg: "bg-rose-50 dark:bg-rose-500/10", text: "text-rose-700 dark:text-rose-400", ring: "ring-rose-600/20 dark:ring-rose-500/20" },
};

export default function Candidates() {
    const [activeTab, setActiveTab] = useState("Tất cả");
    const [searchQuery, setSearchQuery] = useState("");
    const [positionFilter, setPositionFilter] = useState("Tất cả vị trí");
    const [viewMode, setViewMode] = useState<"card" | "table">("card");
    const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
    
    const [modalMode, setModalMode] = useState<"none" | "cv" | "interview" | "offer">("none");

    const openModal = (candidate: any, mode: "cv" | "interview" | "offer") => {
        setSelectedCandidate(candidate);
        setModalMode(mode);
    };

    const closeModal = () => {
        setModalMode("none");
        setSelectedCandidate(null);
    };

    // Filter Data
    const filteredCandidates = MOCK_CANDIDATES.filter((candidate) => {
        const matchesSearch =
            candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            candidate.email.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesTab = false;
        if (activeTab === "Tất cả") matchesTab = true;
        else if (activeTab === "Mới") matchesTab = candidate.status === "Mới";
        else if (activeTab === "Đã chọn") matchesTab = ["Đã chọn", "Qua PV", "Hẹn PV", "Chờ offer"].includes(candidate.status);
        else if (activeTab === "Đã tuyển") matchesTab = candidate.status === "Đã tuyển";
        else if (activeTab === "Đã loại") matchesTab = candidate.status === "Đã loại";

        const matchesPosition = positionFilter === "Tất cả vị trí" || candidate.title === positionFilter;
        return matchesSearch && matchesTab && matchesPosition;
    });

    const getTabCount = (tab: string) => {
        if (tab === "Tất cả") return MOCK_CANDIDATES.length;
        if (tab === "Mới") return MOCK_CANDIDATES.filter(c => c.status === "Mới").length;
        if (tab === "Đã chọn") return MOCK_CANDIDATES.filter(c => ["Đã chọn", "Qua PV", "Hẹn PV", "Chờ offer"].includes(c.status)).length;
        if (tab === "Đã tuyển") return MOCK_CANDIDATES.filter(c => c.status === "Đã tuyển").length;
        if (tab === "Đã loại") return MOCK_CANDIDATES.filter(c => c.status === "Đã loại").length;
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

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                        Hồ sơ ứng viên
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Sàng lọc và quản lý quy trình tuyển dụng (UC-04, 05, 08)
                    </p>
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
            <div className="flex flex-col gap-4">
                <div className="flex overflow-x-auto pb-1 hide-scrollbar">
                    <nav className="flex space-x-2">
                        {STATUS_TABS.map((tab) => (
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
                            {POSITIONS.map(pos => <option key={pos} value={pos}>{pos}</option>)}
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
                                    STATUS_COLORS[candidate.status]?.bg || "bg-slate-50",
                                    STATUS_COLORS[candidate.status]?.text || "text-slate-700",
                                    STATUS_COLORS[candidate.status]?.ring || "ring-slate-600/20"
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
                                
                                {candidate.status === "Mới" && (
                                    <>
                                        <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-500 transition-all active:scale-95">Duyệt</button>
                                        <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 px-3 py-2 text-xs font-bold dark:bg-rose-500/10 transition-all active:scale-95">Loại</button>
                                    </>
                                )}
                                
                                {["Đã chọn", "Hẹn PV"].includes(candidate.status) && (
                                    <button 
                                        onClick={() => openModal(candidate, "interview")}
                                        className="flex-[2] inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-500 transition-all active:scale-95"
                                    >
                                        <Calendar size={14} /> Đặt lịch PV
                                    </button>
                                )}

                                {candidate.status === "Qua PV" && (
                                    <button 
                                        onClick={() => openModal(candidate, "offer")}
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
                                                STATUS_COLORS[candidate.status]?.bg || "bg-slate-50",
                                                STATUS_COLORS[candidate.status]?.text || "text-slate-700"
                                            )}>{candidate.status}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => openModal(candidate, "cv")}
                                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-500/10 transition-all active:scale-95"
                                            >Chi tiết</button>
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
                                    <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center py-10 gap-3">
                                        <FileText size={40} className="text-slate-300" />
                                        <p className="text-sm font-bold text-slate-400 italic">Preveiw_CV_{selectedCandidate.name.replace(/ /g, "_")}.pdf</p>
                                        <button className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all">Mở file CV</button>
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
                                                <input type="date" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pl-10 text-sm dark:bg-slate-800/50 dark:border-slate-700 outline-none" />
                                            </div>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <input type="time" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pl-10 text-sm dark:bg-slate-800/50 dark:border-slate-700 outline-none" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Địa điểm / Link họp</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <input type="text" placeholder="VD: Phòng 302 hoặc Link Google Meet" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pl-10 text-sm dark:bg-slate-800/50 dark:border-slate-700 outline-none" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Người phỏng vấn (Manager)</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <select className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pl-10 text-sm dark:bg-slate-800/50 dark:border-slate-700 outline-none">
                                                <option>Trần Thị B (HM - Engineering)</option>
                                                <option>Nguyễn Văn X (Lead - UI/UX)</option>
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
                                        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 leading-snug">Ứng viên đã đạt yêu cầu chuyên môn. Nhập các thông tin đãi ngộ để gửi Director phê duyệt (UC-08).</p>
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
                                <button onClick={closeModal} className="px-6 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-lg shadow-blue-500/25 hover:bg-blue-500 transition-all active:scale-95">Xác nhận lịch</button>
                            )}
                            {modalMode === "offer" && (
                                <button onClick={closeModal} className="px-6 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-500 transition-all active:scale-95">Gửi đề xuất Offer</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
