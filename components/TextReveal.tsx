"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function TextReveal({
  text, tag = "h2", className = "", delay = 0,
}: {
  text: string; tag?: "h1" | "h2" | "h3" | "p"; className?: string; delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Split into word spans
    const words = text.split(" ");
    el.innerHTML = words.map(w =>
      `<span class="word-wrap" style="display:inline-block;overflow:hidden;vertical-align:bottom;margin-right:0.25em">` +
      `<span class="word" style="display:inline-block;transform:translateY(110%)">${w}</span></span>`
    ).join("");

    const ctx = gsap.context(() => {
      gsap.to(el.querySelectorAll(".word"), {
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.06,
        delay,
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          toggleActions: "play none none none",
        },
      });
    });

    return () => ctx.revert();
  }, [text, delay]);

  const Tag = tag as any;
  return <Tag ref={ref} className={className}>{text}</Tag>;
}
