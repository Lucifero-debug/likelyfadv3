"use client";
/* T-0088 round 7: the How it works motion driver (both layouts).
   Every scene animation is a CSS keyframe run on ONE shared progress value
   (--v6s-p, 0..1) through a paused animation and a negative delay (the rule
   "[data-v6s-mode] .v6s-anim" in polish.css). This driver only writes that
   number, so the same keyframes serve the Apple sticky layout, the cards,
   and phones, and they are checkable in every engine (headless WebKit does
   not run CSS scroll timelines, so the driver is JS by design).
   - Sticky (>=900px): each step's text block drives its scene; the pinned
     card shows the active step's scene (crossfade by class).
   - Stacked (phones, both layouts): each scene drives itself from its own
     position.
   - Cards on a fine pointer: the scene rests on its end frame; hover replays
     it (3s), like inpublic's cards.
   Scroll up = the scene rewinds. Work happens only while the block is on
   screen, one rAF per scroll frame, no layout writes. Reduced motion: no
   mode, so every scene shows its end frame and nothing moves. */
import { useEffect, useRef, type ReactNode } from "react";

const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export function StepsScrub({ layout, children }: { layout: "sticky" | "cards"; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const wide = matchMedia("(min-width: 900px)");
    const fine = matchMedia("(pointer: fine)");
    const hosts = [...el.querySelectorAll<HTMLElement>("[data-v6s-host]")];
    hosts.forEach(h => { h.dataset.v6sMode = "js"; });
    let raf = 0, onScreen = false;
    const set = (h: HTMLElement, p: number) => { const v = p.toFixed(4); if (h.style.getPropertyValue("--v6s-p") !== v) h.style.setProperty("--v6s-p", v); };

    const frame = () => {
      raf = 0;
      const vh = innerHeight;
      if (layout === "sticky" && wide.matches) {
        const steps = [...el.querySelectorAll<HTMLElement>("[data-v6s-step]")];
        let active = 0;
        steps.forEach((s, i) => {
          const top = s.getBoundingClientRect().top;
          if (top < vh * 0.55) active = i;
          const layer = el.querySelector<HTMLElement>(`[data-v6s-host][data-v6s-layer="${i}"]`);
          if (layer) set(layer, clamp((vh * 0.8 - top) / (vh * 0.5)));
        });
        el.querySelectorAll<HTMLElement>("[data-v6s-layer]").forEach(l => l.classList.toggle("is-on", Number(l.dataset.v6sLayer) === active));
        el.querySelectorAll<HTMLElement>("[data-v6s-rail]").forEach((r, i) => r.classList.toggle("is-on", i <= active));
        return;
      }
      if (layout === "cards" && wide.matches && fine.matches) return; // hover-driven
      el.querySelectorAll<HTMLElement>("[data-v6s-host][data-v6s-inline]").forEach(h => {
        if (!h.offsetParent) return;
        set(h, clamp((vh * 0.92 - h.getBoundingClientRect().top) / (vh * 0.55)));
      });
    };
    const schedule = () => { if (onScreen && !raf) raf = requestAnimationFrame(frame); };

    // Cards on a fine pointer: rest on the end frame, replay on hover.
    const tweens = new Map<HTMLElement, number>();
    const replay = (h: HTMLElement) => {
      if (!(layout === "cards" && wide.matches && fine.matches)) return;
      cancelAnimationFrame(tweens.get(h) ?? 0);
      const t0 = performance.now();
      const step = (t: number) => { const p = clamp((t - t0) / 3000); set(h, p); if (p < 1) tweens.set(h, requestAnimationFrame(step)); };
      set(h, 0); tweens.set(h, requestAnimationFrame(step));
    };
    const enter = (e: Event) => { const h = (e.currentTarget as HTMLElement).querySelector<HTMLElement>("[data-v6s-host]"); if (h) replay(h); };
    const cards = [...el.querySelectorAll<HTMLElement>("[data-v6s-card]")];
    cards.forEach(c => c.addEventListener("pointerenter", enter));

    const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; schedule(); }, { rootMargin: "20% 0px" });
    io.observe(el);
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    wide.addEventListener("change", schedule);
    // Before the first frame every host shows its end frame (--v6s-p unset = 1).
    return () => {
      io.disconnect(); removeEventListener("scroll", schedule); removeEventListener("resize", schedule);
      wide.removeEventListener("change", schedule); cancelAnimationFrame(raf);
      tweens.forEach(t => cancelAnimationFrame(t)); cards.forEach(c => c.removeEventListener("pointerenter", enter));
    };
  }, [layout]);

  return <div ref={root} data-v6-steps={layout}>{children}</div>;
}
