import { cache } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";

export const revalidate = 0;

const getPost = cache(async (slug: string) => {
  try {
    const sb = createClient();
    const { data } = await sb.from("blog_posts").select("*").eq("slug", slug).limit(1);
    return data && data.length > 0 ? data[0] : null;
  } catch { return null; }
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  const description = post.excerpt || "A journal entry from AanyaByHiranya.";
  const image = post.cover_image_url;
  return {
    title: post.title,
    description,
    openGraph: image ? { images: [{ url: image }] } : undefined,
    twitter: image ? { card: "summary_large_image", images: [image] } : undefined,
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return (
      <div className="bg-beige dark:bg-dark min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center px-6">
          <p className="font-serif text-4xl text-forest dark:text-beige mb-4">Post not found</p>
          <p className="text-dark/60 dark:text-beige/60 mb-2 text-sm">slug: {slug}</p>
          <Link href="/blog" className="text-xs tracking-widest uppercase bg-forest text-white px-8 py-3 hover:bg-teal transition-colors">
            ← Back to Journal
          </Link>
        </div>
      </div>
    );
  }

  if (post.medium_url) {
    return (
      <div className="bg-beige dark:bg-dark min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center px-6">
          <p className="font-serif text-3xl text-forest dark:text-beige mb-4">Opening Medium…</p>
          <a href={post.medium_url} className="underline text-forest dark:text-rose">
            Click here if not redirected
          </a>
          <script dangerouslySetInnerHTML={{ __html: `window.location.href="${post.medium_url}";` }} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-beige dark:bg-dark min-h-screen pt-16">
      <article className="max-w-2xl mx-auto px-6 py-24">
        <Link href="/blog"
          className="text-xs tracking-widest uppercase text-dark/40 dark:text-beige/40 hover:text-forest dark:hover:text-rose transition-colors mb-10 inline-block">
          ← Journal
        </Link>
        <p className="text-xs tracking-widest uppercase text-dark/40 dark:text-beige/40 mb-4">
          {new Date(post.created_at).toLocaleDateString("en-IN", { year:"numeric", month:"long", day:"numeric" })}
        </p>
        <h1 className="font-serif text-4xl md:text-5xl text-forest dark:text-beige mb-8 leading-tight">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="text-lg text-dark/60 dark:text-beige/60 leading-relaxed mb-10 border-l-2 border-forest/30 pl-4 italic">
            {post.excerpt}
          </p>
        )}
        {post.cover_image_url && (
          <div className="relative aspect-[16/9] overflow-hidden rounded-xl mb-12">
            <Image src={post.cover_image_url} alt={post.title} fill className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
              unoptimized={post.cover_image_url.includes("supabase")} />
          </div>
        )}
        {post.content ? (
          <div className="blog-content">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>
        ) : (
          <p className="text-dark/40 dark:text-beige/40 italic">Content coming soon.</p>
        )}
      </article>
      <style>{`
        .blog-content p{font-size:1.05rem;line-height:1.85;color:rgba(28,28,26,0.82);margin-bottom:1.4em;}
        .dark .blog-content p{color:rgba(239,231,218,0.82);}
        .blog-content h1,.blog-content h2,.blog-content h3{font-family:"Cormorant",Georgia,serif;color:#2E4D38;margin-top:2em;margin-bottom:0.6em;}
        .dark .blog-content h1,.dark .blog-content h2,.dark .blog-content h3{color:#EFE7DA;}
        .blog-content h2{font-size:1.5rem;}.blog-content h3{font-size:1.2rem;}
        .blog-content strong{font-weight:600;}.blog-content em{font-style:italic;}
        .blog-content figure img,.blog-content img{width:100%;max-width:100%;border-radius:12px;margin:1.5em 0;}
        .blog-content a{color:#2E4D38;text-decoration:underline;}
        .dark .blog-content a{color:#DDAA9A;}
      `}</style>
    </div>
  );
}
