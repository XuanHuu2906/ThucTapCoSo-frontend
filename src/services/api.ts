import axios from "axios";
import type { AxiosResponse } from "axios";
import { API_URL, AUTH_REFRESH_TOKEN_KEY, AUTH_TOKEN_KEY } from "@/lib/constants";
import type { ApiResponse } from "@/types";

export type ApiParams = Record<string, boolean | number | string | string[] | undefined>;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
    }

    return Promise.reject(error);
  }
);

export const unwrapResponse = <T>(response: AxiosResponse<ApiResponse<T> | T>): T => {
  const payload = response.data;

  if (
    typeof payload === "object" &&
    payload !== null &&
    "data" in payload &&
    "success" in payload
  ) {
    return (payload as ApiResponse<T>).data;
  }

  return payload as T;
};

export default api;
