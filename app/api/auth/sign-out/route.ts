import { NextResponse } from "next/server";
import { OWNER_SESSION_COOKIE } from "@/lib/workspace-auth-crypto";
import { isSameOriginRequest } from "@/lib/workspace-policy";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "This request could not be verified." }, { status: 403 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(OWNER_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
