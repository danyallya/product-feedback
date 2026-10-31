import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { workspaces } from "@/db/schema";
import { db } from "@/lib/db";
import {
  getSessionSecret,
  OWNER_SESSION_COOKIE,
  OWNER_SESSION_MAX_AGE_SECONDS,
  verifyOwnerPassword,
  createOwnerSessionToken,
} from "@/lib/workspace-auth-crypto";
import { isSameOriginRequest, isValidWorkspaceSlug } from "@/lib/workspace-policy";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "This request could not be verified." }, { status: 403 });
  }

  const sessionSecret = getSessionSecret();
  if (!sessionSecret) {
    return NextResponse.json({ error: "Owner sign-in is not configured on this server." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Enter the workspace address and password." }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Enter the workspace address and password." }, { status: 400 });
  }

  const values = body as Record<string, unknown>;
  const slug = typeof values.slug === "string" ? values.slug.trim().toLowerCase() : "";
  const password = typeof values.password === "string" ? values.password : "";
  if (!isValidWorkspaceSlug(slug) || !password || password.length > 200) {
    return NextResponse.json({ error: "The workspace address or password is incorrect." }, { status: 401 });
  }

  const [workspace] = await db.select({
    id: workspaces.id,
    slug: workspaces.slug,
    ownerPasswordSalt: workspaces.ownerPasswordSalt,
    ownerPasswordHash: workspaces.ownerPasswordHash,
  }).from(workspaces).where(eq(workspaces.slug, slug)).limit(1);

  const valid = workspace?.ownerPasswordSalt && workspace.ownerPasswordHash
    ? await verifyOwnerPassword(password, {
      salt: workspace.ownerPasswordSalt,
      hash: workspace.ownerPasswordHash,
    })
    : false;
  if (!workspace || !valid) {
    return NextResponse.json({ error: "The workspace address or password is incorrect." }, { status: 401 });
  }

  const token = createOwnerSessionToken(workspace.id, sessionSecret);
  const response = NextResponse.json({ slug: workspace.slug });
  response.cookies.set(OWNER_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: OWNER_SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
