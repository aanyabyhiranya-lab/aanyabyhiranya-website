export const revalidate = 60;
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { getCategoryTree, flatten, descendantIds } from "@/lib/categories";
import CategoryCarousel from "@/components/CategoryCarousel";
import HeroSection from "@/components/HeroSection";
import ParticleField from "@/components/ParticleField";
import TextReveal from "@/components/TextReveal";
import ParallaxImage from "@/components/ParallaxImage";
import MagneticButton from "@/components/MagneticButton";

const PLACEHOLDER = [
  { id:"1", title:"Resin Vase",          category_id:"00000000-0000-0000-0000-000000000011", price:3200, availability:"Available", medium:"Resin", image_url:"/art1.jpg", images:[] },
  { id:"2", title:"Resin Bowl",          category_id:"00000000-0000-0000-0000-000000000011", price:2800, availability:"On Request", medium:"Resin", image_url:"/art2.jpg", images:[] },
  { id:"3", title:"Flower Ring",         category_id:"00000000-0000-0000-0000-000000000111", price:1800, availability:"Available", medium:"Resin, dried flowers", image_url:"/art3.jpg", images:[] },
  { id:"4", title:"Petal Pendant",       category_id:"00000000-0000-0000-0000-000000000111", price:2200, availability:"On Request", medium:"Resin, pressed petals", image_url:"/art4.jpg", images:[] },
  { id:"5", title:"Pearl Drop Earrings", category_id:"00000000-0000-0000-0000-000000000112", price:1600, availability:"Available", medium:"Resin, pearl", image_url:"/art5.jpg", images:[] },
  { id:"6", title:"Pearl Bangle",        category_id:"00000000-0000-0000-0000-000000000112", price:2400, availability:"Available", medium:"Resin, pearl", image_url:"/art6.jpg", images:[] },
  { id:"7", title:"Sunset Study",        category_id:"00000000-0000-0000-0000-000000000021", price:4500, availability:"Available", medium:"Oil pastels on paper", image_url:"/art7.jpg", images:[] },
  { id:"8", title:"Forest Floor",        category_id:"00000000-0000-0000-0000-000000000021", price:5000, availability:"Sold", medium:"Oil pastels on paper", image_url:"/art8.jpg", images:[] },
  { id:"9", title:"Forest Memory",       category_id:"00000000-0000-0000-0000-000000000022", price:8000, availability:"Available", medium:"Acrylic on canvas", image_url:"/art9.jpg", images:[] },
];

async function getArtworks() {
  try {
    const supabase = createClient();
    const { data } = await supabase.from("artworks").select("*").order("created_at", { ascending: false });
    return data && data.length > 0 ? data : PLACEHOLDER;
  } catch { return PLACEHOLDER; }
}

export default async function Home() {
  const [artworks, tree] = await Promise.all([getArtworks(), getCategoryTree()]);
  const heroImages = artworks
    .filter((a: any) => a.show_in_hero && a.image_url)
    .map((a: any) => a.image_url as string);

  // One carousel per category flagged "show on homepage" — could be a whole
  // main category, or several of its subcategories individually, whatever
  // the admin picked. Pieces include everything under that node (its own
  // artworks plus any descendants'), so a broad pick still aggregates.
  const homepageSections = flatten(tree).filter(n => n.show_on_homepage);

  return (
    <div className="bg-beige dark:bg-dark min-h-screen relative">

      {/* Three.js particle field — fixed behind everything */}
      <ParticleField />

      {/* Hero */}
      <HeroSection heroImages={heroImages} />

      {/* Works by category */}
      {homepageSections.map(node => {
        const ids = new Set(descendantIds(node));
        const pieces = artworks.filter((a: any) => a.category_id && ids.has(a.category_id)).slice(0, 8);
        const href = `/portfolio/${node.path.join("/")}`;
        return (
          <section key={node.id} className="py-20 px-6 md:px-16 max-w-7xl mx-auto relative z-10">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-xs tracking-widest uppercase text-dark/40 dark:text-beige/40 mb-2 reveal">Collection</p>
                <TextReveal text={node.name} tag="h2"
                  className="font-serif text-3xl md:text-4xl text-forest dark:text-beige" />
              </div>
              <Link href={href}
                className="text-xs tracking-widest uppercase text-forest dark:text-rose underline-anim pb-1 hover:opacity-70 transition-opacity whitespace-nowrap reveal">
                See More →
              </Link>
            </div>
            {pieces.length > 0 ? (
              <div className="reveal">
                <CategoryCarousel pieces={pieces} />
              </div>
            ) : (
              <div className="border border-forest/10 dark:border-beige/10 py-16 text-center">
                <p className="text-dark/40 dark:text-beige/40 text-sm">No pieces yet. Add some from the admin panel.</p>
                <Link href={href} className="text-xs tracking-widest uppercase text-forest dark:text-rose mt-4 inline-block hover:opacity-70">
                  Explore Collection →
                </Link>
              </div>
            )}
          </section>
        );
      })}

      {/* About Hiranya */}
      <section className="py-24 px-6 md:px-16 bg-forest/5 dark:bg-forest/10 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          <ParallaxImage src="/artist.jpg" alt="Hiranya"
            className="aspect-[3/4] shimmer" speed={0.25} />
          <div className="reveal-right">
            <p className="text-xs tracking-widest uppercase text-forest/50 dark:text-beige/40 mb-3">The Artist</p>
            <TextReveal text="Note from the artist" tag="h2"
              className="font-serif text-4xl md:text-5xl text-forest dark:text-beige mb-6 leading-tight" />
            <p className="text-dark/70 dark:text-beige/70 leading-relaxed mb-4">
              I&apos;m a multidisciplinary artist working across acrylic painting, pressed flower jewellery, resin experiments, and sustainable crafts.
            </p>
            <p className="text-dark/60 dark:text-beige/60 leading-relaxed mb-4">
              My practice is rooted in the belief that creativity and nature can coexist in harmony. From vibrant acrylic canvases to delicately preserved botanical jewellery, my work explores themes of growth, healing, the passage of time, and the quiet stories found in nature.
            </p>
            <p className="text-dark/60 dark:text-beige/60 leading-relaxed mb-10">
              Through my art, writing, and community-led events, I hope to create spaces where people can connect through creativity, beauty, and nature.
            </p>
            <MagneticButton>
              <Link href="/commission"
                className="inline-block text-[11px] tracking-[0.15em] uppercase bg-forest text-white px-8 py-3 hover:bg-teal transition-colors">
                Commission a Piece
              </Link>
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* Commission CTA */}
      <section className="py-24 px-6 md:px-16 text-center relative z-10">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs tracking-widest uppercase text-dark/40 dark:text-beige/40 mb-4 reveal">Bespoke Work</p>
          <TextReveal text="Request a Commission" tag="h2"
            className="font-serif text-4xl md:text-5xl text-forest dark:text-beige mb-6" />
          <p className="text-dark/60 dark:text-beige/60 mb-10 leading-relaxed reveal reveal-delay-2">
            Have something specific in mind? Hiranya takes on a limited number of commissions each season. Reach out to begin a conversation.
          </p>
          <MagneticButton className="inline-block">
            <Link href="/commission"
              className="inline-block text-xs tracking-widest uppercase bg-forest text-white px-10 py-4 hover:bg-teal transition-colors reveal reveal-delay-3">
              Get in Touch
            </Link>
          </MagneticButton>
        </div>
      </section>

    </div>
  );
}
