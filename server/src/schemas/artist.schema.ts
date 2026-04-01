import { z } from "zod";

export const artistRegistrationSchema = z.object({
  user_id: z.number().int().positive().optional(),
  name: z.string().trim().min(2, "Name must be 2-100 characters").max(100),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  gender: z.enum(["m", "f", "o"]),
  address: z.string().trim().min(3).max(500),
  first_release_year: z.number().int().min(1900),
  no_of_albums_released: z.number().int().min(0),
});

export const artistUpdateSchema = artistRegistrationSchema.partial();

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const songSchema = z.object({
  title: z.string().trim().min(1).max(255),
  album_name: z.string().trim().min(1).max(255),
  genre: z.enum(["rnb", "country", "classic", "rock", "jazz"]),
});

export const songUpdateSchema = songSchema.partial();

export type IRegisterArtist = z.infer<typeof artistRegistrationSchema>;
export type IUpdateArtist = z.infer<typeof artistUpdateSchema>;
export type ICreateSong = z.infer<typeof songSchema>;
export type IUpdateSong = z.infer<typeof songUpdateSchema>;
