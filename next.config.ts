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
};

export default nextConfig;
