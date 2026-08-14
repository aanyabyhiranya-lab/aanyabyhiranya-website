"use client";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "./ThemeProvider";
import { Sun, Moon, Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const links = [
  { href: "/",           label: "Home" },
  { href: "/portfolio",  label: "All Works" },
  { href: "/workshops",  label: "Workshops" },
  { href: "/blog",       label: "Journal" },
  { href: "/contact",    label: "Contact" },
];

export default function Nav() {
  const { theme, toggle } = useTheme();
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const lastY = useRef(0);
  const pathname = usePathname();

  // One scroll listener for both behaviours (nav background + hide-through-hero),
  // rAF-throttled, reading NO layout.
  //
  // This used to be two listeners, and the second one called querySelector +
  // getBoundingClientRect() on every single scroll event. Measuring geometry
  // mid-scroll forces a synchronous layout, and doing that on the same frames
  // GSAP is writing styles is textbook layout thrashing — the browser recalcs
  // the whole page repeatedly during a swipe, which is exactly what makes a
  // fling stutter. The hero's position is now measured once (and on resize),
  // and the handler only compares numbers.
  useEffect(() => {
    lastY.current = window.scrollY;

    let heroBottom = Infinity;
    let hasHero = false;
    const measureHero = () => {
      const heroEl = document.querySelector<HTMLElement>("[data-hero-wrap]");
      hasHero = !!heroEl;
      heroBottom = heroEl
        ? heroEl.getBoundingClientRect().bottom + window.scrollY
        : Infinity;
    };
    measureHero();

    let queued = false;
    const update = () => {
      queued = false;
      const y = window.scrollY;
      setScrolled(y > 40);

      if (!hasHero) {
        setNavHidden(false);
        lastY.current = y;
        return;
      }
      if (y >= heroBottom - 40) {
        setNavHidden(false); // clear of the hero — permanent from here on
      } else if (y < 60) {
        setNavHidden(false); // at the very top
      } else if (y > lastY.current + 4) {
        setNavHidden(true); // scrolling down through the hero
      } else if (y < lastY.current - 4) {
        setNavHidden(false); // scrolling back up towards the top
      }
      lastY.current = y;
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measureHero);
    window.addEventListener("orientationchange", measureHero);
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measureHero);
      window.removeEventListener("orientationchange", measureHero);
    };
  }, [pathname]);

  // Close mobile menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
      ${navHidden ? "translate-y-[-100%]" : "translate-y-0"}
      ${scrolled
        ? "bg-beige/98 dark:bg-dark/98 shadow-sm border-b border-forest/15 dark:border-beige/10"
        : "bg-beige/85 dark:bg-dark/85 border-b border-forest/10 dark:border-beige/10"}
      backdrop-blur-md`}>

      <div className="max-w-7xl mx-auto px-5 md:px-10 h-16 flex items-center justify-between gap-4">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          {/* 500x500 source rendered at 36px — next/image serves a 36px-class
              WebP instead of the full PNG on every page load. */}
          <Image src="/logo.png" alt="AanyaByHiranya" width={36} height={36} priority
            className="h-9 w-auto object-contain"
            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <span className="font-serif text-lg md:text-xl tracking-wide text-forest dark:text-beige">
            AanyaByHiranya
          </span>
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="hidden md:flex items-center gap-7">
          {links.map(l => (
            <Link key={l.href} href={l.href} prefetch={true}
              className={`font-sans text-[11px] tracking-[0.15em] uppercase transition-colors duration-200
                ${pathname === l.href
                  ? "text-forest dark:text-rose"
                  : "text-forest/70 dark:text-beige/70 hover:text-forest dark:hover:text-beige"}`}>
              {l.label}
            </Link>
          ))}
        </nav>

        {/* ── Right actions ── */}
        <div className="flex items-center gap-3">
          <button onClick={toggle} aria-label="Toggle theme"
            className="text-forest/60 dark:text-beige/60 hover:text-forest dark:hover:text-beige transition-colors p-1">
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <Link href="/commission"
            className="hidden md:inline-flex items-center text-[10px] tracking-[0.15em] uppercase
              bg-forest text-white px-4 py-2 hover:bg-teal transition-colors duration-200">
            Commission
          </Link>

          {/* Hamburger */}
          <button
            className="md:hidden flex items-center justify-center w-9 h-9 text-forest dark:text-beige"
            onClick={() => setOpen(o => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ── Mobile dropdown ── */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out
        ${open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="bg-beige dark:bg-dark border-t border-forest/10 dark:border-beige/10 px-5 pt-4 pb-6 flex flex-col gap-1">
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className={`py-3 font-sans text-[11px] tracking-[0.15em] uppercase border-b border-forest/8 dark:border-beige/8 transition-colors
                ${pathname === l.href
                  ? "text-forest dark:text-rose"
                  : "text-forest/70 dark:text-beige/60 hover:text-forest dark:hover:text-beige"}`}>
              {l.label}
            </Link>
          ))}
          <Link href="/commission"
            className="mt-4 text-center text-[10px] tracking-[0.15em] uppercase
              bg-forest text-white px-4 py-3 hover:bg-teal transition-colors duration-200">
            Commission a Piece
          </Link>
        </div>
      </div>
    </header>
  );
}
