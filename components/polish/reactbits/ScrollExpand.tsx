"use client";
/* Adapted from React Bits ScrollExpand (DavidHDev/react-bits).
   MIT + Commons Clause, Copyright (c) 2026 David Haz.
   Website use; not distributed as a component product.
   Uses the original window-scroll runway, sticky stage and smoothstep curve.
   Uniform frame scale replaces clipping/zoom, preserving the whole portrait ad.
   Scroll drives transform only (one var on the frame); beats flip one attribute.
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
    const frameEl = el?.querySelector<HTMLElement>("[data-expand-frame]");
    if (!el || !media || !frameEl) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    // Phone (Aman msgs 2531-2534): scale and beats come from a CSS scroll
    // timeline on the compositor (polish.css), so JS writes neither there.
    const cssDriven = matchMedia("(hover: none) and (pointer: coarse)").matches && CSS.supports("animation-timeline: view()");
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
      // Reed: the scale lives on the frame only, so each scroll frame restyles one
      // composited layer (transform), never the section or a paint property.
      if (!cssDriven) frameEl.style.setProperty("--expand-scale", String(0.58 + 0.42 * eased));
      // Beats (Alex, option A): three proof lines while the ad grows, then the
      // sound control alone at full width. Only an attribute flips; CSS fades.
      const beat = p === 1 ? "4" : p < 0.3 ? "1" : p < 0.65 ? "2" : "3";
      if (!cssDriven && el.dataset.beat !== beat) el.dataset.beat = beat;
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

  const toggleSound = () => {
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
  };

  return (
    <section ref={root} id="featured-ad" aria-label="Featured ad" data-nav-dark data-scroll-expand data-media-type={mediaType} data-progress="1" data-expanded="true" data-beat="4">
      <div data-expand-stage>
        <div data-expand-frame>
          <video ref={video} poster={poster} preload="none" muted={muted} loop playsInline aria-label="Featured AI ad" />
          {/* Round 2 (Aman msg 2615): the sound control lives ON the video, so it
              moves and scales with the frame (never in the desktop text column). */}
          <button type="button" data-expand-sound data-sound-at="frame" aria-pressed={!muted} onClick={toggleSound}>{muted ? "Tap for sound" : "Mute"}</button>
        </div>
        <p data-expand-beats>
          <span data-beat-line="1">Watch this ad.</span>
          <span data-beat-line="2">Every frame is AI.</span>
          <span data-beat-line="3">Not one was filmed.</span>
        </p>
        {/* Phone/touch: the stage-level control (unscaled, full size). Desktop uses
            the one on the video. CSS displays exactly one, so the a11y tree has one. */}
        <button type="button" data-expand-sound data-sound-at="stage" aria-pressed={!muted} onClick={toggleSound}>{muted ? "Tap for sound" : "Mute"}</button>

      </div>
    </section>
  );
}
