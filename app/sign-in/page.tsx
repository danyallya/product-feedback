import Link from "next/link";
import { WorkspaceAccessForm } from "@/components/workspace-access-form";

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ workspace?: string }> }) {
  const { workspace = "" } = await searchParams;
  return <main className="access-page"><section className="access-card">
    <Link className="access-brand" href="/">morrow<span>.</span></Link>
    <p className="section-overline">WORKSPACE OWNER</p>
    <h1>Sign in</h1>
    <p className="access-intro">Enter your workspace address and owner password to manage its visibility and settings.</p>
    <WorkspaceAccessForm mode="sign-in" initialSlug={workspace} />
    <p className="access-switch">First time here? <Link href="/setup">Set up a workspace</Link></p>
  </section></main>;
}
