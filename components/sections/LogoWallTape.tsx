"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LOGOS, logoSrc, logoWidth, type Logo } from "@/lib/logos";
import { ANCHOR, HEAD_GAP, SECTION, WRAP } from "@/lib/ui";

/* LOGO WALL 09 — THE TAPE.  (v9)

   TWO BANDS OF TAPE ACROSS THE PAGE. One in ink, one in the site's own
   flame-to-violet ramp, tilted 2° apart each way and running opposite
   directions, so they open into a shallow wedge. It is the one wall that is
   loud on purpose: the marquee on /v3 is a quiet line of ink, this is the same
   idea as a poster.

   A WEDGE, NOT AN X. They used to cross in the middle, and whichever band was
   on top buried the other one's logos at the crossing — half the ink band's
   marks were never readable. Now they never meet: the gap between them is
   solved from the tilt (below), so at every width the bands close to ~20px at
   the left edge and open to the right.

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
const TILT = 2;

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
      className={`relative -mx-[15%] w-[130%] py-[clamp(12px,1.6vw,22px)] shadow-[0_10px_24px_-14px_rgba(20,18,23,0.35)] ${className}`}
      style={{ transform: `rotate(${tilt}deg)` }}
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

      {/* THE WEDGE, SOLVED FROM THE TILT. Only the on-screen half-width (50vw)
          of each band matters, and at TILT° its end moves tan(TILT) x 50vw =
          ~1.75vw off its box. The bands converge on the left by twice that,
          so the gap is 3.5vw plus 20px of air; the padding holds the upper
          band's rising end and the lower band's falling end inside the clip. */}
      <div ref={ref} className="flex flex-col gap-[calc(3.5vw+20px)] py-[calc(1.75vw+12px)]">
        <Band className="bg-ink" tilt={-TILT} park={park} />
        <Band
          className="bg-[linear-gradient(90deg,var(--color-rose),var(--color-pink),var(--color-violet))]"
          tilt={TILT}
          reverse
          park={park}
        />
      </div>
    </section>
  );
}
