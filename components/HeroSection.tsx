"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Hero lands top-center (left 38%, top 2%, w ~24vw)
const HERO_LAND = { cx: 50, cy: 14, scale: 0.24 }; // cx/cy = % of screen

// Middle slot — centre gap
const MIDDLE_SLOT = { src: "/art11.jpg", top: 28, left: 38, w: 22, h: 36, row: 1 };

// Desktop: wide 4-column layout — vw/vh tuned for screens with room to spread out.
const COLLAGE = [
  // LEFT cluster — 2 columns, no overlaps
  // col A: left 0, w 20 → ends 20
  { src: "/art7.jpg",  top:  0, left:  0,  w: 20, h: 28, row: 0 },
  { src: "/art9.jpg",  top: 30, left:  0,  w: 20, h: 28, row: 1 },
  { src: "/art4.jpg",  top: 60, left:  0,  w: 20, h: 26, row: 1 },
  // col B: left 22, w 14 → ends 36
  { src: "/art13.jpg", top:  0, left: 22,  w: 14, h: 22, row: 0 },
  { src: "/art2.jpg",  top: 24, left: 22,  w: 14, h: 24, row: 0 },
  { src: "/art14.jpg", top: 50, left: 22,  w: 14, h: 26, row: 1 },
  // RIGHT cluster — 2 columns, no overlaps
  // col C: left 63, w 18 → ends 81
  { src: "/art3.jpg",  top:  0, left: 63,  w: 18, h: 26, row: 0 },
  { src: "/art8.jpg",  top: 28, left: 63,  w: 18, h: 26, row: 1 },
  { src: "/art10.jpg", top: 56, left: 63,  w: 18, h: 26, row: 1 },
  // col D: left 83, w 16 → ends 99
  { src: "/art6.jpg",  top:  0, left: 83,  w: 16, h: 22, row: 0 },
  { src: "/art12.jpg", top: 24, left: 83,  w: 16, h: 24, row: 0 },
  { src: "/art1.jpg",  top: 50, left: 83,  w: 16, h: 26, row: 1 },
  { src: "/art5.jpg",  top: 78, left: 63,  w: 16, h: 20, row: 2 },
];

// Mobile: same tiles, but re-tuned for a ~390px-wide portrait screen. The desktop
// widths above (14-20vw) combined with the same heights (22-28vh) produce tall,
// narrow slivers on a phone — e.g. 14vw is ~55px wide but 24vh is still ~190px
// tall, so object-cover crops away most of each painting. This uses a plain
// 2-column grid with near-square tiles instead, so full compositions stay visible.
const COLLAGE_MOBILE = [
  { src: "/art7.jpg",  top:  2, left:  4, w: 43, h: 20, row: 0 },
  { src: "/art3.jpg",  top:  2, left: 53, w: 43, h: 20, row: 0 },
  { src: "/art9.jpg",  top: 24, left:  4, w: 43, h: 20, row: 1 },
  { src: "/art8.jpg",  top: 24, left: 53, w: 43, h: 20, row: 1 },
  { src: "/art4.jpg",  top: 46, left:  4, w: 43, h: 20, row: 1 },
  { src: "/art10.jpg", top: 46, left: 53, w: 43, h: 20, row: 1 },
  { src: "/art13.jpg", top: 68, left:  4, w: 43, h: 18, row: 2 },
  { src: "/art6.jpg",  top: 68, left: 53, w: 43, h: 18, row: 2 },
];

const MIDDLE_SLOT_MOBILE = { src: "/art11.jpg", top: 30, left: 27, w: 46, h: 24, row: 1 };

const ROW_OPACITY = [0.95, 0.72, 0.35];

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
  const [isMobile, setIsMobile] = useState(false);

  const desktopCollage = withRealImages(COLLAGE, heroImages);
  const mobileCollage  = withRealImages(COLLAGE_MOBILE, heroImages);
  const desktopMiddle  = heroImages[0] ? { ...MIDDLE_SLOT, src: heroImages[0] } : MIDDLE_SLOT;
  const mobileMiddle   = heroImages[0] ? { ...MIDDLE_SLOT_MOBILE, src: heroImages[0] } : MIDDLE_SLOT_MOBILE;

  const activeCollage = isMobile ? mobileCollage : desktopCollage;
  const activeMiddle  = isMobile ? mobileMiddle : desktopMiddle;

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Hero target: top-center
      const targetX = (HERO_LAND.cx / 100 - 0.5) * vw;
      const targetY = (HERO_LAND.cy / 100 - 0.5) * vh;

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

      // Phase 1: hero shrinks to top-center
      tl.to(heroRef.current, {
        scale: HERO_LAND.scale,
        x: targetX,
        y: targetY,
        borderRadius: "14px",
        boxShadow: "0 16px 48px rgba(0,0,0,0.32)",
        ease: "power2.inOut",
        duration: 0.6,
      }, 0);

      // Phase 2: collage fades in staggered (page-shift feel)
      tl.fromTo(
        collageRef.current!.querySelectorAll<HTMLElement>(".cc"),
        { opacity: 0, y: 22 },
        {
          opacity: (i: number) => ROW_OPACITY[activeCollage[i].row],
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

        {/* Collage — left + right clusters */}
        <div ref={collageRef} className="absolute inset-0 z-10">
          {activeCollage.map((c, i) => (
            <div key={i} className="cc absolute overflow-hidden rounded-xl"
              style={{
                top:    `${c.top}%`,
                left:   `${c.left}%`,
                width:  `${c.w}vw`,
                height: `${c.h}vh`,
                opacity: 0,
                willChange: "transform, opacity",
              }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.src} alt="" className="w-full h-full object-cover"
                loading="lazy" draggable={false} />
              {c.row >= 1 && (
                <div className="absolute inset-0 pointer-events-none" style={{
                  background: c.row === 1
                    ? "linear-gradient(to bottom, transparent 25%, rgba(239,231,218,0.5) 100%)"
                    : "linear-gradient(to bottom, transparent 5%, rgba(239,231,218,0.82) 100%)",
                }} />
              )}
              {c.row >= 1 && (
                <div className="absolute inset-0 pointer-events-none hidden dark:block" style={{
                  background: c.row === 1
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

        {/* Middle centrepiece — different artwork in the gap */}
        <div ref={middleRef}
          className="absolute overflow-hidden rounded-xl z-15"
          style={{
            top:    `${activeMiddle.top}%`,
            left:   `${activeMiddle.left}%`,
            width:  `${activeMiddle.w}vw`,
            height: `${activeMiddle.h}vh`,
            opacity: 0,
            willChange: "transform, opacity",
            zIndex: 15,
            boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
          }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={activeMiddle.src} alt="" className="w-full h-full object-cover"
            draggable={false} />
        </div>

        {/* Hero image — full screen, shrinks to top-center */}
        <div ref={heroRef}
          className="absolute inset-0 z-20 overflow-hidden"
          style={{ transformOrigin: "center center", willChange: "transform, border-radius, box-shadow" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hero.png" alt="AanyaByHiranya"
            className="w-full h-full object-cover" />
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
