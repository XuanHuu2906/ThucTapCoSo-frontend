import api, { unwrapResponse } from "./api";

export type HiringManagerOption = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
};

type BackendUser = {
  userId: number;
  fullName: string;
  email: string;
  role: string;
  status: string;
};

const mapHiringManager = (user: BackendUser): HiringManagerOption => ({
  id: String(user.userId),
  fullName: user.fullName,
  email: user.email,
  role: user.role,
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
};