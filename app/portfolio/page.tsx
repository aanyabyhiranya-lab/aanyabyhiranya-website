export const revalidate = 60;
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: "All Works",
  description: "A collection of resin art, oil pastel works, and acrylic paintings: each piece made slowly, with intention.",
};

async function getCounts() {
  try {
    const supabase = createClient();
    const { data } = await supabase.from("artworks").select("category");
    if (!data) return { resin: 0, paintings: 0 };
    return {
      resin:   data.filter(a => a.category?.startsWith("Resin")).length,
    paintings: data.filter(a => ["Oil Pastels","Acrylic Art"].includes(a.category)).length,
    };
  } catch { return { resin: 0, paintings: 0 }; }
}

const CATEGORIES = [
  {
    key: "resin",
    href: "/portfolio/resin",
    label: "Resin Art",
    sub: "Artifacts · Jewellery",
    desc: "Handcrafted resin works: decorative artifacts and wearable jewellery, each piece capturing nature in its most preserved form.",
    bg: "bg-forest/8 dark:bg-forest/15",
    border: "border-forest/20 dark:border-forest/30",
    hover: "hover:border-forest",
    accent: "text-forest dark:text-rose",
    img: "/art1.jpg",
  },
  {
    key: "paintings",
    href: "/portfolio/paintings",
    label: "Oil Pastels & Acrylic Art",
    sub: "Oil Pastels · Acrylic Art",
    desc: "Works on paper and canvas: oil pastels and acrylics, exploring texture, colour, and the quiet stories found in nature.",
    bg: "bg-teal/5 dark:bg-teal/10",
    border: "border-teal/20 dark:border-teal/20",
    hover: "hover:border-teal",
    accent: "text-teal dark:text-rose",
    img: "/art9.jpg",
  },
];

export default async function Portfolio() {
  const counts = await getCounts();
  const countMap: Record<string, number> = { resin: counts.resin, paintings: counts.paintings };

  return (
    <div className="bg-beige dark:bg-dark min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-24">

        <p className="text-xs tracking-widest uppercase text-dark/40 dark:text-beige/40 mb-3">Portfolio</p>
        <h1 className="font-script text-5xl md:text-6xl text-forest dark:text-beige mb-4">Works</h1>
        <p className="text-dark/60 dark:text-beige/60 max-w-xl leading-relaxed mb-20">
          A collection of resin art, oil pastel works, and acrylic paintings: each piece made slowly, with intention.
        </p>

        {/* Top-level category cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {CATEGORIES.map(cat => (
            <Link key={cat.key} href={cat.href}
              className={`group relative overflow-hidden border ${cat.border} ${cat.hover} ${cat.bg} transition-all duration-300 p-8 flex flex-col justify-between min-h-[320px]`}>

              {/* Background image — subtle */}
              <div className="absolute inset-0 opacity-10 group-hover:opacity-15 transition-opacity duration-500">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cat.img} alt="" className="w-full h-full object-cover" />
              </div>

              <div className="relative z-10">
                <p className="text-xs tracking-widest uppercase text-dark/40 dark:text-beige/40 mb-1">
                  {countMap[cat.key] > 0 ? `${countMap[cat.key]} piece${countMap[cat.key] === 1 ? "" : "s"}` : "Collection"}
                </p>
                <p className="text-xs tracking-widest uppercase text-dark/30 dark:text-beige/30">{cat.sub}</p>
              </div>

              <div className="relative z-10">
                <h2 className={`font-script text-4xl md:text-5xl mb-3 group-hover:translate-x-1 transition-transform duration-300 text-forest dark:text-beige`}>
                  {cat.label}
                </h2>
                <p className="text-sm text-dark/60 dark:text-beige/60 leading-relaxed mb-6 max-w-xs">
                  {cat.desc}
                </p>
                <span className={`text-xs tracking-widest uppercase ${cat.accent} flex items-center gap-2`}>
                  Explore
                  <span className="group-hover:translate-x-2 transition-transform duration-300 inline-block">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
