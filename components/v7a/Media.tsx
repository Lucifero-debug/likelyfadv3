"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import type { ReelSegment } from "@/lib/content-v7";
import type { Reel } from "@/lib/reels.generated";

type Entry = {
  video: HTMLVideoElement;
  source: string;
  visible: boolean;
  enabled: boolean;
  manual: boolean;
  stopped: boolean;
  priority: number;
  wanted: boolean;
  pending: boolean;
  prepare?: () => boolean;
};

// One registry for the entire route. Pause outgoing players BEFORE starting any
// incoming player, including play() promises still waiting for media to load.
class Playback {
  entries = new Set<Entry>();
  reduced = true;
  phone = true;

  sync = () => {
    const candidates = [...this.entries].filter((entry) => entry.visible && entry.enabled && !entry.stopped && (!this.reduced || entry.manual) && !document.hidden);
    candidates.sort((a, b) => Number(b.manual) - Number(a.manual) || b.priority - a.priority);
    const selected = new Set(candidates.slice(0, this.phone ? 1 : 3));
    for (const entry of this.entries) {
      entry.wanted = selected.has(entry);
      if (!entry.wanted) entry.video.pause();
    }
    for (const entry of selected) {
      if (entry.video.getAttribute("src") !== entry.source) {
        entry.video.src = entry.source;
        if (entry.prepare) entry.video.load();
      }
      // Segment players must finish their metadata seek before ANY play().
      if (entry.prepare && !entry.prepare()) continue;
      if (entry.video.paused && !entry.pending) {
        entry.pending = true;
        void entry.video.play().catch(() => {}).finally(() => {
          entry.pending = false;
          if (!entry.wanted) entry.video.pause();
        });
      }
    }
  };
}

const PlaybackContext = createContext<Playback | null>(null);

export function MediaProvider({ children }: { children: ReactNode }) {
  const [controller] = useState(() => new Playback());
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const phone = matchMedia("(max-width: 1023px)");
    const sync = () => {
      controller.reduced = reduced.matches;
      controller.phone = phone.matches;
      controller.sync();
    };
    const preference = () => {
      for (const entry of controller.entries) entry.manual = false;
      sync();
    };
    sync();
    reduced.addEventListener("change", preference);
    phone.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      reduced.removeEventListener("change", preference);
      phone.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      for (const entry of controller.entries) entry.video.pause();
    };
  }, [controller]);
  return <PlaybackContext.Provider value={controller}>{children}</PlaybackContext.Provider>;
}

// Timed movement also observes visibility, document.hidden and motion preference.
export function useChapterActivity(ref: RefObject<HTMLElement | null>) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const sync = () => setActive(visible && !preference.matches && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: 0.05 });
    if (ref.current) observer.observe(ref.current);
    preference.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [ref]);
  return active;
}

export function PlayIcon({ paused }: { paused: boolean }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{paused ? <path d="m8 5 11 7-11 7Z" /> : <><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></>}</svg>;
}

function segmentSource(source: string, segment?: ReelSegment) {
  return segment ? `${source.split("#")[0]}#t=${segment.start},${segment.end}` : source;
}

function segmentPosition(time: number, segment: ReelSegment) {
  return Math.max(segment.start, Math.min(Number.isFinite(time) ? time : segment.start, segment.end - 0.1));
}

export function ReelVideo({ reel, enabled = true, priority = 2, soundControl = false, eager = false, loop = true, controls = true, userInitiated = false, onEnded, segment, poster = reel.poster }: {
  reel: Reel; enabled?: boolean; priority?: number; soundControl?: boolean; eager?: boolean; loop?: boolean; controls?: boolean; userInitiated?: boolean; onEnded?: () => void; segment?: ReelSegment; poster?: string | null;
}) {
  const controller = useContext(PlaybackContext)!;
  const videoRef = useRef<HTMLVideoElement>(null);
  const entryRef = useRef<Entry | null>(null);
  const resumeAt = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [sound, setSound] = useState(false);
  const source = segmentSource(reel.src, segment);
  const start = segment?.start;
  const end = segment?.end;

  useEffect(() => {
    const video = videoRef.current!;
    const window = start !== undefined && end !== undefined ? { start, end } : undefined;
    const entry: Entry = { video, source, visible: false, enabled, manual: userInitiated, stopped: false, priority, wanted: false, pending: false };
    let positioned = !window;
    let frame: number | undefined;
    let animation: number | undefined;
    const hide = () => { if (window) video.style.visibility = "hidden"; };
    const inside = (time: number) => !window || (time >= window.start && time < window.end);
    const seek = (time: number) => {
      hide();
      video.currentTime = time;
    };
    const guard = () => {
      if (!window) return true;
      if (!positioned || video.readyState < 1) { hide(); return false; }
      if (video.currentTime < window.start || video.currentTime >= window.end - 0.05) {
        seek(window.start);
        return false;
      }
      return !video.seeking;
    };
    if (window) entry.prepare = guard;
    const metadata = () => {
      const time = resumeAt.current ?? window?.start;
      resumeAt.current = null;
      positioned = true;
      if (time !== undefined) seek(window ? segmentPosition(time, window) : Math.min(time, Math.max(0, video.duration - 0.1)));
      controller.sync();
    };
    const reset = () => { positioned = !window; hide(); };
    const ready = () => { guard(); controller.sync(); };
    const update = () => {
      if (!guard()) return;
      // Without frame callbacks, timeupdate plus the per-paint guard below
      // keeps the window tight rather than relying on sparse timeupdate alone.
      if (window && !video.requestVideoFrameCallback && video.readyState >= 2) video.style.visibility = "";
    };
    const paint = () => {
      animation = undefined;
      update();
      if (!video.paused) animation = requestAnimationFrame(paint);
    };
    const play = () => {
      if (window && !guard()) { video.pause(); return; }
      if (window && !video.requestVideoFrameCallback && animation === undefined) animation = requestAnimationFrame(paint);
    };
    const paused = () => {
      guard();
      // A media fragment can pause at its endpoint; it is our window loop.
      if (window && video.ended && entry.wanted) controller.sync();
    };
    const ended = () => {
      if (!window) return;
      seek(window.start);
      controller.sync();
    };
    if (window && video.requestVideoFrameCallback) {
      const decoded: VideoFrameRequestCallback = (_now, metadata) => {
        frame = undefined;
        if (metadata.mediaTime >= window.end - 0.05 || metadata.mediaTime < window.start) seek(window.start);
        else if (guard() && inside(metadata.mediaTime)) video.style.visibility = "";
        frame = video.requestVideoFrameCallback(decoded);
      };
      frame = video.requestVideoFrameCallback(decoded);
    }
    video.addEventListener("loadedmetadata", metadata);
    video.addEventListener("emptied", reset);
    video.addEventListener("seeking", hide);
    video.addEventListener("seeked", ready);
    video.addEventListener("canplay", ready);
    video.addEventListener("timeupdate", update);
    video.addEventListener("play", play);
    video.addEventListener("pause", paused);
    video.addEventListener("ended", ended);
    document.addEventListener("visibilitychange", update);
    entryRef.current = entry;
    controller.entries.add(entry);
    const observer = new IntersectionObserver(([observation]) => {
      const wasVisible = entry.visible;
      entry.visible = observation.isIntersecting && observation.intersectionRatio >= 0.12;
      if (!entry.visible) {
        if (wasVisible) entry.manual = false;
        video.muted = true;
        setSound(false);
        if (entry.source !== source) {
          resumeAt.current = window ? segmentPosition(video.currentTime, window) : video.currentTime;
          hide();
          positioned = !window;
          video.pause();
          entry.source = source;
          video.removeAttribute("src");
          video.load();
        }
      }
      controller.sync();
    }, { threshold: [0, 0.12, 0.5] });
    observer.observe(video);
    return () => {
      observer.disconnect();
      entry.wanted = false;
      video.pause();
      if (frame !== undefined) video.cancelVideoFrameCallback(frame);
      if (animation !== undefined) cancelAnimationFrame(animation);
      video.removeEventListener("loadedmetadata", metadata);
      video.removeEventListener("emptied", reset);
      video.removeEventListener("seeking", hide);
      video.removeEventListener("seeked", ready);
      video.removeEventListener("canplay", ready);
      video.removeEventListener("timeupdate", update);
      video.removeEventListener("play", play);
      video.removeEventListener("pause", paused);
      video.removeEventListener("ended", ended);
      document.removeEventListener("visibilitychange", update);
      controller.entries.delete(entry);
      entryRef.current = null;
      controller.sync();
    };
    // enabled changes update the existing entry without replacing its observer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controller, reel.id, source, priority, start, end]);

  useEffect(() => {
    const entry = entryRef.current;
    if (!entry) return;
    entry.enabled = enabled;
    if (!enabled) { entry.manual = false; entry.video.muted = true; setSound(false); }
    else entry.stopped = false;
    controller.sync();
  }, [controller, enabled, loop]);

  function togglePlayback() {
    const entry = entryRef.current!;
    entry.stopped = !entry.video.paused;
    entry.manual = !entry.stopped;
    controller.sync();
  }

  function toggleSound() {
    const entry = entryRef.current!;
    const next = !sound;
    // WebKit can apply a fragment's start AFTER the metadata resume seek.
    // HQ uses our guarded window loop so the saved position is the only seek.
    const hq = reel.hq ? (segment ? reel.hq.split("#")[0] : reel.hq) : null;
    entry.video.muted = !next;
    entry.manual = true;
    entry.stopped = false;
    setSound(next);
    if (next && hq && entry.source !== hq) {
      resumeAt.current = segment ? segmentPosition(entry.video.currentTime, segment) : entry.video.currentTime;
      // Authorize this element's sound in Safari while still on the prepared
      // source. The HQ source must wait for its own metadata and seek below.
      controller.sync();
      if (entry.wanted && (!entry.prepare || entry.prepare())) void entry.video.play().catch(() => {});
      if (segment) entry.video.style.visibility = "hidden";
      entry.video.pause();
      entry.source = hq;
      entry.video.src = hq;
      entry.video.load();
    }
    // Ready sources play in this gesture; a new segment source first seeks.
    controller.sync();
  }

  return <div className="v7-reel" data-reel={reel.id} data-playing={playing}>
    {/* Persistent image also covers denied autoplay and delayed source changes. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img className="v7-reel-poster" src={poster ?? undefined} alt="" width={360} height={640} loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : "auto"} decoding="async" />
    <video ref={videoRef} poster={poster ?? undefined} muted={!sound} playsInline loop={segment ? undefined : loop} preload={segment ? "metadata" : "none"} aria-label={reel.id} style={segment ? { visibility: "hidden" } : undefined}
      onPlay={() => {
        const entry = entryRef.current;
        if (!entry?.wanted || (entry.prepare && !entry.prepare())) { videoRef.current?.pause(); return; }
        setPlaying(true);
      }} onPause={() => setPlaying(false)} onEnded={onEnded}
    />
    {controls && <button type="button" className="v7-icon-button v7-media-play" data-control="playback" aria-label={playing ? "Pause" : "Play"} onClick={togglePlayback}><PlayIcon paused={!playing} /></button>}
    {soundControl && <button type="button" className="v7-icon-button v7-media-sound" data-control="sound" aria-label={sound ? "Mute" : "Sound"} aria-pressed={sound} onClick={toggleSound}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4Z" />{sound ? <><path d="M15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14" /></> : <path d="m16 9 6 6m0-6-6 6" />}</svg>
    </button>}
  </div>;
}
