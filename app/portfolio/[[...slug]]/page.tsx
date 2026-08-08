export const revalidate = 60;
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase-server";
import { getCategoryTree, findPathNodes, descendantIds } from "@/lib/categories";
import ArtCard from "../ArtCard";

type Props = { params: Promise<{ slug?: string[] }> };

async function getArtworksByIds(ids: string[]) {
  if (!ids.length) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase.from("artworks").select("*")
      .in("category_id", ids).order("created_at", { ascending: false });
    return data || [];
  } catch { return []; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug = [] } = await params;
  if (!slug.length) {
    return {
      title: "All Works",
      description: "A collection of resin art, oil pastel works, and acrylic paintings: each piece made slowly, with intention.",
    };
  }
  const tree = await getCategoryTree();
  const nodes = findPathNodes(tree, slug);
  if (nodes.length !== slug.length) return {};
  const node = nodes[nodes.length - 1];
  return { title: node.name, description: `Browse the ${node.name} collection.` };
}

function CategoryCard({ href, name, count }: { href: string; name: string; count: number }) {
  return (
    <Link href={href}
      className="group relative overflow-hidden aspect-[4/3] bg-forest/5 dark:bg-forest/10 border border-forest/15 dark:border-beige/10 hover:border-forest dark:hover:border-rose transition-all duration-300">
      <div className="absolute inset-0 flex flex-col justify-end p-8">
        <p className="text-xs tracking-widest uppercase text-dark/40 dark:text-beige/40 mb-2">
          {count ? `${count} piece${count === 1 ? "" : "s"}` : "New"}
        </p>
        <h2 className="font-serif text-3xl md:text-4xl text-forest dark:text-beige mb-2 group-hover:translate-x-1 transition-transform duration-300">
          {name}
        </h2>
        <span className="mt-4 text-xs tracking-widest uppercase text-forest dark:text-rose">Explore →</span>
      </div>
    </Link>
  );
}

function Breadcrumb({ names, hrefs }: { names: string[]; hrefs: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs tracking-widest uppercase text-dark/40 dark:text-beige/40 mb-10">
      <Link href="/portfolio" className="hover:text-forest dark:hover:text-rose transition-colors">Works</Link>
      {names.map((name, i) => {
        const isLast = i === names.length - 1;
        return (
          <span key={hrefs[i]} className="flex items-center gap-2">
            <span>/</span>
            {isLast ? <span className="text-forest dark:text-beige">{name}</span> :
              <Link href={hrefs[i]} className="hover:text-forest dark:hover:text-rose transition-colors">{name}</Link>}
          </span>
        );
      })}
    </div>
  );
}

export default async function PortfolioPage({ params }: Props) {
  const { slug = [] } = await params;
  const tree = await getCategoryTree();

  if (!slug.length) {
    const counts = await Promise.all(tree.map(n => getArtworksByIds(descendantIds(n)).then(a => a.length)));
    return (
      <div className="bg-beige dark:bg-dark min-h-screen pt-16">
        <div className="max-w-7xl mx-auto px-6 md:px-16 py-24">
          <p className="text-xs tracking-widest uppercase text-dark/40 dark:text-beige/40 mb-3">Portfolio</p>
          <h1 className="font-serif text-5xl md:text-6xl text-forest dark:text-beige mb-4">Works</h1>
          <p className="text-dark/60 dark:text-beige/60 max-w-xl leading-relaxed mb-20">
            A collection of resin art, oil pastel works, and acrylic paintings: each piece made slowly, with intention.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            {tree.map((n, i) => (
              <CategoryCard key={n.id} href={`/portfolio/${n.slug}`} name={n.name} count={counts[i]} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const nodes = findPathNodes(tree, slug);
  if (nodes.length !== slug.length) notFound();
  const node = nodes[nodes.length - 1];
  const names = nodes.map(n => n.name);
  const hrefs = nodes.map(n => `/portfolio/${n.path.join("/")}`);

  if (node.children.length > 0) {
    // Hub: subcategory cards, a preview of each, and anything filed directly
    // under this node itself (an admin can assign artworks to any level).
    const [direct, ...childPieces] = await Promise.all([
      getArtworksByIds([node.id]),
      ...node.children.map(c => getArtworksByIds(descendantIds(c))),
    ]);
    return (
      <div className="bg-beige dark:bg-dark min-h-screen pt-16">
        <div className="max-w-7xl mx-auto px-6 md:px-16 py-24">
          <Breadcrumb names={names} hrefs={hrefs} />
          <h1 className="font-serif text-5xl md:text-6xl text-forest dark:text-beige mb-4">{node.name}</h1>
          <p className="text-dark/60 dark:text-beige/60 max-w-xl leading-relaxed mb-16">
            Browse the {node.name} collection.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
            {node.children.map((child, i) => (
              <CategoryCard key={child.id} href={`/portfolio/${child.path.join("/")}`} name={child.name} count={childPieces[i].length} />
            ))}
          </div>

          {direct.length > 0 && (
            <section className="mb-20">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-16">
                {direct.map((art: any) => <ArtCard key={art.id} art={art} />)}
              </div>
            </section>
          )}

          {node.children.map((child, i) => childPieces[i].length > 0 && (
            <section key={child.id} className="mb-20">
              <div className="flex items-end justify-between mb-8">
                <h3 className="font-serif text-2xl text-forest dark:text-beige">{child.name}</h3>
                <Link href={`/portfolio/${child.path.join("/")}`} className="text-xs tracking-widest uppercase text-forest dark:text-rose hover:opacity-70 transition-opacity">
                  See All →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-16">
                {childPieces[i].slice(0, 3).map((art: any) => <ArtCard key={art.id} art={art} />)}
              </div>
            </section>
          ))}
        </div>
      </div>
    );
  }

  // Leaf category — full grid, same as the old per-category pages.
  const artworks = await getArtworksByIds([node.id]);
  return (
    <div className="bg-beige dark:bg-dark min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-24">
        <Breadcrumb names={names} hrefs={hrefs} />
        <h1 className="font-serif text-5xl md:text-6xl text-forest dark:text-beige mb-4">{node.name}</h1>
        <p className="text-dark/60 dark:text-beige/60 max-w-xl leading-relaxed mb-16">
          Browse the {node.name} collection.
        </p>
        {artworks.length === 0 ? (
          <p className="text-dark/40 dark:text-beige/40">No pieces here yet. Check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-16">
            {artworks.map((art: any, i: number) => (
              <div key={art.id} className={`reveal reveal-delay-${Math.min(i + 1, 3)}`}>
                <ArtCard art={art} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
