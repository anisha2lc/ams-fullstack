import { z } from "zod";

export const userRegistrationSchema = z.object({
  first_name: z.string().trim().min(2).max(100),
  last_name: z.string().trim().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(50),
  phone: z.string().trim().min(8).max(20),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  gender: z.enum(["m", "f", "o"]),
  address: z.string().trim().min(3).max(500),
  role: z.enum(["super_admin", "artist_manager", "artist"]).optional(),
});

export const userLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(50),
});

export type IUserRegistration = z.infer<typeof userRegistrationSchema>;
export type IUserLogin = z.infer<typeof userLoginSchema>;
