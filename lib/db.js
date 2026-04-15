import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/shared/schema";

const connectionString = process.env.DATABASE_URL;

// Remove schema parameter from connection string if present (not supported by postgres driver)
const cleanConnectionString = connectionString.replace(/[?&]schema=[^&]*/, '');

const client = postgres(cleanConnectionString);
export const db = drizzle(client, { schema });
