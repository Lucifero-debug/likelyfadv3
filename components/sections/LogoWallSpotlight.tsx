"use client";

import { useEffect, useRef } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LOGOS, logoSrc, logoWidth, type Logo } from "@/lib/logos";
import { ANCHOR, HEAD_GAP, SECTION, WRAP } from "@/lib/ui";

/* LOGO WALL 04 — THE SPOTLIGHT.  (v6)

   SKIPER'S CURSOR-TRAIL IDEA. A soft pool of light follows the pointer across
   the wall — like a torch moving over a wall of marks. Nothing is clicked,
   nothing expands.

   THE LIGHT IS ON THE GROUND, NEVER ON THE MARKS. The logos are the delivered
   PNGs in their true colours, always; the glow is a radial-gradient on a
   layer behind the grid, so it shows only around and between them. The
   gradient is positioned by two custom properties.

   THE PROPERTIES ARE SET ON THE GLOW LAYER, NOT THE SECTION. Custom properties
   inherit, so writing them on the section would restyle every descendant on
   every pointer move; on the glow they invalidate that one layer and nothing
   else. One rAF-throttled write, one element.

   REDUCED MOTION AND TOUCH both leave the hole parked at the centre, so the
   field still shows a pool of light in the middle rather than nothing. */

const COPY = {
  kicker: "Clients",
  heading: "Brands that ship with us.",
  sub: "Move across the wall.",
};

const GRID =
  "grid grid-cols-3 gap-x-[clamp(24px,4vw,64px)] gap-y-[clamp(28px,4vw,56px)] " +
  "items-center justify-items-center py-[clamp(24px,3vw,40px)]";

const HOLE = "clamp(140px, 22vw, 260px)";

function Mark({ logo }: { logo: Logo }) {
  const src = logoSrc(logo);
  const h = Math.round(logo.h * 1.3);
  const w = Math.round(logoWidth(logo) * 1.3);
  return (
    <img
      src={src}
      alt={logo.name}
      width={w}
      height={h}
      loading="lazy"
      decoding="async"
      className="block object-contain"
      style={{ width: w, maxWidth: "100%", aspectRatio: `${w} / ${h}` }}
    />
  );
}

export function LogoWallSpotlight() {
  const fieldRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const field = fieldRef.current;
    const glow = glowRef.current;
    if (!field || !glow) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let x = 50;
    let y = 50;
    let raf = 0;

    const write = () => {
      raf = 0;
      glow.style.setProperty("--mx", `${x}%`);
      glow.style.setProperty("--my", `${y}%`);
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

  const light = `radial-gradient(circle ${HOLE} at var(--mx,50%) var(--my,50%), color-mix(in oklab, var(--color-pink) 22%, transparent) 0%, transparent 100%)`;

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
          {/* The light, on the ground behind the marks. */}
          <div
            ref={glowRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-[1]"
            style={{ backgroundImage: light }}
          />
          <div className={GRID}>
            {LOGOS.map((l) => (
              <Mark key={l.slug} logo={l} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
