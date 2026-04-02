export type UserRole = "super_admin" | "artist_manager" | "artist";

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  dob: string;
  gender: "m" | "f" | "o";
  address: string;
  role: UserRole;
  is_active?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Artist {
  id: number;
  user_id: number | null;
  name: string;
  dob: string;
  gender: "m" | "f" | "o";
  address: string;
  first_release_year: number;
  no_of_albums_released: number;
  created_at: string;
  updated_at: string;
}

export type SongGenre = "rnb" | "country" | "classic" | "rock" | "jazz";

export interface Song {
  id: number;
  artist_id: number;
  title: string;
  album_name: string;
  genre: SongGenre;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
