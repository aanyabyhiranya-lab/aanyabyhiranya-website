"use client";
import { useRef, ReactNode } from "react";

export default function MagneticButton({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect   = el.getBoundingClientRect();
    const cx     = rect.left + rect.width  / 2;
    const cy     = rect.top  + rect.height / 2;
    const dx     = (e.clientX - cx) * 0.35;
    const dy     = (e.clientY - cy) * 0.35;
    el.style.transform    = `translate(${dx}px, ${dy}px)`;
    el.style.transition   = "transform 0.15s ease";
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform  = "translate(0,0)";
    el.style.transition = "transform 0.5s cubic-bezier(0.16,1,0.3,1)";
  };

  return (
    <div ref={ref} className={className}
      onMouseMove={onMove} onMouseLeave={onLeave}>
      {children}
    </div>
  );
}
