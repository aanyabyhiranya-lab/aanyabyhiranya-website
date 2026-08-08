"use client";
import { useEffect, useRef } from "react";

declare global {
  interface Window { instgrm?: { Embeds: { process: () => void } } }
}

// Renders Instagram's own official embed widget for a Reel/post permalink.
// Instagram's player is entirely their iframe — we can't control its playback
// (no forced autoplay), only where and how big it renders on the page.
export default function InstagramEmbed({ url }: { url: string }) {
  const ref = useRef<HTMLQuoteElement>(null);

  useEffect(() => {
    const load = () => window.instgrm?.Embeds.process();
    if (window.instgrm) {
      load();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>('script[src="//www.instagram.com/embed.js"]');
    if (existing) {
      existing.addEventListener("load", load);
      return () => existing.removeEventListener("load", load);
    }
    const script = document.createElement("script");
    script.src = "//www.instagram.com/embed.js";
    script.async = true;
    script.onload = load;
    document.body.appendChild(script);
  }, [url]);

  return (
    <blockquote
      ref={ref}
      className="instagram-media"
      data-instgrm-permalink={url}
      data-instgrm-version="14"
      style={{ margin: "0 auto", maxWidth: "540px", width: "100%" }}
    />
  );
}
