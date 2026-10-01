"use client";

import { useEffect, useRef, useState } from "react";
import type { Reel } from "@/lib/reels.generated";
import { PlayIcon, ReelVideo, useChapterActivity } from "./Media";

const SECONDS = [202, 238];

export function AdWall({ rows, heading, line, pauseLabel }: { rows: Reel[][]; heading: string; line: string; pauseLabel: string }) {
  const root = useRef<HTMLElement>(null);
  const animations = useRef<Animation[]>([]);
  const [paused, setPaused] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const onScreen = useChapterActivity(root);

  useEffect(() => {
    animations.current = [...root.current!.querySelectorAll<HTMLElement>(".v7-wall-track")].map((track, index) => {
      const animation = track.animate([{ transform: "translateX(0)" }, { transform: "translateX(-50%)" }], { duration: SECONDS[index] * 1000, iterations: Infinity, easing: "linear" });
      animation.pause();
      return animation;
    });
    return () => animations.current.forEach((animation) => animation.cancel());
  }, []);

  useEffect(() => {
    const move = onScreen && !paused && selected === null;
    animations.current.forEach((animation) => move ? animation.play() : animation.pause());
    if (root.current) root.current.dataset.moving = String(move);
  }, [onScreen, paused, selected]);

  return <section id="work" className="v7-section v7-work" ref={root} aria-labelledby="v7-work-title">
    <div className="v7-container v7-work-heading"><div><h2 id="v7-work-title" className="v7-chapter-title">{heading}</h2><p className="v7-sub">{line}</p></div>
      <button type="button" className="v7-wall-pause" data-control="wall-pause" aria-label={paused ? "Play" : pauseLabel} aria-pressed={paused} onClick={() => setPaused((value) => !value)}><PlayIcon paused={paused} /><span>{pauseLabel}</span></button>
    </div>
    <div className="v7-wall">{rows.map((reels, row) => <div className="v7-wall-row" key={row} data-loop-seconds={SECONDS[row]}>
      <div className="v7-wall-track">{[0, 1].map((clone) => <ul className="v7-wall-half" key={clone}>
        {reels.map((reel) => {
          const key = `${row}-${clone}-${reel.id}`;
          return <li className="v7-wall-tile" key={reel.id}><button type="button" data-control="wall-tile" data-reel={reel.id} aria-label={selected === key ? "Pause" : `Play ${reel.id}`} aria-pressed={selected === key} onClick={() => setSelected((value) => value === key ? null : key)}>
            {selected === key ? <ReelVideo reel={reel} enabled={!paused} priority={9} controls={false} userInitiated /> : <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={reel.poster!} alt="" width={270} height={480} loading="lazy" decoding="async" draggable={false} /><span className="v7-tile-play" aria-hidden="true"><PlayIcon paused /></span>
            </>}
          </button></li>;
        })}
      </ul>)}</div>
    </div>)}</div>
  </section>;
}
