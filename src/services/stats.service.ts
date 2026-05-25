import api, { unwrapResponse } from "./api";
import type { AxiosResponse } from "axios";

export type FunnelItem = { name: string; value: number; fill: string };
export type MonthlyItem = { month: string; total: number; hired: number };
export type DeptItem = { name: string; value: number };
export type GrowthInfo = { pct: string; positive: boolean };

export type RecruitmentStats = {
  totalApplications: number;
  hiredCount: number;
  hiringRate: string;
  avgTimeToHire: number | null;
  funnel: FunnelItem[];
  monthlyTrend: MonthlyItem[];
  deptBreakdown: DeptItem[];
  growth: GrowthInfo;
  uniqueJobs: string[];
};

type OverviewStats = {
  openJobs: number;
  pendingOffers: number;
  acceptedOffers: number;
  activeProbations: number;
  passedProbations: number;
  totalJobs: number;
  totalOffers: number;
  totalProbations: number;
};

type MonthlyHireItem = { month: string; joined: number; left: number };

export type DirectorStats = {
  overview: OverviewStats;
  monthlyHires: MonthlyHireItem[];
  departments: DeptItem[];
  offersByDepartment: DeptItem[];
};

export const statsService = {
  /** UC-15: Lấy thống kê tuyển dụng cho Recruiter */
  async getRecruitmentStats(params?: {
    timeFilter?: string;
    jobFilter?: string;
    deptFilter?: string;
  }): Promise<RecruitmentStats> {
    const res = await api.get<
      any,
      AxiosResponse<{ success: boolean; data: RecruitmentStats; message: string }>
    >("/stats/recruitment", { params });
    return unwrapResponse(res);
  },

  /** UC-16: Lấy thống kê tổng hợp cho Director */
  async getDirectorStats(params?: { deptFilter?: string }): Promise<DirectorStats> {
    const res = await api.get<
      any,
      AxiosResponse<{ success: boolean; data: DirectorStats; message: string }>
    >("/stats/director", { params });
    return unwrapResponse(res);
  },
};
