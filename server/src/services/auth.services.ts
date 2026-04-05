import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query, queryOne } from "../config/db";
import { IUserLogin, IUserRegistration } from "../schemas/auth.schemas";

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone: string;
  dob: string;
  gender: "m" | "f" | "o";
  address: string;
  role: "super_admin" | "artist_manager" | "artist";
  created_at: string;
}

class AuthService {
  public async register(user: IUserRegistration): Promise<Omit<User, "password">> {
    const existing = await queryOne<User>("SELECT * FROM users WHERE email = $1", [
      user.email,
    ]);
    if (existing) {
      throw new Error("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);

    const created = await queryOne<User>(
      `INSERT INTO users
      (first_name, last_name, email, password, phone, dob, gender, address, role)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *`,
      [
        user.first_name,
        user.last_name,
        user.email,
        hashedPassword,
        user.phone,
        user.dob,
        user.gender,
        user.address,
        user.role ?? "artist_manager",
      ],
    );

    if (!created) {
      throw new Error("User registration failed");
    }

    if (created.role === "artist") {
      await query(
        `INSERT INTO artists (user_id, name, dob, gender, address, first_release_year, no_of_albums_released)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          created.id,
          `${created.first_name} ${created.last_name}`,
          created.dob,
          created.gender,
          created.address,
          new Date().getFullYear(), // sensible default
          0,
        ],
      );
    }

    const { password, ...safeUser } = created;
    return safeUser;
  }

  public async login(credentials: IUserLogin): Promise<{
    token: string;
    user: Omit<User, "password">;
  }> {
    const user = await queryOne<User>("SELECT * FROM users WHERE email = $1", [
      credentials.email,
    ]);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(credentials.password, user.password);
    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
    }

    const token = jwt.sign({ id: user.id, role: user.role }, secret, {
      expiresIn: "1d",
    });
    const { password, ...safeUser } = user;

    return { token, user: safeUser };
  }

  public async getCurrentUser(userId: number): Promise<Omit<User, "password"> | null> {
    const user = await queryOne<User>(
      "SELECT * FROM users WHERE id = $1 AND is_active = true",
      [userId],
    );
    if (!user) {
      return null;
    }
    const { password, ...safeUser } = user;
    return safeUser;
  }

  public verifyAccessToken(token: string): { id: number; role: User["role"] } | null {
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        return null;
      }
      return jwt.verify(token, secret) as { id: number; role: User["role"] };
    } catch {
      return null;
    }
  }
}

export default AuthService;
