"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ParallaxImage({
  src, alt, className = "", speed = 0.3,
}: {
  src: string; alt: string; className?: string; speed?: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef  = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Parallax is a scroll-scrubbed transform running every frame. It's a nice
    // touch with a mouse, but on a phone it's per-frame main-thread work during
    // exactly the swipe that needs to stay smooth, for an effect that's barely
    // perceptible on a small screen. Skip it on touch and render the image flat.
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(imgRef.current,
        { yPercent: -10 * speed * 10 },
        {
          yPercent: 10 * speed * 10,
          ease: "none",
          scrollTrigger: {
            trigger: wrapRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    });
    return () => ctx.revert();
  }, [speed]);

  return (
    <div ref={wrapRef} className={`overflow-hidden relative ${className}`}>
      <Image ref={imgRef} src={src} alt={alt} fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover !h-[115%]"
        style={{ willChange: "transform" }} />
    </div>
  );
}
