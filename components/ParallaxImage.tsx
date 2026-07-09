"use client";
import { useEffect, useRef } from "react";
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
    <div ref={wrapRef} className={`overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={imgRef} src={src} alt={alt}
        className="w-full h-[115%] object-cover"
        style={{ willChange: "transform" }} />
    </div>
  );
}
