"use client";

import { useEffect, useRef, useState } from "react";
import { content } from "@/lib/content";
import { Button } from "@/components/ui/Button";
import { WRAP } from "@/lib/ui";

/* Fixed bar that compacts once scrolled and retracts when scrolling down.

   THE BAR HAS NO EDGE. It is not a filled strip and it is not a flat sheet of
   glass: it is a GRADIENT OF BLUR that is strongest against the top of the
   viewport and has decayed to nothing by the time it clears the type. Whatever
   is scrolling underneath stays whatever it was — warm paper, the near-black
   work band, a moving clip — it only loses its detail as it passes behind the
   row, and it regains it on the way out. There is no line anywhere for the eye
   to catch, which is the entire point: a hairline or a 92% fill both announce
   “the page stops here”, and this page does not stop.

   WHY A STACK RATHER THAN ONE `backdrop-blur` WITH A MASK. Masking a single
   blurred layer does not ramp the blur, it ramps the OPACITY of a uniformly
   blurred layer — so the bottom of the strip is sharp content showing through a
   fading pane of 16px blur, and the seam between blurred and unblurred is still
   there, just softer. Real progressive blur needs the RADIUS to fall off, and
   the radius is not animatable across one element. So it is several elements,
   each a doubling of the last, each masked to die before the next one does; see
   BLUR_RAMP.

   WHAT IT COSTS IS FRAMES, AND THAT IS NOT A SMALL NOTE ON THIS PAGE. A
   backdrop-filter is a strip the compositor re-blurs on every frame anything
   moves behind it, and two marquees move behind this one continuously. That is
   why each layer is clipped to the slice it actually shows in rather than
   spanning the whole strip (~3.1 strip-heights of blur per frame instead of 5)
   and why the ramp stops at five. THE LAYER COUNT IS THE DIAL: if this ever
   shows up in a profile, drop the middle stop before you drop the radius —
   losing 4px widens the step between 2 and 8 but keeps the reach, and the reach
   is what stops it reading as a pane.

   CONTRAST IS STILL NOT A FIXED NUMBER, and blur does not make it one — a blurred
   dark band is still dark. That is what LINK_TONE below is for. If a band ever
   lands the links somewhere unreadable, the fix belongs to THAT BAND (top
   padding, or darker type over it) rather than to a fill up here. */
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
  "relative -my-3 py-3 text-[clamp(0.98rem,0.9rem+0.14vw,1.18rem)] font-normal " +
  "transition-[color,opacity] duration-150 active:opacity-60 " +
  // Gradient underline growing from the left. Offset back out of the padded
  // box so it still sits 3px under the TEXT, not under the tap target — the
  // py-3/-my-3 pair grows the target to ~48px without changing bar height.
  "after:absolute after:bottom-[calc(0.75rem-3px)] after:left-0 after:h-[1.5px] after:w-full " +
  "after:origin-left after:scale-x-0 after:bg-[image:var(--grad)] after:content-[''] " +
  "after:transition-transform after:duration-[280ms] after:ease-[cubic-bezier(0.16,1,0.3,1)] " +
  "hover:after:scale-x-100";

/* THE LINK COLOUR IS THE ONLY THING THE BAR STILL CHANGES ABOUT ITSELF, and it
   is what pays for the transparency. Over paper the links are `ink-soft`, the
   same muted ink the rest of the page uses for secondary text. Over a dark band
   that colour is 2.5:1 against the ground and effectively invisible, so the
   links flip to white at 75% — ~10.8:1 over the work band's #17141b, which is
   past AAA with room for the photograph in the Why us claim to be brighter than
   the flat fill under it.

   NOT `text-white` FLAT. At full strength the links weigh the same as the
   wordmark and the CTA and the bar stops having a hierarchy; 75% is the dark
   counterpart of what `ink-soft` does on paper, and hover takes it to full the
   same way hover takes `ink-soft` to `ink`.

   THE UNDERLINE IS NOT IN HERE because it does not need to be: it is the page's
   own gradient, which was picked to sit on both grounds and does. */
const LINK_TONE = {
  paper: "text-ink-soft hover:text-ink",
  dark: "text-white/75 hover:text-white",
} as const;

/* HALF THE HEIGHT OF THE BAND THE OBSERVER WATCHES, in px either side of the
   content row's own centre line.

   THE STRIP IS NOT THE BAR, AND THAT WAS THE FIRST VERSION'S BUG. Watching the
   bar's whole height — ~104px at its tallest — means a dark band flips the links
   the moment it touches the BOTTOM of the header, which on this page is about
   seventy pixels of scroll before it reaches the text. Measured over the Why us
   claim card, that put white links on paper at 1.04:1: the flip was correct, it
   was just early enough to be wrong the whole way there.

   So the band is pinned to the row's vertical middle instead, which is where the
   link text actually is (`items-center` puts the links on that line, and the
   taller wordmark is centred on it too). The colour turns over as the boundary
   crosses the type rather than as it crosses the header, so the worst case is
   half a line height of mismatch for the 150ms the colour takes to cross-fade —
   which is what the transition on LINK is for.

   8px RATHER THAN 0 because a zero-height root has no area to intersect, and
   thresholds are computed from area. Eight is comfortably inside a ~20px line
   box, so it still reads as "the boundary reached the text". */
const STRIP_HALF = 8;
const BAR_STRIP = STRIP_HALF * 2;

/* THE BLUR RAMP, top of the strip downward. Each stop is a separate layer.

   `blur` DOUBLES EVERY STOP and that is not decoration — perceived blur goes
   with the radius roughly logarithmically, so a linear ramp (1, 4, 8, 12, 16)
   looks like one weak layer and four identical strong ones. Doubling puts the
   stops an equal perceptual distance apart, which is what makes the fall-off
   read as continuous instead of as five panes.

   THEY COMPOUND. A backdrop-filter samples everything painted below it,
   INCLUDING the earlier siblings in this stack, so the top of the strip is not
   16px of blur, it is 16 applied on top of 8 on top of 4 on top of 2 on top of
   1 — roughly 18px equivalent. The numbers below are the increments, not the
   totals, which is why the last one can stay this low.

   `reach` IS HOW FAR DOWN THE STRIP THE LAYER EXTENDS AT ALL, and it doubles as
   the layer's own height: a layer that has faded out by 24% is only drawn 24%
   tall, so the compositor blurs a quarter-height slice rather than a full one.
   Moving a `reach` therefore moves both the look and the cost.

   `solid` IS WHERE THE LAYER STARTS FADING, as a percentage of the STRIP (not
   of the layer — maskFor converts). Every stop's fade begins before the
   previous stop's fade has ended, so at no height is exactly one layer dying on
   its own; that overlap is what keeps the ramp from banding.

   The strongest stop has `solid: 0`, i.e. it is already fading at the very top
   of the strip. It still lands at full strength where it matters because the
   strip starts ABOVE the type, at the viewport edge. */
export const BLUR_RAMP = [
  { blur: 1, solid: 50, reach: 100 },
  { blur: 2, solid: 35, reach: 85 },
  { blur: 3, solid: 20, reach: 65 },
  { blur: 5, solid: 8, reach: 45 },
  { blur: 8, solid: 0, reach: 28 },
] as const;

/* Strip-relative stops → a mask in the LAYER's own coordinates, since each
   layer is only `reach` tall. Spelled `rgb(0 0 0 / 0)` rather than
   `transparent` because in a gradient the keyword is interpolated as
   transparent BLACK in some engines and transparent WHITE in others; a mask
   built on the wrong one greys out from the middle. */
export const maskFor = (solid: number, reach: number) =>
  `linear-gradient(to bottom, rgb(0 0 0) 0%, rgb(0 0 0) ${(solid / reach) * 100}%, rgb(0 0 0 / 0) 100%)`;

/* A WHITE WASH UNDER THE BLUR, and it has a job beyond taste: blur alone moves
   no luminance, so a busy clip passing under the bar stays exactly as bright as
   it was and the links have to fight it in soft focus. Whitening the ground is
   what turns the stack from “out of focus” into “frosted”.

   IT IS WHITE OVER PAPER AND DARK OVER A DARK BAND, and that split is forced
   rather than chosen — see the second note below.

   OVER PAPER IT CAN BE STRONG BECAUSE PAPER IS ALREADY WHITE. `--color-paper`
   is #fbf9f6, which is four, six and nine points off #ffffff; even at full
   opacity there is almost nothing for the wash to move, so over BARE paper it
   is close to a no-op and the bar never reads as a pale band across an empty
   hero. What it actually whitens is the CONTENT passing underneath — the reel
   wall, the clips — which is the only thing up there that ever needed knocking
   back. That is why the number can be this high without costing anything.

   OVER A DARK BAND IT INVERTS, AND WHITE WAS TRIED THERE FIRST. The links are
   `white/75` on those bands, so the thing that threatens them is not the flat
   #17141b fill — that is a comfortable ~8:1 under any wash — it is a BRIGHT
   FRAME in a clip passing under the row. The work wall runs plenty of them: a
   white lab shelf, a sunlit window. A white wash lightens exactly that ground
   and takes the links with it; measured over the window frame it put them near
   1.4:1. Darkening instead is the only version that helps the case that is
   actually hard.

   SO: WHITE WHERE THE INK IS DARK, DARK WHERE THE INK IS WHITE. The wash always
   pushes the ground AWAY from the link colour, which is the rule; “white glass”
   is what that rule happens to look like over paper, not the rule itself.
   Raising the dark value is safe; making it white is not, and that is the one
   edit here that will look fine on the flat fill and fail on the clips.

   THE BRIGHT-FRAME CASE IS STILL THE WEAK ONE even at 25%, and it predates this
   wash. It is not fixable from up here — 25% cannot tame a near-white frame
   without turning the bar into a visible smoked band over everything else. The
   fix belongs to the band, as the header note says.

   FADED ON ITS OWN MASK, more steeply than the blur, so the wash is gone well
   before the blur is. A wash that outlived the blur would be a pale band with a
   soft bottom edge — exactly the hairline this bar does not have. */
export const TINT_MASK =
  "linear-gradient(to bottom, rgb(0 0 0) 0%, rgb(0 0 0 / 0.85) 40%, rgb(0 0 0 / 0.45) 75%, rgb(0 0 0 / 0) 100%)";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  /* Starts false, and the server agrees: the prerendered document is the top of
     the page, the top of the page is the hero, and the hero is paper. So the
     first paint is correct and nothing flips during hydration. */
  const [onDark, setOnDark] = useState(false);
  const lastY = useRef(0);
  const headerRef = useRef<HTMLElement>(null);

  /* The bar's live height as `--nav-h` on the root, so a hero's TopFrost can
     stand exactly as tall as the bar. Observed rather than computed: the bar
     is on three viewport ramps and compacts on scroll. */
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const root = document.documentElement;
    const ro = new ResizeObserver(() => {
      root.style.setProperty("--nav-h", `${el.offsetHeight}px`);
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.removeProperty("--nav-h");
    };
  }, []);

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

  /* WHICH GROUND THE BAR IS OVER.

     AN INTERSECTION OBSERVER, NOT A READ INSIDE THE SCROLL HANDLER ABOVE. The
     handler already runs on every frame of every gesture; adding a rect read to
     it would make it read layout on every frame too, and this state changes
     about six times in the life of the page. The observer fires on those six.

     THE ROOT IS SHRUNK TO THE BAR. A negative bottom margin of the viewport's
     height less BAR_STRIP collapses the observation area to a strip across the
     top exactly as tall as the header, so a section is "under the bar" only
     while it is actually under the bar — not from the moment it enters the
     viewport a screen below. That is the whole trick, and it is why this needs
     no thresholds and no rects.

     A SET RATHER THAN A BOOLEAN PER ENTRY, because the strip can hold two marks
     at once: at the seam between two dark bands the leaving one and the arriving
     one are both in it for a frame or two, and a plain `isIntersecting` on the
     last entry would flicker the links to paper and back in the middle of an
     unbroken dark run.

     REBUILT ON RESIZE because rootMargin is resolved once, at construction, from
     a viewport height that a rotation or a window drag invalidates. Resize is
     rare enough that tearing the observer down and rebuilding it is cheaper than
     anything clever, and `marks` is captured once because the page is static —
     nothing mounts or unmounts a band after hydration. */
  useEffect(() => {
    const marks = document.querySelectorAll("[data-nav-dark]");
    if (!marks.length) return;

    const live = new Set<Element>();
    let io: IntersectionObserver | null = null;

    const build = () => {
      io?.disconnect();
      live.clear();
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) live.add(e.target);
            else live.delete(e.target);
          }
          setOnDark(live.size > 0);
        },
        { rootMargin: `0px 0px ${BAR_STRIP - window.innerHeight}px 0px`, threshold: 0 }
      );
      for (const m of marks) io.observe(m);
    };

    build();
    window.addEventListener("resize", build);
    return () => {
      window.removeEventListener("resize", build);
      io?.disconnect();
    };
  }, []);

  return (
<header
  ref={headerRef}
  className={`fixed inset-x-0 top-0 z-[120]
    transition-[transform,padding]
    duration-[280ms]
    ease-[cubic-bezier(0.22,0.7,0.2,1)]
    ${
      scrolled
        ? "py-[clamp(8px,4.5px+0.39vw,18px)]"
        : "py-[clamp(10px,6px+0.52vw,24px)]"
    }
    ${hidden ? "-translate-y-[115%]" : "translate-y-0"}`
  }
>
      {/* THE STRIP IS EXACTLY THE BAR'S HEIGHT, by request: the frost ends at
          the bar's bottom edge rather than overhanging below it. (It was 170%,
          half a bar of runway for the ramp to decay in; if the bottom edge
          ever reads as a soft line, that overhang is the fix.)

          A PERCENTAGE, so it rides the bar's own clamps for free — the header
          is already on three viewport ramps and compacts on scroll, and a fixed
          px height here would drift out of proportion at both ends of that.

          NO FADE-IN ON SCROLL, AND DO NOT ADD ONE AS AN OPACITY. Any value of
          `opacity` between 0 and 1 makes an element a BACKDROP ROOT, which means
          its descendants' backdrop-filters stop sampling the page and start
          sampling the (empty) subtree — so a fading wrapper would blink the
          whole stack off for the length of the transition and back on at the
          end. If this ever needs to arrive on scroll, animate the strip's
          HEIGHT under `overflow-hidden`, never its opacity. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full"
      >
        {BLUR_RAMP.map(({ blur, solid, reach }) => {
          const mask = maskFor(solid, reach);
          return (
            <div
              key={blur}
              className="absolute inset-x-0 top-0"
              style={{
                height: `${reach}%`,
                backdropFilter: `blur(${blur}px)`,
                WebkitBackdropFilter: `blur(${blur}px)`,
                maskImage: mask,
                WebkitMaskImage: mask,
              }}
            />
          );
        })}

        {/* PAINTED LAST so it sits over the blur rather than under it: a tint
            below the stack would itself be blurred by every layer above it,
            which does nothing to a flat colour but does cost five more passes.

            `transition-colors`, NOT a swap of two opacities, for the reason in
            the note above — the alpha lives in the background-color, which is
            safe to animate, and cross-fading two stacked layers would not be. */}
        <div
          className={`absolute inset-0 transition-colors duration-300 ease-out ${
            onDark ? "bg-black/25" : "bg-white/45"
          }`}
          style={{ maskImage: TINT_MASK, WebkitMaskImage: TINT_MASK }}
        />
      </div>

      <div className={`${WRAP} flex items-center justify-between gap-6`}>
        <a href="#top" className="flex items-center" aria-label={`${content.brand} home`}>
          {/* eslint-disable-next-line @next/next/no-img-element -- a mark on a
              ramp now rather than a fixed box, but still one small PNG the
              optimiser has nothing to do with.

              SIZED FROM THE CTA'S FIRST `nav` SIZE (2 x padding + 1.5 x text
              + 2px border), which was then trimmed on its own; the mark was
              kept at the larger height on purpose. `aspect-[3/1]` keeps the 3:1 box, so
              `object-contain` letterboxes by the same amount at every width. */}
          <img
            src="/ls-icon.png"
            alt="Likelyfad Studio"
            className="aspect-[3/1] h-[calc(1.75rem+1.425rem+2px)] w-auto object-contain tab:h-[calc(2*clamp(14px,9.5px+0.47vw,25px)+1.5*clamp(1rem,0.93rem+0.11vw,1.18rem)+2px)]"
          />
        </a>

        {/* Dropped below the tablet breakpoint, where the wordmark and the CTA
            already fill the bar and the links would wrap it onto two rows. */}
        <nav className="ml-auto mr-6 hidden gap-8 tab:flex" aria-label="Primary">
          {content.nav.links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className={`${LINK} ${LINK_TONE[onDark ? "dark" : "paper"]}`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* THE PILL FLIPS TOO, and it is not a nicety. `dark` is an ink fill
            (#16141a) and the work band it would sit on is #17141b — one point
            of luminance apart, so on that band the pill stops being a pill and
            becomes floating white text. `light` is the same shape inverted, a
            white fill with ink on it, which is the strongest thing the bar can
            put on a dark ground and keeps the CTA reading as the one control up
            there. Both variants carry their own text colour, so nothing here
            has to be told about it. */}
        <Button
          contact
          variant={onDark ? "light" : "dark"}
          size="nav"
          className="shrink-0"
        >
          {content.nav.cta}
        </Button>
      </div>
    </header>
  );
}
