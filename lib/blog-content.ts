export type TextBlock = { id: string; type: "text"; content: string };
export type ImageBlock = { id: string; type: "image"; url: string; caption: string };
export type Block = TextBlock | ImageBlock;

const ALLOWED_IMAGE_HOSTS = ["supabase.co", "images.unsplash.com"];

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isSafeImageUrl(url: string): boolean {
  if (url.startsWith("data:image/")) return true;
  try {
    const u = new URL(url);
    return u.protocol === "https:" && ALLOWED_IMAGE_HOSTS.some(h => u.hostname.endsWith(h));
  } catch {
    return false;
  }
}

// Authoritative HTML builder — always run server-side on data about to be stored.
// Escapes all user-typed text and validates image URLs, so stored blog_posts.content
// can never contain attacker-controlled markup even if a client sends something malicious.
export function blocksToHtml(blocks: Block[]): string {
  return blocks
    .map(b => {
      if (b.type === "text") {
        const escaped = escapeHtml(b.content || "").trim();
        return escaped ? `<p>${escaped}</p>` : "";
      }
      if (!isSafeImageUrl(b.url)) return "";
      const caption = escapeHtml(b.caption || "");
      return `<figure><img src="${b.url}" alt="${caption}" style="max-width:100%;border-radius:8px"/>${
        caption ? `<figcaption>${caption}</figcaption>` : ""
      }</figure>`;
    })
    .filter(Boolean)
    .join("\n");
}
