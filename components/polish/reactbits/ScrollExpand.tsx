"use client";
/* Adapted from React Bits ScrollExpand (DavidHDev/react-bits).
   MIT + Commons Clause, Copyright (c) 2026 David Haz.
   Website use; not distributed as a component product.
   Uses the original window-scroll runway, sticky stage and smoothstep curve.
   Uniform frame scale replaces clipping/zoom, preserving the whole portrait ad.
   No perpetual RAF, deferred video source, visibility-gated playback, accessible
   sound control, and an unpinned, poster-only reduced-motion finished state. */
import { useEffect, useRef, useState } from "react";
import { EXPAND_COMPLETE_EVENT } from "../motion";

export function ScrollExpand({ src, poster, mediaType, useWindowScroll }: {
  src: string; poster: string; mediaType: "video"; useWindowScroll: true;
}) {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const el = root.current, media = video.current;
    if (!el || !media) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0, visible = false, disposed = false;
    const playback = () => {
      if (!visible || preference.matches || document.hidden) { media.pause(); return; }
      // The poster is server-rendered. No video bytes are requested offscreen.
      if (!media.hasAttribute("src")) media.src = src;
      void media.play().then(() => {
        if (disposed || !visible || preference.matches || document.hidden) media.pause();
      }).catch(() => { /* Muted autoplay may still be refused by the browser. */ });
    };
    const update = () => {
      frame = 0;
      const raw = preference.matches ? 1 : Math.max(0, Math.min(1, -el.getBoundingClientRect().top / innerHeight));
      const p = raw >= 0.995 ? 1 : raw; // Reed: scroll maths tops out at 0.9999 at 1440, so "fully expanded" never fired
      const eased = p * p * (3 - 2 * p);
      el.style.setProperty("--expand-scale", String(0.58 + 0.42 * eased));
      el.dataset.progress = String(p);
      el.dataset.expanded = String(p === 1);
      if (p === 1 && el.dataset.expandComplete !== "true") {
        el.dataset.expandComplete = "true";
        window.dispatchEvent(new Event(EXPAND_COMPLETE_EVENT));
      }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const change = () => { update(); playback(); };
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; playback(); });
    // Observe the stage, not the long runway: pause when the visible media exits.
    io.observe(el.querySelector("[data-expand-stage]")!);
    update();
    if (useWindowScroll) window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    preference.addEventListener("change", change);
    document.addEventListener("visibilitychange", playback);
    return () => {
      disposed = true; cancelAnimationFrame(frame); io.disconnect(); media.pause();
      window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule);
      preference.removeEventListener("change", change); document.removeEventListener("visibilitychange", playback);
    };
  }, [src, useWindowScroll]);

  return (
    <section ref={root} id="featured-ad" aria-label="Featured ad" data-scroll-expand data-media-type={mediaType} data-progress="1" data-expanded="true">
      <div data-expand-stage>
        <div data-expand-frame>
          <video ref={video} poster={poster} preload="none" muted={muted} loop playsInline aria-label="Featured AI ad" />
        </div>
        <button type="button" data-expand-sound aria-pressed={!muted} onClick={() => {
          const media = video.current;
          if (!media) return;
          const next = !media.muted;
          media.muted = next; // Must happen synchronously inside the user gesture.
          setMuted(next);
          // The reduced-motion default is a static poster. A deliberate tap
          // may play it with sound; muting restores that static default.
          const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
          if (reduced && next) media.pause();
          else {
            if (!media.hasAttribute("src")) media.src = src;
            void media.play().catch(() => {});
          }
        }}>{muted ? "Tap for sound" : "Mute"}</button>
      </div>
    </section>
  );
}
