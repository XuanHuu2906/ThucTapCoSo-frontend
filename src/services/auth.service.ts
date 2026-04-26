import api, { unwrapResponse } from "./api";
import type { AccountStatus, AuthResponse, LoginPayload, User, UserRole } from "@/types";

export type RegisterPayload = {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: UserRole;
};

type BackendAuthResponse = Partial<AuthResponse> & {
  token?: string;
  user: BackendUser;
};

type BackendUser = Omit<Partial<User>, "role" | "status"> & {
  userId?: number;
  id?: number | string;
  email: string;
  fullName: string;
  role: string;
  status: string;
  createdAt?: string;
};

const roleMap: Record<string, UserRole> = {
  Recruiter: "recruiter",
  HiringManager: "manager",
  Director: "director",
  Probationer: "probationer",
  recruiter: "recruiter",
  manager: "manager",
  director: "director",
  probationer: "probationer",
};

const statusMap: Record<string, AccountStatus> = {
  Active: "active",
  Inactive: "inactive",
  Locked: "locked",
  active: "active",
  inactive: "inactive",
  locked: "locked",
};

const normalizeUser = (user: BackendUser): User => {
  const createdAt = user.createdAt ?? new Date().toISOString();

  return {
    ...user,
    id: String(user.id ?? user.userId ?? ""),
    email: user.email,
    fullName: user.fullName,
    role: roleMap[user.role] ?? "recruiter",
    status: statusMap[user.status] ?? "active",
    createdAt,
    updatedAt: user.updatedAt ?? createdAt,
  };
};

const normalizeAuthResponse = (payload: BackendAuthResponse): AuthResponse => ({
  user: normalizeUser(payload.user),
  accessToken: payload.accessToken ?? payload.token ?? "",
  refreshToken: payload.refreshToken ?? "",
});

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await api.post<BackendAuthResponse>("/auth/login", payload);
    return normalizeAuthResponse(unwrapResponse(response));
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await api.post<BackendAuthResponse>("/auth/register", payload);
    return normalizeAuthResponse(unwrapResponse(response));
  },

  async getMe(): Promise<User> {
    const response = await api.get<BackendUser>("/auth/me");
    return normalizeUser(unwrapResponse(response));
  },

  logout(): void {
    return undefined;
  },
};
