export const revalidate = 60;
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase-server";
import ArtCard from "../../ArtCard";

export const metadata: Metadata = {
  title: "Resin Jewellery",
  description: "Delicate wearable pieces: pressed flowers and pearls preserved in resin, each one a small world held in your hands.",
};

async function getByCategory(cat: string) {
  try {
    const supabase = createClient();
    const { data } = await supabase.from("artworks").select("*")
      .eq("category", cat).order("created_at", { ascending: false });
    return data || [];
  } catch { return []; }
}

export default async function ResinJewelleryPage() {
  const flower = await getByCategory("Resin / Jewellery / Flower");
  const pearl  = await getByCategory("Resin / Jewellery / Pearl");

  return (
    <div className="bg-beige dark:bg-dark min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-24">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-dark/40 dark:text-beige/40 mb-10">
          <Link href="/portfolio" className="hover:text-forest dark:hover:text-rose transition-colors">Works</Link>
          <span>/</span>
          <Link href="/portfolio/resin" className="hover:text-forest dark:hover:text-rose transition-colors">Resin Art</Link>
          <span>/</span>
          <span className="text-forest dark:text-beige">Jewellery</span>
        </div>

        <h1 className="font-script text-5xl md:text-6xl text-forest dark:text-beige mb-4">Resin Jewellery</h1>
        <p className="text-dark/60 dark:text-beige/60 max-w-xl leading-relaxed mb-16">
          Delicate wearable pieces: pressed flowers and pearls preserved in resin, each one a small world held in your hands.
        </p>

        {/* Subcategory cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
          <Link href="/portfolio/resin/jewellery/flower"
            className="group relative overflow-hidden aspect-[4/3] bg-forest/5 dark:bg-forest/10 border border-forest/15 dark:border-beige/10 hover:border-forest transition-all duration-300">
            <div className="absolute inset-0 flex flex-col justify-end p-8">
              <p className="text-xs tracking-widest uppercase text-dark/40 dark:text-beige/40 mb-2">{flower.length ? `${flower.length} piece${flower.length === 1 ? "" : "s"}` : "New"}</p>
              <h2 className="font-script text-3xl md:text-4xl text-forest dark:text-beige mb-2 group-hover:translate-x-1 transition-transform duration-300">
                Flower
              </h2>
              <p className="text-sm text-dark/55 dark:text-beige/55 max-w-xs">
                Pressed flowers preserved in resin: rings, pendants, earrings, and more.
              </p>
              <span className="mt-4 text-xs tracking-widest uppercase text-forest dark:text-rose">Explore →</span>
            </div>
          </Link>

          <Link href="/portfolio/resin/jewellery/pearl"
            className="group relative overflow-hidden aspect-[4/3] bg-rose/5 dark:bg-rose/10 border border-rose/15 dark:border-beige/10 hover:border-rose transition-all duration-300">
            <div className="absolute inset-0 flex flex-col justify-end p-8">
              <p className="text-xs tracking-widest uppercase text-dark/40 dark:text-beige/40 mb-2">{pearl.length ? `${pearl.length} piece${pearl.length === 1 ? "" : "s"}` : "New"}</p>
              <h2 className="font-script text-3xl md:text-4xl text-forest dark:text-beige mb-2 group-hover:translate-x-1 transition-transform duration-300">
                Pearl
              </h2>
              <p className="text-sm text-dark/55 dark:text-beige/55 max-w-xs">
                Pearl and resin combinations: elegant, minimal jewellery with a natural soul.
              </p>
              <span className="mt-4 text-xs tracking-widest uppercase text-rose">Explore →</span>
            </div>
          </Link>
        </div>

        {flower.length > 0 && (
          <section className="mb-20">
            <div className="flex items-end justify-between mb-8">
              <h3 className="font-serif text-2xl text-forest dark:text-beige">Flower Collection</h3>
              <Link href="/portfolio/resin/jewellery/flower" className="text-xs tracking-widest uppercase text-forest dark:text-rose hover:opacity-70">See All →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-16">
              {flower.slice(0, 3).map((art: any) => <ArtCard key={art.id} art={art} />)}
            </div>
          </section>
        )}

        {pearl.length > 0 && (
          <section>
            <div className="flex items-end justify-between mb-8">
              <h3 className="font-serif text-2xl text-forest dark:text-beige">Pearl Collection</h3>
              <Link href="/portfolio/resin/jewellery/pearl" className="text-xs tracking-widest uppercase text-forest dark:text-rose hover:opacity-70">See All →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-16">
              {pearl.slice(0, 3).map((art: any) => <ArtCard key={art.id} art={art} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
