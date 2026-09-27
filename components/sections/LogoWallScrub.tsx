"use client";

import { useEffect, useRef } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LOGOS, logoSrc, logoWidth } from "@/lib/logos";
import { ANCHOR, SECTION, WRAP } from "@/lib/ui";

/* LOGO WALL 03 — THE SCRUB.  (v5)

   THE SCROLL IS THE HANDLE. The strip does not run on its own: it slides in
   direct proportion to how far the section has moved through the viewport, so
   scrolling down pulls the logos left and scrolling up pushes them back. Stop
   and it stops. It is the Awwwards-nominee gesture — motion the visitor owns
   rather than watches — done on one property.

   ONE TRANSFORM PER FRAME, written inline on the strip from a rAF-throttled
   scroll handler. Not a custom property on the section: those inherit, so a
   variable on the section would restyle every logo to move one track. The
   inline transform is not inherited and invalidates nothing but itself.

   TRAVEL IS MEASURED, NOT ASSUMED. The strip's overflow past the viewport is
   read from the DOM on mount and resize, so the last logo arrives exactly at
   the right edge as the section leaves — never short, never past.

   A DARK BAND, SO EACH MARK SITS ON A WHITE CARD. A black wordmark on noir
   does not exist, and the logos' own colours are never altered — so rather
   than recolour the mark, each delivered PNG is shown as-is on white. */

const COPY = {
  kicker: "Clients",
  heading: "Nine brands, one studio.",
};

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export function LogoWallScrub() {
  const sectionRef = useRef<HTMLElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const strip = stripRef.current;
    if (!section || !strip) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let travel = 0;
    let raf = 0;
    let last = -1;

    const measure = () => {
      travel = Math.max(0, strip.scrollWidth - section.clientWidth);
    };

    const update = () => {
      raf = 0;
      const r = section.getBoundingClientRect();
      const vh = window.innerHeight;
      /* 0 as the section's top enters the bottom of the viewport, 1 as its
         bottom leaves the top — the full span the band is on screen. */
      const p = clamp01((vh - r.top) / (vh + r.height));
      const x = -p * travel;
      if (x !== last) {
        last = x;
        strip.style.transform = `translate3d(${x}px,0,0)`;
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      last = -1;
      schedule();
    };

    measure();
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="clients"
      aria-label={COPY.kicker}
      data-nav-dark
      className={`${SECTION} ${ANCHOR} relative overflow-hidden bg-[#17141b] text-[#f5f3f0]`}
    >
      <div className={`${WRAP} mb-[clamp(28px,4vw,56px)]`}>
        <SectionHeading kicker={COPY.kicker} heading={COPY.heading} tone="bright" />
      </div>

      {/* Left-padded by the page gutter so the first mark starts where the
          heading does; the strip runs off the right edge and scrolls in. */}
      <div
        ref={stripRef}
        className="flex w-max items-center gap-[clamp(52px,7vw,128px)] pl-[clamp(24px,5vw,64px)] pr-[clamp(24px,5vw,64px)] will-change-transform"
      >
        {LOGOS.map((l, i) => (
          <Reveal key={l.slug} delay={i * 40}>
            <img
              src={logoSrc(l)}
              alt={l.name}
              width={Math.round(logoWidth(l) * 1.3)}
              height={Math.round(l.h * 1.3)}
              loading="lazy"
              decoding="async"
              className="block max-w-none shrink-0 rounded-[10px] bg-white object-contain"
            />
          </Reveal>
        ))}
      </div>

      {/* The rule under the strip, in the dark band's own hairline. */}
      <div className={`${WRAP} mt-[clamp(28px,4vw,56px)]`}>
        <div className="h-px w-full bg-white/12" />
      </div>
    </section>
  );
}
