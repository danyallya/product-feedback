import { eq, lt, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ideas, ideaSubmissionLimits, workspaces } from "@/db/schema";
import { db } from "@/lib/db";
import {
  createIdeaVisitorToken,
  getIdeaRateBucketKey,
  IDEA_SUBMISSION_LIMIT,
  IDEA_SUBMISSION_WINDOW_SECONDS,
  IDEA_VISITOR_COOKIE,
  IDEA_VISITOR_MAX_AGE_SECONDS,
  isValidIdeaVisitorToken,
  parseIdeaSubmission,
} from "@/lib/idea-submissions";
import { getSessionSecret } from "@/lib/workspace-auth-crypto";
import { isSameOriginRequest } from "@/lib/workspace-policy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function readBoundedJson(request: Request): Promise<{ value?: unknown; tooLarge?: boolean }> {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 8192) return { tooLarge: true };
  if (!request.body) return {};
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > 8192) {
      await reader.cancel();
      return { tooLarge: true };
    }
    chunks.push(value);
  }
  const body = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return { value: JSON.parse(new TextDecoder().decode(body)) as unknown };
  } catch {
    return {};
  }
}

export async function POST(request: Request) {
  const noStore = { "Cache-Control": "private, no-store" };
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "This request could not be verified." }, { status: 403, headers: noStore });
  }
  const parsed = await readBoundedJson(request);
  if (parsed.tooLarge) {
    return NextResponse.json({ error: "Keep the idea under 2,000 characters." }, { status: 413, headers: noStore });
  }
  const secret = getSessionSecret();
  if (!secret) {
    return NextResponse.json({ error: "Idea submissions are not configured on this server." }, { status: 503, headers: noStore });
  }

  if (parsed.value === undefined) {
    return NextResponse.json({ error: "Enter an idea and try again." }, { status: 400, headers: noStore });
  }
  const input = parseIdeaSubmission(parsed.value);
  if (!input) {
    return NextResponse.json({ error: "Check the title, details and category, then try again." }, { status: 400, headers: noStore });
  }

  const [workspace] = await db.select({ id: workspaces.id })
    .from(workspaces).where(eq(workspaces.visibility, "public")).limit(1);
  if (!workspace) {
    return NextResponse.json({ error: "This feedback board is not available." }, { status: 404, headers: noStore });
  }

  const cookieToken = request.headers.get("cookie")?.split(";").map((part) => part.trim())
    .find((part) => part.startsWith(`${IDEA_VISITOR_COOKIE}=`))?.slice(IDEA_VISITOR_COOKIE.length + 1);
  const visitorToken = isValidIdeaVisitorToken(cookieToken) ? cookieToken : createIdeaVisitorToken();
  const now = Math.floor(Date.now() / 1000);
  const windowStart = Math.floor(now / IDEA_SUBMISSION_WINDOW_SECONDS) * IDEA_SUBMISSION_WINDOW_SECONDS;
  const bucketKey = getIdeaRateBucketKey(visitorToken, secret, now);

  try {
    const allowed = await db.transaction(async (transaction) => {
      await transaction.delete(ideaSubmissionLimits).where(lt(ideaSubmissionLimits.expiresAt, now));
      const [bucket] = await transaction.insert(ideaSubmissionLimits).values({
        bucketKey,
        attempts: 1,
        expiresAt: windowStart + IDEA_SUBMISSION_WINDOW_SECONDS * 2,
      }).onConflictDoUpdate({
        target: ideaSubmissionLimits.bucketKey,
        set: { attempts: sql`${ideaSubmissionLimits.attempts} + 1` },
      }).returning({ attempts: ideaSubmissionLimits.attempts });
      return (bucket?.attempts ?? IDEA_SUBMISSION_LIMIT + 1) <= IDEA_SUBMISSION_LIMIT;
    });
    if (!allowed) {
      const response = NextResponse.json({ error: "You have shared several ideas recently. Please try again in a few minutes." }, { status: 429, headers: noStore });
      response.cookies.set(IDEA_VISITOR_COOKIE, visitorToken, {
        httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: IDEA_VISITOR_MAX_AGE_SECONDS,
      });
      return response;
    }

    const id = `idea:${crypto.randomUUID()}`;
    const timestamp = new Date(now * 1000);
    await db.insert(ideas).values({
      id,
      workspaceId: workspace.id,
      title: input.title,
      description: input.description,
      category: input.category,
      status: "considering",
      moderationStatus: "pending",
      authorName: "Community member",
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    const response = NextResponse.json({ id, moderationStatus: "pending" }, { status: 202, headers: noStore });
    response.cookies.set(IDEA_VISITOR_COOKIE, visitorToken, {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: IDEA_VISITOR_MAX_AGE_SECONDS,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Your idea could not be saved. Please try again." }, { status: 500, headers: noStore });
  }
}
