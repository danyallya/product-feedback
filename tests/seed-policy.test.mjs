import { describe, expect, it } from "vitest";
import {
  assertSafeLocalSeedTarget,
  isSafeLocalSeedTarget,
  LOCAL_DEMO_DATABASE_URL,
} from "../scripts/seed-policy.mjs";

describe("Morrow local demo seed boundary", () => {
  it("allows only the dedicated local feedback database", () => {
    expect(isSafeLocalSeedTarget(LOCAL_DEMO_DATABASE_URL)).toBe(true);
    expect(isSafeLocalSeedTarget("libsql://sample.turso.io")).toBe(false);
    expect(isSafeLocalSeedTarget("https://sample.turso.io")).toBe(false);
    expect(isSafeLocalSeedTarget("file:../production.db")).toBe(false);
    expect(isSafeLocalSeedTarget("file:./other.db")).toBe(false);
    expect(isSafeLocalSeedTarget(undefined)).toBe(false);
  });

  it("refuses a remote seed destination", () => {
    expect(() => assertSafeLocalSeedTarget("libsql://sample.turso.io"))
      .toThrow("TURSO_DATABASE_URL must equal file:./feedback.db.");
  });
});
