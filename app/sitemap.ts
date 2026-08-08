import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase-server";
import { getCategoryTree, flatten } from "@/lib/categories";

const SITE_URL = "https://aanyabyhiranya.com";

const OTHER_ROUTES = [
  "",
  "/blog",
  "/workshops",
  "/contact",
  "/commission",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient();

  const [{ data: artworks }, { data: posts }, { data: workshops }, tree] = await Promise.all([
    supabase.from("artworks").select("id, created_at"),
    supabase.from("blog_posts").select("slug, created_at").eq("published", true),
    supabase.from("workshops").select("id, created_at").eq("published", true),
    getCategoryTree(),
  ]);

  // Category URLs are generated from the live tree, not a hand-maintained list —
  // whatever the admin adds under /admin/categories shows up here automatically.
  const categoryPaths = ["/portfolio", ...flatten(tree).map(n => `/portfolio/${n.path.join("/")}`)];

  const staticEntries: MetadataRoute.Sitemap = [...OTHER_ROUTES, ...categoryPaths].map(path => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const artworkEntries: MetadataRoute.Sitemap = (artworks || []).map(art => ({
    url: `${SITE_URL}/artwork/${art.id}`,
    lastModified: art.created_at,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const postEntries: MetadataRoute.Sitemap = (posts || []).map(post => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.created_at,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const workshopEntries: MetadataRoute.Sitemap = (workshops || []).map(w => ({
    url: `${SITE_URL}/workshops/${w.id}`,
    lastModified: w.created_at,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticEntries, ...artworkEntries, ...postEntries, ...workshopEntries];
}
