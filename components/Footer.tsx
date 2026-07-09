import Link from "next/link";
export default function Footer() {
  return (
    <footer className="bg-beige dark:bg-dark border-t border-forest/10 dark:border-beige/10 py-16 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <p className="font-serif text-2xl text-forest dark:text-beige mb-3">AanyaByHiranya</p>
          <p className="text-sm text-dark/60 dark:text-beige/60 leading-relaxed max-w-xs">
            Art rooted in nature, memory, and slow intention.
          </p>
        </div>
        <div>
          <p className="text-xs tracking-widest uppercase text-dark/40 dark:text-beige/40 mb-4">Navigate</p>
          <div className="flex flex-col gap-2">
            {[["Works","/portfolio"],["Journal","/blog"],["Workshops","/workshops"],["Contact","/contact"],["Commission","/commission"]].map(([l,h])=>(
              <Link key={h} href={h} className="text-sm text-dark/70 dark:text-beige/70 hover:text-forest dark:hover:text-rose transition-colors">{l}</Link>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs tracking-widest uppercase text-dark/40 dark:text-beige/40 mb-4">Connect</p>
          <div className="flex flex-col gap-2">
            <a href="mailto:Aanyabyhiranya@gmail.com" className="text-sm text-dark/70 dark:text-beige/70 hover:text-forest dark:hover:text-rose transition-colors">
              Aanyabyhiranya@gmail.com
            </a>
            <a href="https://instagram.com/AanyaByHiranya" target="_blank" rel="noopener noreferrer"
              className="text-sm text-dark/70 dark:text-beige/70 hover:text-forest dark:hover:text-rose transition-colors">
              Instagram
            </a>
            <a href="https://wa.me/919392640611" target="_blank" rel="noopener noreferrer"
              className="text-sm text-dark/70 dark:text-beige/70 hover:text-forest dark:hover:text-rose transition-colors">
              WhatsApp
            </a>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-forest/10 dark:border-beige/10">
        <p className="text-xs text-dark/40 dark:text-beige/40">© {new Date().getFullYear()} AanyaByHiranya. All rights reserved.</p>
      </div>
    </footer>
  );
}
