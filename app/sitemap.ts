import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase-server";

const SITE_URL = "https://aanyabyhiranya.com";

const STATIC_ROUTES = [
  "",
  "/portfolio",
  "/portfolio/resin",
  "/portfolio/resin/artifacts",
  "/portfolio/resin/jewellery",
  "/portfolio/resin/jewellery/flower",
  "/portfolio/resin/jewellery/pearl",
  "/portfolio/oil-pastels",
  "/portfolio/acrylic",
  "/portfolio/paintings",
  "/blog",
  "/workshops",
  "/contact",
  "/commission",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient();

  const [{ data: artworks }, { data: posts }] = await Promise.all([
    supabase.from("artworks").select("id, created_at"),
    supabase.from("blog_posts").select("slug, created_at").eq("published", true),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(path => ({
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

  return [...staticEntries, ...artworkEntries, ...postEntries];
}
