import api, { unwrapResponse } from "./api";
import type { CreateOfferPayload, Offer, OfferFilter, OfferStatus } from "@/types";

type DirectorCommentPayload = {
  comment?: string;
};

type BackendOffer = {
  offerId: number;
  appId: number;
  createdBy: number;
  approvedBy?: number | null;
  baseSalary: string | number;
  allowance?: string | number;
  startDate: string;
  status: string;
  directorNote?: string | null;
  declineReason?: string | null;
  createdAt: string;
  application?: {
    candidate?: { candidateId: number; fullName: string; email: string };
    jobPosting?: { jobId: number; title: string; deptName?: string };
  };
};

const statusMap: Record<string, OfferStatus> = {
  Pending: "pending_approval",
  Approved: "approved",
  Sent: "approved",
  Accepted: "accepted",
  Rejected: "rejected",
  Declined: "declined",
};

const backendStatusMap: Record<OfferStatus, string> = {
  pending_approval: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  accepted: "Accepted",
  declined: "Declined",
};

const mapOffer = (offer: BackendOffer): Offer => ({
  id: String(offer.offerId),
  applicationId: String(offer.appId),
  candidateId: String(offer.application?.candidate?.candidateId ?? ""),
  candidateName: offer.application?.candidate?.fullName ?? "Không rõ ứng viên",
  candidateEmail: offer.application?.candidate?.email ?? "",
  jobId: String(offer.application?.jobPosting?.jobId ?? ""),
  jobTitle: offer.application?.jobPosting?.title ?? "Không rõ vị trí",
  baseSalary: Number(offer.baseSalary),
  allowance: Number(offer.allowance ?? 0),
  currency: "VND",
  startDate: offer.startDate,
  probationDays: 60,
  status: statusMap[offer.status] ?? "pending_approval",
  createdBy: String(offer.createdBy),
  reviewedBy: offer.approvedBy ? String(offer.approvedBy) : undefined,
  directorComment: offer.directorNote ?? undefined,
  declineReason: offer.declineReason ?? undefined,
  createdAt: offer.createdAt,
  updatedAt: offer.createdAt,
  department: offer.application?.jobPosting?.deptName ?? "",
});

export const offerService = {
  async createOffer(payload: CreateOfferPayload): Promise<Offer> {
    const response = await api.post<BackendOffer>("/offers", {
      appId: Number(payload.applicationId),
      baseSalary: payload.baseSalary,
      allowance: payload.allowance ?? 0,
      startDate: new Date(payload.startDate).toISOString(),
    });
    return mapOffer(unwrapResponse(response));
  },

  async getOffers(filter?: OfferFilter): Promise<Offer[]> {
    const response = await api.get<BackendOffer[]>("/offers", {
      params: {
        appId: filter?.candidateId,
        status: filter?.status ? backendStatusMap[filter.status] : undefined,
      },
    });
    return unwrapResponse(response).map(mapOffer);
  },

  async approveOffer(id: string, payload?: DirectorCommentPayload): Promise<Offer> {
    const response = await api.patch<BackendOffer>(`/offers/${id}/approve`, {
      status: "Approved",
      directorNote: payload?.comment,
    });
    return mapOffer(unwrapResponse(response));
  },

  async rejectOffer(id: string, payload?: DirectorCommentPayload): Promise<Offer> {
    const response = await api.patch<BackendOffer>(`/offers/${id}/approve`, {
      status: "Rejected",
      directorNote: payload?.comment,
    });
    return mapOffer(unwrapResponse(response));
  },
};
