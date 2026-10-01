"use client";

import { useEffect, useRef, useState } from "react";
import type { Reel } from "@/lib/reels.generated";

export function StoryVideo({ reel }: { reel: Reel }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const inView = useRef(false);
  const usingHq = useRef(false);
  const resumeAt = useRef<number | null>(null);
  const [sound, setSound] = useState(false);

  useEffect(() => {
    const video = videoRef.current!;
    const sync = () => {
      if (inView.current && !document.hidden) void video.play().catch(() => {});
      else video.pause();
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView.current = entry.isIntersecting;
      sync();
    }, { threshold: 0.1 });
    observer.observe(video);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      video.pause();
    };
  }, []);

  function toggleSound() {
    const video = videoRef.current!;
    const nextSound = !sound;
    if (nextSound && !usingHq.current && reel.hq) {
      resumeAt.current = video.currentTime;
      usingHq.current = true;
      video.src = reel.hq;
      video.load();
    }
    video.muted = !nextSound;
    setSound(nextSound);
    // Keep play() in the user gesture so Safari can play the audio source.
    if (inView.current) void video.play().catch(() => {});
  }

  return (
    <div className="v7-story-card">
      <div className="v7-story-film">
        <video
          ref={videoRef}
          src={reel.src}
          poster={reel.poster ?? undefined}
          muted={!sound}
          loop
          playsInline
          preload="none"
          aria-label="Health brand ad"
          onLoadedMetadata={() => {
            if (resumeAt.current !== null) {
              videoRef.current!.currentTime = resumeAt.current;
              resumeAt.current = null;
            }
          }}
        />
        <button type="button" className="v7-round-button v7-sound-button" data-story-sound aria-label={sound ? "Mute the ad" : "Unmute the ad"} onClick={toggleSound}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M11 5 6 9H3v6h3l5 4Z" />
            {sound ? <><path d="M15 8a6 6 0 0 1 0 8" /><path d="M18 5a10 10 0 0 1 0 14" /></> : <path d="m16 9 6 6m0-6-6 6" />}
          </svg>
        </button>
      </div>
    </div>
  );
}
