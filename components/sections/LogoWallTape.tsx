"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LOGOS, logoSrc, logoWidth, type Logo } from "@/lib/logos";
import { ANCHOR, HEAD_GAP, SECTION, WRAP } from "@/lib/ui";

/* LOGO WALL 09 — THE TAPE.  (v9)

   TWO BANDS OF TAPE CROSSED OVER THE PAGE. One in ink, one in the site's own
   flame-to-violet ramp, each tilted a few degrees the opposite way and running
   the opposite direction, so they form a shallow X that is always moving at
   the crossing. It is the one wall that is loud on purpose: the marquee on
   /v3 is a quiet line of ink, this is the same idea as a poster.

   THE BANDS ARE THE MARQUEE'S MECHANISM, TILTED. Each is a `lane-x` track
   holding the set twice and sliding half its own length; the second band plays
   the same keyframe in reverse. The tilt is on the band's wrapper, not the
   track, so the loop arithmetic never sees it.

   WIDER THAN THE PAGE. A rotated strip exactly as wide as the viewport shows
   its corners at both edges; each band is 130% wide and centred, and the
   section clips it. The same reason the bands carry a separator glyph between
   marks — a tape reads as tape when it repeats a rhythm, not just a list.

   WHITE MARKS ON BOTH BANDS, via the logo's alpha as a mask, since neither
   ground is paper. No colour reveal: on a moving diagonal there is nothing to
   hover. Parks off screen; reduced motion stops the tracks where globals.css
   leaves them, which with both sets on the band is still a full row. */

const COPY = {
  kicker: "Clients",
  heading: "Stuck on our work.",
  sub: "Nine brands, taped to the wall.",
};

const SECONDS = 46;

function Mark({ logo }: { logo: Logo }) {
  const src = logoSrc(logo);
  return (
    <span
      className="block shrink-0 bg-white [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]"
      style={{
        width: `min(${logoWidth(logo)}px, ${(logo.aspect * 7).toFixed(1)}vw)`,
        aspectRatio: String(logo.aspect),
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
      }}
    />
  );
}

function Band({
  className,
  tilt,
  reverse,
  park,
}: {
  className: string;
  tilt: number;
  reverse?: boolean;
  park?: CSSProperties;
}) {
  const set = (dup: boolean) =>
    LOGOS.map((l) => (
      <span key={`${dup ? "dup-" : ""}${l.slug}`} className="flex shrink-0 items-center gap-[clamp(28px,4vw,64px)]">
        <Mark logo={l} />
        <span className="text-[0.9rem] leading-none text-white/55">✦</span>
      </span>
    ));

  return (
    <div
      aria-hidden
      className={`absolute left-1/2 top-1/2 w-[130%] py-[clamp(12px,1.6vw,22px)] shadow-[0_18px_40px_-18px_rgba(20,18,23,0.45)] ${className}`}
      style={{ transform: `translate(-50%, -50%) rotate(${tilt}deg)` }}
    >
      <div
        className="flex w-max animate-lane-x items-center gap-[clamp(28px,4vw,64px)] will-change-transform"
        style={{ animationDuration: `${SECONDS}s`, animationDirection: reverse ? "reverse" : "normal", ...park }}
      >
        {set(false)}
        {set(true)}
      </div>
    </div>
  );
}

export function LogoWallTape() {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: "20% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const park: CSSProperties | undefined = near ? undefined : { animationPlayState: "paused" };

  return (
    <section id="clients" aria-label={COPY.kicker} className={`${SECTION} ${ANCHOR} overflow-hidden bg-paper text-ink`}>
      <div className={WRAP}>
        <div className={HEAD_GAP}>
          <SectionHeading kicker={COPY.kicker} heading={COPY.heading} />
          <Reveal delay={100}>
            <p className="mt-3 text-center font-mono text-[0.8rem] tracking-[0.04em] text-ink-soft">{COPY.sub}</p>
          </Reveal>
        </div>
      </div>

      <ul className="sr-only">
        {LOGOS.map((l) => (
          <li key={l.slug}>{l.name}</li>
        ))}
      </ul>

      {/* The crossing. Only the on-screen stretch of each band has to fit: at
          4.5° that stretch climbs ~76px either side of centre at 1920px wide,
          plus half the band's own height, which 15vw clears at every width. */}
      <div ref={ref} className="relative h-[clamp(180px,15vw,290px)]">
        <Band className="bg-ink" tilt={-4.5} park={park} />
        <Band
          className="bg-[linear-gradient(90deg,var(--color-rose),var(--color-pink),var(--color-violet))]"
          tilt={3.5}
          reverse
          park={park}
        />
      </div>
    </section>
  );
}
