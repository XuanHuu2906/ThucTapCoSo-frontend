import api, { unwrapResponse } from "./api";
import type {
  Application,
  ApplicationFilter,
  ApplicationStatus,
  SubmitApplicationPayload,
  UpdateApplicationStatusPayload,
} from "@/types";

export type BackendApplication = {
  appId: number;
  jobId: number;
  candidateId: number;
  managedBy?: number | null;
  appliedDate: string;
  cvFile?: string | null;
  status: string;
  candidate?: {
    candidateId: number;
    fullName: string;
    email: string;
    phone?: string | null;
  };
  jobPosting?: {
    title: string;
    deptName: string;
  };
};

const statusMap: Record<string, ApplicationStatus> = {
  New: "new",
  Screening: "shortlisted",
  Shortlisted: "shortlisted",
  Interviewing: "interviewing",
  InterviewPassed: "interview_passed",
  InterviewFailed: "interview_failed",
  Offered: "offered",
  Hired: "hired",
  Rejected: "rejected",
  Withdrawn: "withdrawn",
};

const backendStatusMap: Record<ApplicationStatus, string> = {
  new: "New",
  shortlisted: "Shortlisted",
  interviewing: "Interviewing",
  interview_passed: "InterviewPassed",
  interview_failed: "InterviewFailed",
  offered: "Offered",
  hired: "Hired",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export const mapApplication = (application: BackendApplication): Application => ({
  id: String(application.appId),
  jobId: String(application.jobId),
  jobTitle: application.jobPosting?.title ?? "Không rõ vị trí",
  candidateId: String(application.candidateId),
  candidateName: application.candidate?.fullName ?? "Không rõ ứng viên",
  candidateEmail: application.candidate?.email ?? "",
  candidatePhone: application.candidate?.phone ?? "",
  cvUrl: application.cvFile ?? "",
  status: statusMap[application.status] ?? "new",
  appliedAt: application.appliedDate,
  updatedAt: application.appliedDate,
});

export const applicationService = {
  async apply(payload: SubmitApplicationPayload): Promise<Application> {
    const formData = new FormData();
    formData.append("jobId", payload.jobId);
    if (payload.fullName) formData.append("fullName", payload.fullName);
    if (payload.email) formData.append("email", payload.email);
    if (payload.phone) formData.append("phone", payload.phone);
    if (payload.cvUrl) formData.append("cvFile", payload.cvUrl);

    const response = await api.post<BackendApplication>("/applications", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return mapApplication(unwrapResponse(response));
  },

  async getApplications(filter?: ApplicationFilter): Promise<Application[]> {
    const params = {
      jobId: filter?.jobId,
      status: filter?.status ? backendStatusMap[filter.status] : undefined,
    };
    const response = await api.get<BackendApplication[]>("/applications", { params });
    return unwrapResponse(response).map(mapApplication);
  },

  async updateStatus(
    id: string,
    payload: UpdateApplicationStatusPayload
  ): Promise<Application> {
    const response = await api.patch<BackendApplication>(`/applications/${id}/status`, {
      status: backendStatusMap[payload.status],
    });
    return mapApplication(unwrapResponse(response));
  },
};
