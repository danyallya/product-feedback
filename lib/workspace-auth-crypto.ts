import { createHash, createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const PASSWORD_KEY_BYTES = 64;
export const OWNER_SESSION_COOKIE = "morrow_owner_session";
export const OWNER_SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

export type OwnerPasswordRecord = { salt: string; hash: string };
export type OwnerSessionClaims = { workspaceId: string; expiresAt: number };

function derivePassword(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, PASSWORD_KEY_BYTES, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey as Buffer);
    });
  });
}

export async function hashOwnerPassword(password: string): Promise<OwnerPasswordRecord> {
  const salt = randomBytes(16).toString("base64url");
  const hash = await derivePassword(password, salt);
  return { salt, hash: hash.toString("base64url") };
}

export async function verifyOwnerPassword(
  password: string,
  record: OwnerPasswordRecord,
): Promise<boolean> {
  try {
    const expected = Buffer.from(record.hash, "base64url");
    if (expected.length !== PASSWORD_KEY_BYTES) return false;
    const actual = await derivePassword(password, record.salt);
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export function getSessionSecret(): string | null {
  const secret = process.env.MORROW_SESSION_SECRET?.trim();
  return secret && Buffer.byteLength(secret) >= 32 ? secret : null;
}

export function secretsMatch(value: string, expected: string): boolean {
  const valueHash = createHash("sha256").update(value).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  return timingSafeEqual(valueHash, expectedHash);
}

function sign(payload: string, secret: string): Buffer {
  return createHmac("sha256", secret).update(payload).digest();
}

export function createOwnerSessionToken(
  workspaceId: string,
  secret: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): string {
  const claims: OwnerSessionClaims = {
    workspaceId,
    expiresAt: nowSeconds + OWNER_SESSION_MAX_AGE_SECONDS,
  };
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  return `${payload}.${sign(payload, secret).toString("base64url")}`;
}

export function verifyOwnerSessionToken(
  token: string,
  secret: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): OwnerSessionClaims | null {
  const [payload, suppliedSignature, extra] = token.split(".");
  if (!payload || !suppliedSignature || extra !== undefined) return null;

  try {
    const expectedSignature = sign(payload, secret);
    const actualSignature = Buffer.from(suppliedSignature, "base64url");
    if (actualSignature.length !== expectedSignature.length || !timingSafeEqual(actualSignature, expectedSignature)) {
      return null;
    }

    const value = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<OwnerSessionClaims>;
    if (typeof value.workspaceId !== "string" || !value.workspaceId) return null;
    if (typeof value.expiresAt !== "number" || !Number.isInteger(value.expiresAt) || value.expiresAt <= nowSeconds) {
      return null;
    }
    return { workspaceId: value.workspaceId, expiresAt: value.expiresAt };
  } catch {
    return null;
  }
}
