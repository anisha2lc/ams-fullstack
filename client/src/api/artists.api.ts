import { http } from "./http";
import type { Artist, Pagination, Song } from "./types";

export async function listArtists(page: number, limit: number) {
  const { data } = await http.get<{
    success: boolean;
    data: Artist[];
    pagination: Pagination;
  }>("/api/artists", { params: { page, limit } });
  return data;
}

export async function getArtist(id: number) {
  const { data } = await http.get<{ success: boolean; data: Artist }>(`/api/artists/${id}`);
  return data.data;
}

export async function createArtist(body: Record<string, unknown>) {
  const { data } = await http.post<{ success: boolean; data: Artist }>(
    "/api/artists",
    body,
  );
  return data.data;
}

export async function updateArtist(id: number, body: Record<string, unknown>) {
  const { data } = await http.put<{ success: boolean; data: Artist }>(
    `/api/artists/${id}`,
    body,
  );
  return data.data;
}

export async function deleteArtist(id: number): Promise<void> {
  await http.delete(`/api/artists/${id}`);
}

export async function exportArtistsCsv(): Promise<Blob> {
  const { data } = await http.get<Blob>("/api/artists/export", {
    responseType: "blob",
  });
  return data;
}

export async function importArtistsCsv(file: File) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await http.post<{
    success: boolean;
    message?: string;
    data: {
      totalRows: number;
      validRows: number;
      inserted: number;
      failed: number;
      errors: Array<{ row: number; message: string }>;
    };
  }>("/api/artists/import", form);
  return data;
}

export async function listSongs(artistId: number, page: number, limit: number) {
  const { data } = await http.get<{
    success: boolean;
    data: Song[];
    pagination: Pagination;
  }>(`/api/artists/${artistId}/songs`, { params: { page, limit } });
  return data;
}

export async function createSong(artistId: number, body: Record<string, unknown>) {
  const { data } = await http.post<{ success: boolean; data: Song }>(
    `/api/artists/${artistId}/songs`,
    body,
  );
  return data.data;
}

export async function updateSong(
  artistId: number,
  songId: number,
  body: Record<string, unknown>,
) {
  const { data } = await http.put<{ success: boolean; data: Song }>(
    `/api/artists/${artistId}/songs/${songId}`,
    body,
  );
  return data.data;
}

export async function deleteSong(artistId: number, songId: number): Promise<void> {
  await http.delete(`/api/artists/${artistId}/songs/${songId}`);
}
