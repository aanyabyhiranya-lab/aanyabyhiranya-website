import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE_NAME = "admin_session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function createAdminSessionCookieValue(secret: string): string {
  const expires = Date.now() + ADMIN_SESSION_MAX_AGE_SECONDS * 1000;
  const payload = String(expires);
  return `${payload}.${sign(payload, secret)}`;
}

export function verifyAdminSessionCookieValue(value: string | undefined, secret: string): boolean {
  if (!value) return false;
  const [payload, sig] = value.split(".");
  if (!payload || !sig) return false;

  const expected = sign(payload, secret);
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length) return false;
  if (!timingSafeEqual(sigBuf, expectedBuf)) return false;

  return Number(payload) > Date.now();
}
