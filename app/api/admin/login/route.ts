import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSessionCookieValue,
} from "@/lib/admin-session";

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export async function POST(req: NextRequest) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPass = process.env.ADMIN_PASS;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!adminEmail || !adminPass || !secret) {
    return NextResponse.json({ error: "Admin auth not configured" }, { status: 500 });
  }

  const { email, password } = await req.json();
  const emailOk = typeof email === "string" && email.trim() === adminEmail.trim();
  const passOk = typeof password === "string" && safeEqual(password, adminPass);

  if (!emailOk || !passOk) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, createAdminSessionCookieValue(secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  });
  return res;
}
