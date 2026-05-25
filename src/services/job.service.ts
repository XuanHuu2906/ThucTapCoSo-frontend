import api, { type ApiParams, unwrapResponse } from "./api";
import type { Job, JobFilter, JobPayload, JobStatus } from "@/types";

type BackendJob = {
  jobId: number;
  postedBy: number;
  deptName: string;
  title: string;
  description?: string | null;
  requirements?: string | null;
  salaryRange?: string | null;
  startDate: string;
  endDate: string;
  type: string;
  experienceLevel: string;
  location: string;
  headcount: number;
  status: string;
  createdAt: string;
};

const statusMap: Record<string, JobStatus> = {
  Draft: "draft",
  Open: "published",
  Closed: "closed",
  Filled: "filled",
};

const backendStatusMap: Record<JobStatus, string> = {
  draft: "Draft",
  published: "Open",
  closed: "Closed",
  filled: "Closed",
};

const parseRequirements = (requirements?: string | null) =>
  requirements
    ? requirements
      .split(/\r?\n/)
      .map((item) => item.replace(/^[-*]\s*/, "").trim())
      .filter(Boolean)
    : [];

const mapJob = (job: BackendJob): Job => {
  let salaryMin: number | undefined;
  let salaryMax: number | undefined;

  if (job.salaryRange) {
    const parts = job.salaryRange.split("-").map((p) => Number(p.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      salaryMin = parts[0];
      salaryMax = parts[1];
    }
  }

  return {
    id: String(job.jobId),
    title: job.title,
    department: job.deptName,
    location: job.location,
    type: job.type as JobType,
    experienceLevel: job.experienceLevel as ExperienceLevel,
    description: job.description ?? "",
    requirements: parseRequirements(job.requirements),
    salaryMin,
    salaryMax,
    currency: "VND",
    headcount: job.headcount,
    deadline: job.endDate,
    status: statusMap[job.status] ?? "draft",
    applicants: 0,
    createdBy: String(job.postedBy),
    createdAt: job.createdAt,
    updatedAt: job.createdAt,
  };
};

const toBackendPayload = (payload: Partial<JobPayload>) => ({
  title: payload.title,
  deptName: payload.department,
  description: payload.description,
  requirements: payload.requirements?.map((item) => `- ${item}`).join("\n"),
  salaryRange:
    payload.salaryMin && payload.salaryMax
      ? `${payload.salaryMin} - ${payload.salaryMax}`
      : undefined,
  startDate: new Date().toISOString(),
  endDate: payload.deadline ? new Date(payload.deadline).toISOString() : undefined,
  type: payload.type,
  experienceLevel: payload.experienceLevel,
  location: payload.location,
  headcount: payload.headcount,
  status: payload.saveAsDraft ? "Draft" : "Open",
});

export const jobService = {
  async getJobs(filter?: JobFilter): Promise<Job[]> {
    const params = {
      search: filter?.keyword,
      deptName: filter?.department,
      status: filter?.status ? backendStatusMap[filter.status] : undefined,
    };
    const response = await api.get<BackendJob[]>("/jobs", { params: params as ApiParams });
    return unwrapResponse(response).map(mapJob);
  },

  async getJobById(id: string): Promise<Job> {
    const response = await api.get<BackendJob>(`/jobs/${id}`);
    return mapJob(unwrapResponse(response));
  },

  async createJob(payload: JobPayload): Promise<Job> {
    const response = await api.post<BackendJob>("/jobs", toBackendPayload(payload));
    return mapJob(unwrapResponse(response));
  },

  async updateJob(id: string, payload: Partial<JobPayload>): Promise<Job> {
    const response = await api.put<BackendJob>(`/jobs/${id}`, toBackendPayload(payload));
    return mapJob(unwrapResponse(response));
  },

  async deleteJob(id: string): Promise<void> {
    await api.delete(`/jobs/${id}`);
  },

  async updateStatus(id: string, status: JobStatus): Promise<Job> {
    const response = await api.patch<BackendJob>(`/jobs/${id}/status`, {
      status: backendStatusMap[status],
    });
    return mapJob(unwrapResponse(response));
  },
};
