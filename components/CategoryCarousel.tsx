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

  // A category with only a few pieces doesn't fill one screen width, so
  // there's nothing to actually scroll to — showing arrows anyway made those
  // sections look broken. Every row still starts flush left (so the first
  // card lines up in the same spot section to section, matching whichever
  // row has the most items), just without arrows when there's nowhere to go.
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
      {/* scroll-pl-* must match the px-* padding. The negative margin + padding
          is a full-bleed trick so cards can scroll past the section's gutter,
          but snap-start alone snaps a card to the scroller's OUTER edge, so
          the browser auto-scrolls the row left to satisfy snap-mandatory —
          pulling the first card out of line with the heading by up to the
          padding width, and worst on the row with the most overflow to scroll
          into. scroll-padding-left moves the snap line to the padding edge. */}
      <div ref={scrollerRef}
        className="flex gap-6 md:gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth -mx-6 px-6 scroll-pl-6 md:-mx-16 md:px-16 md:scroll-pl-16">
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
