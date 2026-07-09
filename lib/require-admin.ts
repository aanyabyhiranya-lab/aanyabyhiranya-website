import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminSessionCookieValue } from "@/lib/admin-session";

// Returns a 401 response if the request isn't an authenticated admin session, otherwise null.
export function requireAdmin(req: NextRequest): NextResponse | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Admin auth not configured" }, { status: 500 });
  }
  const cookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!verifyAdminSessionCookieValue(cookie, secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
