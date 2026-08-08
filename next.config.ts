import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "cucpjfuecmwwvraqlqje.supabase.co" },
    ],
  },
  experimental: {
    optimizePackageImports: ["three", "gsap", "lenis"],
  },
  // Oil Pastels and Acrylic Art moved from top-level portfolio routes to living
  // under the new "Paintings" parent category — redirect so old links/SEO don't 404.
  async redirects() {
    return [
      { source: "/portfolio/oil-pastels", destination: "/portfolio/paintings/oil-pastels", permanent: true },
      { source: "/portfolio/acrylic", destination: "/portfolio/paintings/acrylic-art", permanent: true },
    ];
  },
};

export default nextConfig;
