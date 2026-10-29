import { defineConfig } from "drizzle-kit";

const url = process.env.TURSO_DATABASE_URL?.trim() || "file:./feedback.db";
const authToken = process.env.TURSO_AUTH_TOKEN?.trim() || undefined;

if (!url.startsWith("file:") && !authToken) {
  throw new Error("TURSO_AUTH_TOKEN is required for a remote Morrow database.");
}

export default defineConfig({
  dialect: "turso",
  schema: "./db/schema.ts",
  out: "./drizzle/migrations",
  dbCredentials: { url, authToken },
});
