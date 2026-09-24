"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { content } from "@/lib/content";
import { DRIVE_LIBRARY_URL } from "@/lib/site";
import { reelVideos, type Reel } from "@/lib/reels.generated";
import { takeReels } from "@/lib/reelOrder";
import { LazyVideo } from "@/components/ui/LazyVideo";
import { Lightbox } from "@/components/ui/Lightbox";
import {
  Spring,
  SPRING_FLICK,
  SPRING_SETTLE,
  clamp,
  prefersReducedMotion,
  project,
  rubberband,
} from "@/lib/v3/spring";
import { V3_H2, V3_LEAD, V3_SECTION, V3_WRAP, Eyebrow, TextLink } from "./primitives";

/* THE WORK — a shelf you can throw.

   Everything the page claims about fluid motion is in this one component:

   - 1:1 TRACKING. After a 10px intent threshold the row is glued to the
     pointer, from wherever it was grabbed, including mid-flight: pointer-down
     stops the spring and the drag continues from its on-screen value.
   - RUBBER-BANDING. Past either end the row follows less and less, instead of
     stopping dead.
   - MOMENTUM PROJECTION. On release the landing card is chosen from where the
     flick WOULD come to rest (Apple's projection), not from where the finger
     let go — a small flick travels several cards.
   - VELOCITY HANDOFF. The spring starts at the finger's release velocity, so
     there is no seam between dragging and gliding. A flick gets a touch of
     bounce; a slow release settles critically damped.

   Vertical intent is let go at the threshold, so the page still scrolls
   through the shelf on a phone (touch-action: pan-y). A drag never opens a
   card; a tap does, into the same lightbox the home page uses. */

const WORK_REELS = takeReels(reelVideos, 6, 14);
const THRESHOLD = 10;

type Drag = {
  id: number;
  x0: number;
  y0: number;
  from: number;
  active: boolean;
  /** The row was gliding when grabbed: that touch stops it, it does not tap. */
  caught: boolean;
  history: { x: number; t: number }[];
};

export function Work() {
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const spring = useRef<Spring | null>(null);
  const bounds = useRef({ min: 0, snaps: [0] });
  const drag = useRef<Drag | null>(null);
  const suppressClick = useRef(false);
  const [open, setOpen] = useState<Reel | null>(null);
  // Stable, because the lightbox's mount effect depends on it.
  const close = useCallback(() => setOpen(null), []);
  const [edges, setEdges] = useState({ start: true, end: false });

  const render = useCallback((x: number) => {
    const el = track.current;
    if (el) el.style.transform = `translate3d(${x}px,0,0)`;
    const { min } = bounds.current;
    const start = x > -4;
    const end = x < min + 4;
    setEdges((e) => (e.start === start && e.end === end ? e : { start, end }));
  }, []);

  /* Snap points are the cards' own offsets, measured, so the layout's CSS
     stays the only source of card size and gap. */
  const measure = useCallback(() => {
    const vp = viewport.current;
    const tr = track.current;
    if (!vp || !tr) return;
    const pad = parseFloat(getComputedStyle(tr).paddingLeft) || 0;
    const min = Math.min(0, vp.clientWidth - tr.scrollWidth);
    const snaps = Array.from(tr.children, (c) => clamp(-((c as HTMLElement).offsetLeft - pad), min, 0));
    bounds.current = { min, snaps: [...new Set(snaps.map((s) => Math.round(s)))] };
    const s = spring.current;
    if (s) s.set(clamp(s.value, min, 0));
  }, []);

  useEffect(() => {
    spring.current = new Spring(0, render);
    measure();
    const ro = new ResizeObserver(measure);
    if (viewport.current) ro.observe(viewport.current);
    return () => {
      ro.disconnect();
      spring.current?.stop();
    };
  }, [measure, render]);

  const nearest = (x: number) =>
    bounds.current.snaps.reduce((a, b) => (Math.abs(b - x) < Math.abs(a - x) ? b : a));

  const settle = (target: number, velocity = 0) => {
    const s = spring.current;
    if (!s) return;
    if (prefersReducedMotion()) return s.set(target);
    const flicked = Math.abs(velocity) > 400;
    s.to(target, { velocity, config: flicked ? SPRING_FLICK : SPRING_SETTLE });
  };

  /* ---- pointer ---- */

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const s = spring.current;
    if (!s) return;
    // Grab it where it IS — the presentation value, mid-flight or not.
    s.stop();
    drag.current = {
      id: e.pointerId,
      x0: e.clientX,
      y0: e.clientY,
      from: s.value,
      active: false,
      caught: Math.abs(s.velocity) > 60,
      history: [{ x: e.clientX, t: e.timeStamp }],
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const s = spring.current;
    if (!d || !s || e.pointerId !== d.id) return;
    const dx = e.clientX - d.x0;
    const dy = e.clientY - d.y0;

    if (!d.active) {
      if (Math.abs(dy) > THRESHOLD && Math.abs(dy) > Math.abs(dx)) {
        // A vertical scroll. Let the page have it, and put the row back.
        drag.current = null;
        settle(nearest(s.value));
        return;
      }
      if (Math.abs(dx) < THRESHOLD) return;
      d.active = true;
      // Re-base at the commit point so crossing the threshold is not a jump.
      d.x0 = e.clientX;
      viewport.current?.setPointerCapture(e.pointerId);
    }

    const { min } = bounds.current;
    const width = viewport.current?.clientWidth ?? 1;
    const raw = d.from + (e.clientX - d.x0);
    const x = raw > 0 ? rubberband(raw, width) : raw < min ? min + rubberband(raw - min, width) : raw;
    s.set(x);

    d.history.push({ x: e.clientX, t: e.timeStamp });
    if (d.history.length > 6) d.history.shift();
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    const s = spring.current;
    drag.current = null;
    if (!d || !s || e.pointerId !== d.id) return;
    if (!d.active) {
      // Released before committing — a tap. It opens the card, unless it was
      // the touch that caught a moving row; either way, finish the glide it
      // interrupted.
      if (d.caught) suppressClick.current = true;
      if (s.value !== nearest(s.value)) settle(nearest(s.value));
      return;
    }
    suppressClick.current = true;

    // Release velocity from the last ~100ms of movement, px/s.
    const now = e.timeStamp;
    const recent = d.history.filter((h) => now - h.t < 100);
    const first = recent[0] ?? d.history[0];
    const last = d.history[d.history.length - 1];
    const dt = Math.max(16, last.t - first.t);
    const velocity = now - last.t > 80 ? 0 : ((last.x - first.x) / dt) * 1000;

    const { min } = bounds.current;
    const landing = clamp(s.value + project(velocity), min, 0);
    settle(nearest(landing), velocity);
  };

  /* ---- wheel: a horizontal trackpad swipe moves the row directly ---- */

  const wheelIdle = useRef(0);
  useEffect(() => {
    const vp = viewport.current;
    if (!vp) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      const s = spring.current;
      if (!s) return;
      s.set(clamp(s.value - e.deltaX, bounds.current.min, 0));
      window.clearTimeout(wheelIdle.current);
      wheelIdle.current = window.setTimeout(() => settle(nearest(s.value)), 140);
    };
    vp.addEventListener("wheel", onWheel, { passive: false });
    return () => vp.removeEventListener("wheel", onWheel);
  });

  /* ---- buttons and keyboard ---- */

  const page = (dir: 1 | -1) => {
    const s = spring.current;
    if (!s) return;
    const { snaps } = bounds.current;
    // Step from where it is HEADING, so repeated presses queue up cleanly.
    const i = snaps.indexOf(nearest(s.target));
    const perView = Math.max(1, Math.floor((viewport.current?.clientWidth ?? 0) / 280));
    settle(snaps[clamp(i + dir * perView, 0, snaps.length - 1)]);
  };

  const onCardFocus = (i: number) => {
    const target = bounds.current.snaps[Math.min(i, bounds.current.snaps.length - 1)];
    const card = track.current?.children[i] as HTMLElement | undefined;
    const vp = viewport.current;
    if (!card || !vp || !spring.current) return;
    const left = card.offsetLeft + spring.current.value;
    if (left < 0 || left + card.offsetWidth > vp.clientWidth) settle(target);
  };

  const { work } = content;

  return (
    <section id="work" aria-labelledby="v3-work-title" className={`overflow-x-clip bg-white ${V3_SECTION}`}>
      <div className={`${V3_WRAP} flex flex-col gap-6 tab:flex-row tab:items-end tab:justify-between`}>
        <div className="max-w-[640px]">
          <Eyebrow>{work.kicker}</Eyebrow>
          <h2 id="v3-work-title" className={`mt-3 text-v3-ink ${V3_H2}`}>
            {work.heading}
          </h2>
          <p className={`mt-4 ${V3_LEAD}`}>{work.sub}</p>
        </div>

        <div className="flex shrink-0 gap-3" role="group" aria-label="Scroll the reels">
          {([-1, 1] as const).map((dir) => {
            const disabled = dir === -1 ? edges.start : edges.end;
            return (
              <button
                key={dir}
                type="button"
                onClick={() => page(dir)}
                disabled={disabled}
                aria-label={dir === -1 ? "Previous reels" : "Next reels"}
                className="grid size-11 place-items-center rounded-full bg-v3-band text-v3-ink transition-[background-color,opacity,transform] duration-200 hover:bg-[#e8e8ed] active:scale-[0.92] active:duration-100 disabled:opacity-35"
              >
                <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                  <path
                    d={dir === -1 ? "M10 3 5 8l5 5" : "m6 3 5 5-5 5"}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            );
          })}
        </div>
      </div>

      <p className="sr-only">{work.description}</p>

      <div
        ref={viewport}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDragStart={(e) => e.preventDefault()}
        onClickCapture={(e) => {
          if (!suppressClick.current) return;
          suppressClick.current = false;
          e.preventDefault();
          e.stopPropagation();
        }}
        className="mt-[clamp(32px,4vw,56px)] cursor-grab touch-pan-y select-none active:cursor-grabbing"
      >
        {/* The track's left padding lines the first card up with the page
            measure; the right padding lets the last card come to rest at the
            same inset. */}
        <ul
          ref={track}
          className="flex w-max gap-4 will-change-transform lap:gap-5 [padding-inline:max(16px,calc((100vw-1200px)/2+40px))] phone:[padding-inline:max(24px,calc((100vw-1200px)/2+40px))]"
        >
          {WORK_REELS.map((reel, i) => (
            <li key={`${reel.id}-${i}`} className="w-[clamp(180px,46vw,280px)] tab:w-[clamp(200px,24vw,280px)]">
              <button
                type="button"
                onClick={() => setOpen(reel)}
                onFocus={() => onCardFocus(i)}
                aria-label={`Play reel ${i + 1} of ${WORK_REELS.length}`}
                draggable={false}
                className="group relative block aspect-[9/16] w-full overflow-hidden rounded-[22px] bg-v3-band transition-transform duration-200 ease-out active:scale-[0.97] active:duration-100"
              >
                <LazyVideo
                  src={reel.src}
                  poster={reel.poster}
                  lane="v3-work"
                  posterMode="element"
                  className="absolute inset-0 size-full object-cover"
                />
                <span
                  aria-hidden="true"
                  className="v3-material-dark absolute bottom-3 right-3 grid size-10 place-items-center rounded-full text-white opacity-90 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110"
                >
                  <svg viewBox="0 0 12 12" width="12" height="12" fill="currentColor">
                    <path d="M3 1.5v9l7.5-4.5z" />
                  </svg>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className={`${V3_WRAP} mt-8`}>
        <TextLink href={DRIVE_LIBRARY_URL} external ariaLabel={work.ctaAria}>
          {work.cta}
        </TextLink>
      </div>

      {open && <Lightbox reel={open} onClose={close} />}
    </section>
  );
}
