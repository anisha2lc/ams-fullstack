import { http } from "./http";
import type { LoginResponse, User } from "./types";

export async function login(body: { email: string; password: string }): Promise<LoginResponse> {
  const { data } = await http.post<{ success: boolean; data: LoginResponse }>(
    "/api/auth/login",
    body,
  );
  return data.data;
}

export async function register(body: Record<string, unknown>): Promise<User> {
  const { data } = await http.post<{ success: boolean; data: User }>(
    "/api/auth/register",
    body,
  );
  return data.data;
}

export async function fetchMe(): Promise<User> {
  const { data } = await http.get<{ success: boolean; data: User }>("/api/auth/me");
  return data.data;
}

export async function logoutApi(): Promise<void> {
  await http.post("/api/auth/logout");
}
