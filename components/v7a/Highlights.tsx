"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Reel } from "@/lib/reels.generated";
import { PlayIcon, ReelVideo, useChapterActivity } from "./Media";

export function Highlights({ reels, lines, heading }: { reels: Reel[]; lines: readonly string[]; heading: string }) {
  const root = useRef<HTMLElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const elapsed = useRef(0);
  const ignoreScrollUntil = useRef(0);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const onScreen = useChapterActivity(root);
  const running = onScreen && !paused;

  const select = useCallback((index: number, scroll = true) => {
    const next = (index + reels.length) % reels.length;
    elapsed.current = 0;
    progress.current?.querySelectorAll<HTMLElement>(".v7-progress-fill").forEach((bar) => { bar.style.width = "0%"; });
    setActive(next);
    if (scroll && rail.current) {
      const card = rail.current.children[next] as HTMLElement;
      ignoreScrollUntil.current = performance.now() + 750;
      rail.current.scrollTo({ left: card.offsetLeft - (rail.current.children[0] as HTMLElement).offsetLeft, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    }
  }, [reels.length]);

  useEffect(() => {
    if (!running) return;
    let request = 0;
    let last = performance.now();
    const tick = (now: number) => {
      if (running) elapsed.current += Math.min(now - last, 200);
      last = now;
      const bars = progress.current?.querySelectorAll<HTMLElement>(".v7-progress-fill");
      bars?.forEach((bar, index) => bar.style.width = `${index === active ? Math.min(100, elapsed.current / 80) : 0}%`);
      if (running && elapsed.current >= 8000) { select(active + 1); return; }
      request = requestAnimationFrame(tick);
    };
    request = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(request);
  }, [active, running, select]);

  useEffect(() => {
    const node = rail.current!;
    let timeout: ReturnType<typeof setTimeout>;
    const settle = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (performance.now() < ignoreScrollUntil.current) return;
        const first = (node.children[0] as HTMLElement).offsetLeft;
        const nearest = [...node.children].reduce((best, child, index) => Math.abs((child as HTMLElement).offsetLeft - first - node.scrollLeft) < Math.abs((node.children[best] as HTMLElement).offsetLeft - first - node.scrollLeft) ? index : best, 0);
        if (nearest !== active) select(nearest, false);
      }, 160);
    };
    node.addEventListener("scroll", settle, { passive: true });
    return () => { node.removeEventListener("scroll", settle); clearTimeout(timeout); };
  }, [active, select]);

  return <section id="highlights" className="v7-section v7-highlights" ref={root} aria-labelledby="v7-highlights-title" data-active={active + 1} data-paused={paused}>
    <div className="v7-container"><h2 id="v7-highlights-title" className="v7-chapter-title">{heading}</h2></div>
    <div className="v7-highlight-rail" ref={rail} aria-roledescription="carousel">
      {reels.map((reel, index) => <article className="v7-highlight-card" data-active={active === index} key={reel.id} aria-label={`${index + 1} / ${reels.length}`}>
        <ReelVideo key={`${reel.id}-${active === index}`} reel={reel} enabled={active === index && !paused} loop={false} priority={6} controls={active === index} onEnded={() => { if (running && active === index) select(active + 1); }} />
        <p>{lines[index]}</p>
      </article>)}
    </div>
    <div className="v7-container v7-carousel-controls">
      <div className="v7-progress-group" ref={progress}>{reels.map((reel, index) => <button type="button" data-control="carousel" className="v7-progress-button" key={reel.id} aria-label={`Highlight ${index + 1}`} aria-current={active === index ? "true" : undefined} onClick={() => select(index)}><span className="v7-progress-track"><span className="v7-progress-fill" /></span></button>)}</div>
      <div className="v7-carousel-buttons">
        <button type="button" data-control="carousel" className="v7-icon-button" aria-label="Previous highlight" onClick={() => select(active - 1)}><span aria-hidden="true">‹</span></button>
        <button type="button" data-control="carousel" className="v7-icon-button" aria-label={paused ? "Play" : "Pause"} data-carousel-pause onClick={() => setPaused((value) => !value)}><PlayIcon paused={paused} /></button>
        <button type="button" data-control="carousel" className="v7-icon-button" aria-label="Next highlight" onClick={() => select(active + 1)}><span aria-hidden="true">›</span></button>
      </div>
    </div>
  </section>;
}
