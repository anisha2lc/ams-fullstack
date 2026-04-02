import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters").max(50),
});

export const registerSchema = z.object({
  first_name: z.string().trim().min(2).max(100),
  last_name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  password: z.string().min(6).max(50),
  phone: z.string().trim().min(8).max(20),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  gender: z.enum(["m", "f", "o"]),
  address: z.string().trim().min(3).max(500),
  role: z.enum(["super_admin", "artist_manager", "artist"]).optional(),
});

export const userCreateSchema = z.object({
  first_name: z.string().trim().min(2).max(100),
  last_name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  password: z.string().min(6).max(50),
  phone: z.string().trim().min(8).max(20),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  gender: z.enum(["m", "f", "o"]),
  address: z.string().trim().min(3).max(500),
  role: z.enum(["super_admin", "artist_manager", "artist"]).optional(),
  is_active: z.boolean().optional(),
});

export const userUpdateSchema = z.object({
  first_name: z.string().trim().min(2).max(100).optional(),
  last_name: z.string().trim().min(2).max(100).optional(),
  phone: z.string().trim().min(8).max(20).optional(),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD").optional(),
  gender: z.enum(["m", "f", "o"]).optional(),
  address: z.string().trim().min(3).max(500).optional(),
  role: z.enum(["super_admin", "artist_manager", "artist"]).optional(),
  is_active: z.boolean().optional(),
});

/** Form fields — user_id is optional text that maps to a numeric id */
export const artistFormSchema = z.object({
  user_id: z.string().optional(),
  name: z.string().trim().min(2).max(100),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  gender: z.enum(["m", "f", "o"]),
  address: z.string().trim().min(3).max(500),
  first_release_year: z.coerce.number().int().min(1900),
  no_of_albums_released: z.coerce.number().int().min(0),
});

export type ArtistFormValues = z.infer<typeof artistFormSchema>;

export function toArtistApiPayload(values: ArtistFormValues): Record<string, unknown> {
  const raw = values.user_id?.trim();
  let user_id: number | undefined;
  if (raw && raw.length > 0) {
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) user_id = n;
  }
  const payload: Record<string, unknown> = {
    name: values.name,
    dob: values.dob,
    gender: values.gender,
    address: values.address,
    first_release_year: values.first_release_year,
    no_of_albums_released: values.no_of_albums_released,
  };
  if (user_id !== undefined) payload.user_id = user_id;
  return payload;
}

export const songSchema = z.object({
  title: z.string().trim().min(1).max(255),
  album_name: z.string().trim().min(1).max(255),
  genre: z.enum(["rnb", "country", "classic", "rock", "jazz"]),
});
