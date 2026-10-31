"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type WorkspaceAccessFormProps = {
  mode: "setup" | "sign-in";
  initialSlug?: string;
};

export function WorkspaceAccessForm({ mode, initialSlug = "" }: WorkspaceAccessFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isSetup = mode === "setup";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const values = new FormData(event.currentTarget);
    const payload = Object.fromEntries(values.entries());
    try {
      const response = await fetch(isSetup ? "/api/workspaces/setup" : "/api/auth/sign-in", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json() as { slug?: string; error?: string };
      if (!response.ok || !result.slug) {
        setError(result.error || "The request could not be completed. Try again.");
        return;
      }
      router.push(`/w/${encodeURIComponent(result.slug)}`);
      router.refresh();
    } catch {
      setError("The server could not be reached. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return <form className="access-form" onSubmit={submit}>
    {isSetup ? <>
      <label htmlFor="workspace-name">Workspace name</label>
      <input id="workspace-name" name="name" required maxLength={80} autoComplete="organization" />
      <label htmlFor="workspace-slug">Workspace address</label>
      <div className="slug-input"><span>/w/</span><input id="workspace-slug" name="slug" required minLength={3} maxLength={48} pattern="[a-z0-9]+(-[a-z0-9]+)*" autoCapitalize="none" autoComplete="url" aria-describedby="slug-help" /></div>
      <small id="slug-help">Use lowercase letters, numbers and single hyphens.</small>
      <label htmlFor="owner-password">Owner password</label>
      <input id="owner-password" name="password" type="password" required minLength={12} maxLength={200} autoComplete="new-password" />
      <small>Use at least 12 characters. Store it somewhere safe.</small>
      <label htmlFor="workspace-visibility">Who can view this workspace?</label>
      <select id="workspace-visibility" name="visibility" defaultValue="public">
        <option value="public">Public — anyone with the link</option>
        <option value="private">Private — owner only</option>
      </select>
      <label htmlFor="setup-token">One-time setup key</label>
      <input id="setup-token" name="setupToken" type="password" required autoComplete="off" />
      <small>Read MORROW_SETUP_TOKEN from your local server environment.</small>
    </> : <>
      <label htmlFor="workspace-slug">Workspace address</label>
      <div className="slug-input"><span>/w/</span><input id="workspace-slug" name="slug" required minLength={3} maxLength={48} autoCapitalize="none" autoComplete="username" defaultValue={initialSlug} /></div>
      <label htmlFor="owner-password">Owner password</label>
      <input id="owner-password" name="password" type="password" required maxLength={200} autoComplete="current-password" />
    </>}
    {error && <p className="access-error" role="alert">{error}</p>}
    <button className="access-submit" type="submit" disabled={busy}>{busy ? "Working…" : isSetup ? "Create workspace" : "Sign in"}</button>
  </form>;
}
