import axios, { type AxiosError } from "axios";

const baseURL = import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "";

export const http = axios.create({
  baseURL: baseURL || undefined,
});

const TOKEN_KEY = "ams_token";

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

http.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const body = config.data;
  if (
    body &&
    typeof body === "object" &&
    !(body instanceof FormData) &&
    !(body instanceof URLSearchParams)
  ) {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

export function getErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  const ax = err as AxiosError<{ message?: string }>;
  const msg = ax.response?.data?.message;
  if (typeof msg === "string" && msg.length) return msg;
  if (ax.message) return ax.message;
  return fallback;
}
