import { cache } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import ArtworkGallery from "@/app/artwork/[id]/ArtworkGallery";

const PLACEHOLDER: any[] = [
  { id:"1", title:"Pressed Botanicals I", category:"Botanical & Pressed Flower", price:3200, availability:"Available", medium:"Pressed flowers on paper", description:"A delicate composition of hand-pressed botanicals arranged on archival paper. Each flower is carefully selected and preserved to retain its natural colour and form.", image_url:"https://images.unsplash.com/photo-1490750967868-88df5691cc5e?w=800&q=80", images:["https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80","https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&q=80"] },
  { id:"2", title:"Wild Garden", category:"Botanical & Pressed Flower", price:2800, availability:"Sold", medium:"Pressed flowers, frame", description:"", image_url:"https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80", images:[] },
  { id:"3", title:"Meadow Study", category:"Botanical & Pressed Flower", price:4500, availability:"On Request", medium:"Mixed botanicals", description:"", image_url:"https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&q=80", images:[] },
  { id:"4", title:"Resin Garden Ring", category:"Resin Flower Jewellery", price:1800, availability:"Available", medium:"Resin, pressed flowers", description:"", image_url:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80", images:[] },
  { id:"5", title:"Memory Pendant", category:"Resin Flower Jewellery", price:2200, availability:"On Request", medium:"Custom resin jewellery", description:"", image_url:"https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80", images:[] },
  { id:"6", title:"Bloom Earrings", category:"Resin Flower Jewellery", price:1400, availability:"Available", medium:"Resin, dried petals", description:"", image_url:"https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80", images:[] },
  { id:"7", title:"Forest Memory", category:"Acrylic Paintings", price:8000, availability:"Available", medium:"Acrylic on canvas, 24×30\"", description:"", image_url:"https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80", images:[] },
  { id:"8", title:"Tide", category:"Acrylic Paintings", price:6500, availability:"Sold", medium:"Acrylic on canvas, 18×24\"", description:"", image_url:"https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80", images:[] },
  { id:"9", title:"Root & Rise", category:"Acrylic Paintings", price:9500, availability:"On Request", medium:"Acrylic on canvas, 30×40\"", description:"", image_url:"https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80", images:[] },
];

const getArtwork = cache(async (id: string) => {
  if (id.includes("-")) {
    const supabase = createClient();
    const { data } = await supabase.from("artworks").select("*").eq("id", id).single();
    return data;
  }
  return PLACEHOLDER.find(p => p.id === id) ?? null;
});

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const art = await getArtwork(id);
  if (!art) return {};

  const description = art.description || `${art.medium || art.category} — ₹${art.price?.toLocaleString()}, ${art.availability}.`;
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

  const allImages: string[] = [art.image_url, ...(art.images || [])].filter(Boolean);
  const wa = `https://wa.me/919392640611?text=Hi! I'm interested in "${art.title}" — could you share more details?`;
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
            <p className="text-xs tracking-widest uppercase text-dark/40 dark:text-beige/40 mb-3">{art.category}</p>
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
