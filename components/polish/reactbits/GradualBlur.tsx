"use client";
/* Adapted from React Bits GradualBlur (DavidHDev/react-bits).
   MIT + Commons Clause, Copyright (c) 2026 David Haz.
   Website use; not distributed as a component product.
   Retains its progressive masked backdrop layers; three static layers, no hover,
   runtime style injection or dependencies.
   Reed (Aman msg 2512-2514, option B): ONE strip fixed to the viewport bottom.
   It shows over text sections and fades out while a video wall is under it,
   so the footage is never blurred. One IntersectionObserver watches the bottom
   band of the viewport; the only thing that changes is one attribute. */
import { useEffect, useRef } from "react";
import { GRADUAL_BLUR_HIDE_OVER_VIDEO, SHOW_GRADUAL_BLUR } from "../motion";

const HEIGHT = 48;
/* The sections whose footage would sit under the strip. */
const VIDEO_WALLS = "[data-polish-lanes], [data-video-wall], #featured-ad, #work, #testimonials";

export function GradualBlur() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const strip = ref.current;
    if (!strip || !GRADUAL_BLUR_HIDE_OVER_VIDEO) return;
    const walls = [...document.querySelectorAll(VIDEO_WALLS)];
    const under = new Set<Element>();
    let io: IntersectionObserver | null = null;
    const observe = () => {
      io?.disconnect();
      under.clear();
      // The root is shrunk to the strip's own band at the bottom of the viewport.
      io = new IntersectionObserver(entries => {
        for (const e of entries) { if (e.isIntersecting) under.add(e.target); else under.delete(e.target); }
        strip.dataset.overVideo = String(under.size > 0);
      }, { rootMargin: `-${Math.max(0, innerHeight - HEIGHT)}px 0px 0px 0px` });
      walls.forEach(w => io!.observe(w));
    };
    let timer = 0;
    const resize = () => { clearTimeout(timer); timer = window.setTimeout(observe, 150); };
    observe();
    window.addEventListener("resize", resize);
    return () => { io?.disconnect(); clearTimeout(timer); window.removeEventListener("resize", resize); };
  }, []);

  if (!SHOW_GRADUAL_BLUR) return null;
  return (
    <div ref={ref} data-gradual-blur="viewport" data-over-video={GRADUAL_BLUR_HIDE_OVER_VIDEO ? "true" : "false"} aria-hidden="true">
      {[1, 2, 3].map(i => {
        const step = 100 / 3;
        const stops = [`transparent ${(i - 1) * step}%`, `black ${i * step}%`];
        if ((i + 1) * step <= 100) stops.push(`black ${(i + 1) * step}%`);
        if ((i + 2) * step <= 100) stops.push(`transparent ${(i + 2) * step}%`);
        const mask = `linear-gradient(to bottom, ${stops.join(", ")})`;
        return <div key={i} style={{ maskImage: mask, WebkitMaskImage: mask, backdropFilter: `blur(${i * 2}px)`, WebkitBackdropFilter: `blur(${i * 2}px)` }} />;
      })}
    </div>
  );
}
