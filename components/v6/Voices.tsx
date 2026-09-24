"use client";

import { useCallback, useState } from "react";
import { content } from "@/lib/content";
import { reelVideos, type Reel } from "@/lib/reels.generated";
import { LazyVideo } from "@/components/ui/LazyVideo";
import { Lightbox } from "@/components/ui/Lightbox";
import { PAGE, BAND, T, Badge, Card, Icon, SectionHeader } from "./primitives";

/* WHAT CLIENTS SAY — three media cards. The ad on top (its thumbnail is the
   card's action and opens the lightbox), a neutral badge naming the format,
   the reaction as it was sent, and the attribution. Identities are private by
   request, so there is no name or avatar to show, and no stand-in for one.

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
    <section aria-labelledby="v6-voices-title" className={`border-t border-p-border ${BAND}`}>
      <div className={PAGE}>
        <SectionHeader id="v6-voices-title" heading={testimonials.heading} />

        <ul className="mt-6 grid gap-4 p-md:grid-cols-3">
          {items.map((t, i) => {
            const reel = byId.get(t.reel);
            return (
              <li key={t.quote} className="flex">
                <Card as="figure" padded={false} className="flex w-full flex-col">
                  {reel && (
                    <button
                      type="button"
                      onClick={() => setOpen(reel)}
                      aria-label={`Play the ad: ${t.label}`}
                      className="group relative m-2 mb-0 block aspect-[4/5] overflow-hidden rounded-lg bg-p-bg-fill-secondary"
                    >
                      <LazyVideo
                        src={reel.src}
                        poster={reel.poster}
                        lane={`v6-voice-${i}`}
                        placeholderClassName="bg-p-bg-fill-secondary"
                        className="absolute inset-0 size-full object-cover"
                      />
                      <span
                        aria-hidden="true"
                        className="p-btn-secondary absolute bottom-3 right-3 flex h-8 items-center gap-1 rounded-lg bg-p-bg-surface px-2.5 font-sans text-xs font-medium text-p-text"
                      >
                        <Icon name="play" size={14} />
                        Play ad
                      </span>
                    </button>
                  )}
                  <blockquote className="px-4 pt-4">
                    <Badge>{t.label}</Badge>
                    <p className={`mt-3 text-pretty text-p-text ${T.bodyLg}`}>&ldquo;{t.quote}&rdquo;</p>
                  </blockquote>
                  <figcaption className={`mt-auto px-4 pb-4 pt-4 text-p-text-secondary ${T.bodySm}`}>{t.who}</figcaption>
                </Card>
              </li>
            );
          })}
        </ul>
      </div>

      {open && <Lightbox reel={open} onClose={close} />}
    </section>
  );
}
