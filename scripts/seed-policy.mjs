export const LOCAL_DEMO_DATABASE_URL = "file:./feedback.db";

export function isSafeLocalSeedTarget(databaseUrl) {
  return databaseUrl === LOCAL_DEMO_DATABASE_URL;
}

export function assertSafeLocalSeedTarget(databaseUrl) {
  if (!isSafeLocalSeedTarget(databaseUrl)) {
    throw new Error(
      `Refusing to seed: TURSO_DATABASE_URL must equal ${LOCAL_DEMO_DATABASE_URL}.`,
    );
  }
}
