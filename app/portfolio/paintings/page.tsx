export const revalidate = 60;
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase-server";
import ArtCard from "../ArtCard";

export const metadata: Metadata = {
  title: "Oil Pastels & Acrylic Art",
  description: "Works on paper and canvas: oil pastels and acrylics, each piece exploring texture, colour, and the quiet stories found in nature.",
};

async function getArtworks() {
  try {
    const supabase = createClient();
    const { data } = await supabase.from("artworks").select("*")
      .in("category", ["Oil Pastels", "Acrylic Art"])
      .order("created_at", { ascending: false });
    return data || [];
  } catch { return []; }
}

export default async function PaintingsPage() {
  const artworks = await getArtworks();
  const oilPastels = artworks.filter((a: any) => a.category === "Oil Pastels");
  const acrylic    = artworks.filter((a: any) => a.category === "Acrylic Art");

  return (
    <div className="bg-beige dark:bg-dark min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-24">

        <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-dark/40 dark:text-beige/40 mb-10">
          <Link href="/portfolio" className="hover:text-forest dark:hover:text-rose transition-colors">Works</Link>
          <span>/</span>
          <span className="text-forest dark:text-beige">Oil Pastels & Acrylic Art</span>
        </div>

        <h1 className="font-script text-5xl md:text-6xl text-forest dark:text-beige mb-4">Oil Pastels & Acrylic Art</h1>
        <p className="text-dark/60 dark:text-beige/60 max-w-xl leading-relaxed mb-20">
          Works on paper and canvas: oil pastels and acrylics, each piece exploring texture, colour, and the quiet stories found in nature.
        </p>

        {/* Oil Pastels */}
        {oilPastels.length > 0 && (
          <section className="mb-24">
            <div className="border-t border-forest/20 dark:border-beige/20 pt-10 mb-12">
              <h2 className="font-script text-3xl md:text-4xl text-forest dark:text-beige mb-2">Oil Pastels</h2>
              <p className="text-sm text-dark/55 dark:text-beige/55">Expressive works on paper: rich texture and vivid colour.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-16">
              {oilPastels.map((art: any, i: number) => (
                <div key={art.id} className={`reveal reveal-delay-${Math.min(i+1,3)}`}>
                  <ArtCard art={art} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Acrylic Art */}
        {acrylic.length > 0 && (
          <section>
            <div className="border-t border-forest/20 dark:border-beige/20 pt-10 mb-12">
              <h2 className="font-script text-3xl md:text-4xl text-forest dark:text-beige mb-2">Acrylic Art</h2>
              <p className="text-sm text-dark/55 dark:text-beige/55">Acrylic paintings on canvas: abstract, nature-influenced, deeply personal.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-16">
              {acrylic.map((art: any, i: number) => (
                <div key={art.id} className={`reveal reveal-delay-${Math.min(i+1,3)}`}>
                  <ArtCard art={art} />
                </div>
              ))}
            </div>
          </section>
        )}

        {artworks.length === 0 && (
          <p className="text-dark/40 dark:text-beige/40">No pieces here yet. Check back soon.</p>
        )}
      </div>
    </div>
  );
}
