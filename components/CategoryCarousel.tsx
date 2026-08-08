"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ArtCard from "@/app/portfolio/ArtCard";

// Homepage category preview — a horizontally-scrolling row of cards (like a
// shop's collection carousel) instead of a grid that collapses to one column
// and lets a single product fill most of the screen on narrow viewports.
export default function CategoryCarousel({ pieces }: { pieces: any[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);

  // A category with only a few pieces doesn't fill one screen width, so there's
  // nothing to actually scroll to — showing arrows anyway made those sections
  // look broken/incomplete next to a fuller one. Only show them, and only let
  // the row hug the left edge, when there's real overflow; otherwise center
  // the pieces so a short row reads as intentionally curated, not sparse.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    // A meaningful buffer, not just >0 — sub-pixel/rounding overflow of a few
    // px is effectively nothing to scroll to and shouldn't trigger arrows.
    const check = () => setHasOverflow(el.scrollWidth > el.clientWidth + 24);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [pieces]);

  const scrollByPage = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <div>
      <div ref={scrollerRef}
        className={`flex gap-6 md:gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth -mx-6 px-6 md:-mx-16 md:px-16 ${hasOverflow ? "" : "justify-center"}`}>
        {pieces.map((art) => (
          <div key={art.id} className="shrink-0 snap-start w-[75%] sm:w-[46%] md:w-[31%] lg:w-[23%]">
            <ArtCard art={art} />
          </div>
        ))}
      </div>

      {hasOverflow && (
        <div className="hidden md:flex justify-end gap-2 mt-8">
          <button onClick={() => scrollByPage(-1)} aria-label="Scroll left"
            className="w-9 h-9 flex items-center justify-center border border-forest/20 dark:border-beige/20 text-forest dark:text-beige hover:bg-forest hover:text-white dark:hover:bg-beige dark:hover:text-dark transition-colors">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => scrollByPage(1)} aria-label="Scroll right"
            className="w-9 h-9 flex items-center justify-center border border-forest/20 dark:border-beige/20 text-forest dark:text-beige hover:bg-forest hover:text-white dark:hover:bg-beige dark:hover:text-dark transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
