import axios from "axios";
import type { AxiosResponse } from "axios";

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

export type InterviewInfo = {
  candidateName: string;
  jobTitle: string;
  interviewDate: string;
  location: string | null;
  type: string;
  interviewerName: string;
  status: string;
};

export type InterviewResponseResult = {
  decision: "confirmed" | "declined";
};

export const interviewResponseService = {
  async getInterviewInfo(token: string): Promise<InterviewInfo> {
    const res = await publicApi.get<ApiResponse<InterviewInfo>>(`/interview-confirm/${token}`);
    return unwrap(res);
  },

  async confirmInterview(token: string): Promise<InterviewResponseResult> {
    const res = await publicApi.post<ApiResponse<InterviewResponseResult>>(`/interview-confirm/${token}/confirm`);
    return unwrap(res);
  },

  async declineInterview(token: string): Promise<InterviewResponseResult> {
    const res = await publicApi.post<ApiResponse<InterviewResponseResult>>(`/interview-confirm/${token}/decline`);
    return unwrap(res);
  },
};
