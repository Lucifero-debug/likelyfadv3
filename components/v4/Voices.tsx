"use client";

import { useCallback, useState } from "react";
import { content } from "@/lib/content";
import { reelVideos, type Reel } from "@/lib/reels.generated";
import { LazyVideo } from "@/components/ui/LazyVideo";
import { Lightbox } from "@/components/ui/Lightbox";
import { Reveal } from "@/components/ui/Reveal";
import { V4_SECTION, V4_WRAP, T, Chip, Icon, SectionHeader } from "./primitives";

/* WHAT CLIENTS SAY — filled cards with media: the ad on top, the reaction to
   it underneath. The media is the card's primary action (it opens the ad),
   so it carries the state layer; the text does not.

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
    <section aria-labelledby="v4-voices-title" className={`bg-m3-surface ${V4_SECTION}`}>
      <div className={V4_WRAP}>
        <SectionHeader id="v4-voices-title" kicker={testimonials.kicker} heading={testimonials.heading} />

        <ul className="mt-[clamp(40px,5vw,64px)] grid gap-3 medium:grid-cols-2 expanded:grid-cols-3 expanded:gap-4">
          {items.map((t, i) => {
            const reel = byId.get(t.reel);
            return (
              <li key={t.quote} className={i === 2 ? "medium:col-span-2 expanded:col-span-1" : ""}>
                <Reveal delay={i * 80} className="h-full">
                  <figure className="flex h-full flex-col rounded-[28px] bg-m3-surface-container p-2">
                    {reel && (
                      <button
                        type="button"
                        onClick={() => setOpen(reel)}
                        aria-label={`Play the ad: ${t.label}`}
                        className="m3-state m3-ripple group relative aspect-[4/5] w-full overflow-hidden rounded-[20px] bg-m3-surface-container-high text-white"
                      >
                        <LazyVideo
                          src={reel.src}
                          poster={reel.poster}
                          lane={`v4-voice-${i}`}
                          className="absolute inset-0 size-full object-cover"
                        />
                        <Chip className="absolute left-3 top-3 bg-m3-inverse-surface/90 text-m3-inverse-on-surface">
                          {t.label}
                        </Chip>
                        <span
                          aria-hidden="true"
                          className="absolute bottom-3 right-3 grid size-14 place-items-center rounded-2xl bg-m3-primary-container text-m3-on-primary-container shadow-[var(--m3-elev-3)] transition-[border-radius] duration-[var(--m3-spring-fast-ms)] ease-[var(--m3-spring-fast)] group-hover:rounded-[28px]"
                        >
                          <Icon name="play" />
                        </span>
                      </button>
                    )}
                    <blockquote className="px-4 pt-5 medium:px-5">
                      <p className={`text-pretty text-m3-on-surface ${T.titleL}`}>&ldquo;{t.quote}&rdquo;</p>
                    </blockquote>
                    <figcaption className={`mt-auto px-4 pb-4 pt-4 text-m3-on-surface-variant medium:px-5 medium:pb-5 ${T.bodyM}`}>
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
