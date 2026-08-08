import { cache } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import InstagramEmbed from "@/components/InstagramEmbed";

export const revalidate = 0;

const getWorkshop = cache(async (id: string) => {
  try {
    const sb = createClient();
    const { data } = await sb.from("workshops").select("*").eq("id", id).eq("published", true).limit(1);
    return data && data.length > 0 ? data[0] : null;
  } catch { return null; }
});

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const w = await getWorkshop(id);
  if (!w) return {};
  const image = w.cover_image_url || w.video_cover_url;
  return {
    title: w.title,
    description: w.description || "A workshop with AanyaByHiranya.",
    openGraph: image ? { images: [{ url: image }] } : undefined,
  };
}

export default async function WorkshopDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const w = await getWorkshop(id);

  if (!w) {
    return (
      <div className="bg-beige dark:bg-dark min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center px-6">
          <p className="font-serif text-4xl text-forest dark:text-beige mb-4">Workshop not found</p>
          <Link href="/workshops" className="text-xs tracking-widest uppercase bg-forest text-white px-8 py-3 hover:bg-teal transition-colors">
            ← Back to Workshops
          </Link>
        </div>
      </div>
    );
  }

  const gallery: string[] = w.images || [];

  return (
    <div className="bg-beige dark:bg-dark min-h-screen pt-16">
      <article className="max-w-2xl mx-auto px-6 py-24">
        <Link href="/workshops"
          className="text-xs tracking-widest uppercase text-dark/40 dark:text-beige/40 hover:text-forest dark:hover:text-rose transition-colors mb-10 inline-block">
          ← Workshops
        </Link>
        <h1 className="font-serif text-4xl md:text-5xl text-forest dark:text-beige mb-8 leading-tight">{w.title}</h1>

        {/* Video autoplays only here, on the workshop's own page — muted so the
            browser actually allows autoplay; a visible control lets people unmute. */}
        {w.video_url ? (
          <div className="relative aspect-video overflow-hidden rounded-xl mb-10 bg-dark/5">
            <video
              src={w.video_url}
              poster={w.video_cover_url || w.cover_image_url || undefined}
              className="w-full h-full object-cover"
              autoPlay muted loop playsInline controls
            />
          </div>
        ) : w.cover_image_url && (
          <div className="relative aspect-video overflow-hidden rounded-xl mb-10">
            <Image src={w.cover_image_url} alt={w.title} fill className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px" />
          </div>
        )}

        {w.description && (
          <p className="text-lg text-dark/70 dark:text-beige/70 leading-relaxed mb-10 whitespace-pre-line">
            {w.description}
          </p>
        )}

        {w.instagram_reel_url && (
          <div className="mb-10">
            <InstagramEmbed url={w.instagram_reel_url} />
          </div>
        )}

        {gallery.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-10">
            {gallery.map((src, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-lg">
                <Image src={src} alt={`${w.title} ${i + 1}`} fill className="object-cover"
                  sizes="(max-width: 768px) 50vw, 336px" />
              </div>
            ))}
          </div>
        )}

        <div className="text-center py-12 border-t border-forest/20 dark:border-beige/20 mt-12">
          <p className="text-dark/60 dark:text-beige/60 mb-6">Interested in joining or booking this workshop?</p>
          <Link href="/contact"
            className="inline-block text-xs tracking-widest uppercase bg-forest text-white px-8 py-3 hover:bg-teal transition-colors">
            Get in Touch
          </Link>
        </div>
      </article>
    </div>
  );
}
