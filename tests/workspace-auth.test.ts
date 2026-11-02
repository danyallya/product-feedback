import { describe, expect, it } from "vitest";
import {
  createOwnerSessionToken,
  OWNER_SESSION_MAX_AGE_SECONDS,
  verifyOwnerSessionToken,
} from "../lib/workspace-auth-crypto";
import {
  canManageWorkspace,
  canViewWorkspace,
  isSameOriginRequest,
  isValidWorkspaceSlug,
  parseWorkspaceSettingsInput,
  parseWorkspaceSetupInput,
} from "../lib/workspace-policy";
import {
  createIdeaVisitorToken,
  getIdeaRateBucketKey,
  IDEA_SUBMISSION_LIMIT,
  IDEA_SUBMISSION_WINDOW_SECONDS,
  isValidIdeaVisitorToken,
  parseIdeaSubmission,
} from "../lib/idea-submissions";

const secret = "a-session-secret-with-at-least-32-bytes";

describe("workspace setup and settings validation", () => {
  it("accepts bounded lowercase workspace addresses and rejects ambiguous ones", () => {
    expect(isValidWorkspaceSlug("design-team-2")).toBe(true);
    for (const slug of ["ab", "Two Words", "-leading", "trailing-", "double--dash", "x".repeat(49)]) {
      expect(isValidWorkspaceSlug(slug)).toBe(false);
    }
  });

  it("normalizes setup values and requires a strong password and explicit visibility", () => {
    expect(parseWorkspaceSetupInput({
      name: "  Design Team  ", slug: "Design-Team", password: "correct horse battery staple", visibility: "private",
    })).toEqual({ name: "Design Team", slug: "design-team", password: "correct horse battery staple", visibility: "private" });
    expect(parseWorkspaceSetupInput({ name: "Team", slug: "team", password: "short", visibility: "public" })).toBeNull();
    expect(parseWorkspaceSettingsInput({ name: "Team", visibility: "hidden" })).toBeNull();
  });
});

describe("workspace owner sessions and visibility", () => {
  it("signs an owner session and rejects changed, expired, or malformed tokens", () => {
    const now = 1_800_000_000;
    const token = createOwnerSessionToken("workspace:one", secret, now);
    expect(verifyOwnerSessionToken(token, secret, now)).toEqual({
      workspaceId: "workspace:one",
      expiresAt: now + OWNER_SESSION_MAX_AGE_SECONDS,
    });
    expect(verifyOwnerSessionToken(`${token}x`, secret, now)).toBeNull();
    expect(verifyOwnerSessionToken(token, secret, now + OWNER_SESSION_MAX_AGE_SECONDS)).toBeNull();
    expect(verifyOwnerSessionToken(token, "a-different-secret-with-more-than-32-bytes", now)).toBeNull();
    expect(verifyOwnerSessionToken("not-a-token", secret, now)).toBeNull();
  });

  it("allows public reads and limits private workspaces to their owner session", () => {
    expect(canViewWorkspace("public", null, "workspace:one")).toBe(true);
    expect(canViewWorkspace("private", null, "workspace:one")).toBe(false);
    expect(canViewWorkspace("private", "workspace:one", "workspace:one")).toBe(true);
    expect(canManageWorkspace("workspace:one", "workspace:two")).toBe(false);
  });
});

describe("same-origin mutation guard", () => {
  it("requires a valid Origin matching the request URL", () => {
    expect(isSameOriginRequest(new Request("https://morrow.test/api/auth", { headers: { origin: "https://morrow.test" } }))).toBe(true);
    expect(isSameOriginRequest(new Request("https://morrow.test/api/auth", { headers: { origin: "https://attacker.test" } }))).toBe(false);
    expect(isSameOriginRequest(new Request("https://morrow.test/api/auth"))).toBe(false);
    expect(isSameOriginRequest(new Request("https://morrow.test/api/auth", { headers: { origin: "not an origin" } }))).toBe(false);
  });
});

describe("public idea submission policy", () => {
  it("normalizes valid input and rejects missing, oversized or unsupported fields", () => {
    expect(parseIdeaSubmission({ title: "  Keyboard modes ", description: "  Let teams save accessible board layouts. ", category: "Accessibility" }))
      .toEqual({ title: "Keyboard modes", description: "Let teams save accessible board layouts.", category: "Accessibility" });
    expect(parseIdeaSubmission({ title: "", description: "A sufficiently long description", category: "Other" })).toBeNull();
    expect(parseIdeaSubmission({ title: "Hi", description: "A sufficiently long description", category: "Other" })).toBeNull();
    expect(parseIdeaSubmission({ title: "Good idea", description: "Too short", category: "Other" })).toBeNull();
    expect(parseIdeaSubmission({ title: "x".repeat(121), description: "A sufficiently long description", category: "Other" })).toBeNull();
    expect(parseIdeaSubmission({ title: "Good idea", description: "x".repeat(2001), category: "Other" })).toBeNull();
    expect(parseIdeaSubmission({ title: "Good idea", description: "A sufficiently long description", category: "Executive" })).toBeNull();
  });

  it("uses opaque visitor cookies and deterministic, secret-keyed fixed windows", () => {
    const token = createIdeaVisitorToken();
    const now = 1_800_000_000;
    expect(isValidIdeaVisitorToken(token)).toBe(true);
    expect(isValidIdeaVisitorToken("not-a-token")).toBe(false);
    expect(IDEA_SUBMISSION_LIMIT).toBe(3);
    expect(getIdeaRateBucketKey(token, secret, now)).toBe(getIdeaRateBucketKey(token, secret, now + IDEA_SUBMISSION_WINDOW_SECONDS - 1));
    expect(getIdeaRateBucketKey(token, secret, now)).not.toBe(getIdeaRateBucketKey(token, "a-different-session-secret-longer-than-32-bytes", now));
  });
});
