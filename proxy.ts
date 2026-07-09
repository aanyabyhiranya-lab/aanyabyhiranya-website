import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminSessionCookieValue } from "@/lib/admin-session";

export function proxy(req: NextRequest) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const cookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const authed = !!secret && verifyAdminSessionCookieValue(cookie, secret);

  if (!authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/dashboard",
    "/admin/artworks/:path*",
    "/admin/blog/:path*",
    "/admin/orders/:path*",
  ],
};
