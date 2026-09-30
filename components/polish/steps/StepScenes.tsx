import type { ReactNode } from "react";
import { reelVideos } from "@/lib/reels.generated";

/* Server-rendered final frames. Reed supplies the shared animation clock. */
const posterIds = [
  "0616", "ai-podcast", "boyfriend-angle-ai", "hoodie-ad-podcast-style",
  "v2934", "v3057", "v3558", "doctor-in-office-ai-ugc-health-product",
] as const;

function Poster({ id }: { id: (typeof posterIds)[number] }) {
  const reel = reelVideos.find((video) => video.id === id);
  if (!reel?.poster) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={reel.poster} loading="lazy" decoding="async" alt="" />;
}

function Check() {
  return <svg viewBox="0 0 20 20" fill="none"><path d="m4 10 4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function VideoCall() {
  return <svg viewBox="0 0 26 20" fill="none"><rect x="2" y="3" width="15" height="14" rx="4" stroke="currentColor" strokeWidth="1.8" /><path d="m17 8 7-4v12l-7-4" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>;
}

function ChatHeader() {
  return <div className="v6s-chat-header"><span className="v6s-back">‹</span><span className="v6s-avatar"><svg viewBox="0 0 32 32" fill="currentColor"><circle cx="16" cy="11" r="5" /><path d="M6 28v-3a10 10 0 0 1 20 0v3Z" /></svg></span><VideoCall /></div>;
}

export function SceneDM() {
  return (
    <div className="v6s-scene v6s-scene-1" aria-hidden="true">
      <div className="v6s-chat-card">
        <ChatHeader />
        <div className="v6s-thread">
          <p className="v6s-bubble v6s-out v6s-dm-request v6s-anim">Hey, here&apos;s my product. Can you do UGC?</p>
          <p className="v6s-bubble v6s-in v6s-dm-reply v6s-anim">Yes. Tell me about the brand and what you&apos;re running now.</p>
          <div className="v6s-chip v6s-call v6s-anim"><VideoCall /><span>Quick call? Optional</span></div>
        </div>
      </div>
    </div>
  );
}

export function SceneTrial() {
  return (
    <div className="v6s-scene v6s-scene-2" aria-hidden="true">
      <div className="v6s-brief">
        <span className="v6s-chip v6s-brief-angle v6s-anim">Angle: morning routine</span>
        <span className="v6s-chip v6s-brief-format v6s-anim">Format: Podcast style</span>
        <span className="v6s-chip v6s-brief-script v6s-anim"><svg viewBox="0 0 20 20" fill="none"><path d="M6 2h6l4 4v12H4V2h2Zm6 0v5h4M7 11h6M7 14h4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>Script attached</span>
      </div>
      <div className="v6s-formats-window"><div className="v6s-formats v6s-anim">
        {["UGC", "podcast", "animation", "AI drama", "AI song", "anything you can imagine"].map((format) => <span key={format}>{format}</span>)}
      </div></div>
      <div className="v6s-editor">
        <div className="v6s-editor-top"><span className="v6s-editor-dots"><i /><i /><i /></span><span className="v6s-countdown"><span className="v6s-count-48 v6s-anim">48h</span><span className="v6s-count-24 v6s-anim">24h</span><span className="v6s-count-0 v6s-anim">0h</span></span></div>
        <div className="v6s-timeline">
          <div className="v6s-ruler"><i /><i /><i /><i /><i /><i /><i /></div>
          {["Clips", "Voice", "Captions"].map((track, index) => <div className={`v6s-track v6s-track-${index + 1}`} key={track}><span>{track}</span><div className="v6s-track-well"><div className="v6s-track-fill v6s-anim"><i /><i /><i /><i /></div></div></div>)}
          <div className="v6s-playhead v6s-anim" />
        </div>
        <div className="v6s-result v6s-anim"><div className="v6s-result-poster"><Poster id="ai-podcast" /><span className="v6s-play-icon"><svg viewBox="0 0 20 20" fill="currentColor"><path d="m7 4 9 6-9 6Z" /></svg></span></div><span className="v6s-first-video">First video</span></div>
      </div>
    </div>
  );
}

export function SceneRetainer() {
  return (
    <div className="v6s-scene v6s-scene-3" aria-hidden="true">
      <div className="v6s-retainer-thread">
        <p className="v6s-bubble v6s-out v6s-reaction v6s-anim">This is so good. Can you do thirty a month?</p>
        <p className="v6s-bubble v6s-in v6s-agree v6s-anim">Yes. Let&apos;s set it up.</p>
      </div>
      <div className="v6s-agreement">
        <div className="v6s-flow">
          {["Agreed in chat", "Confirmed by email", "Advance invoice paid"].map((label, index) => <div className={`v6s-flow-chip v6s-flow-${index + 1}`} key={label}><span className="v6s-flow-lit v6s-anim" /><span className="v6s-flow-check v6s-anim"><Check /></span><span className="v6s-flow-label">{label}</span></div>)}
        </div>
        <div className="v6s-volume"><span>Videos a month:</span><div className="v6s-volume-value"><span className="v6s-volume-10 v6s-anim">10</span><span className="v6s-volume-20 v6s-anim">20</span><span className="v6s-volume-30 v6s-anim">30</span><strong className="v6s-volume-any v6s-anim">any number</strong></div></div>
      </div>
    </div>
  );
}

export function SceneAds({ ring }: { ring?: ReactNode }) {
  return (
    <div className="v6s-scene v6s-scene-4" aria-hidden="true">
      <div className="v6s-brief-stack"><div className="v6s-paper v6s-paper-back" /><div className="v6s-paper v6s-paper-middle" /><div className="v6s-paper v6s-paper-front"><svg viewBox="0 0 24 24" fill="none"><path d="M7 3h7l4 4v14H5V3Zm7 0v5h4M8 12h7M8 16h5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg><span>Brief 14 attached</span><i /><i /></div></div>
      <div className="v6s-create v6s-anim">Start creating ads<span>↗</span></div>
      <svg className="v6s-cursor v6s-anim" viewBox="0 0 24 30"><path d="m3 2 18 16-9 1-4 8Z" fill="#302b37" stroke="white" strokeWidth="2" strokeLinejoin="round" /></svg>
      <div className="v6s-ring-reveal v6s-anim"><div className="v6s-ring-slot">{ring ?? <div className="v6s-placeholder-ring">{posterIds.map((id, index) => <div className={`v6s-ring-tile v6s-ring-tile-${index + 1}`} key={id}><Poster id={id} /></div>)}</div>}</div></div>
      <div className="v6s-chip v6s-approved v6s-anim"><Check />Approved. Running on Meta.</div>
      <p className="v6s-ai-caption v6s-anim">Every one of these is AI.</p>
    </div>
  );
}
