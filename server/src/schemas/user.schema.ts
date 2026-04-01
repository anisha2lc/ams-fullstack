import { z } from "zod";

export const userCreateSchema = z.object({
  first_name: z.string().trim().min(2).max(100),
  last_name: z.string().trim().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(50),
  phone: z.string().trim().min(8).max(20),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  gender: z.enum(["m", "f", "o"]),
  address: z.string().trim().min(3).max(500),
  role: z.enum(["super_admin", "artist_manager", "artist"]).optional(),
  is_active: z.boolean().optional(),
});

export const userUpdateSchema = userCreateSchema
  .omit({ password: true, email: true })
  .partial();

export const usersPaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export type IUserCreate = z.infer<typeof userCreateSchema>;
export type IUserUpdate = z.infer<typeof userUpdateSchema>;
