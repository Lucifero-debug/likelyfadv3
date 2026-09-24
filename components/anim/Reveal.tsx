"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

/* ============================================================================
   REVEAL — the GSAP-shaped API, on an IntersectionObserver.

   components/ui/Reveal does the same job with a ms `delay` and one moving
   element. This is the variant the sections written against the v1 markup call
   for: SECONDS rather than milliseconds, a ScrollTrigger-style `start` string,
   and a `stagger` mode where the ROOT is the layout box and the things that
   move are its `[data-reveal-item]` children.

   THE TWO MODES ARE NOT INTERCHANGEABLE, which is the whole reason this takes
   a flag rather than inferring one. `<Reveal>` wraps a thing and moves the
   wrapper. `<Reveal stagger className="why-grid">` IS the grid — putting a
   transform on it would slide all six cards as one sheet and defeat the
   stagger, so in that mode the root never moves and the children do.

   THE VISUAL STATE LIVES IN globals.css, keyed off `data-reveal-root` and
   `data-phase`. It has to: in stagger mode the moving elements are children
   this component never renders and must not clone, so there is nowhere to hang
   a class. What JS still owns is --reveal-delay, which is an index times a step
   and cannot be expressed in CSS without an --i on every child — the markup
   this exists to serve does not carry one.

   THE DELAY IS WRITTEN WHILE THE ITEMS ARE STILL ARMED, one commit before the
   phase that starts the motion, and that ordering is the whole trick. An
   animation reads its delay when it starts; set it afterwards and the six cards
   have already left together. Effects run after paint, so "afterwards" is
   exactly what a post-flip write would be.

   AN ANIMATION RATHER THAN A TRANSITION, for the same reason. A transition
   needs its timing declared on the element it moves, and the element it moves
   here is the caller's own card — which already declares a `transition` for its
   hover lift, at a lower specificity than anything this could write. The reveal
   would win and the card would spend the rest of the page's life hovering at
   950ms with no shadow fade. A keyframe with `backwards` fill touches nothing:
   it holds the from-state through its delay, runs, and hands every property
   back to the stylesheet when it ends.

   THREE PHASES, AND `rest` IS THE ONE THAT MATTERS FOR SSR. Nothing is hidden
   until the client has mounted and armed it, so a reader with no JS, or one
   who arrives before hydration, sees the section at full opacity rather than a
   blank band that never fills.
   ========================================================================== */

/* Armed synchronously, before paint, so the element is never shown and then
   snatched back. On the server there is no layout to flush, and calling
   useLayoutEffect there warns, so it degrades to useEffect. */
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/* v1's numbers: 26px, 950ms, eased-out quart, 90ms between siblings. Only the
   step is needed here — the distance and the curve are in the stylesheet. */
const STEP = 0.09;

/* ScrollTrigger's `start` in the one shape the sections use: "top 80%" means
   fire when the element's top passes 80% of the way down the viewport. An
   IntersectionObserver expresses the same line by pulling its root's bottom
   edge up the remaining 20%.

   Anything else falls back to -14%, which is ui/Reveal's trigger and v1's
   "top 86%" — a little before the element is fully in, so the rise finishes as
   it reaches comfortable reading height. */
function rootMarginFrom(start: string | undefined): string {
  const match = /^\s*top\s+(-?\d+(?:\.\d+)?)%\s*$/.exec(start ?? "");
  if (!match) return "0px 0px -14% 0px";
  return `0px 0px ${-(100 - Number(match[1]))}% 0px`;
}

export function Reveal({
  children,
  className = "",
  delay = 0,
  stagger = false,
  step = STEP,
  start,
}: {
  children: ReactNode;
  className?: string;
  /** SECONDS before this element moves. Ignored in stagger mode. */
  delay?: number;
  /** Move the `[data-reveal-item]` children in sequence instead of the root. */
  stagger?: boolean;
  /** SECONDS between staggered siblings. */
  step?: number;
  /** ScrollTrigger-style trigger line, e.g. "top 80%". */
  start?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"rest" | "armed" | "in">("rest");

  useIsoLayoutEffect(() => setPhase("armed"), []);

  useEffect(() => {
    if (phase !== "armed") return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setPhase("in");
        io.disconnect();
      },
      { rootMargin: rootMarginFrom(start) }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [phase, start]);

  /* The delays are written to the DOM rather than rendered, because the items
     are the caller's own elements. On `armed`, which is the commit before the
     one that moves them — see the note at the head of the file. */
  useIsoLayoutEffect(() => {
    if (!stagger || phase !== "armed") return;
    const el = ref.current;
    if (!el) return;
    el.querySelectorAll<HTMLElement>("[data-reveal-item]").forEach((item, i) => {
      item.style.setProperty("--reveal-delay", `${i * step}s`);
    });
  }, [phase, stagger, step, children]);

  return (
    <div
      ref={ref}
      data-reveal-root={stagger ? "stagger" : "self"}
      data-phase={phase}
      /* Set from the first render rather than on entry: same reason as above,
         an animation reads its delay when it starts. */
      style={!stagger && delay ? ({ "--reveal-delay": `${delay}s` } as CSSProperties) : undefined}
      className={className}
    >
      {children}
    </div>
  );
}
