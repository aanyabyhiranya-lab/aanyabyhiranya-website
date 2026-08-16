"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Second half of the same mobile problem the viewport effect below guards
// against: even with React no longer rebuilding the timeline, ScrollTrigger
// itself refreshes (recalculating every pin's start/end) on window resize —
// which on a phone fires every time the address bar hides or shows mid-scroll.
// This tells it to ignore resizes where only the height changed on touch.
ScrollTrigger.config({ ignoreMobileResize: true });

// Hero lands top-center as a single continuous shape morph: the same element
// clip-paths itself down from the full rectangle to a centered square (via an
// animated inset()) while the "round" corner radius grows to 999px, so by the
// time the inset region is square it's a true circle — no crossfade between
// separate assets, just one element whose shape gradually rounds and shrinks.
const HERO_LAND = { cx: 50, cy: 14, scale: 0.24 }; // cx/cy = % of screen

// Collage layout uses CSS Grid with explicit column/row spans instead of hand-tuned
// vw/vh percentages. Grid cells structurally cannot overlap, and integer spans (1
// for small tiles, 2 for big ones) give real size variation that holds up at any
// viewport width — the old percentage-based version only looked right at the one
// width it was tuned for, and drifted into overlaps or slivers everywhere else.

// Desktop: 8 columns x 5 rows. One big tile top-left with a small cluster beside
// it, mirrored loosely on the right; columns 4-5 are left empty for the middle
// centrepiece slot.
const GRID_COLS = 8;
const GRID_ROWS = 5;

const MIDDLE_SLOT = { src: "/art11.jpg", col: 4, colSpan: 2, row: 2, rowSpan: 3, fade: 1 };

const COLLAGE = [
  // Left: big tile + cluster of 4 smaller ones
  { src: "/art7.jpg",  col: 1, colSpan: 2, row: 1, rowSpan: 2, fade: 0 },
  { src: "/art13.jpg", col: 3, colSpan: 1, row: 1, rowSpan: 1, fade: 0 },
  { src: "/art2.jpg",  col: 3, colSpan: 1, row: 2, rowSpan: 1, fade: 0 },
  { src: "/art9.jpg",  col: 1, colSpan: 1, row: 3, rowSpan: 1, fade: 1 },
  { src: "/art4.jpg",  col: 2, colSpan: 1, row: 3, rowSpan: 1, fade: 1 },
  { src: "/art14.jpg", col: 3, colSpan: 1, row: 3, rowSpan: 2, fade: 1 },
  { src: "/art6.jpg",  col: 1, colSpan: 1, row: 4, rowSpan: 2, fade: 2 },
  { src: "/art12.jpg", col: 2, colSpan: 1, row: 4, rowSpan: 1, fade: 2 },
  // Right: big tile + smaller cluster, mirrored
  { src: "/art3.jpg",  col: 7, colSpan: 2, row: 1, rowSpan: 2, fade: 0 },
  { src: "/art8.jpg",  col: 6, colSpan: 1, row: 1, rowSpan: 1, fade: 0 },
  { src: "/art10.jpg", col: 6, colSpan: 1, row: 2, rowSpan: 1, fade: 0 },
  { src: "/art1.jpg",  col: 6, colSpan: 1, row: 3, rowSpan: 1, fade: 1 },
  { src: "/art5.jpg",  col: 7, colSpan: 2, row: 3, rowSpan: 2, fade: 1 },
];

// Mobile: 4 columns x 6 rows — one modestly bigger tile, rest a simple near-square
// cluster. Simpler than desktop since a narrow screen has little room for drama.
const GRID_COLS_MOBILE = 4;
const GRID_ROWS_MOBILE = 6;

const MIDDLE_SLOT_MOBILE = { src: "/art11.jpg", col: 1, colSpan: 4, row: 3, rowSpan: 2, fade: 1 };

const COLLAGE_MOBILE = [
  { src: "/art7.jpg",  col: 1, colSpan: 2, row: 1, rowSpan: 2, fade: 0 },
  { src: "/art3.jpg",  col: 3, colSpan: 1, row: 1, rowSpan: 1, fade: 0 },
  { src: "/art9.jpg",  col: 4, colSpan: 1, row: 1, rowSpan: 1, fade: 0 },
  { src: "/art8.jpg",  col: 3, colSpan: 2, row: 2, rowSpan: 1, fade: 0 },
  { src: "/art4.jpg",  col: 1, colSpan: 1, row: 5, rowSpan: 1, fade: 1 },
  { src: "/art10.jpg", col: 2, colSpan: 1, row: 5, rowSpan: 1, fade: 1 },
  { src: "/art13.jpg", col: 3, colSpan: 2, row: 5, rowSpan: 1, fade: 1 },
  { src: "/art6.jpg",  col: 1, colSpan: 4, row: 6, rowSpan: 1, fade: 2 },
];

const FADE_OPACITY = [0.95, 0.72, 0.5];

// Overlays real, admin-selected artwork photos onto the fixed layout slots above,
// in order. Any slot beyond the number of real images supplied keeps its original
// static fallback image, so the collage never looks sparse.
function withRealImages<T extends { src: string }>(positions: T[], realImages: string[]): T[] {
  return positions.map((pos, i) => (realImages[i] ? { ...pos, src: realImages[i] } : pos));
}

export default function HeroSection({ heroImages = [] }: { heroImages?: string[] }) {
  const wrapRef      = useRef<HTMLDivElement>(null);
  const stickyRef    = useRef<HTMLDivElement>(null);
  const heroRef      = useRef<HTMLDivElement>(null);
  const collageRef   = useRef<HTMLDivElement>(null);
  const middleRef    = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const isMobile = viewport.w > 0 && viewport.w < 768;
  // Nothing viewport-dependent renders until we've actually measured, so a
  // phone never fetches the desktop tile set for a frame before swapping.
  const measured = viewport.w > 0;

  const desktopCollage = withRealImages(COLLAGE, heroImages);
  const mobileCollage  = withRealImages(COLLAGE_MOBILE, heroImages);
  const desktopMiddle  = heroImages[0] ? { ...MIDDLE_SLOT, src: heroImages[0] } : MIDDLE_SLOT;
  const mobileMiddle   = heroImages[0] ? { ...MIDDLE_SLOT_MOBILE, src: heroImages[0] } : MIDDLE_SLOT_MOBILE;

  const activeCollage = isMobile ? mobileCollage : desktopCollage;
  const activeMiddle  = isMobile ? mobileMiddle : desktopMiddle;
  const gridCols = isMobile ? GRID_COLS_MOBILE : GRID_COLS;
  const gridRows = isMobile ? GRID_ROWS_MOBILE : GRID_ROWS;
  const gridTemplate = {
    gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
    gridTemplateRows: `repeat(${gridRows}, 1fr)`,
  };

  // Tracks viewport WIDTH only, deliberately.
  //
  // Mobile browsers change window.innerHeight constantly while you scroll, as
  // the address bar hides and shows. Committing that to state re-runs the
  // ScrollTrigger effect below, whose cleanup calls ctx.revert() — so the
  // pinned hero timeline was being destroyed and rebuilt mid-scroll, every
  // time the address bar moved. That's a hard hitch under your finger.
  //
  // Height isn't needed here anyway: the circle math reads the sticky box's
  // own getBoundingClientRect() (see below), and that box is sized in CSS vh,
  // which resolves against the LARGE viewport and so doesn't move with the
  // address bar. Width is what actually matters (the mobile/desktop breakpoint
  // and orientation changes), and a genuine orientation change moves width too.
  useEffect(() => {
    const measure = () => {
      setViewport(prev => {
        const w = window.innerWidth, h = window.innerHeight;
        // Height-only changes are the address bar — ignore them entirely.
        return prev.w === w ? prev : { w, h };
      });
    };
    measure();
    let timer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(measure, 150);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    window.visualViewport?.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!viewport.w || !stickyRef.current) return;
    // One timeline for every screen size — mobile runs the same pinned morph
    // as desktop, just with the mobile grid and tile set.
    //
    // Worth recording why this came back: when mobile scrolling was finally
    // fixed, five things changed at once — the pin came off, 12-megapixel
    // images started going through next/image, Nav stopped forcing a layout
    // on every scroll event, the timeline stopped rebuilding on address-bar
    // resize, and scroll-behavior: smooth was removed. The pin got the blame
    // without ever being isolated. The image fix alone took a phone from
    // roughly 300MB of decoded bitmaps to a few MB, which is far more likely
    // to have been what was evicting textures mid-scroll. All of those fixes
    // stay; the pin is back on trial by itself.
    const ctx = gsap.context(() => {
      // Measure the sticky box itself rather than window.innerWidth/innerHeight.
      // CSS `vh` (the 100vh/300vh in this component's own styles) resolves to
      // the browser's LARGE viewport (chrome retracted), while JS innerHeight
      // reflects whatever's visible right now — on mobile those two numbers
      // genuinely disagree, and that mismatch (not just a stale read) is what
      // made the crop non-square and clipped into the logo. Reading the real
      // rendered box removes the mismatch entirely, on any browser.
      const box = stickyRef.current!.getBoundingClientRect();
      const vw = box.width;
      const vh = box.height;

      // Hero target: top-center
      const targetX = (HERO_LAND.cx / 100 - 0.5) * vw;
      const targetY = (HERO_LAND.cy / 100 - 0.5) * vh;

      // Clip-path crops the full-bleed rectangle down to a centered square (the
      // "round" radius grows to 999px at the same time, which the browser clamps
      // to 50% of whatever box remains — once that box is square, that's a
      // perfect circle). Whichever dimension is already the shorter one gets 0
      // inset, so this works the same in both landscape and portrait viewports.
      const squareSide = Math.min(vw, vh);
      const insetX = Math.max(0, (vw - squareSide) / 2);
      const insetY = Math.max(0, (vh - squareSide) / 2);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "top top",
          end: "bottom bottom",
          // Numeric (not `true`) on purpose: this eases the animation toward
          // the scroll position instead of locking it 1:1. On touch, momentum
          // dies the instant a finger touches down — with a 1:1 scrub the
          // visual stops dead at that moment, which reads as the scroll
          // "stopping midway". The easing lets it glide to a stop instead.
          scrub: 1.2,
          pin: stickyRef.current,
          anticipatePin: 1,
        },
      });

      // Phase 1: hero shrinks + moves to top-center while its own clip-path
      // gradually rounds the rectangle into a circle — one continuous morph,
      // not a crossfade between separate shapes.
      tl.to(heroRef.current, {
        scale: HERO_LAND.scale,
        x: targetX,
        y: targetY,
        clipPath: `inset(${insetY}px ${insetX}px ${insetY}px ${insetX}px round 999px)`,
        // box-shadow is not GPU-composited, so scrubbing it means re-rasterising
        // a large blurred shadow on a full-viewport element every single frame —
        // one of the most expensive things you can animate on a phone GPU, and a
        // direct cause of dropped frames mid-scroll. Desktop can afford it; on
        // mobile the morph runs without it.
        ...(isMobile ? {} : { boxShadow: "0 12px 32px rgba(0,0,0,0.22)" }),
        ease: "power2.inOut",
        duration: 0.6,
      }, 0);

      // Phase 2: collage fades in staggered (page-shift feel)
      tl.fromTo(
        collageRef.current!.querySelectorAll<HTMLElement>(".cc"),
        { opacity: 0, y: 22 },
        {
          opacity: (i: number) => FADE_OPACITY[activeCollage[i].fade],
          y: 0,
          stagger: 0.025,
          ease: "power2.out",
          duration: 0.6,
        },
        0.1
      );

      // Phase 3: middle artwork fades in last — page-shift centrepiece
      tl.fromTo(middleRef.current,
        { opacity: 0, scale: 0.92, y: 30 },
        { opacity: 1, scale: 1, y: 0, ease: "power3.out", duration: 0.5 },
        0.45
      );

    });

    return () => ctx.revert();
    // isMobile is derived from viewport.w (already a dep), so it can't change
    // without w changing — listed explicitly because the effect branches on it
    // for the mobile-only paint-cost reductions.
  }, [viewport.w, isMobile]);

  // Desktop keeps the 300vh pinned scroll-scrub. Mobile is exactly one screen
  // tall with nothing pinned, so a single thumb swipe carries you past the hero
  // and into the page — no scroll is ever absorbed without moving content.
  return (
    <div ref={wrapRef} data-hero-wrap style={{ height: "300vh" }}>
      {/* `relative` is load-bearing: every child below is `absolute inset-0`,
          and without a positioned ancestor they resolve against the page
          wrapper instead — stretching the hero to the full document height.
          On desktop GSAP's pin happens to set position:fixed, which masked
          this; unpinned mobile has no such accident. */}
      {/* hero-screen = 100dvh (falling back to 100vh). dvh is the height that's
          actually visible, so on iOS the pinned hero fills the screen exactly
          instead of running under the address bar. `relative` is load-bearing:
          every child is `absolute inset-0` and needs a positioned ancestor. */}
      <div ref={stickyRef} className="relative w-full overflow-hidden hero-screen">

        {/* Page bg */}
        <div className="absolute inset-0 bg-beige dark:bg-dark" />

        {/* Collage — CSS Grid, so tiles structurally cannot overlap regardless of
            viewport width, and integer spans give real big/small size variation.
            Rendered only once the viewport is measured, so a phone never fetches
            the desktop tile set for a frame before swapping to the mobile one.
            Desktop reveals these by scrubbing the pinned timeline; mobile fades
            them in once on load (see below) — same look arriving, no scroll
            hijacked to produce it. */}
        {measured && (
        <div ref={collageRef} className="absolute inset-0 z-10 grid gap-2 md:gap-3 p-2 md:p-3"
          style={gridTemplate}>
          {activeCollage.map((c, i) => (
            <div key={i} className="cc relative overflow-hidden rounded-xl"
              style={{
                gridColumn: `${c.col} / span ${c.colSpan}`,
                gridRow: `${c.row} / span ${c.rowSpan}`,
                // Hidden until the scrubbed timeline reveals them — same on
                // every screen size now.
                opacity: 0,
                willChange: "transform, opacity",
              }}>
              {/* next/image, not a raw <img>: the source art is up to 12
                  megapixels (~4MB each), and a raw tag ships the original
                  untouched. This serves a resized WebP/AVIF at roughly the
                  size actually rendered — which is what makes showing these
                  on a phone affordable at all. */}
              <Image src={c.src} alt="" fill draggable={false}
                sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 20vw"
                className="object-cover" />
              {c.fade >= 1 && (
                <div className="absolute inset-0 pointer-events-none" style={{
                  background: c.fade === 1
                    ? "linear-gradient(to bottom, transparent 25%, rgba(239,231,218,0.5) 100%)"
                    : "linear-gradient(to bottom, transparent 5%, rgba(239,231,218,0.82) 100%)",
                }} />
              )}
              {c.fade >= 1 && (
                <div className="absolute inset-0 pointer-events-none hidden dark:block" style={{
                  background: c.fade === 1
                    ? "linear-gradient(to bottom, transparent 25%, rgba(28,28,26,0.5) 100%)"
                    : "linear-gradient(to bottom, transparent 5%, rgba(28,28,26,0.82) 100%)",
                }} />
              )}
            </div>
          ))}

          {/* Screen fog */}
          <div className="absolute inset-0 pointer-events-none z-20" style={{
            background: "linear-gradient(to bottom, transparent 50%, rgba(239,231,218,0.7) 78%, rgba(239,231,218,1) 100%)",
          }} />
          <div className="absolute inset-0 pointer-events-none z-20 hidden dark:block" style={{
            background: "linear-gradient(to bottom, transparent 50%, rgba(28,28,26,0.7) 78%, rgba(28,28,26,1) 100%)",
          }} />
        </div>
        )}

        {/* Middle centrepiece — its own grid using the same template/gap/padding as
            the collage above, so its slot lines up exactly with the reserved gap
            instead of relying on a separately hand-computed pixel position. */}
        {measured && (
        <div className="absolute inset-0 grid gap-2 md:gap-3 p-2 md:p-3 pointer-events-none"
          style={{ ...gridTemplate, zIndex: 15 }}>
          <div ref={middleRef}
            className="relative overflow-hidden rounded-xl pointer-events-auto"
            style={{
              gridColumn: `${activeMiddle.col} / span ${activeMiddle.colSpan}`,
              gridRow: `${activeMiddle.row} / span ${activeMiddle.rowSpan}`,
              opacity: 0,
              willChange: "transform, opacity",
              boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
            }}>
            <Image src={activeMiddle.src} alt="" fill draggable={false}
              sizes="(max-width: 1280px) 40vw, 30vw"
              className="object-cover" />
          </div>
        </div>
        )}

        {/* Hero logo — full screen, gradually clip-paths + shrinks into a
            circular badge at top-center as a single continuous scroll-driven
            morph. Same on every screen size. */}
        <div ref={heroRef}
          className="absolute inset-0 overflow-hidden"
          style={{
            transformOrigin: "center center",
            clipPath: "inset(0px 0px 0px 0px round 0px)",
            boxShadow: "0 0px 0px rgba(0,0,0,0)",
            zIndex: 22,
            // Matches hero.png's own background so the area object-contain
            // letterboxes is indistinguishable from the image itself; the
            // CSS variable flips with the theme so this doesn't stay beige
            // in dark mode (see --hero-letterbox in globals.css).
            backgroundColor: "var(--hero-letterbox)",
            // clip-path and box-shadow aren't GPU-composited, so promoting for
            // them buys nothing and costs layer memory — which is scarce on a
            // phone, and box-shadow isn't scrubbed there anyway.
            willChange: isMobile ? "transform" : "transform, clip-path, box-shadow",
          }}>
          {/* object-contain, not object-cover: hero.png is a square whose logo
              is sized to fit the circular clip. Cover would scale it to fill
              the viewport and crop the overflowing axis — on a tall phone that
              meant cutting several hundred px off each side, straight through
              the logo. Contain renders it at exactly min(vw,vh) centred, which
              is the same box the clip-path targets, so the logo is never cut on
              any screen shape. */}
          {/* priority: this is the largest-contentful-paint element on every
              first visit, so it must not wait behind lazy-loading heuristics. */}
          <Image src="/hero.png" alt="AanyaByHiranya" fill priority
            sizes="100vw" className="object-contain" />
        </div>

        {/* Discover CTA — a sibling of the hero image, not a child, so it's
            unaffected by the hero's own shrink/clip-path morph and stays
            full-size and legible for the whole pinned scroll. It leaves the
            screen only because it scrolls away with the rest of the sticky
            section once the pin releases past the hero. */}
        <div className="absolute inset-x-0 bottom-20 md:bottom-24 flex flex-col items-center px-6 text-center" style={{ zIndex: 25 }}>
          <Link href="/portfolio"
            className="text-[11px] tracking-[0.2em] uppercase text-forest dark:text-beige border-b border-forest/40 dark:border-beige/40 pb-1 hover:opacity-70 transition-opacity">
            Discover
          </Link>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 opacity-40">
          <div className="relative h-10 w-px overflow-hidden bg-white/40">
            <div className="absolute top-0 h-[40%] w-full bg-white"
              style={{ animation: "scrollLine 1.5s ease-in-out infinite" }} />
          </div>
        </div>

        <style>{`
          @keyframes scrollLine {
            0%   { transform: translateY(-100%); }
            100% { transform: translateY(300%); }
          }
          /* The collage is revealed by the scrubbed timeline, so it starts at
             opacity 0. If someone has asked the OS to reduce motion, the
             timeline never runs for them — reveal the tiles outright rather
             than leaving content permanently invisible. */
          @media (prefers-reduced-motion: reduce) {
            .cc { opacity: 1 !important; }
          }
        `}</style>
      </div>
    </div>
  );
}
