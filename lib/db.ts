import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@/lib/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const globalForDb = globalThis as unknown as {
  pool: pg.Pool | undefined;
};

export const pool = globalForDb.pool ?? new Pool({ connectionString: process.env.DATABASE_URL });

if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

export const db = drizzle(pool, { schema });
