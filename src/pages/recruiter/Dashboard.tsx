import { useEffect, useMemo, useState } from "react";
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
import { applicationService, interviewService, jobService } from "@/services";
import type { Application, Interview, Job } from "@/types";
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

function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<DailyInterviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      jobService.getJobs(),
      applicationService.getApplications(),
      interviewService.getInterviews(),
    ])
      .then(([jobList, applicationList, interviewList]) => {
        setJobs(jobList);
        setApplications(applicationList);
        setInterviews(
          interviewList.slice(0, 5).map((interview: Interview) => ({
            id: Number(interview.id),
            candidate: interview.candidateName,
            position: interview.jobTitle,
            time: new Date(interview.scheduledAt).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            status: interview.status === "done" ? "done" : "upcoming",
          }))
        );
      })
      .catch(() => setError("Không thể tải dữ liệu dashboard."))
      .finally(() => setIsLoading(false));
  }, []);

  const data = useMemo<CandidateFlowData[]>(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      return date;
    });

    return days.map((date) => {
      const key = date.toDateString();
      return {
        name: date.toLocaleDateString("vi-VN", { weekday: "short" }),
        candidates: applications.filter(
          (application) => new Date(application.appliedAt).toDateString() === key
        ).length,
      };
    });
  }, [applications]);

  const openJobs = jobs.filter((job) => job.status === "published").length;
  const todayApplications = applications.filter(
    (application) => new Date(application.appliedAt).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Dashboard Overview
        </h1>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-500 dark:bg-slate-900 dark:border-slate-800">
          Đang tải dashboard...
        </div>
      )}

      {/* Metric Cards - 3 columns */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Card 1 */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
          <div className="z-10 relative">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Tổng số Việc làm đang mở
            </p>
            <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              {openJobs}
            </p>
          </div>
          <Briefcase className="absolute -bottom-4 -right-2 h-24 w-24 text-gray-300 opacity-50 dark:text-slate-800" />
        </div>

        {/* Card 2 */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
          <div className="z-10 relative">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Ứng viên mới hôm nay
            </p>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                {todayApplications}
              </p>
              <p className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full dark:bg-emerald-500/20 dark:text-emerald-400">
                +12%
              </p>
            </div>
          </div>
          <Users className="absolute -bottom-4 -right-2 h-24 w-24 text-gray-300 opacity-50 dark:text-slate-800" />
        </div>

        {/* Card 3 */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
          <div className="z-10 relative">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Lịch phỏng vấn sắp tới
            </p>
            <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              {interviews.filter((interview) => interview.status === "upcoming").length}
            </p>
          </div>
          <Calendar className="absolute -bottom-4 -right-2 h-24 w-24 text-gray-300 opacity-50 dark:text-slate-800" />
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
          <div className="h-75 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E2E8F0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748B", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748B", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow:
                      "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                  }}
                  cursor={{ stroke: "#f1f5f9", strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="candidates"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                  activeDot={{ r: 6, strokeWidth: 0, fill: "#3B82F6" }}
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
                Bạn có{" "}
                {interviews.filter((i) => i.status === "upcoming").length} lịch
                sắp tới
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
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      interview.status === "done"
                        ? "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        : "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                    }`}
                  >
                    {interview.status === "done" ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Clock className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p
                      className={`font-medium ${
                        interview.status === "done"
                          ? "text-slate-500 dark:text-slate-400 line-through"
                          : "text-slate-900 dark:text-slate-50"
                      }`}
                    >
                      {interview.candidate}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {interview.position}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-medium ${
                      interview.status === "done"
                        ? "text-slate-400 dark:text-slate-500"
                        : "text-slate-900 dark:text-slate-50"
                    }`}
                  >
                    {interview.time}
                  </p>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold mt-1 ${
                      interview.status === "done"
                        ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        : "bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                    }`}
                  >
                    {interview.status === "done" ? "Đã xong" : "Sắp diễn ra"}
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
