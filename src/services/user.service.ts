import api, { unwrapResponse } from "./api";

export type HiringManagerOption = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  department?: string;
  status: string;
};

type BackendUser = {
  userId: number;
  fullName: string;
  email: string;
  role: string;
  department?: string;
  status: string;
};

const mapHiringManager = (user: BackendUser): HiringManagerOption => ({
  id: String(user.userId),
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  department: user.department,
  status: user.status,
});

export const userService = {
  async getHiringManagers(): Promise<HiringManagerOption[]> {
    const response = await api.get<BackendUser[]>("/users", {
      params: {
        role: "HiringManager",
        status: "Active",
      },
    });

    return unwrapResponse(response).map(mapHiringManager);
  },

  async getDepartments(): Promise<string[]> {
    const response = await api.get<string[]>("/users/departments");
    return unwrapResponse(response);
  },
};