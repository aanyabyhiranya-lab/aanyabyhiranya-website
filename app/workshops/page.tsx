import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase-server";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Workshops & Collaborations",
  description: "Intimate, hands-on workshops in botanical pressing and resin art, plus brand and event collaborations rooted in sustainability and craft.",
};

async function getWorkshops() {
  try {
    const supabase = createClient();
    const { data } = await supabase.from("workshops").select("*")
      .eq("published", true).order("created_at", { ascending: false });
    return data || [];
  } catch { return []; }
}

export default async function Workshops() {
  const workshops = await getWorkshops();

  return (
    <div className="bg-beige dark:bg-dark min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-24">
        <p className="text-xs tracking-widest uppercase text-dark/40 dark:text-beige/40 mb-3">Community</p>
        <h1 className="font-serif text-5xl md:text-6xl text-forest dark:text-beige mb-16">Workshops & Collaborations</h1>

        <div className="mb-24">
          <h2 className="font-serif text-3xl text-forest dark:text-beige mb-4 border-t border-forest/20 dark:border-beige/20 pt-10">Workshops</h2>
          <p className="text-dark/70 dark:text-beige/70 leading-relaxed mb-10 max-w-2xl">
            Hiranya hosts intimate, hands-on workshops exploring botanical pressing, resin art, and slow creative practices. Sessions are kept small to allow for genuine connection and learning.
          </p>

          {workshops.length === 0 ? (
            <p className="text-sm text-dark/50 dark:text-beige/50 italic">More coming soon. Reach out to collaborate.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {workshops.map((w: any) => {
                const thumb = w.cover_image_url || w.video_cover_url;
                return (
                  <Link key={w.id} href={`/workshops/${w.id}`} className="group block">
                    <div className="relative aspect-[4/3] overflow-hidden mb-4 bg-forest/5 dark:bg-forest/10">
                      {thumb && (
                        <Image src={thumb} alt={w.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                      )}
                      {w.video_url && (
                        <div className="absolute inset-0 flex items-center justify-center bg-dark/10 group-hover:bg-dark/20 transition-colors">
                          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                            <div className="w-0 h-0 border-y-8 border-y-transparent border-l-[14px] border-l-forest ml-1" />
                          </div>
                        </div>
                      )}
                    </div>
                    <h3 className="font-serif text-xl text-dark dark:text-beige group-hover:text-forest dark:group-hover:text-rose transition-colors mb-1">
                      {w.title}
                    </h3>
                    {w.description && (
                      <p className="text-sm text-dark/60 dark:text-beige/60 leading-relaxed line-clamp-2">{w.description}</p>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-24">
          <div className="border-t border-forest/20 dark:border-beige/20 pt-10">
            <h2 className="font-serif text-3xl text-forest dark:text-beige mb-4">Brand & Event Collaborations</h2>
            <p className="text-dark/70 dark:text-beige/70 leading-relaxed mb-6">
              Open to collaborations with brands, spaces, and events that share a commitment to sustainability, craft, and intentional living.
            </p>
            <p className="text-sm text-dark/50 dark:text-beige/50 italic">More coming soon. Reach out to collaborate.</p>
          </div>
        </div>

        <div className="text-center py-16 border-t border-forest/20 dark:border-beige/20">
          <p className="font-serif text-3xl text-forest dark:text-beige mb-4">Interested in working together?</p>
          <p className="text-dark/60 dark:text-beige/60 mb-8">Get in touch to discuss workshops, events, or brand collaborations.</p>
          <Link href="/contact"
            className="inline-block text-xs tracking-widest uppercase bg-forest text-white px-10 py-4 hover:bg-teal transition-colors">
            Contact Hiranya
          </Link>
        </div>
      </div>
    </div>
  );
}
