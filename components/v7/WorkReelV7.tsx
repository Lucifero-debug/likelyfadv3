"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { content } from "@/lib/content";
import { takeReels } from "@/lib/reelOrder";
import type { Reel } from "@/lib/reels.generated";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/ui/RevealText";
import { DRIVE_LIBRARY_URL } from "@/lib/site";
import { ANCHOR, SECTION, TEXT_META, TEXT_SMALL, WRAP } from "@/lib/ui";

const { work } = content;

/* THE WORK — A SCREENING ROOM, NOT A DRUM.

   The drum was spectacle: two dozen clips turning past, none of which could be
   stopped, heard or picked. For a studio whose whole pitch is "these look
   real", that is the one thing the section must allow — so this lets a visitor
   actually WATCH the work:

     ONE LARGE PLAYER, playing the HQ cut (the only tier with an audio track),
     muted until the visitor asks for sound. Once they do, sound stays on as
     they move between clips.

     A GRID OF CLIPS beside it (a swipeable rail on a phone). Pick one and it
     plays; when a clip ends the next one starts, so the section also works as
     a showreel nobody has to drive.

     REAL CONTROLS: play/pause, sound, previous/next, a progress bar, the
     position ("04 / 12"), and ←/→ on the keyboard while focus is in the
     section.

   COST: one <video> at a time, and only while the section is on screen — it
   pauses when scrolled away and resumes on return (unless the visitor paused
   it). The grid is posters, lazily loaded. Against the drum's 7 live decoders
   plus 24 GL textures, this is the cheapest the band has been.

   REDUCED MOTION: nothing starts by itself — the player shows its poster and
   waits for the play button, and clips do not auto-advance. */

const COUNT = 12;
const LIBRARY = content.reels.videos;
const PICKS: Reel[] = takeReels(LIBRARY, 0, Math.min(LIBRARY.length, COUNT));
const pad = (n: number) => String(n).padStart(2, "0");

const EASE = "ease-[cubic-bezier(0.22,0.7,0.2,1)]";
const CTRL =
  `grid size-11 shrink-0 place-items-center rounded-full border border-white/20 bg-black/45 text-white ` +
  `transition-[background-color,border-color] duration-150 ${EASE} hover:border-white/45 hover:bg-black/65 active:bg-black/80`;
const STEP_BTN =
  `grid size-11 shrink-0 place-items-center rounded-full border border-white/15 text-white/80 ` +
  `transition-[border-color,color,background-color] duration-200 ${EASE} hover:border-pink hover:text-white active:bg-white/10`;

export function WorkReelV7() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const railRef = useRef<HTMLDivElement>(null);

  const [index, setIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  /* The visitor's own pause, which scrolling back into view must respect. */
  const userPaused = useRef(false);
  const inView = useRef(false);
  const [motion] = useState(
    () =>
      typeof window !== "undefined" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  const reel = PICKS[index];

  const tryPlay = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    el.play().catch(() => {
      /* Refused with sound: fall back to muted so the picture still runs, and
         let the control say so. */
      el.muted = true;
      setMuted(true);
      void el.play().catch(() => {});
    });
  }, []);

  const go = useCallback((next: number) => {
    setIndex((next + PICKS.length) % PICKS.length);
  }, []);

  /* A new clip: reset the bar, and play it if we should be playing. */
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (barRef.current) barRef.current.style.transform = "scaleX(0)";
    el.muted = muted;
    if (inView.current && !userPaused.current && (motion || playing)) tryPlay();
    /* Keep the active thumbnail in view on the rail without scrolling the page. */
    const rail = railRef.current;
    const thumb = rail?.querySelector<HTMLElement>(`[data-i="${index}"]`);
    if (rail && thumb && rail.scrollWidth > rail.clientWidth) {
      rail.scrollTo({
        left: thumb.offsetLeft - rail.clientWidth / 2 + thumb.clientWidth / 2,
        behavior: motion ? "smooth" : "auto",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  /* Play on screen, pause off it. */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const io = new IntersectionObserver(
      ([e]) => {
        inView.current = e.isIntersecting;
        const el = videoRef.current;
        if (!el) return;
        if (e.isIntersecting) {
          if (motion && !userPaused.current) tryPlay();
        } else if (!el.paused) {
          el.pause();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(section);
    return () => io.disconnect();
  }, [motion, tryPlay]);

  /* THE BAND OPENS AS IT ARRIVES. While the section rises into view it is an
     inset, rounded panel on the paper; by the time its top reaches the top of
     the screen it is full bleed. One clip-path, written only while
     the band is entering, and cleared after, so the resting band carries none. */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || !motion) return;
    let raf = 0;
    let last = -1;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const top = el.getBoundingClientRect().top;
      const p = Math.min(1, Math.max(0, (vh - top) / vh));
      const q = +(1 - Math.pow(1 - p, 2)).toFixed(3);
      if (q === last) return;
      last = q;
      if (q >= 1) {
        el.style.clipPath = "";
        return;
      }
      const inset = (1 - q) * Math.min(64, vh * 0.06);
      el.style.clipPath = `inset(0 ${inset.toFixed(1)}px round ${((1 - q) * 36).toFixed(1)}px)`;
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      el.style.clipPath = "";
    };
  }, [motion]);

  const onTime = () => {
    const el = videoRef.current;
    const bar = barRef.current;
    if (!el || !bar || !el.duration) return;
    bar.style.transform = `scaleX(${(el.currentTime / el.duration).toFixed(4)})`;
  };

  const togglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      userPaused.current = false;
      tryPlay();
    } else {
      userPaused.current = true;
      el.pause();
    }
  };

  const toggleSound = () => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
    if (!el.muted && el.paused) {
      userPaused.current = false;
      tryPlay();
    }
  };

  const pick = (i: number) => {
    userPaused.current = false;
    if (i === index) {
      const el = videoRef.current;
      if (el?.paused) tryPlay();
      return;
    }
    go(i);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if ((e.target as HTMLElement).closest("a")) return;
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (index + step + PICKS.length) % PICKS.length;
    pick(next);
    /* Focus follows the clip when it was on a thumbnail, so the focus ring and
       the active ring never mark two different clips. */
    if ((e.target as HTMLElement).dataset.i !== undefined) {
      railRef.current?.querySelector<HTMLElement>(`[data-i="${next}"]`)?.focus({ preventScroll: true });
    }
  };

  return (
    <section
      ref={sectionRef}
      id="work"
      aria-label={work.kicker}
      data-nav-dark
      onKeyDown={onKey}
      className={`${SECTION} ${ANCHOR} relative overflow-hidden bg-[radial-gradient(120%_90%_at_30%_-10%,#241d2b,#17141b_72%)] text-[#f5f3f0]`}
    >
      <div
        className={`${WRAP} grid items-center gap-y-12 lap:grid-cols-[auto_minmax(0,1fr)] lap:gap-x-[clamp(48px,6vw,96px)]`}
      >
        {/* ── THE PLAYER ─────────────────────────────────────────────── */}
        <Reveal className="mx-auto w-[clamp(240px,70vw,340px)] lap:w-[clamp(260px,min(26vw,calc((100svh-200px)*9/16)),400px)]">
          <div className="relative aspect-[9/16] overflow-hidden rounded-[28px] bg-black shadow-[0_30px_80px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.08)]">
            {/* Keyed by clip, so a switch is a fresh element: no stale frame of
                the old clip under the new poster. The poster covers the load. */}
            <video
              key={reel.id}
              ref={videoRef}
              src={reel.hq ?? reel.src}
              poster={reel.poster ?? undefined}
              muted={muted}
              playsInline
              preload="metadata"
              onClick={togglePlay}
              data-cursor={playing ? "Pause" : "Play"}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onTimeUpdate={onTime}
              onEnded={() => (motion ? go(index + 1) : setPlaying(false))}
              aria-label={`Client reel ${index + 1} of ${PICKS.length}`}
              className="size-full animate-[v7-clip-in_520ms_cubic-bezier(0.16,1,0.3,1)] cursor-pointer object-cover motion-reduce:animate-none"
            />

            {/* Big play affordance, only while stopped. */}
            {!playing && (
              <button
                type="button"
                onClick={togglePlay}
                aria-label="Play reel"
                className="absolute inset-0 grid place-items-center bg-black/25 transition-colors duration-200 hover:bg-black/35"
              >
                <span className="grid size-16 place-items-center rounded-full bg-[image:var(--grad)] shadow-[0_10px_30px_rgba(240,64,127,0.45)]">
                  <svg viewBox="0 0 16 16" className="ml-0.5 size-6" fill="white" aria-hidden="true">
                    <path d="M4 2.5v11l9-5.5z" />
                  </svg>
                </span>
              </button>
            )}

            {/* Controls. A gradient floor keeps them legible over bright clips. */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(to_top,rgba(0,0,0,0.6),rgba(0,0,0,0))]" />
            <div className="absolute inset-x-4 bottom-4 flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlay}
                aria-label={playing ? "Pause reel" : "Play reel"}
                className={CTRL}
              >
                {playing ? (
                  <svg viewBox="0 0 16 16" className="size-4" fill="currentColor" aria-hidden="true">
                    <path d="M4 2.5h3v11H4zM9 2.5h3v11H9z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 16 16" className="ml-0.5 size-4" fill="currentColor" aria-hidden="true">
                    <path d="M4 2.5v11l9-5.5z" />
                  </svg>
                )}
              </button>

              <span className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-white/20" aria-hidden="true">
                <span
                  ref={barRef}
                  className="absolute inset-0 origin-left scale-x-0 rounded-full bg-[image:var(--grad)]"
                />
              </span>

              <button
                type="button"
                onClick={toggleSound}
                aria-pressed={!muted}
                aria-label={muted ? "Turn sound on" : "Turn sound off"}
                className={CTRL}
              >
                {muted ? (
                  <svg viewBox="0 0 14 12" width="16" height="14" fill="currentColor" aria-hidden="true">
                    <path d="M0 4h3l3-3v10L3 8H0z" />
                    <path d="M9 4l4 4M13 4l-4 4" stroke="currentColor" strokeWidth="1.4" fill="none" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 14 12" width="16" height="14" fill="currentColor" aria-hidden="true">
                    <path d="M0 4h3l3-3v10L3 8H0z" />
                    <path d="M9 3.5a4 4 0 0 1 0 5M11 2a6.5 6.5 0 0 1 0 8" stroke="currentColor" strokeWidth="1.3" fill="none" />
                  </svg>
                )}
              </button>
            </div>

            {/* The one-time nudge toward sound, gone once it is on. */}
            {muted && playing && (
              <button
                type="button"
                onClick={toggleSound}
                className={`absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/20 bg-black/45 px-3 py-1.5 font-mono ${TEXT_META} tracking-[0.04em] text-white/90 transition-colors hover:bg-black/65`}
              >
                Tap for sound
              </button>
            )}
          </div>
        </Reveal>

        {/* ── THE COPY AND THE PICKER ─────────────────────────────────── */}
        <div className="flex min-w-0 flex-col">
          <Reveal>
            <span
              className="inline-flex items-center gap-[0.65em] font-mono text-[0.74rem] font-medium uppercase tracking-[0.22em] text-pink before:h-px before:w-7 before:bg-current before:opacity-55 before:content-['']"
            >
              {work.kicker}
            </span>
          </Reveal>
          <RevealText
            as="h2"
            text={work.heading}
            className="mt-4 block text-balance font-display text-[clamp(2rem,1.4rem+2.6vw,3.5rem)] font-bold leading-[1.03] tracking-[-0.025em]"
          />
          <Reveal delay={80}>
            <p className={`mt-5 max-w-[46ch] text-pretty font-sans ${TEXT_SMALL} leading-6 text-ink-dim`}>
              {work.sub} Pick any clip to watch it, with sound.
            </p>
          </Reveal>

          {/* Position and stepping. aria-live so a screen reader hears the
              switch when the arrows or auto-advance change the clip. */}
          <div className="mt-8 flex items-center gap-3">
            <button type="button" onClick={() => pick(index - 1 < 0 ? PICKS.length - 1 : index - 1)} aria-label="Previous reel" className={STEP_BTN}>
              <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M10 3 5 8l5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button type="button" onClick={() => pick((index + 1) % PICKS.length)} aria-label="Next reel" className={STEP_BTN}>
              <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="m6 3 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <p aria-live="polite" className={`ml-2 font-mono ${TEXT_META} tracking-[0.08em] text-white/70`}>
              <span className="text-white">{pad(index + 1)}</span> / {pad(PICKS.length)}
            </p>
          </div>

          {/* THE PICKER. A 6-up grid from `lap:`; below it a swipeable rail. */}
          <div
            ref={railRef}
            role="list"
            aria-label="Choose a reel"
            className="-mx-[clamp(24px,5vw,64px)] mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-[clamp(24px,5vw,64px)] pb-2 [scrollbar-width:none] lap:mx-0 lap:grid lap:grid-cols-6 lap:overflow-visible lap:px-0 lap:pb-0"
          >
            {PICKS.map((r, i) => {
              const active = i === index;
              return (
                <div role="listitem" key={r.id} className="shrink-0 snap-start">
                  <button
                    type="button"
                    data-i={i}
                    data-cursor="Play"
                    onClick={() => pick(i)}
                    aria-label={`Play reel ${i + 1}`}
                    aria-current={active ? "true" : undefined}
                    className={`group relative block aspect-[9/16] w-[88px] overflow-hidden rounded-xl bg-[#1a1620] ring-1 transition-[transform,box-shadow] duration-300 ${EASE} lap:w-full ${
                      active
                        ? "ring-2 ring-pink shadow-[0_10px_30px_rgba(240,64,127,0.35)]"
                        : "ring-white/10 hover:-translate-y-1 hover:ring-white/40"
                    }`}
                  >
                    {r.poster && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.poster}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className={`size-full object-cover transition-[opacity,transform] duration-500 ${EASE} group-hover:scale-105 ${
                          active ? "opacity-100" : "opacity-60 group-hover:opacity-100"
                        }`}
                      />
                    )}
                    <span className={`absolute left-1.5 top-1.5 font-mono text-[0.65rem] ${active ? "text-white" : "text-white/70"}`}>
                      {pad(i + 1)}
                    </span>
                    {active && playing && (
                      <span aria-hidden className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-end gap-[3px]">
                        {[0, 1, 2].map((b) => (
                          <span
                            key={b}
                            style={{ animationDelay: `${b * 140}ms` }}
                            className="h-3 w-[3px] origin-bottom animate-[v7-eq_900ms_ease-in-out_infinite] rounded-full bg-white motion-reduce:animate-none"
                          />
                        ))}
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          <Reveal className="mt-10">
            <Button href={DRIVE_LIBRARY_URL} external variant="light" withArrow ariaLabel={work.ctaAria}>
              {work.cta}
            </Button>
          </Reveal>
        </div>
      </div>

      <p className="sr-only">{work.description}</p>
    </section>
  );
}
