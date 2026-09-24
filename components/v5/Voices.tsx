"use client";

import { useCallback, useState } from "react";
import { content } from "@/lib/content";
import { reelVideos, type Reel } from "@/lib/reels.generated";
import { LazyVideo } from "@/components/ui/LazyVideo";
import { Lightbox } from "@/components/ui/Lightbox";
import { Enter } from "./Enter";
import { GRID, SECTION, T, Icon, SectionHead, Tag } from "./primitives";

/* WHAT CLIENTS SAY — three tiles with media, condensed.

   The ad on top (the tile's action: it opens the lightbox), the reaction
   under it in the expressive heading face, the attribution as helper text on
   a ruled line at the foot. The play control is a 48px square in
   button-primary — blue because it is the button.

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
    <section aria-labelledby="v5-voices-title" className={`cds-g10 bg-cds-background ${SECTION}`}>
      <div className={`${GRID} gap-y-12`}>
        <SectionHead id="v5-voices-title" kicker={testimonials.kicker} heading={testimonials.heading} />

        <Enter className="col-span-4 cds-md:col-span-8 cds-lg:col-span-12">
          <ul className="grid gap-px bg-cds-border-subtle-0 p-px cds-md:grid-cols-3">
            {items.map((t, i) => {
              const reel = byId.get(t.reel);
              return (
                <li key={t.quote} className="flex flex-col bg-cds-layer">
                  <figure className="flex h-full flex-col">
                    {reel && (
                      <button
                        type="button"
                        onClick={() => setOpen(reel)}
                        aria-label={`Play the ad: ${t.label}`}
                        className="group cds-skeleton block aspect-[4/5] w-full"
                      >
                        <LazyVideo
                          src={reel.src}
                          poster={reel.poster}
                          lane={`v5-voice-${i}`}
                          placeholderClassName=""
                          className="absolute inset-0 size-full object-cover"
                        />
                        <Tag className="absolute left-3 top-3">{t.label}</Tag>
                        <span
                          aria-hidden="true"
                          className="absolute bottom-0 right-0 grid size-12 place-items-center bg-cds-btn-primary text-cds-text-on-color transition-colors duration-[var(--cds-fast-01)] ease-[var(--cds-standard-productive)] group-hover:bg-cds-btn-primary-hover group-active:bg-cds-btn-primary-active"
                        >
                          <Icon name="play" size={16} />
                        </span>
                      </button>
                    )}
                    <blockquote className="px-4 pt-6">
                      <p className={`text-pretty text-cds-text-primary ${T.heading03}`}>{t.quote}</p>
                    </blockquote>
                    <figcaption className={`mt-auto px-4 pb-4 pt-8 text-cds-text-secondary ${T.label01}`}>
                      <span className="block border-t border-cds-border-subtle pt-3">{t.who}</span>
                    </figcaption>
                  </figure>
                </li>
              );
            })}
          </ul>
        </Enter>
      </div>

      {open && <Lightbox reel={open} onClose={close} />}
    </section>
  );
}
