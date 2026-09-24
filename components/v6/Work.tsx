"use client";

import { useCallback, useState } from "react";
import { content } from "@/lib/content";
import { DRIVE_LIBRARY_URL } from "@/lib/site";
import { reelVideos, type Reel } from "@/lib/reels.generated";
import { takeReels } from "@/lib/reelOrder";
import { LazyVideo } from "@/components/ui/LazyVideo";
import { Lightbox } from "@/components/ui/Lightbox";
import { PAGE, BAND, T, Button, Card, Icon, SectionHeader } from "./primitives";

/* THE WORK — one card holding the set, like a media library in the admin.

   Card header: the title, a count, and the card's one action (the full
   library) as a plain button at the right, where Polaris puts a card's
   header action. Body: a grid of 9:16 thumbnails at radius-200, three across
   on a phone, four on md, six on lg. Each is a button; hover or focus shows a
   small white play button, which is always shown on touch. Footer: one line of
   secondary text saying what the set is.

   PLAYBACK BUDGET. Two lanes of six, one per half of the set. */

const REELS = takeReels(reelVideos, 6, 12);

export function Work() {
  const [open, setOpen] = useState<Reel | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const { work } = content;

  return (
    <section id="work" aria-labelledby="v6-work-title" className={BAND}>
      <div className={PAGE}>
        <SectionHeader id="v6-work-title" heading={work.heading} lead={work.sub} />
        <p className="sr-only">{work.description}</p>

        <Card padded={false} className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 pt-3 p-sm:px-5">
            <h3 className={`text-p-text ${T.headingMd}`}>
              Reels <span className="font-normal text-p-text-secondary">· {REELS.length}</span>
            </h3>
            <Button href={DRIVE_LIBRARY_URL} external variant="plain" trailingIcon="external" ariaLabel={work.ctaAria}>
              {work.cta}
            </Button>
          </div>

          <ul className="grid grid-cols-3 gap-2 px-4 pb-4 pt-3 p-sm:gap-3 p-sm:px-5 p-md:grid-cols-4 p-lg:grid-cols-6">
            {REELS.map((reel, i) => (
              <li key={`${reel.id}-${i}`}>
                <button
                  type="button"
                  onClick={() => setOpen(reel)}
                  aria-label={`Play reel ${i + 1} of ${REELS.length}`}
                  className="group relative block aspect-[9/16] w-full overflow-hidden rounded-lg bg-p-bg-fill-secondary"
                >
                  <LazyVideo
                    src={reel.src}
                    poster={reel.poster}
                    lane={i < 6 ? "v6-work-a" : "v6-work-b"}
                    posterMode="element"
                    placeholderClassName="bg-p-bg-fill-secondary"
                    className="absolute inset-0 size-full object-cover"
                  />
                  <span
                    aria-hidden="true"
                    className="p-btn-secondary absolute bottom-2 right-2 grid size-8 place-items-center rounded-lg bg-p-bg-surface text-p-text opacity-0 transition-opacity duration-[var(--p-duration-150)] ease-[var(--p-ease)] group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
                  >
                    <Icon name="play" size={16} />
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <p className={`border-t border-p-border-secondary bg-p-bg-surface-secondary px-4 py-3 text-p-text-secondary p-sm:px-5 ${T.bodySm}`}>
            Different products, different sectors. Select a reel to play it with sound.
          </p>
        </Card>
      </div>

      {open && <Lightbox reel={open} onClose={close} />}
    </section>
  );
}
