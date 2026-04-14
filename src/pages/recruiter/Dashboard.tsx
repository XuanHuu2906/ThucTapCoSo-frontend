import { Briefcase, Users, Calendar, Clock, CheckCircle2 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
/** Kiểu dữ liệu hiển thị lịch phỏng vấn trong ngày (Dashboard widget) */
interface DailyInterviewItem {
  id: number;
  candidate: string;
  position: string;
  time: string;
  // "upcoming" = scheduled/confirmed – dùng riêng cho widget này, không phụ thuộc InterviewStatus
  status: "done" | "upcoming";
}

/** Dữ liệu biểu đồ lưu lượng ứng viên theo ngày */
interface CandidateFlowData {
  name: string;
  candidates: number;
}

const data: CandidateFlowData[] = [
  { name: "Mon", candidates: 12 },
  { name: "Tue", candidates: 19 },
  { name: "Wed", candidates: 15 },
  { name: "Thu", candidates: 22 },
  { name: "Fri", candidates: 28 },
  { name: "Sat", candidates: 10 },
  { name: "Sun", candidates: 14 },
];

const interviews: DailyInterviewItem[] = [
  {
    id: 1,
    candidate: "Nguyen Van A",
    position: "Frontend Developer",
    time: "09:00 AM",
    status: "done",
  },
  {
    id: 2,
    candidate: "Tran Thi B",
    position: "UI/UX Designer",
    time: "10:30 AM",
    status: "upcoming",
  },
  {
    id: 3,
    candidate: "Le Van C",
    position: "Backend Developer",
    time: "02:00 PM",
    status: "upcoming",
  },
  {
    id: 4,
    candidate: "Pham Thi D",
    position: "Project Manager",
    time: "04:00 PM",
    status: "upcoming",
  },
];

function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
      </div>

      {/* Metric Cards - 3 columns */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Card 1 */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
          <div className="z-10 relative">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Tổng số Việc làm đang mở
            </p>
            <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              24
            </p>
          </div>
          <Briefcase className="absolute -bottom-4 -right-2 h-24 w-24 text-slate-100 opacity-50 dark:text-slate-800" />
        </div>

        {/* Card 2 */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
          <div className="z-10 relative">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Ứng viên mới hôm nay
            </p>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                18
              </p>
              <p className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full dark:bg-emerald-500/20 dark:text-emerald-400">
                +12%
              </p>
            </div>
          </div>
          <Users className="absolute -bottom-4 -right-2 h-24 w-24 text-slate-100 opacity-50 dark:text-slate-800" />
        </div>

        {/* Card 3 */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
          <div className="z-10 relative">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Lịch phỏng vấn sắp tới
            </p>
            <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              5
            </p>
          </div>
          <Calendar className="absolute -bottom-4 -right-2 h-24 w-24 text-slate-100 opacity-50 dark:text-slate-800" />
        </div>
      </div>

      {/* Main Content - 60/40 Split */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column - 60% (3/5) */}
        <div className="lg:col-span-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Lưu lượng ứng viên
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Thống kê lượng ứng viên mới trong 7 ngày qua
            </p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="candidates"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#3B82F6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column - 40% (2/5) */}
        <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                Lịch phỏng vấn hôm nay
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Bạn có {interviews.filter(i => i.status === 'upcoming').length} lịch sắp tới
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {interviews.map((interview) => (
              <div
                key={interview.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${interview.status === 'done'
                    ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    : 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                    {interview.status === 'done' ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Clock className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className={`font-medium ${interview.status === 'done'
                      ? 'text-slate-500 dark:text-slate-400 line-through'
                      : 'text-slate-900 dark:text-slate-50'
                      }`}>
                      {interview.candidate}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {interview.position}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${interview.status === 'done'
                    ? 'text-slate-400 dark:text-slate-500'
                    : 'text-slate-900 dark:text-slate-50'
                    }`}>
                    {interview.time}
                  </p>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold mt-1 ${interview.status === 'done'
                    ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    : 'bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                    }`}>
                    {interview.status === 'done' ? 'Đã xong' : 'Sắp diễn ra'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button className="mt-6 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-700 transition-colors">
            Xem tất cả lịch hẹn
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;