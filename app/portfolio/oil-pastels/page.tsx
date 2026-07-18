export const revalidate = 60;
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase-server";
import ArtCard from "../ArtCard";

export const metadata: Metadata = {
  title: "Oil Pastels",
  description: "Expressive oil pastel works on paper: rich texture, vivid colour, and emotional depth.",
};

async function getArtworks() {
  try {
    const supabase = createClient();
    const { data } = await supabase.from("artworks").select("*")
      .eq("category", "Oil Pastels").order("created_at", { ascending: false });
    return data || [];
  } catch { return []; }
}

export default async function OilPastelsPage() {
  const artworks = await getArtworks();
  return (
    <div className="bg-beige dark:bg-dark min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-24">
        <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-dark/40 dark:text-beige/40 mb-10">
          <Link href="/portfolio" className="hover:text-forest dark:hover:text-rose transition-colors">Works</Link>
          <span>/</span>
          <span className="text-forest dark:text-beige">Oil Pastels</span>
        </div>
        <h1 className="font-script text-5xl md:text-6xl text-forest dark:text-beige mb-4">Oil Pastels</h1>
        <p className="text-dark/60 dark:text-beige/60 max-w-xl leading-relaxed mb-16">
          Expressive oil pastel works on paper: rich texture, vivid colour, and emotional depth.
        </p>
        {artworks.length === 0 ? (
          <p className="text-dark/40 dark:text-beige/40">No pieces here yet. Check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-16">
            {artworks.map((art: any, i: number) => (
              <div key={art.id} className={`reveal reveal-delay-${Math.min(i+1,3)}`}>
                <ArtCard art={art} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
