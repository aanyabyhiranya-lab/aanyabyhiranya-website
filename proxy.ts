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
    // These two were added after this matcher list, and never added to it —
    // /admin/categories and /admin/workshops rendered for anyone, logged in
    // or not, with no server-side check (their data-fetches were still
    // gated at the API layer, but the page shell itself was not).
    "/admin/categories/:path*",
    "/admin/workshops/:path*",
  ],
};
