"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { content } from "@/lib/content";
import { reelVideos } from "@/lib/reels.generated";
import { takeReels } from "@/lib/reelOrder";
import { LazyVideo } from "@/components/ui/LazyVideo";
import { V3_WRAP, Eyebrow, Highlight, Pill, TextLink } from "./primitives";

/* THE HERO — one headline, one action, one object.

   The object is five reels held like a hand of cards. Scrolling DEALS them:
   the fan opens into a clean row, 1:1 with the scroll position, so the motion
   is something the visitor is doing rather than something being played at
   them. Scroll back up and it folds again from exactly where it is.

   ONE NUMBER DRIVES ALL FIVE CARDS. The script writes a single registered
   property, --v3-p (0 = fanned, 1 = dealt), onto the stage; every card's
   transform is a calc() of it against its own slot constants. So the server
   renders the fanned state with no script at all, a frame costs one property
   write, and the transform stays compositor-only.

   Under reduced motion there is no listener and the stage sits dealt — the
   finished composition, no scroll-linked movement. */

const HERO_REELS = takeReels(reelVideos, 0, 5);

/* Slot i in -2..2. p=0 is the fan, p=1 the row. X/Y are in card widths. */
function slot(i: number): CSSProperties {
  const a = Math.abs(i);
  return {
    "--x0": i * 0.6,
    "--x1": i * 1.08,
    "--y0": a * 0.09,
    "--r0": i * 6,
    "--s0": 1 - a * 0.07,
    "--s1": a === 0 ? 1.02 : 0.96,
    zIndex: 10 - a,
  } as CSSProperties;
}

const SLOTS = [-2, -1, 0, 1, 2];

const STATS = [
  { big: "48h", small: "to your first concepts" },
  { big: "20–40", small: "distinct variants a month" },
  { big: "1 DM", small: "to get started, no forms" },
];

export function Hero() {
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = stage.current;
    if (!el) return;
    let frame = 0;
    let last = -1;
    const write = () => {
      frame = 0;
      const p = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.5)));
      if (Math.abs(p - last) < 0.001) return;
      last = p;
      el.style.setProperty("--v3-p", p.toFixed(4));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(write);
    };
    write();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const { hero } = content;

  return (
    <section id="top" aria-labelledby="v3-hero-title" className="overflow-x-clip pt-[calc(var(--v3-nav)+clamp(48px,6vw,96px))]">
      <div className={`${V3_WRAP} flex flex-col items-center text-center`}>
        <Eyebrow className="v3-rise">{hero.eyebrow}</Eyebrow>
        <h1
          id="v3-hero-title"
          className="v3-rise mt-3 max-w-[14ch] text-balance font-display text-[clamp(2.6rem,1.2rem+5.6vw,6.25rem)] font-extrabold leading-[1.0] tracking-[-0.042em] text-v3-ink"
          style={{ animationDelay: "60ms" }}
        >
          <Highlight text={hero.headline} />
        </h1>
        <p
          className="v3-rise mt-6 max-w-[40ch] text-pretty text-[clamp(1.0625rem,0.98rem+0.45vw,1.375rem)] leading-[1.45] text-v3-ink-2"
          style={{ animationDelay: "120ms" }}
        >
          {hero.subline}
        </p>
        <div
          className="v3-rise mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
          style={{ animationDelay: "180ms" }}
        >
          <Pill contact tone="ink">
            {hero.primaryCta}
          </Pill>
          <TextLink href={hero.secondaryHref}>{hero.secondaryCta}</TextLink>
        </div>
      </div>

      {/* The dealt row is ~5.3 card widths, so --cw is sized to fit that at
          every width; on a phone only the middle three are dealt. */}
      <div
        ref={stage}
        aria-label={content.reels.caption}
        role="img"
        className="v3-stage relative mx-auto mt-[clamp(48px,6vw,88px)] h-[calc(var(--cw)*16/9*1.12)] [--cw:28vw] tab:[--cw:clamp(120px,15.5vw,212px)]"
      >
        {HERO_REELS.map((reel, n) => {
          const i = SLOTS[n];
          return (
            <div
              key={reel.id}
              style={slot(i)}
              className={`v3-card absolute left-1/2 top-0 ml-[calc(var(--cw)/-2)] aspect-[9/16] w-[var(--cw)] overflow-hidden rounded-[calc(var(--cw)*0.1)] bg-v3-band shadow-[0_30px_60px_-24px_rgba(0,0,0,0.35),0_0_0_1px_rgba(0,0,0,0.04)] ${
                Math.abs(i) === 2 ? "hidden tab:block" : ""
              }`}
            >
              <LazyVideo
                src={reel.src}
                poster={reel.poster}
                lane="v3-hero"
                immediate
                preload={i === 0 ? "auto" : "metadata"}
                className="absolute inset-0 size-full object-cover"
              />
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-center text-[0.875rem] tracking-[0.005em] text-v3-ink-2">
        {content.reels.caption}
      </p>

      {/* The three claims, set as figures. Big numbers get the tightest
          tracking on the page; the captions under them stay near zero. */}
      <div className={`${V3_WRAP} mt-[clamp(56px,7vw,112px)]`}>
        <dl className="grid grid-cols-1 divide-y divide-v3-line border-y border-v3-line tab:grid-cols-3 tab:divide-x tab:divide-y-0">
          {STATS.map((s) => (
            <div key={s.big} className="flex flex-col items-center gap-1 px-4 py-7 text-center tab:py-9">
              <dt className="order-2 text-[0.95rem] tracking-[-0.003em] text-v3-ink-2">{s.small}</dt>
              <dd className="order-1 font-display text-[clamp(2rem,1.5rem+1.6vw,3rem)] font-bold leading-none tracking-[-0.04em] text-v3-ink">
                {s.big}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
