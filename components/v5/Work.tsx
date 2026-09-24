"use client";

import { useCallback, useState } from "react";
import { content } from "@/lib/content";
import { DRIVE_LIBRARY_URL } from "@/lib/site";
import { reelVideos, type Reel } from "@/lib/reels.generated";
import { takeReels } from "@/lib/reelOrder";
import { LazyVideo } from "@/components/ui/LazyVideo";
import { Lightbox } from "@/components/ui/Lightbox";
import { Enter } from "./Enter";
import { GRID, SECTION, Button, Icon, SectionHead } from "./primitives";

/* THE WORK — twelve clickable tiles on a CONDENSED grid: 1px gutters,
   square, two across on sm, four on md, six on xlg, so the set is always
   complete rows. Nothing is printed on the clips; no invented IDs or counts.

   Each tile is a button. On hover or focus a 48px play control in
   button-primary appears at its bottom-right corner (always shown on touch),
   on fast-02 — blue because it IS the control, the one thing blue means here.
   The full library sits under the set as a ghost button with the launch icon,
   which is how Carbon marks a link that leaves the page.

   PLAYBACK BUDGET. Two lanes of six, one per half of the set, so the lane
   budget in useInViewPlay keeps at most twelve decoders live. */

const REELS = takeReels(reelVideos, 6, 12);

export function Work() {
  const [open, setOpen] = useState<Reel | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const { work } = content;

  return (
    <section id="work" aria-labelledby="v5-work-title" className={`cds-g10 bg-cds-background ${SECTION}`}>
      <div className={`${GRID} gap-y-12`}>
        <SectionHead id="v5-work-title" kicker={work.kicker} heading={work.heading} lead={work.sub} />

        <Enter className="col-span-4 cds-md:col-span-8 cds-lg:col-span-12">
          <p className="sr-only">{work.description}</p>

          <ul className="grid grid-cols-2 gap-px bg-cds-border-subtle-0 p-px cds-md:grid-cols-4 cds-xlg:grid-cols-6">
            {REELS.map((reel, i) => (
              <li key={`${reel.id}-${i}`} className="bg-cds-layer">
                <button
                  type="button"
                  onClick={() => setOpen(reel)}
                  aria-label={`Play reel ${i + 1} of ${REELS.length}`}
                  className="group relative block w-full text-left"
                >
                  <span className="cds-skeleton block aspect-[9/16]">
                    <LazyVideo
                      src={reel.src}
                      poster={reel.poster}
                      lane={i < 6 ? "v5-work-a" : "v5-work-b"}
                      posterMode="element"
                      placeholderClassName=""
                      className="absolute inset-0 size-full object-cover"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 right-0 grid size-12 place-items-center bg-cds-btn-primary text-cds-text-on-color opacity-0 transition-opacity duration-[var(--cds-fast-02)] ease-[var(--cds-entrance-productive)] group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
                    >
                      <Icon name="play" size={16} />
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <Button href={DRIVE_LIBRARY_URL} external kind="ghost" size="lg" icon="launch" ariaLabel={work.ctaAria} className="-ml-4 mt-6">
            {work.cta}
          </Button>
        </Enter>
      </div>

      {open && <Lightbox reel={open} onClose={close} />}
    </section>
  );
}
