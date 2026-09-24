"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { content } from "@/lib/content";
import { DRIVE_LIBRARY_URL } from "@/lib/site";
import { reelVideos, type Reel } from "@/lib/reels.generated";
import { takeReels } from "@/lib/reelOrder";
import { LazyVideo } from "@/components/ui/LazyVideo";
import { Lightbox } from "@/components/ui/Lightbox";
import { V4_SECTION, V4_WRAP, Button, Icon, ICON_BTN, SectionHeader } from "./primitives";

/* THE WORK — M3's multi-browse carousel.

   NATIVE SCROLL, ON PURPOSE. M3's carousel is a scroll container with snap
   points, not a custom drag physics engine: it inherits the platform's own
   fling, the trackpad's own momentum, and keyboard and screen-reader
   scrolling for free. The Expressive part is the MASK: items at either edge
   are clipped narrower and open to full width as they travel in, driven by a
   scroll timeline in CSS (.m3-carousel-mask in globals.css) — no JS per frame.

   Items are 28dp-cornered (extra-large), 8dp apart, per the carousel spec.
   The previous/next controls are filled tonal icon buttons. */

const WORK_REELS = takeReels(reelVideos, 6, 14);

export function Work() {
  const scroller = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const [open, setOpen] = useState<Reel | null>(null);
  const close = useCallback(() => setOpen(null), []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const update = () => {
      const start = el.scrollLeft < 4;
      const end = el.scrollLeft + el.clientWidth > el.scrollWidth - 4;
      setEdges((e) => (e.start === start && e.end === end ? e : { start, end }));
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  const page = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: reduce ? "auto" : "smooth" });
  };

  const { work } = content;

  return (
    <section id="work" aria-labelledby="v4-work-title" className={`overflow-x-clip bg-m3-surface ${V4_SECTION}`}>
      <div className={`${V4_WRAP} flex flex-col gap-6 medium:flex-row medium:items-end medium:justify-between`}>
        <SectionHeader id="v4-work-title" kicker={work.kicker} heading={work.heading} lead={work.sub} />

        <div className="flex shrink-0 gap-2" role="group" aria-label="Scroll the reels">
          {([-1, 1] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              onClick={() => page(dir)}
              disabled={dir === -1 ? edges.start : edges.end}
              aria-label={dir === -1 ? "Previous reels" : "Next reels"}
              className={`${ICON_BTN} bg-m3-secondary-container text-m3-on-secondary-container`}
            >
              <Icon name={dir === -1 ? "left" : "right"} />
            </button>
          ))}
        </div>
      </div>

      <p className="sr-only">{work.description}</p>

      {/* The inline padding lines the first item up with the page margin and
          lets the last one rest at the same inset. */}
      <ul
        ref={scroller}
        className="m3-carousel mt-[clamp(32px,4vw,48px)] flex snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain [padding-inline:max(16px,calc((100vw-1280px)/2+32px))] [scroll-padding-inline:max(16px,calc((100vw-1280px)/2+32px))]"
      >
        {WORK_REELS.map((reel, i) => (
          <li
            key={`${reel.id}-${i}`}
            className="m3-carousel-item w-[clamp(168px,44vw,260px)] shrink-0 snap-start medium:w-[clamp(200px,26vw,280px)]"
          >
            <button
              type="button"
              onClick={() => setOpen(reel)}
              aria-label={`Play reel ${i + 1} of ${WORK_REELS.length}`}
              className="m3-carousel-mask group relative block aspect-[9/16] w-full overflow-hidden rounded-[28px] bg-m3-surface-container-high"
            >
              <LazyVideo
                src={reel.src}
                poster={reel.poster}
                lane="v4-work"
                posterMode="element"
                className="absolute inset-0 size-full object-cover"
              />
              <span
                aria-hidden="true"
                className="absolute bottom-3 right-3 grid size-12 place-items-center rounded-2xl bg-m3-primary-container text-m3-on-primary-container shadow-[var(--m3-elev-1)] transition-[border-radius,scale] duration-[var(--m3-spring-fast-ms)] ease-[var(--m3-spring-fast)] group-hover:scale-110 group-hover:rounded-3xl"
              >
                <Icon name="play" />
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className={`${V4_WRAP} mt-8`}>
        <Button href={DRIVE_LIBRARY_URL} external variant="text" trailingIcon="external" ariaLabel={work.ctaAria} className="-ml-4">
          {work.cta}
        </Button>
      </div>

      {open && <Lightbox reel={open} onClose={close} />}
    </section>
  );
}
