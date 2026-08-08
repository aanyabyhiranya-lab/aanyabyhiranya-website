"use client";
import { useEffect, useRef, useState } from "react";

// Gated on real pointer capability (`pointer: fine`), not a width breakpoint —
// a width check doesn't stop mobile browsers from firing one synthetic
// `mousemove` on tap, which planted the dot at the tap point with nothing to
// move it afterward (no real mousemove stream on a touch device). Checking
// pointer capability means touch devices never attach the listener or render
// the dot at all, regardless of viewport width.
export default function CursorDot() {
  const cursor = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const sync = () => setEnabled(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.style.cursor = "none";
    document.documentElement.style.setProperty("--cursor", "none");

    const move = (e: MouseEvent) => {
      if (!cursor.current) return;
      cursor.current.style.left = e.clientX + "px";
      cursor.current.style.top = e.clientY + "px";
    };
    window.addEventListener("mousemove", move);
    return () => {
      window.removeEventListener("mousemove", move);
      document.documentElement.style.cursor = "";
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={cursor} className="fixed pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 text-2xl select-none">
      🌻
    </div>
  );
}
