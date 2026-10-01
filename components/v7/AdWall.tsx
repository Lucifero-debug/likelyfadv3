"use client";

import { useEffect, useRef, useState } from "react";
import type { Reel } from "@/lib/reels.generated";

const LOOP_SECONDS = [238, 202, 191];
const START_FRACTIONS = [0.035, 0.39, 0.18];

export function AdWall({ rows }: { rows: Reel[][] }) {
  const root = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(true);
  const syncRef = useRef<() => void>(() => {});
  // Hydration never starts motion before the OS preference has been checked.
  const [paused, setPaused] = useState(true);

  useEffect(() => {
    const viewports = Array.from(root.current!.querySelectorAll<HTMLElement>(".v7-wall-row"));
    const visible = viewports.map(() => false);
    const animations = viewports.map((row, index) => {
      const track = row.querySelector<HTMLElement>(".v7-wall-track")!;
      const animation = track.animate(
        [{ transform: "translateX(0)" }, { transform: "translateX(-50%)" }],
        { duration: LOOP_SECONDS[index] * 1000, iterations: Infinity, easing: "linear" },
      );
      animation.pause();
      animation.currentTime = LOOP_SECONDS[index] * 1000 * START_FRACTIONS[index];
      return animation;
    });

    const sync = () => animations.forEach((animation, index) => {
      const playing = visible[index] && !pausedRef.current && !document.hidden;
      if (playing) animation.play();
      else animation.pause();
      viewports[index].dataset.playing = String(playing);
    });
    syncRef.current = sync;

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const index = viewports.indexOf(entry.target as HTMLElement);
        visible[index] = entry.isIntersecting;
        viewports[index].dataset.inView = String(entry.isIntersecting);
      }
      sync();
    });
    viewports.forEach((row) => observer.observe(row));

    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyPreference = () => {
      pausedRef.current = preference.matches;
      setPaused(preference.matches);
      sync();
    };
    applyPreference();
    preference.addEventListener("change", applyPreference);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
      preference.removeEventListener("change", applyPreference);
      document.removeEventListener("visibilitychange", sync);
      syncRef.current = () => {};
    };
  }, []);

  function togglePause() {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
    syncRef.current();
  }

  return (
    <section id="wall" aria-label="Ad wall">
      <div className="v7-wall" ref={root}>
        {rows.map((reels, rowIndex) => (
          <div className="v7-wall-row" key={rowIndex} data-row={rowIndex + 1}>
            <div className="v7-wall-track" style={{ transform: `translateX(-${START_FRACTIONS[rowIndex] * 50}%)` }}>
              {[false, true].map((clone) => (
                <ul className="v7-wall-half" key={String(clone)} aria-hidden={clone ? true : undefined} data-clone={clone}>
                  {reels.map((reel, index) => (
                    <li className={`v7-wall-tile ${(index + rowIndex) % 3 === 1 ? "v7-portrait" : "v7-landscape"}`} key={reel.id} data-reel={reel.id}>
                      {/* Direct manifest posters: no image proxy and no video in the wall. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={reel.poster!} alt="" width={400} height={300} decoding="async" draggable={false} />
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="v7-wall-controls">
        <button className="v7-round-button" type="button" data-wall-pause aria-label={paused ? "Play the ad wall" : "Pause the ad wall"} onClick={togglePause}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            {paused ? <path d="M9 5.5 19 12 9 18.5Z" /> : <><rect x="7" y="6" width="3" height="12" rx="1" /><rect x="14" y="6" width="3" height="12" rx="1" /></>}
          </svg>
        </button>
      </div>
    </section>
  );
}
