"use client";

import { useCallback, useState } from "react";
import { content } from "@/lib/content";
import { reelVideos, type Reel } from "@/lib/reels.generated";
import { LazyVideo } from "@/components/ui/LazyVideo";
import { Lightbox } from "@/components/ui/Lightbox";
import { Reveal } from "@/components/ui/Reveal";
import { V3_H2, V3_SECTION, V3_WRAP, Eyebrow } from "./primitives";

/* WHAT CLIENTS SAY — the quote, and the ad it was about, side by side.

   ONLY THE FIRST THREE ITEMS, ON PURPOSE. content.ts marks every item after
   the third as a placeholder that no client wrote, and the house rule is real
   quotes only. When real messages replace them, raise REAL_COUNT. */
const REAL_COUNT = 3;

const byId = new Map(reelVideos.map((r) => [r.id, r]));

export function Voices() {
  const { testimonials } = content;
  const items = testimonials.items.slice(0, REAL_COUNT);
  const [open, setOpen] = useState<Reel | null>(null);
  const close = useCallback(() => setOpen(null), []);

  return (
    <section aria-labelledby="v3-voices-title" className={`bg-white ${V3_SECTION}`}>
      <div className={V3_WRAP}>
        <div className="mx-auto max-w-[760px] text-center">
          <Eyebrow>{testimonials.kicker}</Eyebrow>
          <h2 id="v3-voices-title" className={`mt-3 text-v3-ink ${V3_H2}`}>
            {testimonials.heading}
          </h2>
        </div>

        <ul className="mt-[clamp(40px,5vw,72px)] grid gap-4 lap:grid-cols-3 lap:gap-5">
          {items.map((t, i) => {
            const reel = byId.get(t.reel);
            return (
              <li key={t.quote}>
                <Reveal delay={i * 80} className="h-full">
                  <figure className="flex h-full flex-col overflow-hidden rounded-[28px] bg-v3-band">
                    {reel && (
                      <button
                        type="button"
                        onClick={() => setOpen(reel)}
                        aria-label={`Play the ad: ${t.label}`}
                        className="group relative aspect-[4/5] w-full overflow-hidden bg-[#e8e8ed] transition-transform duration-200 ease-out active:scale-[0.985] active:duration-100"
                      >
                        <LazyVideo
                          src={reel.src}
                          poster={reel.poster}
                          lane={`v3-voice-${i}`}
                          className="absolute inset-0 size-full object-cover"
                        />
                        <span className="v3-material-dark absolute left-3 top-3 rounded-full px-3 py-1 text-[0.75rem] font-medium tracking-[0.01em] text-white">
                          {t.label}
                        </span>
                      </button>
                    )}
                    <blockquote className="px-[clamp(22px,2.2vw,32px)] pt-6">
                      <p className="text-pretty font-display text-[clamp(1.25rem,1.1rem+0.5vw,1.55rem)] font-bold leading-[1.22] tracking-[-0.022em] text-v3-ink">
                        “{t.quote}”
                      </p>
                    </blockquote>
                    <figcaption className="mt-auto px-[clamp(22px,2.2vw,32px)] pb-6 pt-4 text-[0.9rem] leading-[1.4] text-v3-ink-2">
                      {t.who}
                    </figcaption>
                  </figure>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>

      {open && <Lightbox reel={open} onClose={close} />}
    </section>
  );
}
