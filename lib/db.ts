import "server-only";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "@/db/schema";

const databaseUrl = process.env.TURSO_DATABASE_URL?.trim() || "file:./feedback.db";
const authToken = process.env.TURSO_AUTH_TOKEN?.trim() || undefined;

function createDatabase() {
  if (!databaseUrl.startsWith("file:") && !authToken) {
    throw new Error("TURSO_AUTH_TOKEN is required for a remote Morrow database.");
  }

  const client = createClient({ url: databaseUrl, authToken });
  return { client, db: drizzle(client, { schema }) };
}

type MorrowDatabase = ReturnType<typeof createDatabase>;

const globalForDatabase = globalThis as typeof globalThis & {
  morrowDatabase?: MorrowDatabase;
};

const database = globalForDatabase.morrowDatabase ?? createDatabase();

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.morrowDatabase = database;
}

export const db = database.db;
