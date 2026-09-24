"use client";

import { useEffect, useRef, useState } from "react";
import { content } from "@/lib/redesign/content";
import { reelVideos, type Reel } from "@/lib/reels.generated";
import { HOT } from "@/lib/useInViewPlay";
import { Button } from "@/components/ui/Button";
import { LazyVideo } from "@/components/ui/LazyVideo";
import { HEADING, SECTION, TEXT_LEAD, WRAP } from "@/lib/redesign/ui";

const { spot } = content;

/* SPOT THE REAL ONE — the page's proof, as something the visitor does rather
   than reads. Four clips play; the visitor taps the one they think was filmed;
   every clip then gets an "AI" caption, because every clip is AI.

   HONEST BY CONSTRUCTION: the copy asks which one was filmed and never says
   one was, and lib/content.ts only lists AI clips. The reveal is a surprise,
   not a trick played with a false claim.

   THE CLIPS PLAY EVEN UNDER REDUCED MOTION. Everywhere else on the page that
   setting stills the decoration (the walls, the word pops). Here the footage IS
   the content — nobody can judge whether a clip was filmed from a still frame —
   so it plays, muted, and the "Pause clips" control stops it for anyone who
   wants it still (WCAG 2.2.2: auto-playing media needs a pause).

   A dark band on purpose: it follows the paper hero, so the game reads as a
   separate stage, and bright vertical video sits best on near-black. */

const CLIPS = spot.clips
  .map((id) => reelVideos.find((r) => r.id === id))
  .filter((r): r is Reel => Boolean(r));

export function SpotTheReal() {
  const [picked, setPicked] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const grid = useRef<HTMLUListElement>(null);

  /* Turning the lane off stops it being managed; this is what actually stops
     the frames already running. Resuming hands them back to the lane. */
  useEffect(() => {
    if (!paused) return;
    grid.current?.querySelectorAll("video").forEach((v) => v.pause());
  }, [paused]);

  /* AUTOPLAY CAN BE REFUSED. Some browsers are set to block it outright (Edge
     can block even muted video), and then the lane's play() calls fail
     silently and the game shows four stills. While the grid is on screen this
     retries any loaded clip that is sitting paused; if the browser rejects it
     as not allowed, a "Play the clips" button goes over the grid. A click is a
     user gesture, which every browser accepts. */
  const [blocked, setBlocked] = useState(false);
  useEffect(() => {
    const el = grid.current;
    if (!el || paused) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const check = () =>
      el.querySelectorAll("video").forEach((v) => {
        if (v.paused && v.readyState >= 2) {
          v.play().catch((e: unknown) => {
            if (e instanceof DOMException && e.name === "NotAllowedError")
              setBlocked(true);
          });
        }
      });
    const io = new IntersectionObserver(([entry]) => {
      clearInterval(timer);
      if (entry.isIntersecting) timer = setInterval(check, 1500);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      clearInterval(timer);
    };
  }, [paused]);

  const startByHand = () => {
    grid.current?.querySelectorAll("video").forEach((v) => {
      v.muted = true;
      void v.play().catch(() => {});
    });
    setBlocked(false);
  };
  const revealed = picked !== null;

  return (
    <section
      id="spot"
      data-nav-dark
      aria-label={spot.kicker}
      className={`${SECTION} bg-noir text-white`}
    >
      <div className={WRAP}>
        {/* aria-live so the answer is announced when it replaces the question. */}
        {/* Centred over the clips: the one band set like a stage, because it
            is the one where the visitor is the one acting. */}
        <div
          aria-live="polite"
          className="flex flex-col items-center gap-4 text-center"
        >
          <h2 className={`max-w-[16ch] ${HEADING}`}>
            {revealed ? spot.answer : spot.question}
          </h2>
          <p
            className={`max-w-[40ch] text-pretty font-sans ${TEXT_LEAD} leading-normal text-ink-dim`}
          >
            {revealed ? spot.answerBody : spot.prompt}
          </p>
        </div>

        <div className="relative mt-[clamp(32px,4.5vw,64px)]">
          <ul
            ref={grid}
            className="grid grid-cols-2 gap-[clamp(10px,1.5vw,20px)] lap:grid-cols-4"
          >
            {CLIPS.map((clip, i) => {
              const mine = picked === i;
              return (
                <li key={clip.id}>
                  <button
                    type="button"
                    onClick={() => !revealed && setPicked(i)}
                    aria-disabled={revealed}
                    aria-label={
                      revealed
                        ? `Clip ${i + 1}: AI${mine ? ", your pick" : ""}`
                        : `Clip ${i + 1}: pick as the real one`
                    }
                    className={`relative block aspect-[9/16] w-full overflow-hidden rounded-2xl bg-poster outline-offset-4 transition-[box-shadow,opacity] duration-300 ${
                      revealed
                        ? `cursor-default ${mine ? "shadow-[0_0_0_4px_var(--color-pink)]" : "opacity-80"}`
                        : "cursor-pointer hover:shadow-[0_0_0_3px_rgba(255,255,255,0.7)]"
                    }`}
                  >
                    <LazyVideo
                      lane="spot"
                      src={clip.src}
                      poster={clip.poster}
                      posterMode="element"
                      enabled={!paused}
                      policy={HOT}
                      ariaHidden
                      className="size-full object-cover"
                    />

                    {/* The answer, set as an on-screen caption: the same box the
                      ads themselves use. At the top, clear of the captions each
                      ad already carries near the bottom. Staggered so the four
                      land in turn. */}
                    {revealed && (
                      <span
                        aria-hidden
                        className="caption-pop absolute inset-x-0 top-[7%] mx-auto w-fit rounded-[0.15em] bg-white px-[0.3em] font-display text-[clamp(1.75rem,1rem+2.5vw,3rem)] font-extrabold leading-[1.15] tracking-[-0.02em] text-ink"
                        style={{ animationDelay: `${120 + i * 140}ms` }}
                      >
                        AI
                      </span>
                    )}
                  </button>
                  {/* Under the tile, so it never covers the clip. Always takes its
                    line, so revealing it does not push the band down. */}
                  <p
                    aria-hidden
                    className={`mt-2 font-sans text-[0.9rem] font-bold text-pink ${revealed && mine ? "" : "invisible"}`}
                  >
                    {spot.picked}
                  </p>
                </li>
              );
            })}
          </ul>
          {blocked && !paused && (
            <div className="absolute inset-0 bottom-[1.9rem] grid place-items-center rounded-2xl bg-noir/55">
              <button
                type="button"
                onClick={startByHand}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-pink px-6 font-sans font-bold text-ink transition-colors hover:bg-white"
              >
                <span aria-hidden>▶</span> Play the clips
              </button>
            </div>
          )}
        </div>

        {/* Always available, before and after the reveal. */}
        <div className="mt-2 flex justify-center">
          <button
            type="button"
            aria-pressed={paused}
            onClick={() => setPaused((p) => !p)}
            className="inline-flex min-h-[44px] items-center gap-2 font-sans text-[0.9rem] font-semibold text-ink-dim transition-colors hover:text-white"
          >
            <span aria-hidden className="text-[0.75rem]">
              {paused ? "▶" : "❚❚"}
            </span>
            {paused ? "Play clips" : "Pause clips"}
          </button>
        </div>

        {/* Always rendered so the band does not grow when the answer lands;
            invisible, and so out of the tab order, until then. */}
        <div
          className={`mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 transition-opacity duration-300 ${
            revealed ? "opacity-100" : "invisible opacity-0"
          }`}
        >
          <Button contact variant="pink">
            {spot.cta}
          </Button>
          <button
            type="button"
            onClick={() => setPicked(null)}
            className="inline-flex min-h-[44px] items-center font-sans font-bold text-white underline decoration-white/35 underline-offset-[0.3em] transition-colors hover:decoration-white"
          >
            {spot.again}
          </button>
        </div>
      </div>
    </section>
  );
}
