import api, { unwrapResponse } from "./api";
import type {
  ProbationEvaluation,
  Probationer,
  ProbationerFilter,
  ProbationStatus,
  ReviewProbationEvaluationPayload,
  SubmitProbationEvaluationPayload,
} from "@/types";

type BackendProbation = {
  probationId: number;
  offerId: number;
  probationerId: number;
  supervisorId?: number | null;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
  probationer?: { fullName: string; email: string };
  supervisor?: { fullName: string; email: string } | null;
  offer?: {
    application?: {
      jobPosting?: {
        jobId: number;
        title: string;
        deptName: string;
      };
      candidate?: {
        phone?: string;
      };
    };
  };
  evaluation?: BackendEvaluation | null;
};

type UpdateProbationPayload = {
  supervisorId?: string;
  startDate?: string;
  endDate?: string;
};

const toBackendDate = (value?: string) => {
  if (!value) return undefined;
  const date = value.includes("T") ? new Date(value) : new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

type BackendEvaluation = {
  evalId: number;
  probationId: number;
  submittedBy: number;
  approvedBy?: number | null;
  kpiScore?: number | null;
  comment?: string | null;
  recommendation?: string | null;
  directorNote?: string | null;
  status: string;
  submittedAt?: string | null;
  approvedAt?: string | null;
};

const statusMap: Record<string, ProbationStatus> = {
  Ongoing: "probating",
  PendingEvaluation: "pending_evaluation",
  PendingApproval: "pending_evaluation",
  Pass: "passed",
  Fail: "failed",
};

const backendStatusMap: Record<ProbationStatus, string> = {
  probating: "Ongoing",
  pending_evaluation: "PendingApproval",
  passed: "Pass",
  failed: "Fail",
};

const mapEvaluation = (evaluation: BackendEvaluation): ProbationEvaluation => ({
  id: String(evaluation.evalId),
  probationerId: String(evaluation.probationId),
  evaluatedBy: String(evaluation.submittedBy),
  kpiScore: evaluation.kpiScore ?? 0,
  comment: evaluation.comment ?? "",
  recommendation: evaluation.recommendation === "Fail" ? "terminate" : "sign_contract",
  submittedAt: evaluation.submittedAt ?? "",
  directorDecision:
    evaluation.status === "Approved"
      ? "approved"
      : evaluation.status === "Rejected"
        ? "rejected"
        : undefined,
  directorComment: evaluation.directorNote ?? undefined,
  directorReviewedAt: evaluation.approvedAt ?? undefined,
});

const mapProbationer = (probation: BackendProbation): Probationer => ({
  id: String(probation.probationId),
  userId: String(probation.probationerId),
  candidateId: "",
  offerId: String(probation.offerId),
  fullName: probation.probationer?.fullName ?? "Không rõ nhân viên",
  email: probation.probationer?.email ?? "",
  phone: probation.offer?.application?.candidate?.phone ?? "",
  jobId: String(probation.offer?.application?.jobPosting?.jobId ?? ""),
  jobTitle: probation.offer?.application?.jobPosting?.title ?? "Không rõ vị trí",
  department: probation.offer?.application?.jobPosting?.deptName ?? "",
  startDate: probation.startDate,
  endDate: probation.endDate,
  supervisorId: String(probation.supervisorId ?? ""),
  supervisorName: probation.supervisor?.fullName ?? "",
  status: statusMap[probation.status] ?? "probating",
  evaluationId: probation.evaluation ? String(probation.evaluation.evalId) : undefined,
  evaluation: probation.evaluation ? mapEvaluation(probation.evaluation) : undefined,
  createdAt: probation.createdAt,
  updatedAt: probation.createdAt,
});

export const probationService = {
  async getEndingSoon(): Promise<Probationer[]> {
    const response = await api.get<BackendProbation[]>("/probations/ending-soon");
    return unwrapResponse(response).map(mapProbationer);
  },

  async getProbationers(filter?: ProbationerFilter): Promise<Probationer[]> {
    const response = await api.get<BackendProbation[]>("/probations", {
      params: {
        status: filter?.status ? backendStatusMap[filter.status] : undefined,
      },
    });
    return unwrapResponse(response).map(mapProbationer);
  },

  async getProbationerById(id: string): Promise<Probationer> {
    const response = await api.get<BackendProbation>(`/probations/${id}`);
    return mapProbationer(unwrapResponse(response));
  },

  async getMyProbation(): Promise<Probationer> {
    const probations = await this.getProbationers();
    const probation = probations[0];
    if (!probation) throw new Error("Probation not found");
    return probation;
  },

  async updateProbation(id: string, payload: UpdateProbationPayload): Promise<Probationer> {
    const response = await api.put<BackendProbation>(`/probations/${id}`, {
      supervisorId: payload.supervisorId ? Number(payload.supervisorId) : undefined,
      startDate: toBackendDate(payload.startDate),
      endDate: toBackendDate(payload.endDate),
    });
    return mapProbationer(unwrapResponse(response));
  },

  async submitEvaluation(
    payload: SubmitProbationEvaluationPayload
  ): Promise<ProbationEvaluation> {
    throw new Error(`Use submitEvaluationForProbation(probationId, payload) instead: ${payload.comment}`);
  },

  async submitEvaluationForProbation(
    probationId: string,
    payload: SubmitProbationEvaluationPayload
  ): Promise<ProbationEvaluation> {
    const response = await api.put<BackendEvaluation>(`/probations/${probationId}/evaluate`, {
      kpiScore: payload.kpiScore,
      comment: payload.comment,
      recommendation: payload.recommendation === "terminate" ? "Fail" : "Pass",
      isSubmit: true,
    });
    return mapEvaluation(unwrapResponse(response));
  },

  async reviewEvaluation(
    id: string,
    payload: ReviewProbationEvaluationPayload
  ): Promise<ProbationEvaluation> {
    const response = await api.patch<BackendEvaluation>(`/probations/${id}/approve`, {
      status: payload.decision === "approved" ? "Approved" : "Rejected",
      directorNote: payload.comment,
    });
    return mapEvaluation(unwrapResponse(response));
  },
};
