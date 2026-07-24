"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Hero lands top-center (left 38%, top 2%, w ~24vw). The full rectangular hero
// image shrinks and fades out here, then a separate circular badge (a dedicated
// pre-cropped circular logo, not the same rectangular image forced into a circle)
// fades in at the same spot — CSS can't turn a wide rectangle into a true circle
// without squishing it, so this crossfades between two purpose-made assets instead.
const HERO_LAND = { cx: 50, cy: 27, scale: 0.24 }; // cx/cy = % of screen; cy kept clear of the fixed nav bar

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

const FADE_OPACITY = [0.95, 0.72, 0.35];

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
  const circleRef    = useRef<HTMLDivElement>(null);
  const collageRef   = useRef<HTMLDivElement>(null);
  const middleRef    = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

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

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    let timer: ReturnType<typeof setTimeout>;
    const check = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setIsMobile(window.innerWidth < 768), 150);
    };
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("resize", check);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Hero target: top-center. Clamp the landing Y so it never sits behind
      // the fixed nav bar (64px) on short viewports — a pure vh-percentage
      // lands too high once the badge's own radius eats into that headroom.
      const halfBadge = Math.min(110, Math.max(48, 0.07 * vw));
      const safeCenterY = Math.max((HERO_LAND.cy / 100) * vh, 64 + halfBadge + 16);
      const targetX = (HERO_LAND.cx / 100 - 0.5) * vw;
      const targetY = safeCenterY - vh / 2;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2,
          pin: stickyRef.current,
          anticipatePin: 1,
        },
      });

      // Phase 1: hero shrinks + moves to top-center, then fades out as the
      // circular badge crossfades in at the exact same landed spot.
      tl.to(heroRef.current, {
        scale: HERO_LAND.scale,
        x: targetX,
        y: targetY,
        ease: "power2.inOut",
        duration: 0.6,
      }, 0);

      tl.to(heroRef.current, {
        opacity: 0,
        ease: "power1.in",
        duration: 0.18,
      }, 0.42);

      tl.fromTo(circleRef.current,
        { opacity: 0, scale: 0.85, xPercent: -50, yPercent: -50 },
        { opacity: 1, scale: 1, xPercent: -50, yPercent: -50, ease: "power2.out", duration: 0.28 },
        0.48
      );

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
  }, [isMobile]);

  return (
    <div ref={wrapRef} style={{ height: "300vh" }}>
      <div ref={stickyRef} className="w-full overflow-hidden"
        style={{ height: "100vh" }}>

        {/* Page bg */}
        <div className="absolute inset-0 bg-beige dark:bg-dark" />

        {/* Collage — CSS Grid, so tiles structurally cannot overlap regardless of
            viewport width, and integer spans give real big/small size variation. */}
        <div ref={collageRef} className="absolute inset-0 z-10 grid gap-2 md:gap-3 p-2 md:p-3"
          style={gridTemplate}>
          {activeCollage.map((c, i) => (
            <div key={i} className="cc relative overflow-hidden rounded-xl"
              style={{
                gridColumn: `${c.col} / span ${c.colSpan}`,
                gridRow: `${c.row} / span ${c.rowSpan}`,
                opacity: 0,
                willChange: "transform, opacity",
              }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.src} alt="" className="w-full h-full object-cover"
                loading="lazy" draggable={false} />
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

        {/* Middle centrepiece — its own grid using the same template/gap/padding as
            the collage above, so its slot lines up exactly with the reserved gap
            instead of relying on a separately hand-computed pixel position. */}
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={activeMiddle.src} alt="" className="w-full h-full object-cover"
              draggable={false} />
          </div>
        </div>

        {/* Hero image — full screen, shrinks to top-center, then fades out */}
        <div ref={heroRef}
          className="absolute inset-0 z-20 overflow-hidden"
          style={{ transformOrigin: "center center", willChange: "transform, opacity" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hero.png" alt="AanyaByHiranya"
            className="w-full h-full object-cover" />
        </div>

        {/* Circular badge — a dedicated pre-cropped circular logo (not the same
            rectangular hero image forced into a circle, which would need squishing
            or an unpredictable crop), crossfaded in at the same landed spot. */}
        <div ref={circleRef}
          className="absolute rounded-full overflow-hidden"
          style={{
            left: `${HERO_LAND.cx}%`,
            top: `max(${HERO_LAND.cy}%, calc(4rem + clamp(48px, 7vw, 110px) + 16px))`,
            width: "clamp(96px, 14vw, 220px)",
            height: "clamp(96px, 14vw, 220px)",
            transformOrigin: "center center",
            opacity: 0,
            zIndex: 22,
            willChange: "transform, opacity",
            boxShadow: "0 12px 32px rgba(0,0,0,0.22)",
          }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hero-circle.png" alt="AanyaByHiranya"
            className="w-full h-full object-cover" draggable={false} />
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
        `}</style>
      </div>
    </div>
  );
}
