export const revalidate = 0;
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: "Journal",
  description: "Reflections, experiments, and stories from the studio.",
};

async function getPosts() {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });
    return data && data.length > 0 ? data : [];
  } catch { return []; }
}

export default async function Blog() {
  const posts = await getPosts();

  return (
    <div className="bg-beige dark:bg-dark min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-24">
        <p className="text-xs tracking-widest uppercase text-dark/40 dark:text-beige/40 mb-3">Writing</p>
        <h1 className="font-script text-5xl md:text-6xl text-forest dark:text-beige mb-4">Journal</h1>
        <p className="text-dark/60 dark:text-beige/60 max-w-xl leading-relaxed mb-20">
          Reflections, experiments, and stories from the studio.
        </p>

        {posts.length === 0 ? (
          <p className="text-dark/40 dark:text-beige/40">No posts yet. Check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {posts.map((post: any) => {
              const isMedium = !!post.medium_url;

              // Medium post — plain <a> opens in new tab
              if (isMedium) {
                return (
                  <a key={post.id} href={post.medium_url}
                    target="_blank" rel="noopener noreferrer"
                    className="group block cursor-pointer">
                    <PostCard post={post} isMedium />
                  </a>
                );
              }

              // Internal post — Next.js Link
              return (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                  <PostCard post={post} isMedium={false} />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function PostCard({ post, isMedium }: { post: any; isMedium: boolean }) {
  return (
    <>
      <div className="relative aspect-[4/3] overflow-hidden mb-5 bg-forest/5 dark:bg-forest/10">
        {post.cover_image_url && (
          <Image src={post.cover_image_url} alt={post.title}
            fill className="object-cover group-hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
        )}
        {isMedium && (
          <div className="absolute top-3 right-3 bg-dark/80 text-white text-[10px] tracking-widest uppercase px-2 py-1 flex items-center gap-1">
            Read on Medium ↗
          </div>
        )}
      </div>
      <p className="text-xs text-dark/40 dark:text-beige/40 mb-2">
        {new Date(post.created_at).toLocaleDateString("en-IN", { year:"numeric", month:"long", day:"numeric" })}
      </p>
      <h2 className="font-serif text-2xl text-dark dark:text-beige mb-2 group-hover:text-forest dark:group-hover:text-rose transition-colors">
        {post.title}
      </h2>
      <p className="text-sm text-dark/60 dark:text-beige/60 leading-relaxed line-clamp-3">{post.excerpt}</p>
    </>
  );
}
