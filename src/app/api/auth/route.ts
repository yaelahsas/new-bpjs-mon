import { NextRequest, NextResponse } from "next/server";
import {
  verifyPassword,
  createSession,
  validateSession,
  deleteSession,
  getSessionCookieName,
} from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(getSessionCookieName())?.value;
  if (token && validateSession(token)) {
    return NextResponse.json({ authenticated: true });
  }
  return NextResponse.json({ authenticated: false });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { password } = body;

  if (!password || !verifyPassword(password)) {
    return NextResponse.json(
      { success: false, error: "Invalid password" },
      { status: 401 }
    );
  }

  const token = createSession();
  const proto = req.headers.get("x-forwarded-proto");
  const isSecure = proto === "https" || (!proto && process.env.NODE_ENV === "production");
  const res = NextResponse.json({ success: true, token });
  res.cookies.set(getSessionCookieName(), token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
    maxAge: 24 * 60 * 60,
  });

  return res;
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(getSessionCookieName())?.value;
  if (token) {
    deleteSession(token);
  }
  const res = NextResponse.json({ success: true });
  res.cookies.delete(getSessionCookieName());
  return res;
}
