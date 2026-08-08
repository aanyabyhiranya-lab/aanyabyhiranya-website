"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminDashboard() {
  const router = useRouter();

  const signOut = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
  };

  return (
    <div className="min-h-screen bg-beige dark:bg-dark pt-16">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-12">
          <p className="font-serif text-4xl text-forest dark:text-beige">Dashboard</p>
          <button onClick={signOut}
            className="text-xs tracking-widest uppercase text-dark/50 dark:text-beige/50 hover:text-red-500 transition-colors">
            Sign Out
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { href:"/admin/artworks", label:"Artworks", desc:"Add, edit, or remove artworks from your portfolio.", icon:"🖼" },
            { href:"/admin/categories", label:"Categories", desc:"Organize your main categories, subcategories, and what shows on the homepage.", icon:"🗂" },
            { href:"/admin/blog", label:"Blog Posts", desc:"Write and publish journal entries.", icon:"✍️" },
            { href:"/admin/workshops", label:"Workshops", desc:"Add workshops with images, an Instagram Reel, or a video.", icon:"🎨" },
            { href:"/admin/orders", label:"Orders", desc:"View and manage incoming orders.", icon:"📦" },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className="block p-8 border border-forest/20 dark:border-beige/20 hover:border-forest dark:hover:border-beige transition-colors group">
              <p className="text-3xl mb-4">{item.icon}</p>
              <p className="font-serif text-2xl text-forest dark:text-beige mb-2 group-hover:text-teal dark:group-hover:text-rose transition-colors">{item.label}</p>
              <p className="text-sm text-dark/60 dark:text-beige/60">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
