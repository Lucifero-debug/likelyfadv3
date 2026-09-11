"use client";

import { useEffect, useRef, useState } from "react";
import { content } from "@/lib/content";
import { Button } from "@/components/ui/Button";
import { WRAP } from "@/lib/ui";

/* Fixed bar that compacts once scrolled and retracts when scrolling down.

   The scrolled state is a THICK material rather than a thin one, for two
   reasons that turn out to be the same reason.

   LEGIBILITY. At 74% the bar was translucent enough that the link colour was
   composited against whatever happened to be scrolling underneath — warm paper
   one moment, the near-black work band or a moving clip the next. Text contrast
   was therefore not a fixed number and could not be guaranteed.

   PERFORMANCE. The backdrop-filter that made the thin version work had to
   re-blur the strip on every frame anything moved behind it, and two marquees
   move behind it continuously.

   At 92% the bar still reads as a material (it is not flat paint, and content
   still tints it) while the ink on it is effectively fixed. */
/* THE BAR'S OWN RAMPS. Everything about this header used to be a fixed number —
   `py-4`, a 40px wordmark, 0.95rem links — which made it the one component on
   the page with no response to the viewport at all: 90.6px tall at 761px wide
   and 90.6px tall at 2866px wide. That is invisible at 100% zoom on the machine
   it was drawn on and obvious everywhere else. Browser zoom scales CSS px and
   shrinks the CSS viewport, so a fixed bar beside a vw-driven page grows on
   screen as you zoom in: at 175% the bar and its CTA were eating 158 physical
   px of a 1080px-tall screen while the hero headline beside them had ramped
   DOWN to 47px. Zoomed out it went the other way and read as a sliver.

   ALL THREE RAMPS ARE INERT AT 1920 — 16px of padding, a 40x120 wordmark,
   15.2px links, which are the fixed values to the pixel. Nothing about the bar
   anyone has looked at on a desktop moved; the ramp only runs outward from
   there, down through the zoomed-in / laptop widths and up past 1920.

   The `py-3 -my-3` pair on the links is NOT on a ramp and must not be: it is
   the tap target, not the bar's height, and it is what puts each link at ~48px
   against the 44px floor. See the note on the underline offset below. */
const LINK =
  "relative -my-3 py-3 text-[clamp(0.875rem,0.8rem+0.125vw,1.05rem)] font-normal text-ink-soft " +
  "transition-opacity duration-150 hover:text-ink active:opacity-60 " +
  // Gradient underline growing from the left. Offset back out of the padded
  // box so it still sits 3px under the TEXT, not under the tap target — the
  // py-3/-my-3 pair grows the target to ~48px without changing bar height.
  "after:absolute after:bottom-[calc(0.75rem-3px)] after:left-0 after:h-[1.5px] after:w-full " +
  "after:origin-left after:scale-x-0 after:bg-[image:var(--grad)] after:content-[''] " +
  "after:transition-transform after:duration-[280ms] after:ease-[cubic-bezier(0.16,1,0.3,1)] " +
  "hover:after:scale-x-100";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      // Only retracts well past the hero, so the bar does not flicker on the
      // small scroll corrections people make while reading the headline.
      setHidden(y > lastY.current && y > 400);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[120] transition-[transform,background-color,padding,box-shadow] duration-[280ms] ease-[cubic-bezier(0.22,0.7,0.2,1)] ${
        scrolled
          ? "bg-paper/92 py-[clamp(8px,4.5px+0.39vw,18px)] shadow-[0_1px_0_var(--color-line)]"
          : "py-[clamp(10px,6px+0.52vw,24px)]"
      } ${hidden ? "-translate-y-[115%]" : "translate-y-0"}`}
    >
      <div className={`${WRAP} flex items-center justify-between gap-6`}>
        <a href="#top" className="flex items-center" aria-label={`${content.brand} home`}>
          {/* eslint-disable-next-line @next/next/no-img-element -- a mark on a
              ramp now rather than a fixed box, but still one small PNG the
              optimiser has nothing to do with.

              THE TWO CLAMPS ARE ONE BOX: the width ramp is exactly 3x the
              height ramp at every point, which is the 120x40 the fixed pair
              spelled, so `object-contain` letterboxes by the same amount at
              every width and the mark never changes shape. Move one and the
              other moves by 3x, or the wordmark starts drifting inside its own
              box as the window resizes. */}
          <img
            src="/ls-icon.png"
            alt="Likelyfad Studio"
            className="h-[clamp(28px,17px+1.2vw,52px)] w-[clamp(84px,51px+3.6vw,156px)] object-contain"
          />
        </a>

        {/* Dropped below the tablet breakpoint, where the wordmark and the CTA
            already fill the bar and the links would wrap it onto two rows. */}
        <nav className="ml-auto mr-6 hidden gap-8 tab:flex" aria-label="Primary">
          {content.nav.links.map((l) => (
            <a key={l.label} href={l.href} className={LINK}>
              {l.label}
            </a>
          ))}
        </nav>

        <Button contact variant="dark" size="compact" className="shrink-0">
          {content.nav.cta}
        </Button>
      </div>
    </header>
  );
}
