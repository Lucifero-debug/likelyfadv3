"use client";

/* ROUND 8 (Aman msg 2801): PhoneInHand's app markup, icons and conversation
   timing, rendered at native size in a frameless card. */
import { useEffect, useRef, useState } from "react";
import { content } from "@/lib/content-v6";

type Phase = "typing" | "sent" | "replying" | "replied";

const Mic = ({ c }: { c: string }) => (
  <svg width="14" height="20" viewBox="0 0 14 20"><rect x="4" y="1" width="6" height="11" rx="3" fill="none" stroke={c} strokeWidth="1.8" /><path d="M1.5 9a5.5 5.5 0 0 0 11 0M7 14.5V18" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" /></svg>
);
const Back = ({ c }: { c: string }) => (
  <svg width="12" height="20" viewBox="0 0 12 20"><path d="M10 2 2 10l8 8" fill="none" stroke={c} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const Video = ({ c }: { c: string }) => (
  <svg width="26" height="18" viewBox="0 0 26 18"><rect x="1" y="2" width="16" height="14" rx="3.5" fill="none" stroke={c} strokeWidth="2" /><path d="m19 7 5-3.5v11L19 11Z" fill="none" stroke={c} strokeWidth="2" strokeLinejoin="round" /></svg>
);

export function ChatCard({ skin }: { skin: "imessage" | "whatsapp" }) {
  const { closeChat: c } = content;
  const full = c.typed + c.link;
  const root = useRef<HTMLDivElement>(null);
  // Server HTML, the first hydration frame and reduced motion show the reply.
  const [chars, setChars] = useState(full.length);
  const [phase, setPhase] = useState<Phase>("replied");

  useEffect(() => {
    const el = root.current;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    if (!el || motion.matches) return;
    const loop = matchMedia("(min-width: 761px) and (pointer: fine)").matches;
    let timer = 0, visible = false, started = false, cancelled = false;
    let since = 0;
    let pending: { remaining: number; resolve: (active: boolean) => void } | undefined;

    // Keep the remaining delay when hidden, including send/reply/loop waits.
    const syncPlayback = () => {
      const playing = visible && !document.hidden && !cancelled;
      el.dataset.playing = String(playing);
      if (timer) {
        clearTimeout(timer);
        timer = 0;
        if (pending) pending.remaining = Math.max(0, pending.remaining - (performance.now() - since));
      }
      if (playing && pending) {
        since = performance.now();
        timer = window.setTimeout(() => {
          timer = 0;
          const done = pending;
          pending = undefined;
          done?.resolve(!cancelled);
        }, pending.remaining);
      }
    };
    const wait = (ms: number) => new Promise<boolean>(resolve => {
      pending = { remaining: ms, resolve };
      syncPlayback();
    });
    const run = async () => {
      do {
        setPhase("typing"); setChars(0);
        if (!(await wait(500))) return;
        for (let i = 1; i <= full.length; i++) {
          setChars(i);
          if (!(await wait(i <= c.typed.length ? 55 : 35))) return;
        }
        if (!(await wait(450))) return;
        setPhase("sent");
        if (!(await wait(800))) return;
        setPhase("replying");
        if (!(await wait(1600))) return;
        setPhase("replied");
        if (loop && !(await wait(4200))) return;
      } while (loop && !cancelled);
    };
    const stop = () => {
      cancelled = true;
      syncPlayback();
      pending?.resolve(false);
      pending = undefined;
    };
    const onMotionChange = () => {
      if (motion.matches) {
        stop();
        setChars(full.length);
        setPhase("replied");
      }
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= 0.35;
      syncPlayback();
      if (visible && !started && !cancelled) {
        started = true;
        el.dataset.animated = "true";
        void run();
      }
    }, { threshold: 0.35 });
    io.observe(el);
    document.addEventListener("visibilitychange", syncPlayback);
    motion.addEventListener("change", onMotionChange);
    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      motion.removeEventListener("change", onMotionChange);
    };
  }, [full, c.typed.length]);

  const typing = phase === "typing";
  const sent = phase !== "typing";
  const replying = phase === "replying";
  const replied = phase === "replied";
  const typed = full.slice(0, chars);
  const field = typing && chars > 0
    ? <span className="v6-hs-typed">{typed.slice(0, c.typed.length)}<u>{typed.slice(c.typed.length)}</u><i className="v6-hs-caret" /></span>
    : null;

  return (
    <div ref={root} className={`v6-chat-card v6-chat-card-${skin}`} data-skin={skin} data-phase={phase} data-playing="false" aria-hidden="true">
      {skin === "imessage" ? (
        <>
          <div className="v6-im-head">
            <Back c="#0a84ff" />
            <div className="v6-im-who"><span className="v6-hs-av">L</span><span className="v6-im-name">{c.contact} <b>&rsaquo;</b></span></div>
            <Video c="#0a84ff" />
          </div>
          <div className="v6-hs-thread">
            <p className="v6-im-stamp"><b>iMessage</b><br />Today 9:41</p>
            {sent && <p className="v6-im-b v6-im-out">{c.typed}<u>{c.link}</u></p>}
            {sent && <p className="v6-im-dlv">Delivered</p>}
            {replying && <div className="v6-im-typing" aria-label={c.typing}><i /><i /><i /></div>}
            {replied && <p className="v6-im-b v6-im-in">{c.reply}</p>}
          </div>
          <div className="v6-im-bar">
            <span className="v6-im-plus">+</span>
            <span className="v6-im-field">{field ?? <span className="v6-hs-ph">iMessage</span>}{field ? <span className="v6-im-send" /> : <Mic c="#8e8e93" />}</span>
          </div>
        </>
      ) : (
        <>
          <div className="v6-wa-head">
            <Back c="#111b21" />
            <span className="v6-hs-av">L</span>
            <span className="v6-wa-who"><b>{c.contact}</b><small>{replying ? "typing…" : "online"}</small></span>
            <Video c="#111b21" />
            <svg width="19" height="19" viewBox="0 0 20 20"><path d="M5.2 1.8 7.6 5c.4.6.3 1.3-.2 1.8L6 8c1 2.3 3.2 4.6 5.9 5.9l1.3-1.4c.5-.5 1.2-.6 1.8-.2l3.2 2.3c.6.5.8 1.3.3 2L17.4 18c-.6.7-1.6 1-2.5.7C8.8 16.7 3.3 11.2 1.3 5c-.3-.9 0-1.9.7-2.5l1.4-1.1c.6-.5 1.4-.3 1.8.4Z" fill="none" stroke="#111b21" strokeWidth="1.8" strokeLinejoin="round" /></svg>
          </div>
          <div className="v6-hs-thread v6-wa-wall">
            <p className="v6-wa-chip">Today</p>
            {sent && (
              <p className="v6-wa-b v6-wa-out">{c.typed}<u>{c.link}</u>
                <span className="v6-wa-meta">9:41 <svg width="17" height="11" viewBox="0 0 17 11"><path d={replied || replying ? "m1 6 3 3 6-7M7 8.5l.8.7 6-7" : "m3 6 3 3 6-7"} fill="none" stroke={replied || replying ? "#53bdeb" : "#8696a0"} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
              </p>
            )}
            {replying && <div className="v6-wa-b v6-wa-in v6-chat-typing" aria-label={c.typing}><i /><i /><i /></div>}
            {replied && <p className="v6-wa-b v6-wa-in">{c.reply}<span className="v6-wa-meta">9:42</span></p>}
          </div>
          <div className="v6-wa-bar">
            <span className="v6-wa-plus">+</span>
            <span className="v6-wa-field">{field}</span>
            {field ? <span className="v6-wa-send" /> : (<><svg width="22" height="20" viewBox="0 0 24 20"><path d="M3 5h3l2-3h8l2 3h3v13H3Z" fill="none" stroke="#111b21" strokeWidth="1.8" strokeLinejoin="round" /><circle cx="12" cy="11" r="4" fill="none" stroke="#111b21" strokeWidth="1.8" /></svg><Mic c="#111b21" /></>)}
          </div>
        </>
      )}
    </div>
  );
}
