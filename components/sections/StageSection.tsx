"use client";

import { useEffect, useRef, useState } from "react";
import { content } from "@/lib/content";
import type { Reel } from "@/lib/reels.generated";
import { Button } from "@/components/ui/Button";
import { Lightbox } from "@/components/ui/Lightbox";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DRIVE_LIBRARY_URL } from "@/lib/site";
import { createReelStage, type StageOptions } from "@/lib/reelStage";
import { ANCHOR, SECTION, TEXT_META, WRAP } from "@/lib/ui";

const { work } = content;

/* THE BAND AROUND A WEBGL SCENE.

   Four scenes share this. It owns the heading, the canvas host, the read-out and
   the CTA, so a variant file is nothing but a layout and a motion rule — which
   is the whole point of having four of them to compare.

   THE READ-OUT IS DOM, NOT SCENE. Text rendered into WebGL is a texture: it
   cannot be selected, translated, zoomed by the browser, or read by a screen
   reader. Anything a person needs to READ stays in the document.

   THE CANVAS HAS A FIXED VIEWPORT HEIGHT because a scene's scale is set by its
   camera, not by its box — a shorter box crops the view instead of shrinking it,
   so the height is part of the composition rather than a container detail. */

export function StageSection({
  hint,
  height = "clamp(420px,64svh,760px)",
  options,
}: {
  /** What the read-out says when nothing is under the pointer — each scene has
      its own gesture to advertise. */
  hint: string;
  height?: string;
  options: Omit<StageOptions, "onOpen" | "onHover">;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<Reel | null>(null);
  const [hover, setHover] = useState<number | null>(null);

  /* The handlers run inside the renderer's own listeners, outside React's render
     cycle, so they are read from refs rather than captured by the effect. That
     also keeps the effect's dependency list empty: a scene is built once and
     torn down once, never rebuilt because a parent re-rendered. */
  const openRef = useRef(setOpen);
  const hoverRef = useRef(setHover);
  openRef.current = setOpen;
  hoverRef.current = setHover;
  const optsRef = useRef(options);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    return createReelStage(host, {
      ...optsRef.current,
      onOpen: (reel) => openRef.current(reel),
      onHover: (i) => hoverRef.current(i),
    });
  }, []);

  const total = options?.reels?.length;

  return (
    <section
      id="work"
      aria-label={work.kicker}
      data-nav-dark
      className={`${SECTION} ${ANCHOR} relative overflow-hidden bg-[radial-gradient(120%_80%_at_50%_-5%,#241d2b,#17141b_70%)] text-[#f5f3f0]`}
    >
      <div className={`${WRAP} mb-[clamp(20px,3vw,40px)]`}>
        <SectionHeading kicker={work.kicker} heading={work.heading} tone="bright" />
        <p
          className={`mt-3 text-center font-mono ${TEXT_META} leading-1.2 tracking-[0.04em] text-ink-dim`}
        >
          {work.sub}
        </p>
      </div>

      <div ref={hostRef} className="relative w-full" style={{ height }} />

      <div className={`${WRAP} mt-[clamp(18px,2.4vw,32px)] flex flex-wrap items-center gap-4`}>
        <span
          className={`font-mono ${TEXT_META} tabular-nums tracking-[0.06em] text-white/70`}
          aria-live="polite"
        >
          {hover === null ? (
            <>
              {hint} · {String(total).padStart(2, "0")} reels
            </>
          ) : (
            <>
              {String(hover + 1).padStart(2, "0")}
              <span className="text-white/35"> / {String(total).padStart(2, "0")}</span>
            </>
          )}
        </span>
        <span className="h-px flex-1 bg-white/12" />
        <Button href={DRIVE_LIBRARY_URL} external variant="light" withArrow ariaLabel={work.ctaAria}>
          {work.cta}
        </Button>
      </div>

      <p className="sr-only">{work.description}</p>

      {open && <Lightbox reel={open} onClose={() => setOpen(null)} />}
    </section>
  );
}