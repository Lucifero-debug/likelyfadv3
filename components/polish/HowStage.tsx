"use client";
/* The moving part of How it works (see HowItWorks.tsx). The server HTML shows
   step 01 fully. One timer; state changes are class swaps, and every motion
   is a CSS transition/animation on opacity and transform. */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type Props = {
  steps: string[];
  screens: { trialTag: string; refundAsk: string; refundReply: string; monthlyTag: string };
  chat: { typed: string; link: string; reply: string; typing: string; contact: string };
  video: { src: string; poster: string };
  grid: string[];
  cta: ReactNode;
};

/* How long each step shows before the next one (ms). */
const DUR = [3600, 5200, 3600, 3800];

export function HowStage({ steps, screens, chat, video, grid, cta }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(0);
  const [running, setRunning] = useState(false); // auto-advance on, and visible
  const [cycle, setCycle] = useState(0);          // remounts the fill + in-card animations on each show
  const loop = useRef(false);
  const held = useRef(false);                     // phone: finished once, holds on 04
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = matchMedia("(prefers-reduced-motion: reduce)").matches;
    loop.current = matchMedia("(min-width: 761px) and (pointer: fine)").matches;
    const el = root.current;
    if (!el || reduced.current) return;
    const io = new IntersectionObserver(([e]) => setRunning(e.isIntersecting && !held.current), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!running) return;
    const t = window.setTimeout(() => {
      if (active === steps.length - 1 && !loop.current) { held.current = true; setRunning(false); return; }
      setActive(a => (a + 1) % steps.length); setCycle(c => c + 1);
    }, DUR[active] ?? 3600);
    return () => clearTimeout(t);
  }, [running, active, steps.length]);

  // The trial ad: attach the source on first show, play only while showing.
  useEffect(() => {
    const v = vid.current;
    if (!v) return;
    if (active === 1 && !reduced.current) {
      if (!v.hasAttribute("src")) v.src = video.src;
      v.currentTime = 0; void v.play().catch(() => {});
    } else v.pause();
  }, [active, cycle, video.src]);

  const go = (i: number) => {
    setActive(i); setCycle(c => c + 1);
    if (!reduced.current && !held.current) setRunning(true);
  };

  const on = (i: number) => (i === active ? "is-on" : "");
  const style = { "--dur": `${DUR[active]}ms` } as CSSProperties;

  return (
    <div ref={root} className="v6-how-stage" data-running={running ? "" : undefined} style={style}>
      <div className="v6-how-copy" data-reveal-item>
        <p className="v6-how-count" aria-hidden="true">{String(active + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}</p>
        <div className="v6-how-lines" aria-hidden="true">
          {steps.map((s, i) => <p key={s} className={`v6-how-line ${on(i)}`}>{s}</p>)}
        </div>
        <div className="v6-how-dashes" role="group" aria-label="Steps">
          {steps.map((s, i) => (
            <button key={s} type="button" aria-label={`Step ${i + 1}: ${s}`} aria-pressed={i === active}
              className={`v6-how-dash ${i < active ? "is-done" : ""} ${on(i)}`} onClick={() => go(i)}>
              <i key={i === active ? `f${cycle}` : "f"} />
            </button>
          ))}
        </div>
        <div className="v6-how-cta">{cta}</div>
      </div>

      <div className="v6-how-card" data-reveal-item aria-hidden="true">
        {/* 01 the DM */}
        <div className={`v6-how-screen v6-how-chat ${on(0)}`} key={`s0-${active === 0 ? cycle : "x"}`}>
          <div className="v6-how-top"><span className="v6-how-av">L</span>{chat.contact}</div>
          <div className="v6-how-thread">
            <p className="v6-how-b v6-how-out" style={{ "--d": "250ms" } as CSSProperties}>{chat.typed}<span className="v6-how-link">{chat.link}</span></p>
            <p className="v6-how-typing" style={{ "--d": "900ms" } as CSSProperties}>{chat.typing}</p>
            <p className="v6-how-b v6-how-in" style={{ "--d": "1900ms" } as CSSProperties}>{chat.reply}</p>
          </div>
        </div>
        {/* 02 the trial ad, playing */}
        <div className={`v6-how-screen v6-how-video ${on(1)}`}>
          <video ref={vid} poster={video.poster} muted loop playsInline preload="none" />
          <span className="v6-how-tag">{screens.trialTag}</span>
          <span className="v6-how-bar" key={`b${active === 1 ? cycle : "x"}`}><i /></span>
        </div>
        {/* 03 the refund */}
        <div className={`v6-how-screen v6-how-chat ${on(2)}`} key={`s2-${active === 2 ? cycle : "x"}`}>
          <div className="v6-how-top"><span className="v6-how-av">L</span>{chat.contact}</div>
          <div className="v6-how-thread">
            <p className="v6-how-b v6-how-out" style={{ "--d": "250ms" } as CSSProperties}>{screens.refundAsk}</p>
            <p className="v6-how-b v6-how-in" style={{ "--d": "1300ms" } as CSSProperties}>{screens.refundReply}</p>
          </div>
        </div>
        {/* 04 monthly */}
        <div className={`v6-how-screen v6-how-grid ${on(3)}`} key={`s3-${active === 3 ? cycle : "x"}`}>
          <div className="v6-how-tiles">
            {grid.map((p, i) => <span key={p} style={{ backgroundImage: `url(${p})`, "--d": `${200 + i * 350}ms` } as CSSProperties} />)}
          </div>
          <span className="v6-how-tag v6-how-tag-low">{screens.monthlyTag}</span>
        </div>
      </div>
    </div>
  );
}
