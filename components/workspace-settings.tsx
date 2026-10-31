"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function WorkspaceSettings({ slug, name, visibility }: {
  slug: string;
  name: string;
  visibility: "public" | "private";
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaved(false);
    setBusy(true);
    const values = new FormData(event.currentTarget);
    try {
      const response = await fetch(`/api/workspaces/${encodeURIComponent(slug)}/settings`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(Object.fromEntries(values.entries())),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) {
        setError(result.error || "Workspace settings could not be saved.");
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("The server could not be reached. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    setError("");
    try {
      const response = await fetch("/api/auth/sign-out", { method: "POST" });
      if (!response.ok) throw new Error("Sign out failed");
      router.push("/sign-in");
      router.refresh();
    } catch {
      setError("You could not be signed out. Try again.");
    }
  }

  return <>
    <form className="access-form settings-form" onSubmit={save}>
      <label htmlFor="workspace-name">Workspace name</label>
      <input id="workspace-name" name="name" required maxLength={80} defaultValue={name} />
      <label htmlFor="workspace-visibility">Visibility</label>
      <select id="workspace-visibility" name="visibility" defaultValue={visibility}>
        <option value="public">Public — anyone with the link</option>
        <option value="private">Private — owner only</option>
      </select>
      <p className="access-note">Private workspaces require the owner session for every workspace page request. Public previews do not contain private ideas.</p>
      {error && <p className="access-error" role="alert">{error}</p>}
      {saved && <p className="access-success" role="status">Settings saved.</p>}
      <button className="access-submit" type="submit" disabled={busy}>{busy ? "Saving…" : "Save settings"}</button>
    </form>
    <button className="text-action" type="button" onClick={signOut}>Sign out</button>
  </>;
}
