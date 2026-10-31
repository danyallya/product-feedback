import Link from "next/link";
import { WorkspaceAccessForm } from "@/components/workspace-access-form";

export default function SetupPage() {
  return <main className="access-page"><section className="access-card">
    <Link className="access-brand" href="/">morrow<span>.</span></Link>
    <p className="section-overline">FIRST WORKSPACE</p>
    <h1>Set up your workspace</h1>
    <p className="access-intro">Create the first workspace and its owner account. Setup is protected by a one-time key configured on the server.</p>
    <WorkspaceAccessForm mode="setup" />
    <p className="access-switch">Already set up? <Link href="/sign-in">Sign in</Link></p>
  </section></main>;
}
