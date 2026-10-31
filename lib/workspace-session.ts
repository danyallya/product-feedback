import "server-only";
import { cookies } from "next/headers";
import {
  getSessionSecret,
  OWNER_SESSION_COOKIE,
  verifyOwnerSessionToken,
} from "@/lib/workspace-auth-crypto";

export async function getOwnerSession() {
  const secret = getSessionSecret();
  if (!secret) return null;
  const cookieStore = await cookies();
  const token = cookieStore.get(OWNER_SESSION_COOKIE)?.value;
  return token ? verifyOwnerSessionToken(token, secret) : null;
}
