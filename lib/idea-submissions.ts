import { createHmac, randomBytes } from "node:crypto";

export const IDEA_VISITOR_COOKIE = "morrow_idea_visitor";
export const IDEA_SUBMISSION_LIMIT = 3;
export const IDEA_SUBMISSION_WINDOW_SECONDS = 10 * 60;
export const IDEA_VISITOR_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export type IdeaSubmissionInput = {
  title: string;
  description: string;
  category: "Workflow" | "Workspace" | "Accessibility" | "Notifications" | "Other";
};

const categories = ["Workflow", "Workspace", "Accessibility", "Notifications", "Other"] as const;

export function parseIdeaSubmission(value: unknown): IdeaSubmissionInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (typeof input.title !== "string" || typeof input.description !== "string" || typeof input.category !== "string") return null;
  const title = input.title.trim();
  const description = input.description.trim();
  if (title.length < 3 || title.length > 120 || description.length < 10 || description.length > 2000) return null;
  if (!(categories as readonly string[]).includes(input.category)) return null;
  return { title, description, category: input.category as IdeaSubmissionInput["category"] };
}

export function createIdeaVisitorToken(): string {
  return randomBytes(32).toString("base64url");
}

export function getIdeaRateBucketKey(token: string, secret: string, nowSeconds = Math.floor(Date.now() / 1000)): string {
  const window = Math.floor(nowSeconds / IDEA_SUBMISSION_WINDOW_SECONDS);
  const identity = createHmac("sha256", secret).update(token).digest("hex");
  return `${identity}:${window}`;
}

export function isValidIdeaVisitorToken(token: string | undefined): token is string {
  return typeof token === "string" && /^[A-Za-z0-9_-]{43}$/.test(token);
}
