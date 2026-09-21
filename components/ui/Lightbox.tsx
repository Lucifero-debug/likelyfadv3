"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Reel } from "@/lib/reels.generated";

/* One reel, large, everything behind it blurred. Both walls open this.

   The entrance is a state flip rather than a keyframe: mount at rest, then one
   frame later switch the classes on, and the transition does the rest. That
   keeps two more @keyframes out of globals.css for an animation that plays for
   under a second.

   THE SCRIM IS A FLAT TINT AND NOT A FROSTED ONE, which is a measurement
   rather than a taste — the note on the backdrop element has the numbers. */
export function Lightbox({ reel, onClose }: { reel: Reel; onClose: () => void }) {
  const [shown, setShown] = useState(false);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  /* Starts false because the intent is to open WITH sound. The autoplay effect
     below flips it to true if the browser refuses, so this is the state the
     control reports rather than the state it requests. */
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true));
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    // The page behind must not scroll while this owns the screen.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  /* AUTOPLAY WITH SOUND, AND THE FALLBACK IS NOT OPTIONAL. This dialog only
     ever opens from a click on a wall tile, so sticky user activation is there
     and the policy allows an unmuted start — which is the whole point of the
     HQ cut, the only tier that HAS an audio track. (`hqArgs` in
     scripts/sync-videos.mjs maps `0:a:0?` and encodes AAC; the tile cut the
     walls play is built with `-an` and has no track at all, so a lightbox
     that stays muted is the only place on the page a visitor could ever hear
     one of these ads.)

     A browser with a stricter setting still rejects the promise, and leaving a
     dead first frame there would read as a broken overlay rather than as a
     policy. Muting and retrying gets it running; `muted` state then makes the
     control say what happened, so the fix is one visible click away.

     THE SAME SHAPE AS Testimonials, deliberately — see the note on its own
     play effect. Two players, one policy. */
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    el.play().catch(() => {
      el.muted = true;
      setMuted(true);
      void el.play().catch(() => {});
    });
  }, []);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Reel preview"
      onClick={onClose}
      /* z-210: above the nav (120) and the skip link (200).

         NO backdrop-filter, AND IT IS WHAT USED TO BE HERE. `backdrop-blur-[24px]
         backdrop-saturate-[115%]` over a 52% tint was the single most expensive
         interaction on the site: profiled on the production build at 1440x900,
         opening this from the work wall cost 4 visible hitches, a 160ms worst
         frame and jitter 30, with zero blocking main-thread time — entirely
         compositor-side, entirely at the mount, because a full-viewport filter
         has to raster the whole backdrop before the first frame of the overlay
         can be composited.

         IT IS THE FILTER AND NOT THE RADIUS. 24, 16, 12 and 8px were measured
         against each other and against none: every radius held 3-4 hitches and
         a ~130-160ms worst frame, and only removing the filter moved anything.
         There is no cheap frosted setting to tune down to — it is present or
         absent. Absent, with the fade below, the same open measures ZERO
         hitches, a 49ms worst frame and jitter 6.7.

         THE TINT CARRIES THE SEPARATION INSTEAD, at 88% rather than 52%. The
         blur is what let the old value stay that transparent; a flat scrim over
         96 clips needs the density or the wall reads straight through it.

         The fade is affordable now, and was never itself the problem: an
         opacity transition over a plain colour is one composited layer at a new
         alpha, which is free. Over a filter it was 300ms of re-blurring the
         viewport, and that is why the two are in the same note. */
      className={`fixed inset-0 z-[210] grid place-items-center p-[clamp(16px,4vw,48px)] bg-[color-mix(in_srgb,var(--color-noir)_88%,transparent)] transition-opacity duration-300 ${
        shown ? "opacity-100" : "opacity-0"
      }`}
    >
      <button
        type="button"
        ref={closeBtn}
        onClick={onClose}
        aria-label="Close preview"
        className="absolute top-[clamp(12px,2.5vw,32px)] right-[clamp(12px,2.5vw,32px)] grid size-11 place-items-center rounded-full border border-white/20 bg-white/10 text-2xl leading-none text-white transition-[background-color,border-color] duration-150 hover:border-white/45 hover:bg-white/20 active:bg-white/30"
      >
        <span aria-hidden="true">×</span>
      </button>

      {/* Portrait, height-led so it fills the screen without ever overflowing
          it. Click stops here so only the backdrop closes. */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative h-[min(84svh,900px)] aspect-[9/16] max-w-[min(92vw,520px)] overflow-hidden rounded-3xl bg-black shadow-[var(--shadow-pink)] transition-[opacity,transform] duration-[850ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
          shown ? "translate-y-0 scale-100 opacity-100" : "translate-y-3.5 scale-[0.92] opacity-0"
        }`}
      >
        {/* The HQ tier: larger cut, fetched only now that someone has asked to
            look closely, and THE ONLY TIER WITH AN AUDIO TRACK. Falls back to
            the tile cut when the Drive sync ran without ffmpeg — which is also
            a fall back to silence, since that cut is built with `-an`.

            NO `autoPlay` AND NO `muted` ATTRIBUTE — both are the effect's job
            now. `autoPlay` on the element races the effect, and the browser
            settles that race by applying its unmuted-autoplay policy before the
            effect can install the muted fallback, which is how you get a silent
            frozen frame under a control claiming to be unmuted. */}
        <video
          ref={video}
          src={reel.hq ?? reel.src}
          poster={reel.poster ?? undefined}
          loop
          playsInline
          preload="auto"
          className="size-full object-cover"
        />

        {/* INSIDE THE STAGE, WHICH IS WHAT KEEPS IT CLICKABLE. The backdrop
            closes on click and the stage stops propagation, so a mute control
            parked on the backdrop would toggle and dismiss in one gesture. */}
        <button
          type="button"
          onClick={() => {
            const el = video.current;
            if (!el) return;
            el.muted = !el.muted;
            setMuted(el.muted);
            /* An unmute IS a gesture, so it is also the moment a play() the
               policy refused earlier can be retried. */
            if (!el.muted && el.paused) void el.play().catch(() => {});
          }}
          aria-label={muted ? "Unmute reel" : "Mute reel"}
          className="absolute bottom-4 right-4 grid size-11 place-items-center rounded-full border border-white/20 bg-black/45 text-white transition-[background-color,border-color] duration-150 hover:border-white/45 hover:bg-black/65 active:bg-black/80"
        >
          {muted ? (
            <svg viewBox="0 0 14 12" width="16" height="14" fill="currentColor" aria-hidden="true">
              <path d="M0 4h3l3-3v10L3 8H0z" />
              <path d="M9 4l4 4M13 4l-4 4" stroke="currentColor" strokeWidth="1.4" fill="none" />
            </svg>
          ) : (
            <svg viewBox="0 0 14 12" width="16" height="14" fill="currentColor" aria-hidden="true">
              <path d="M0 4h3l3-3v10L3 8H0z" />
              <path
                d="M9 3.5a4 4 0 0 1 0 5M11 2a6.5 6.5 0 0 1 0 8"
                stroke="currentColor"
                strokeWidth="1.3"
                fill="none"
              />
            </svg>
          )}
        </button>
      </div>
    </div>,
    document.body
  );
}
