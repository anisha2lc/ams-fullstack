import bcrypt from "bcryptjs";
import { query, queryOne } from "../config/db";
import { IUserCreate, IUserUpdate } from "../schemas/user.schema";

interface UserRow {
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
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SafeUser extends Omit<UserRow, "password"> {}

interface UsersPage {
  data: SafeUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class UsersService {
  private toSafeUser(user: UserRow): SafeUser {
    const { password, ...safeUser } = user;
    return safeUser;
  }

  public async listUsers(page = 1, limit = 10): Promise<UsersPage> {
    const offset = (page - 1) * limit;
    const rows = await query<SafeUser>(
      `SELECT id, first_name, last_name, email, phone, dob, gender, address, role, is_active, created_at, updated_at
       FROM users
       ORDER BY id DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    const totalRow = await queryOne<{ count: string }>(
      "SELECT COUNT(*)::text AS count FROM users",
    );
    const total = Number(totalRow?.count ?? 0);

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public async getUserById(id: string): Promise<SafeUser | null> {
    return queryOne<SafeUser>(
      `SELECT id, first_name, last_name, email, phone, dob, gender, address, role, is_active, created_at, updated_at
       FROM users
       WHERE id = $1`,
      [id],
    );
  }

  public async createUser(user: IUserCreate): Promise<SafeUser> {
    const existing = await queryOne<{ id: number }>(
      "SELECT id FROM users WHERE email = $1",
      [user.email],
    );
    if (existing) {
      throw new Error("Email already in use");
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);

    const created = await queryOne<UserRow>(
      `INSERT INTO users
       (first_name, last_name, email, password, phone, dob, gender, address, role, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
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
        user.role ?? "artist",
        user.is_active ?? true,
      ],
    );

    if (!created) {
      throw new Error("Failed to create user");
    }

    return this.toSafeUser(created);
  }

  public async updateUser(id: string, updateData: IUserUpdate): Promise<SafeUser | null> {
    const existing = await queryOne<UserRow>("SELECT * FROM users WHERE id = $1", [id]);
    if (!existing) {
      return null;
    }

    const updated = await queryOne<SafeUser>(
      `UPDATE users
       SET first_name = $1,
           last_name = $2,
           phone = $3,
           dob = $4,
           gender = $5,
           address = $6,
           role = $7,
           is_active = $8,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING id, first_name, last_name, email, phone, dob, gender, address, role, is_active, created_at, updated_at`,
      [
        updateData.first_name ?? existing.first_name,
        updateData.last_name ?? existing.last_name,
        updateData.phone ?? existing.phone,
        updateData.dob ?? existing.dob,
        updateData.gender ?? existing.gender,
        updateData.address ?? existing.address,
        updateData.role ?? existing.role,
        updateData.is_active ?? existing.is_active,
        id,
      ],
    );

    return updated;
  }

  public async deleteUser(id: string): Promise<boolean> {
    const deleted = await queryOne<{ id: number }>(
      "DELETE FROM users WHERE id = $1 RETURNING id",
      [id],
    );
    return Boolean(deleted);
  }
}

export default UsersService;
