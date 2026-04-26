import api, { unwrapResponse } from "./api";
import { type BackendApplication } from "./application.service";
import type { Candidate, CandidateFilter } from "@/types";

const mapCandidateFromApplication = (application: BackendApplication): Candidate | null => {
  if (!application.candidate) return null;

  return {
    id: String(application.candidate.candidateId),
    fullName: application.candidate.fullName,
    email: application.candidate.email,
    phone: application.candidate.phone ?? "",
    cvUrl: application.cvFile ?? "",
    createdAt: application.appliedDate,
    updatedAt: application.appliedDate,
  };
};

export const candidateService = {
  async getCandidates(filter?: CandidateFilter): Promise<Candidate[]> {
    const response = await api.get<BackendApplication[]>("/applications", {
      params: { search: filter?.keyword },
    });
    const uniqueCandidates = new Map<string, Candidate>();

    unwrapResponse(response).forEach((application) => {
      const candidate = mapCandidateFromApplication(application);
      if (candidate) {
        uniqueCandidates.set(candidate.id, candidate);
      }
    });

    return Array.from(uniqueCandidates.values());
  },

  async getCandidateById(id: string): Promise<Candidate> {
    const candidates = await this.getCandidates();
    const candidate = candidates.find((item) => item.id === id);

    if (!candidate) {
      throw new Error("Candidate not found");
    }

    return candidate;
  },
};
