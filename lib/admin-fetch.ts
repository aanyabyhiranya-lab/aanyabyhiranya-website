// Thin fetch wrapper for admin pages: JSON body/headers by default, and bounce to the
// login page on 401 since the session cookie is the actual source of truth (middleware
// re-checks it server-side on every admin page navigation too).
export async function adminFetch(url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  if (res.status === 401) {
    window.location.href = "/admin";
    throw new Error("Unauthorized");
  }
  return res;
}
