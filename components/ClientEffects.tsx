"use client";
import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ClientEffects() {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ── Lenis smooth scroll ──────────────────────────────────────
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // ── Cursor dot only ──────────────────────────────────────────
    const dot = dotRef.current;
    const moveCursor = (e: MouseEvent) => {
      if (!dot) return;
      dot.style.left = `${e.clientX - 3}px`;
      dot.style.top  = `${e.clientY - 3}px`;
    };
    window.addEventListener("mousemove", moveCursor);

    // ── Scroll reveal ────────────────────────────────────────────
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger")
      .forEach(el => observer.observe(el));

    // ── Section divider lines draw in ───────────────────────────
    document.querySelectorAll<HTMLElement>(".line-draw").forEach(el => {
      gsap.fromTo(el,
        { scaleX: 0, transformOrigin: "left center" },
        {
          scaleX: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none none" },
        }
      );
    });

    // ── Image scale-in on scroll ─────────────────────────────────
    document.querySelectorAll<HTMLElement>(".img-reveal").forEach(el => {
      gsap.fromTo(el,
        { scale: 1.08, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 1.1,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" },
        }
      );
    });

    // ── Stat counters animate up ─────────────────────────────────
    document.querySelectorAll<HTMLElement>(".count-up").forEach(el => {
      const target = parseFloat(el.dataset.target || "0");
      const isInt  = Number.isInteger(target);
      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        once: true,
        onEnter: () => {
          gsap.fromTo({ val: 0 }, { val: target },
            {
              duration: 1.8,
              ease: "power2.out",
              onUpdate: function() {
                el.textContent = isInt
                  ? Math.round(this.targets()[0].val).toString()
                  : this.targets()[0].val.toFixed(1);
              },
            }
          );
        },
      });
    });

    // ── Artwork cards tilt on hover ──────────────────────────────
    const cards = document.querySelectorAll<HTMLElement>(".art-card-tilt");
    const onCardMove = (e: MouseEvent) => {
      const card = (e.currentTarget as HTMLElement);
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 10;
      const y = ((e.clientY - rect.top)  / rect.height - 0.5) * -10;
      gsap.to(card, { rotateX: y, rotateY: x, duration: 0.4, ease: "power2.out", transformPerspective: 800 });
    };
    const onCardLeave = (e: MouseEvent) => {
      gsap.to(e.currentTarget as HTMLElement, { rotateX: 0, rotateY: 0, duration: 0.6, ease: "elastic.out(1,0.5)" });
    };
    cards.forEach(c => {
      c.addEventListener("mousemove",  onCardMove);
      c.addEventListener("mouseleave", onCardLeave);
    });


    return () => {
      lenis.destroy();
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
      window.removeEventListener("mousemove", moveCursor);
      observer.disconnect();
      ScrollTrigger.getAll().forEach(t => t.kill());
      cards.forEach(c => {
        c.removeEventListener("mousemove",  onCardMove);
        c.removeEventListener("mouseleave", onCardLeave);
      });
    };
  }, []);

  return <div ref={dotRef} className="cursor-dot" aria-hidden />;
}
