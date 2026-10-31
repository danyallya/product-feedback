import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { workspaces } from "@/db/schema";
import { db } from "@/lib/db";
import { getOwnerSession } from "@/lib/workspace-session";
import { isSameOriginRequest, parseWorkspaceSettingsInput } from "@/lib/workspace-policy";

export const runtime = "nodejs";

export async function PATCH(request: Request, context: { params: Promise<{ slug: string }> }) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "This request could not be verified." }, { status: 403 });
  }

  const session = await getOwnerSession();
  if (!session) return NextResponse.json({ error: "Sign in as the workspace owner to continue." }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Check the workspace name and visibility." }, { status: 400 });
  }
  const input = parseWorkspaceSettingsInput(body);
  if (!input) return NextResponse.json({ error: "Check the workspace name and visibility." }, { status: 400 });

  const { slug } = await context.params;
  const [workspace] = await db.select({ id: workspaces.id }).from(workspaces)
    .where(eq(workspaces.slug, slug)).limit(1);
  if (!workspace || workspace.id !== session.workspaceId) {
    return NextResponse.json({ error: "You cannot manage this workspace." }, { status: 403 });
  }

  await db.update(workspaces).set(input).where(eq(workspaces.id, workspace.id));
  return NextResponse.json({ slug, ...input });
}
