"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LOGOS, logoSrc, logoWidth, type Logo } from "@/lib/logos";
import { ANCHOR, HEAD_GAP, SECTION, WRAP } from "@/lib/ui";

/* LOGO WALL 06 — THE BOARD.  (v1, the home page)

   A DEPARTURE BOARD, NOT A CAROUSEL. Three slots, three brands each, and the
   slots roll one at a time left to right — so there is always one change on
   the board and never three at once. The eye gets one event to follow, which
   is the difference between a board and a slideshow.

   THE ROLL IS A TRANSFORM AND AN OPACITY on three stacked marks per slot: the
   live one sits at 0, the one it replaced exits upward, the rest wait below.
   A mark that wraps from "gone" back to "waiting" crosses the slot while fully
   transparent, so the jump never shows. No layout moves; each slot is a fixed
   box.

   FULL COLOUR, UNLIKE THE OTHER LIGHT WALLS. One mark per slot is not a row of
   nine competing colour systems — at three on screen the brands can be
   themselves, and the mono label under each does the job the tint does
   elsewhere of making the set read as one list.

   THE CLOCK STOPS off screen, in a background tab, under the pointer (so a
   reader can look at a mark), and never starts under reduced motion — that
   case shows all nine as a still 3 x 3 board instead, so no brand is hidden
   behind a roll that never comes. */

const COPY = {
  kicker: "Clients",
  heading: "Now shipping for.",
  sub: "Nine brands on the board.",
};

const SLOTS = 3;
/* One slot rolls per step, so each slot changes every SLOTS * STEP_MS. */
const STEP_MS = 1500;

/* Deal the logos into columns: 0,3,6 / 1,4,7 / 2,5,8. */
const COLUMNS: Logo[][] = Array.from({ length: SLOTS }, (_, s) =>
  LOGOS.filter((_, i) => i % SLOTS === s)
);

const pad = (n: number) => String(n).padStart(2, "0");

const CELL =
  "relative flex min-h-[clamp(128px,15vw,196px)] flex-col items-center justify-center " +
  "overflow-hidden border-line px-3 [&:not(:last-child)]:border-r";

const REDUCED = "(prefers-reduced-motion: reduce)";

function subscribeMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function Mark({ logo, scale = 1.2 }: { logo: Logo; scale?: number }) {
  return (
    <img
      src={logoSrc(logo)}
      alt=""
      width={Math.round(logoWidth(logo) * scale)}
      height={Math.round(logo.h * scale)}
      decoding="async"
      className="block h-auto max-w-[82%] object-contain"
    />
  );
}

export function LogoWallBoard() {
  const boardRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const paused = useRef(false);
  /* Read through useSyncExternalStore so the server (no window) and the
     client agree on the first render; the server snapshot is the moving board. */
  const still = useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(REDUCED).matches,
    () => false
  );

  useEffect(() => {
    const el = boardRef.current;
    if (!el || still) return;
    let near = false;
    const io = new IntersectionObserver(([e]) => (near = e.isIntersecting), { rootMargin: "10% 0px" });
    io.observe(el);
    const id = window.setInterval(() => {
      if (near && !paused.current && !document.hidden) setStep((n) => n + 1);
    }, STEP_MS);
    return () => {
      window.clearInterval(id);
      io.disconnect();
    };
  }, [still]);

  return (
    <section id="clients" aria-label={COPY.kicker} className={`${SECTION} ${ANCHOR} bg-paper text-ink`}>
      <div className={WRAP}>
        <div className={HEAD_GAP}>
          <SectionHeading kicker={COPY.kicker} heading={COPY.heading} />
          <Reveal delay={100}>
            <p className="mt-3 text-center font-mono text-[0.8rem] tracking-[0.04em] text-ink-soft">{COPY.sub}</p>
          </Reveal>
        </div>

        {/* The list, once, for assistive tech; the board itself is decoration
            over it and would read as a stream of changing names. */}
        <ul className="sr-only">
          {LOGOS.map((l) => (
            <li key={l.slug}>{l.name}</li>
          ))}
        </ul>

        <Reveal>
          {still ? (
            <div aria-hidden className="grid grid-cols-3 overflow-hidden rounded-2xl border border-line">
              {LOGOS.map((l, i) => (
                <div
                  key={l.slug}
                  className="flex min-h-[clamp(96px,11vw,140px)] items-center justify-center border-line px-3 [&:nth-child(-n+6)]:border-b [&:not(:nth-child(3n))]:border-r"
                >
                  <span className="sr-only">{pad(i + 1)}</span>
                  <Mark logo={l} />
                </div>
              ))}
            </div>
          ) : (
            <div
              ref={boardRef}
              aria-hidden
              className="grid grid-cols-3 overflow-hidden rounded-2xl border border-line bg-white/60"
              onPointerEnter={() => (paused.current = true)}
              onPointerLeave={() => (paused.current = false)}
            >
              {COLUMNS.map((col, s) => {
                /* How many times this slot has rolled: slot s moves on steps
                   s+1, s+1+SLOTS, … */
                const rolls = Math.max(0, Math.ceil((step - s) / SLOTS));
                const live = rolls % col.length;
                const gone = (live - 1 + col.length) % col.length;
                const logo = col[live];
                return (
                  <div key={s} className={CELL}>
                    <span className="absolute left-3 top-3 font-mono text-[0.68rem] tracking-[0.08em] text-ink-faint tab:left-4 tab:top-4">
                      {pad(LOGOS.indexOf(logo) + 1)}
                      <span className="text-ink-faint/60"> / {pad(LOGOS.length)}</span>
                    </span>

                    {col.map((l, i) => (
                      <div
                        key={l.slug}
                        className={`absolute inset-0 flex items-center justify-center transition-[transform,opacity,filter] duration-700 ease-[cubic-bezier(0.22,0.7,0.2,1)] ${
                          i === live
                            ? "translate-y-0 opacity-100 blur-0"
                            : i === gone && rolls > 0
                              ? "-translate-y-1/2 opacity-0 blur-[3px]"
                              : "translate-y-1/2 opacity-0 blur-[3px]"
                        }`}
                      >
                        <Mark logo={l} />
                      </div>
                    ))}

                    <span className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[0.62rem] uppercase tracking-[0.14em] text-ink-soft tab:bottom-4 tab:text-[0.68rem]">
                      {logo.name}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
