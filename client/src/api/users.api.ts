import { http } from "./http";
import type { Pagination, User } from "./types";

export async function listUsers(page: number, limit: number) {
  const { data } = await http.get<{
    success: boolean;
    data: User[];
    pagination: Pagination;
  }>("/api/users", { params: { page, limit } });
  return data;
}

export async function getUser(id: number) {
  const { data } = await http.get<{ success: boolean; data: User }>(`/api/users/${id}`);
  return data.data;
}

export async function createUser(body: Record<string, unknown>) {
  const { data } = await http.post<{ success: boolean; data: User }>("/api/users", body);
  return data.data;
}

export async function updateUser(id: number, body: Record<string, unknown>) {
  const { data } = await http.put<{ success: boolean; data: User }>(
    `/api/users/${id}`,
    body,
  );
  return data.data;
}

export async function deleteUser(id: number): Promise<void> {
  await http.delete(`/api/users/${id}`);
}
