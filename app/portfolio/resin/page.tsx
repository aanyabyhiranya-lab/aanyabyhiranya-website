export const revalidate = 60;
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase-server";
import ArtCard from "../ArtCard";

export const metadata: Metadata = {
  title: "Resin Art",
  description: "Handcrafted resin works: from decorative artifacts to wearable jewellery, each piece capturing nature in its most preserved form.",
};

async function getArtworks(category: string) {
  try {
    const supabase = createClient();
    const { data } = await supabase.from("artworks").select("*")
      .ilike("category", `Resin / ${category}%`)
      .order("created_at", { ascending: false });
    return data || [];
  } catch { return []; }
}

export default async function ResinPage() {
  const artifacts = await getArtworks("Artifacts");
  const jewellery = await getArtworks("Jewellery");

  return (
    <div className="bg-beige dark:bg-dark min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-24">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-dark/40 dark:text-beige/40 mb-10">
          <Link href="/portfolio" className="hover:text-forest dark:hover:text-rose transition-colors">Works</Link>
          <span>/</span>
          <span className="text-forest dark:text-beige">Resin Art</span>
        </div>

        <h1 className="font-serif text-5xl md:text-6xl text-forest dark:text-beige mb-4">Resin Art</h1>
        <p className="text-dark/60 dark:text-beige/60 max-w-xl leading-relaxed mb-16">
          Handcrafted resin works: from decorative artifacts to wearable jewellery, each piece capturing nature in its most preserved form.
        </p>

        {/* Subcategory cards — Amazon-style entry points */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
          <Link href="/portfolio/resin/artifacts"
            className="group relative overflow-hidden aspect-[4/3] bg-forest/5 dark:bg-forest/10 border border-forest/15 dark:border-beige/10 hover:border-forest dark:hover:border-rose transition-all duration-300">
            <div className="absolute inset-0 flex flex-col justify-end p-8">
              <p className="text-xs tracking-widest uppercase text-dark/40 dark:text-beige/40 mb-2">
                {artifacts.length ? `${artifacts.length} piece${artifacts.length === 1 ? "" : "s"}` : "New"}
              </p>
              <h2 className="font-serif text-3xl md:text-4xl text-forest dark:text-beige mb-2 group-hover:translate-x-1 transition-transform duration-300">
                Artifacts
              </h2>
              <p className="text-sm text-dark/55 dark:text-beige/55 max-w-xs">
                Decorative resin objects: vases, bowls, and sculptural pieces for the home.
              </p>
              <span className="mt-4 text-xs tracking-widest uppercase text-forest dark:text-rose">
                Explore →
              </span>
            </div>
          </Link>

          <Link href="/portfolio/resin/jewellery"
            className="group relative overflow-hidden aspect-[4/3] bg-rose/5 dark:bg-rose/10 border border-rose/15 dark:border-beige/10 hover:border-rose transition-all duration-300">
            <div className="absolute inset-0 flex flex-col justify-end p-8">
              <p className="text-xs tracking-widest uppercase text-dark/40 dark:text-beige/40 mb-2">
                {jewellery.length ? `${jewellery.length} piece${jewellery.length === 1 ? "" : "s"}` : "New"}
              </p>
              <h2 className="font-serif text-3xl md:text-4xl text-forest dark:text-beige mb-2 group-hover:translate-x-1 transition-transform duration-300">
                Jewellery
              </h2>
              <p className="text-sm text-dark/55 dark:text-beige/55 max-w-xs">
                Wearable resin pieces: flower and pearl collections, each one unique.
              </p>
              <span className="mt-4 text-xs tracking-widest uppercase text-rose">
                Explore →
              </span>
            </div>
          </Link>
        </div>

        {/* Preview of latest from each */}
        {artifacts.length > 0 && (
          <section className="mb-20">
            <div className="flex items-end justify-between mb-8">
              <h3 className="font-serif text-2xl text-forest dark:text-beige">Latest Artifacts</h3>
              <Link href="/portfolio/resin/artifacts" className="text-xs tracking-widest uppercase text-forest dark:text-rose hover:opacity-70 transition-opacity">
                See All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-16">
              {artifacts.slice(0, 3).map((art: any) => <ArtCard key={art.id} art={art} />)}
            </div>
          </section>
        )}

        {jewellery.length > 0 && (
          <section>
            <div className="flex items-end justify-between mb-8">
              <h3 className="font-serif text-2xl text-forest dark:text-beige">Latest Jewellery</h3>
              <Link href="/portfolio/resin/jewellery" className="text-xs tracking-widest uppercase text-forest dark:text-rose hover:opacity-70 transition-opacity">
                See All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-16">
              {jewellery.slice(0, 3).map((art: any) => <ArtCard key={art.id} art={art} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
