"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ArtCard({ art }: { art: any }) {
  const allImages: string[] = [art.image_url, ...(art.images || [])].filter(Boolean);
  const wa = `https://wa.me/919392640611?text=Hi! I'm interested in "${art.title}" — could you share more details?`;
  const ig = "https://instagram.com/AanyaByHiranya";
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startSlide = () => {
    if (allImages.length < 2) return;
    intervalRef.current = setInterval(() => setCurrent(p => (p + 1) % allImages.length), 900);
  };
  const stopSlide = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCurrent(0);
  };

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  return (
    <div className="group">
      <Link href={`/artwork/${art.id}`}>
        <div className="relative aspect-[4/5] overflow-hidden mb-5 bg-forest/5"
          onMouseEnter={startSlide} onMouseLeave={stopSlide}>
          {allImages.map((img, i) => (
            <div key={i} className={`absolute inset-0 transition-opacity duration-500 ${i === current ? "opacity-100" : "opacity-0"}`}>
              <Image src={img} alt={`${art.title} ${i + 1}`} fill className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
            </div>
          ))}
          <div className="absolute top-3 right-3 z-10">
            <span className={`text-xs px-2 py-1 ${art.availability === "Available" ? "bg-forest text-white" : art.availability === "Sold" ? "bg-dark/80 text-white" : "bg-rose/90 text-white"}`}>
              {art.availability}
            </span>
          </div>
          {allImages.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
              {allImages.map((_, i) => (
                <span key={i} className={`block w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === current ? "bg-white scale-125" : "bg-white/40"}`} />
              ))}
            </div>
          )}
        </div>
      </Link>
      <p className="font-serif text-xl text-dark dark:text-beige mb-1">{art.title}</p>
      {art.medium && <p className="text-xs text-dark/50 dark:text-beige/50 mb-1">{art.medium}</p>}
      <div className="flex items-center justify-between mt-2">
        <p className="text-sm text-forest dark:text-rose">₹{art.price?.toLocaleString()}</p>
        {art.availability !== "Sold" && (
          <div className="flex gap-2">
            <a href={wa} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
              className="text-xs tracking-widest uppercase border border-forest dark:border-beige/30 text-forest dark:text-beige px-3 py-1 hover:bg-forest hover:text-white transition-all">
              WhatsApp
            </a>
            <a href={ig} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
              className="text-xs tracking-widest uppercase border border-rose text-rose px-3 py-1 hover:bg-rose hover:text-white transition-all">
              DM
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
