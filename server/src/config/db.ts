import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing in environment variables");
}

const pool = new Pool({
  connectionString,
});

export const query = async <T = unknown>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> => {
  const result = await pool.query(text, params);
  return result.rows as T[];
};

export const queryOne = async <T = unknown>(
  text: string,
  params: unknown[] = [],
): Promise<T | null> => {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
};

export default pool;
