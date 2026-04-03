import type { UserRole } from "@/api/types";

export function canManageUsers(role: UserRole | undefined): boolean {
  return role === "super_admin" || role === "artist_manager";
}

/** Create/update/delete artists, songs, CSV import/export */
export function canMutateArtists(role: UserRole | undefined): boolean {
  return role === "artist_manager" || role === "super_admin";
}

export function canViewArtists(role: UserRole | undefined): boolean {
  return role === "super_admin" || role === "artist_manager";
}
