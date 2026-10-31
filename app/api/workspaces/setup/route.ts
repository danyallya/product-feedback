import { and, eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { workspaces } from "@/db/schema";
import { isSameOriginRequest, parseWorkspaceSetupInput } from "@/lib/workspace-policy";
import {
  createOwnerSessionToken,
  getSessionSecret,
  hashOwnerPassword,
  OWNER_SESSION_COOKIE,
  OWNER_SESSION_MAX_AGE_SECONDS,
  secretsMatch,
} from "@/lib/workspace-auth-crypto";

export const runtime = "nodejs";
const SEEDED_WORKSPACE_ID = "workspace:morrow-demo";
const FIRST_WORKSPACE_ID = "workspace:morrow-owner";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "This request could not be verified." }, { status: 403 });
  }

  const setupToken = process.env.MORROW_SETUP_TOKEN?.trim();
  const sessionSecret = getSessionSecret();
  if (!setupToken || !sessionSecret) {
    return NextResponse.json({ error: "Owner setup is not configured on this server." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Enter the workspace details and try again." }, { status: 400 });
  }
  const input = parseWorkspaceSetupInput(body);
  const submittedToken = body && typeof body === "object" && "setupToken" in body && typeof body.setupToken === "string"
    ? body.setupToken.trim()
    : "";
  if (!input || !submittedToken) {
    return NextResponse.json({ error: "Check the workspace name, address, password and setup key." }, { status: 400 });
  }
  if (!secretsMatch(submittedToken, setupToken)) {
    return NextResponse.json({ error: "The setup key is not valid." }, { status: 401 });
  }

  const passwordRecord = await hashOwnerPassword(input.password);
  try {
    const workspace = await db.transaction(async (transaction) => {
      const existing = await transaction.select({
        id: workspaces.id,
        ownerPasswordHash: workspaces.ownerPasswordHash,
      }).from(workspaces).limit(2);

      if (existing.length === 0) {
        const [created] = await transaction.insert(workspaces).values({
          // A stable first-workspace ID makes simultaneous setup attempts race
          // on the primary key, so only one can establish the initial owner.
          id: FIRST_WORKSPACE_ID,
          name: input.name,
          slug: input.slug,
          visibility: input.visibility,
          ownerPasswordSalt: passwordRecord.salt,
          ownerPasswordHash: passwordRecord.hash,
          createdAt: new Date(),
        }).returning({ id: workspaces.id, slug: workspaces.slug });
        return created ?? null;
      }

      if (existing.length !== 1 || existing[0].id !== SEEDED_WORKSPACE_ID || existing[0].ownerPasswordHash !== null) {
        return null;
      }

      const [claimed] = await transaction.update(workspaces).set({
        name: input.name,
        slug: input.slug,
        visibility: input.visibility,
        ownerPasswordSalt: passwordRecord.salt,
        ownerPasswordHash: passwordRecord.hash,
      }).where(and(eq(workspaces.id, SEEDED_WORKSPACE_ID), isNull(workspaces.ownerPasswordHash)))
        .returning({ id: workspaces.id, slug: workspaces.slug });
      return claimed ?? null;
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace setup is already complete. Sign in as its owner." }, { status: 409 });
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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Workspace setup failed.";
    if (/unique|constraint/i.test(message)) {
      return NextResponse.json({ error: "That workspace address is already in use." }, { status: 409 });
    }
    return NextResponse.json({ error: "Workspace setup could not be completed." }, { status: 500 });
  }
}
