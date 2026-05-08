import axios from "axios";
import type { AxiosResponse } from "axios";

// Sử dụng axios instance riêng KHÔNG có auth token (public API)
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api/v1";

const publicApi = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

type ApiResponse<T> = { success: boolean; data: T; message: string };

const unwrap = <T>(res: AxiosResponse<ApiResponse<T> | T>): T => {
  const payload = res.data;
  if (typeof payload === "object" && payload !== null && "data" in payload && "success" in payload) {
    return (payload as ApiResponse<T>).data;
  }
  return payload as T;
};

export type OfferInfo = {
  candidateName: string;
  jobTitle: string;
  baseSalary: number;
  allowance: number;
  startDate: string;
  status: string;
};

export type OfferResponseResult = {
  decision: "accepted" | "declined";
};

export const offerResponseService = {
  async getOfferInfo(token: string): Promise<OfferInfo> {
    const res = await publicApi.get<ApiResponse<OfferInfo>>(`/offer-response/${token}`);
    return unwrap(res);
  },

  async acceptOffer(token: string): Promise<OfferResponseResult> {
    const res = await publicApi.post<ApiResponse<OfferResponseResult>>(`/offer-response/${token}/accept`);
    return unwrap(res);
  },

  async declineOffer(token: string, reason: string): Promise<OfferResponseResult> {
    const res = await publicApi.post<ApiResponse<OfferResponseResult>>(`/offer-response/${token}/decline`, { reason });
    return unwrap(res);
  },
};
