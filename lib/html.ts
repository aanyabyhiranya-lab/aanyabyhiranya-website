export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// For values placed in an email header (Subject, From display name, etc.) —
// strips characters that could be used to inject extra headers or lines.
export function sanitizeHeaderValue(s: string): string {
  return s.replace(/[\r\n]+/g, " ").trim();
}
