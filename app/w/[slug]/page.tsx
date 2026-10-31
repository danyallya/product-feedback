import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { WorkspaceSettings } from "@/components/workspace-settings";
import { workspaces } from "@/db/schema";
import { db } from "@/lib/db";
import { getOwnerSession } from "@/lib/workspace-session";
import { canManageWorkspace, canViewWorkspace } from "@/lib/workspace-policy";

export const dynamic = "force-dynamic";

export default async function WorkspacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [workspace] = await db.select({
    id: workspaces.id,
    name: workspaces.name,
    slug: workspaces.slug,
    visibility: workspaces.visibility,
  }).from(workspaces).where(eq(workspaces.slug, slug)).limit(1);
  if (!workspace) notFound();

  const session = await getOwnerSession();
  if (!canViewWorkspace(workspace.visibility, session?.workspaceId ?? null, workspace.id)) {
    return <main className="access-page"><section className="access-card">
      <Link className="access-brand" href="/">morrow<span>.</span></Link>
      <p className="section-overline">PRIVATE WORKSPACE</p>
      <h1>This workspace is private</h1>
      <p className="access-intro">Sign in as its owner to view this workspace.</p>
      <Link className="access-submit access-link" href={`/sign-in?workspace=${encodeURIComponent(workspace.slug)}`}>Owner sign in</Link>
      <p className="access-switch"><Link href="/">Back to Morrow preview</Link></p>
    </section></main>;
  }

  const isOwner = canManageWorkspace(session?.workspaceId ?? null, workspace.id);
  return <main className="access-page"><section className="access-card workspace-card">
    <Link className="access-brand" href="/">morrow<span>.</span></Link>
    <p className="section-overline">{isOwner ? "WORKSPACE OWNER" : "PUBLIC WORKSPACE"}</p>
    <h1>{workspace.name}</h1>
    <p className="access-intro">Workspace address: <strong>/w/{workspace.slug}</strong>. Visibility: <strong>{workspace.visibility}</strong>.</p>
    {isOwner ? <WorkspaceSettings slug={workspace.slug} name={workspace.name} visibility={workspace.visibility} /> : <p className="access-note">This workspace is ready. Idea submission and persisted roadmap content are scheduled for Day 05.</p>}
    <p className="access-switch"><Link href="/">Back to Morrow preview</Link></p>
  </section></main>;
}
