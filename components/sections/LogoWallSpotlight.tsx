"use client";

import { useEffect, useRef } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LOGOS, logoSrc, logoWidth, type Logo } from "@/lib/logos";
import { ANCHOR, HEAD_GAP, SECTION, WRAP } from "@/lib/ui";

/* LOGO WALL 04 — THE SPOTLIGHT.  (v6)

   SKIPER'S CURSOR-TRAIL IDEA, INVERTED. The whole field is ink-tinted, and a
   soft circle of full colour follows the pointer across it — like a torch
   moving over a wall of marks. Nothing is clicked, nothing expands; the brand
   colours simply exist wherever you are looking.

   TWO IDENTICAL GRIDS, ONE ON TOP OF THE OTHER. The lower grid is the marks
   in colour. The upper grid is the same marks tinted to ink, and it carries a
   `mask-image` that is OPAQUE everywhere except a soft hole at the pointer —
   so the tint is cut away there and the colour beneath shows through. The
   hole is a radial-gradient positioned by two custom properties.

   THE PROPERTIES ARE SET ON THE UPPER GRID, NOT THE SECTION. Custom properties
   inherit, so writing them on the section would restyle every descendant on
   every pointer move; on the grid they invalidate the grid's own mask and
   nothing else. One rAF-throttled write, one element.

   THE MASK IS A COMPOSITOR OPERATION on a layer of nine images; it does not
   read the page behind it the way backdrop-filter would. Same reason the reel
   walls never blend.

   REDUCED MOTION AND TOUCH both leave the hole parked at the centre, so the
   field still shows a pool of colour in the middle rather than nothing. */

const COPY = {
  kicker: "Clients",
  heading: "Brands that ship with us.",
  sub: "Move across the wall.",
};

const GRID =
  "grid grid-cols-3 gap-x-[clamp(24px,4vw,64px)] gap-y-[clamp(28px,4vw,56px)] " +
  "items-center justify-items-center py-[clamp(24px,3vw,40px)]";

const HOLE = "clamp(140px, 22vw, 260px)";

function Mark({ logo, tint }: { logo: Logo; tint?: boolean }) {
  const src = logoSrc(logo);
  const h = Math.round(logo.h * 1.3);
  const w = Math.round(logoWidth(logo) * 1.3);
  return tint ? (
    <span
      aria-hidden
      className="block bg-ink/45 [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]"
      style={{ width: w, height: h, WebkitMaskImage: `url(${src})`, maskImage: `url(${src})` }}
    />
  ) : (
    <img src={src} alt={logo.name} width={w} height={h} loading="lazy" decoding="async" className="block object-contain" />
  );
}

export function LogoWallSpotlight() {
  const fieldRef = useRef<HTMLDivElement>(null);
  const tintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const field = fieldRef.current;
    const tint = tintRef.current;
    if (!field || !tint) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let x = 50;
    let y = 50;
    let raf = 0;

    const write = () => {
      raf = 0;
      tint.style.setProperty("--mx", `${x}%`);
      tint.style.setProperty("--my", `${y}%`);
    };
    const onMove = (e: PointerEvent) => {
      const r = field.getBoundingClientRect();
      x = ((e.clientX - r.left) / r.width) * 100;
      y = ((e.clientY - r.top) / r.height) * 100;
      if (!raf) raf = requestAnimationFrame(write);
    };
    const onLeave = () => {
      x = 50;
      y = 50;
      if (!raf) raf = requestAnimationFrame(write);
    };

    field.addEventListener("pointermove", onMove, { passive: true });
    field.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      field.removeEventListener("pointermove", onMove);
      field.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const mask = `radial-gradient(circle ${HOLE} at var(--mx,50%) var(--my,50%), transparent 0%, transparent 42%, black 100%)`;

  return (
    <section id="clients" aria-label={COPY.kicker} className={`${SECTION} ${ANCHOR} bg-paper text-ink`}>
      <div className={WRAP}>
        <div className={HEAD_GAP}>
          <SectionHeading kicker={COPY.kicker} heading={COPY.heading} />
          <Reveal delay={100}>
            <p className="mt-3 text-center font-mono text-[0.8rem] tracking-[0.04em] text-ink-soft">
              {COPY.sub}
            </p>
          </Reveal>
        </div>

        <div ref={fieldRef} className="relative isolate">
          {/* The colour layer. */}
          <div className={GRID}>
            {LOGOS.map((l) => (
              <Mark key={l.slug} logo={l} />
            ))}
          </div>
          {/* The tint layer, with the hole cut out of it. Positioned over the
              colour layer exactly, so the two grids register. */}
          <div
            ref={tintRef}
            aria-hidden
            className={`${GRID} pointer-events-none absolute inset-0 transition-[mask-position] duration-150`}
            style={{ WebkitMaskImage: mask, maskImage: mask }}
          >
            {LOGOS.map((l) => (
              <Mark key={`t-${l.slug}`} logo={l} tint />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
