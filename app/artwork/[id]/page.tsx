import { cache } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import { getCategoryTree, flatten } from "@/lib/categories";
import ArtworkGallery from "@/app/artwork/[id]/ArtworkGallery";

const getArtwork = cache(async (id: string) => {
  const supabase = createClient();
  const { data } = await supabase.from("artworks").select("*").eq("id", id).single();
  return data;
});

// New rows carry category_id (the admin-managed category tree); the legacy
// free-text `category` column only still has data on rows from before that
// migration, so it's the fallback, not the source of truth.
async function getCategoryName(art: any): Promise<string> {
  if (!art.category_id) return art.category || "";
  const tree = await getCategoryTree();
  return flatten(tree).find(n => n.id === art.category_id)?.name || art.category || "";
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const art = await getArtwork(id);
  if (!art) return {};

  const categoryName = await getCategoryName(art);
  const description = art.description || `${art.medium || categoryName}, ₹${art.price?.toLocaleString()}, ${art.availability}.`;
  const image = art.image_url;
  return {
    title: art.title,
    description,
    openGraph: image ? { images: [{ url: image }] } : undefined,
    twitter: image ? { card: "summary_large_image", images: [image] } : undefined,
  };
}

export default async function ArtworkDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const art = await getArtwork(id);

  if (!art) notFound();

  const categoryName = await getCategoryName(art);
  const allImages: string[] = [art.image_url, ...(art.images || [])].filter(Boolean);
  const wa = `https://wa.me/919392640611?text=Hi! I'm interested in "${art.title}". Could you share more details?`;
  const ig = "https://instagram.com/AanyaByHiranya";

  return (
    <div className="min-h-screen bg-beige dark:bg-dark pt-16">
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-16">
        <a href="/portfolio" className="text-xs tracking-widest uppercase text-dark/40 dark:text-beige/40 hover:text-forest dark:hover:text-rose mb-12 block transition-colors">
          ← Back to Works
        </a>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <ArtworkGallery images={allImages} title={art.title} />

          <div className="md:sticky md:top-24">
            <p className="text-xs tracking-widest uppercase text-dark/40 dark:text-beige/40 mb-3">{categoryName}</p>
            <h1 className="font-serif text-4xl md:text-5xl text-forest dark:text-beige mb-4">{art.title}</h1>
            {art.medium && <p className="text-sm text-dark/60 dark:text-beige/60 mb-6">{art.medium}</p>}
            <p className="font-serif text-3xl text-forest dark:text-rose mb-6">₹{art.price?.toLocaleString()}</p>

            <div className="mb-8">
              <span className={`text-xs px-3 py-1 ${art.availability === "Available" ? "bg-forest text-white" : art.availability === "Sold" ? "bg-dark/80 text-white" : "bg-rose/90 text-white"}`}>
                {art.availability}
              </span>
            </div>

            {art.description && (
              <div className="mb-10 border-t border-forest/10 dark:border-beige/10 pt-8">
                <p className="text-xs tracking-widest uppercase text-dark/40 dark:text-beige/40 mb-3">About this piece</p>
                <p className="text-dark/70 dark:text-beige/70 leading-relaxed">{art.description}</p>
              </div>
            )}

            {art.availability !== "Sold" ? (
              <div className="flex flex-col gap-4">
                <a href={wa} target="_blank" rel="noopener noreferrer"
                  className="text-xs tracking-widest uppercase bg-forest text-white px-8 py-4 text-center hover:bg-teal transition-colors">
                  {art.availability === "On Request" ? "Request via WhatsApp" : "Buy via WhatsApp"}
                </a>
                <a href={ig} target="_blank" rel="noopener noreferrer"
                  className="text-xs tracking-widest uppercase border border-rose text-rose px-8 py-4 text-center hover:bg-rose hover:text-white transition-colors">
                  DM on Instagram
                </a>
              </div>
            ) : (
              <p className="text-sm text-dark/40 dark:text-beige/40 tracking-widest uppercase">This piece has been sold</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
