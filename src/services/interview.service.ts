import api, { unwrapResponse } from "./api";
import type {
  Interview,
  InterviewFilter,
  InterviewRound,
  InterviewStatus,
  ScheduleInterviewPayload,
  SubmitInterviewEvaluationPayload,
} from "@/types";

type BackendInterview = {
  interviewId: number;
  appId: number;
  interviewerId: number;
  interviewDate: string;
  location?: string | null;
  type: string;
  confirmStatus: string;
  technicalScore?: number | null;
  softScore?: number | null;
  attitudeScore?: number | null;
  result: string;
  feedback?: string | null;
  createdAt: string;
  application?: {
    candidate?: { candidateId: number; fullName: string };
    jobPosting?: { jobId: number; title: string };
  };
};

const statusMap: Record<string, InterviewStatus> = {
  Pending: "scheduled",
  Confirmed: "confirmed",
  Declined: "declined",
  Done: "done",
  Cancelled: "cancelled",
};

const typeMap: Record<string, InterviewRound> = {
  HR: "hr",
  Technical: "technical",
  Final: "final",
};

const mapInterview = (interview: BackendInterview): Interview => ({
  id: String(interview.interviewId),
  applicationId: String(interview.appId),
  candidateId: String(interview.application?.candidate?.candidateId ?? ""),
  candidateName: interview.application?.candidate?.fullName ?? "Không rõ ứng viên",
  jobId: String(interview.application?.jobPosting?.jobId ?? ""),
  jobTitle: interview.application?.jobPosting?.title ?? "Không rõ vị trí",
  round: typeMap[interview.type] ?? "technical",
  mode: interview.location?.toLowerCase().includes("meet") ? "online" : "offline",
  scheduledAt: interview.interviewDate,
  durationMinutes: 60,
  location: interview.location ?? undefined,
  interviewerIds: [String(interview.interviewerId)],
  status:
    interview.result !== "Pending"
      ? "done"
      : statusMap[interview.confirmStatus] ?? "scheduled",
  note: interview.feedback ?? undefined,
  createdAt: interview.createdAt,
  updatedAt: interview.createdAt,
});

export const interviewService = {
  async scheduleInterview(payload: ScheduleInterviewPayload): Promise<Interview> {
    const response = await api.post<BackendInterview>("/interviews", {
      appId: Number(payload.applicationId),
      interviewerId: Number(payload.interviewerIds[0]),
      interviewDate: payload.scheduledAt,
      location: payload.location ?? payload.meetingUrl,
      type: payload.round === "hr" ? "HR" : payload.round === "final" ? "Final" : "Technical",
    });
    return mapInterview(unwrapResponse(response));
  },

  async getInterviews(filter?: InterviewFilter): Promise<Interview[]> {
    const response = await api.get<BackendInterview[]>("/interviews", {
      params: {
        appId: filter?.candidateId,
        interviewerId: filter?.interviewerId,
        type: filter?.round === "hr" ? "HR" : filter?.round === "final" ? "Final" : undefined,
      },
    });
    return unwrapResponse(response).map(mapInterview);
  },

  async getInterviewById(id: string): Promise<Interview> {
    const response = await api.get<BackendInterview>(`/interviews/${id}`);
    return mapInterview(unwrapResponse(response));
  },

  async updateInterview(id: string, payload: Partial<ScheduleInterviewPayload>): Promise<Interview> {
    const response = await api.put<BackendInterview>(`/interviews/${id}`, {
      interviewDate: payload.scheduledAt,
      location: payload.location ?? payload.meetingUrl,
    });
    return mapInterview(unwrapResponse(response));
  },

  async submitResult(
    id: string,
    payload: SubmitInterviewEvaluationPayload
  ): Promise<Interview> {
    const response = await api.patch<BackendInterview>(`/interviews/${id}/evaluate`, {
      technicalScore: payload.technicalScore,
      softScore: payload.softSkillScore,
      attitudeScore: payload.attitudeScore,
      feedback: payload.comment,
      result: payload.result === "passed" ? "Pass" : "Fail",
    });
    return mapInterview(unwrapResponse(response));
  },
};
