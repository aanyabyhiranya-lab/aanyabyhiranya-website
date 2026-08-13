"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ClientEffects() {
  useEffect(() => {
    // Teardown for things gsap's context doesn't own (Lenis, the ticker hook).
    const cleanups: Array<() => void> = [];

    // Everything gsap creates here is registered to this context, so cleanup
    // reverts exactly what this component made. (It used to call
    // ScrollTrigger.getAll().kill(), which also destroyed triggers belonging to
    // other components — notably the hero's pinned scroll timeline.)
    const ctx = gsap.context(() => {

      // ── Lenis smooth scroll — pointer-capable devices only ──────
      // Touch devices already have smooth, hardware-accelerated momentum
      // scrolling. Running Lenis on top of it means JS re-driving the scroll
      // position every frame while native momentum is also running, and it
      // fights the pinned/scrubbed hero timeline — which reads as stutter.
      // Lenis exists to smooth mouse-wheel input, so gate it on that.
      const wantsSmoothScroll =
        typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;

      if (wantsSmoothScroll) {
        const lenis = new Lenis({
          duration: 1.4,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
        });
        lenis.on("scroll", ScrollTrigger.update);

        // Keep the exact reference — the old code passed a fresh arrow function
        // to ticker.remove(), which never matches what was added, so the
        // callback (and a destroyed Lenis instance) leaked on every remount.
        const raf = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(raf);
        // Only meaningful while Lenis drives scrolling; left on globally it
        // removes GSAP's protection against frame-time spikes elsewhere.
        gsap.ticker.lagSmoothing(0);

        cleanups.push(() => {
          gsap.ticker.remove(raf);
          gsap.ticker.lagSmoothing(500, 33); // restore GSAP's default
          lenis.destroy();
        });
      }

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
    });

    // ── Scroll reveal ────────────────────────────────────────────
    // This gates real content behind a client-side animation succeeding —
    // if the observer is ever late or never fires, that content is stuck
    // invisible with no recourse. Chromium throttles IntersectionObserver
    // callbacks (along with rAF and timers) while a tab is backgrounded; a
    // user who switches away and comes back mid-scroll can land on a
    // section whose reveal callback hasn't been flushed yet. Two backstops:
    // re-check everything the moment the tab regains visibility, and
    // unconditionally reveal anything still hidden after a few seconds so a
    // slow/missed observer callback can never permanently hide content.
    const revealTargets = document.querySelectorAll<HTMLElement>(
      ".reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger"
    );
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1 }
    );
    revealTargets.forEach(el => observer.observe(el));

    const revealIfInView = () => {
      const vh = window.innerHeight;
      revealTargets.forEach(el => {
        if (el.classList.contains("visible")) return;
        const rect = el.getBoundingClientRect();
        if (rect.top < vh * 0.9 && rect.bottom > 0) el.classList.add("visible");
      });
    };
    document.addEventListener("visibilitychange", revealIfInView);

    const revealAllTimer = setTimeout(() => {
      revealTargets.forEach(el => el.classList.add("visible"));
    }, 4000);

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
      cleanups.forEach(fn => fn());
      cleanups.length = 0;
      ctx.revert();
      observer.disconnect();
      document.removeEventListener("visibilitychange", revealIfInView);
      clearTimeout(revealAllTimer);
      cards.forEach(c => {
        c.removeEventListener("mousemove",  onCardMove);
        c.removeEventListener("mouseleave", onCardLeave);
      });
    };
  }, []);

  // No custom cursor here — components/CursorDot.tsx owns that, and it gates
  // itself on `pointer: fine`. This component used to render a second, ungated
  // cursor dot: on a touch device a tap fires one synthetic mousemove, which
  // parked a green dot at the tap point with no further events to move it.
  return null;
}
