"use client";
import { useState } from "react";
import Image from "next/image";

export default function ArtworkGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="relative aspect-[3/4] overflow-hidden mb-4 bg-forest/5">
        {images.map((img, i) => (
          <Image key={i} src={img} alt={`${title} ${i + 1}`} fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className={`object-cover transition-opacity duration-500 ${active === i ? "opacity-100" : "opacity-0"}`} />
        ))}
      </div>
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((img, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={`relative w-20 h-24 flex-shrink-0 overflow-hidden border-2 transition-all ${active === i ? "border-forest dark:border-rose" : "border-transparent opacity-50 hover:opacity-100"}`}>
              <Image src={img} alt={`${title} ${i + 1}`} fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
