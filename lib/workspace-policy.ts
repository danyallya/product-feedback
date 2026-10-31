export type WorkspaceVisibility = "public" | "private";

export type WorkspaceSetupInput = {
  name: string;
  slug: string;
  password: string;
  visibility: WorkspaceVisibility;
};

export type WorkspaceSettingsInput = {
  name: string;
  visibility: WorkspaceVisibility;
};

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

export function isValidWorkspaceSlug(value: string): boolean {
  return value.length >= 3 && value.length <= 48 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

export function parseWorkspaceSetupInput(value: unknown): WorkspaceSetupInput | null {
  const input = record(value);
  if (!input) return null;

  const name = typeof input.name === "string" ? input.name.trim() : "";
  const slug = typeof input.slug === "string" ? input.slug.trim().toLowerCase() : "";
  const password = typeof input.password === "string" ? input.password : "";
  const visibility = input.visibility;

  if (!name || name.length > 80 || !isValidWorkspaceSlug(slug)) return null;
  if (password.length < 12 || password.length > 200) return null;
  if (visibility !== "public" && visibility !== "private") return null;

  return { name, slug, password, visibility };
}

export function parseWorkspaceSettingsInput(value: unknown): WorkspaceSettingsInput | null {
  const input = record(value);
  if (!input) return null;

  const name = typeof input.name === "string" ? input.name.trim() : "";
  const visibility = input.visibility;
  if (!name || name.length > 80 || (visibility !== "public" && visibility !== "private")) return null;

  return { name, visibility };
}

export function canManageWorkspace(sessionWorkspaceId: string | null, workspaceId: string): boolean {
  return sessionWorkspaceId !== null && sessionWorkspaceId === workspaceId;
}

export function canViewWorkspace(
  visibility: WorkspaceVisibility,
  sessionWorkspaceId: string | null,
  workspaceId: string,
): boolean {
  return visibility === "public" || canManageWorkspace(sessionWorkspaceId, workspaceId);
}

export function isSameOriginRequest(request: Pick<Request, "url" | "headers">): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}
