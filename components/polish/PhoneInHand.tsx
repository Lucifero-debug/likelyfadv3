"use client";
/* T-0088 END CTA PHONE, in hand (Aman msgs 2705-2734; copy: Alex, closeChat).
   A photo of an iPhone 16 Pro held in a hand (ls.graphics "Free Realistic
   iPhone 16 Pro in Hand Mockup"; licence cleared by Aman, msg 2713) with the
   screen punched out as a transparent hole, from the PSD's own screen mask.
   Our chat is real HTML UNDER the photo, so the fingertips sit in front of it.

   THE FIT. The stage is always 395px wide in layout (phones shrink it with
   CSS zoom), so the screen's projective transform is a constant, computed
   below from the four screen corners the PSD's smart object records. No layout
   JS and nothing to re-measure. The stage keeps the photo's own aspect ratio;
   forcing a different one misplaces the chat (the round-6 bottom-edge bug).

   THE CHAT. Two skins that follow the real apps' layouts, drawn here (no
   logos, no app artwork). The visitor's DM types itself, sends, the typing
   indicator shows, the reply lands. Desktop (fine pointer) loops; phone plays
   once and holds. Paused off screen. Server HTML and reduced motion: the
   finished conversation. */
import { useEffect, useRef, useState } from "react";
import { content } from "@/lib/content-v6";

export const HAND_SRC = "/v6/hand-phone.webp";
/** The photo's natural size and, in those pixels, the screen corners TL TR BR BL. */
export const HAND_W = 2222, HAND_H = 3934;
export const HAND_CORNERS: [number, number][] = [[339.07, 46.52], [1658.94, 41.48], [1670.49, 2876.18], [350.64, 2887.75]];
export const STAGE_W = 395;
const SCREEN_W = 390, SCREEN_H = 844;

/** The matrix3d that maps a SCREEN_W x SCREEN_H box onto four points (a plane homography). */
function homography(w: number, h: number, p: [number, number][]) {
  const src = [[0, 0], [w, 0], [w, h], [0, h]], A: number[][] = [], b: number[] = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i], [u, v] = p[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v);
  }
  for (let c = 0; c < 8; c++) {
    let m = c;
    for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[m][c])) m = r;
    [A[c], A[m]] = [A[m], A[c]]; [b[c], b[m]] = [b[m], b[c]];
    for (let r = 0; r < 8; r++) if (r !== c) { const f = A[r][c] / A[c][c]; for (let k = c; k < 8; k++) A[r][k] -= f * A[c][k]; b[r] -= f * b[c]; }
  }
  const s = b.map((v, i) => v / A[i][i]);
  const n = (x: number) => Number(x.toPrecision(9));
  return `matrix3d(${n(s[0])},${n(s[3])},0,${n(s[6])},${n(s[1])},${n(s[4])},0,${n(s[7])},0,0,1,0,${n(s[2])},${n(s[5])},0,1)`;
}
const K = STAGE_W / HAND_W;
const SCREEN_MATRIX = homography(SCREEN_W, SCREEN_H, HAND_CORNERS.map(([x, y]) => [x * K, y * K]));

type Phase = "typing" | "sent" | "replying" | "replied";

const StatusBar = () => (
  <div className="v6-hs-sb">
    <span>9:41</span>
    <span className="v6-hs-sbi">
      <svg width="18" height="11" viewBox="0 0 18 11"><rect x="0" y="7" width="3" height="4" rx=".7" /><rect x="5" y="5" width="3" height="6" rx=".7" /><rect x="10" y="2.5" width="3" height="8.5" rx=".7" /><rect x="15" y="0" width="3" height="11" rx=".7" /></svg>
      <svg width="16" height="11" viewBox="0 0 16 11"><path d="M8 2.2c2.3 0 4.4.9 6 2.4l1.2-1.2A10.2 10.2 0 0 0 8 .5C5.2.5 2.7 1.6.8 3.4L2 4.6a8.5 8.5 0 0 1 6-2.4Zm0 3.3c1.4 0 2.7.5 3.7 1.4l1.2-1.2A7 7 0 0 0 8 3.8a7 7 0 0 0-4.9 1.9l1.2 1.2c1-.9 2.3-1.4 3.7-1.4Zm0 3.3c.5 0 1 .2 1.4.5L8 10.8 6.6 9.3c.4-.3.9-.5 1.4-.5Z" /></svg>
      <svg width="27" height="12" viewBox="0 0 27 12"><rect x=".5" y=".5" width="22" height="11" rx="3.2" fill="none" stroke="currentColor" opacity=".4" /><rect x="2" y="2" width="19" height="8" rx="2" /><path d="M24 4v4c.8-.3 1.3-1.1 1.3-2S24.8 4.3 24 4Z" opacity=".45" /></svg>
    </span>
  </div>
);
const Mic = ({ c }: { c: string }) => (
  <svg width="14" height="20" viewBox="0 0 14 20"><rect x="4" y="1" width="6" height="11" rx="3" fill="none" stroke={c} strokeWidth="1.8" /><path d="M1.5 9a5.5 5.5 0 0 0 11 0M7 14.5V18" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" /></svg>
);
const Back = ({ c }: { c: string }) => (
  <svg width="12" height="20" viewBox="0 0 12 20"><path d="M10 2 2 10l8 8" fill="none" stroke={c} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const Video = ({ c }: { c: string }) => (
  <svg width="26" height="18" viewBox="0 0 26 18"><rect x="1" y="2" width="16" height="14" rx="3.5" fill="none" stroke={c} strokeWidth="2" /><path d="m19 7 5-3.5v11L19 11Z" fill="none" stroke={c} strokeWidth="2" strokeLinejoin="round" /></svg>
);

export function PhoneInHand({ skin = "imessage" }: { skin?: "imessage" | "whatsapp" }) {
  const { closeChat: c } = content;
  const full = c.typed + c.link;
  const root = useRef<HTMLDivElement>(null);
  const [chars, setChars] = useState(full.length);
  const [phase, setPhase] = useState<Phase>("replied");

  useEffect(() => {
    const el = root.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const loop = matchMedia("(min-width: 761px) and (pointer: fine)").matches;
    let timer = 0, visible = false, started = false, cancelled = false;
    const wait = (ms: number) => new Promise<void>(res => { timer = window.setTimeout(res, ms); });
    const untilVisible = () => new Promise<void>(res => { const tick = () => (visible || cancelled ? res() : (timer = window.setTimeout(tick, 250))); tick(); });
    const run = async () => {
      do {
        setPhase("typing"); setChars(0);
        await untilVisible(); await wait(500);
        for (let i = 1; i <= full.length && !cancelled; i++) { await untilVisible(); setChars(i); await wait(i <= c.typed.length ? 55 : 35); }
        await wait(450); if (cancelled) return; setPhase("sent");
        await wait(800); if (cancelled) return; setPhase("replying");
        await wait(1600); if (cancelled) return; setPhase("replied");
        if (loop) await wait(4200);
      } while (loop && !cancelled);
    };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !started) { started = true; void run(); } }, { threshold: 0.35 });
    io.observe(el);
    return () => { cancelled = true; clearTimeout(timer); io.disconnect(); };
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
    <div ref={root} className="v6-hand" data-skin={skin} aria-hidden="true">
      <div className="v6-hand-stage">
        <div className={`v6-hs v6-hs-${skin}`} style={{ transform: SCREEN_MATRIX }} data-v6-screen>
          <i className="v6-hs-probe" data-c="0" /><i className="v6-hs-probe" data-c="1" /><i className="v6-hs-probe" data-c="2" /><i className="v6-hs-probe" data-c="3" />
          <StatusBar />
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
                {replying && <div className="v6-im-typing"><i /><i /><i /></div>}
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
                {replied && <p className="v6-wa-b v6-wa-in">{c.reply}<span className="v6-wa-meta">9:42</span></p>}
              </div>
              <div className="v6-wa-bar">
                <span className="v6-wa-plus">+</span>
                <span className="v6-wa-field">{field}</span>
                {field ? <span className="v6-wa-send" /> : (<><svg width="22" height="20" viewBox="0 0 24 20"><path d="M3 5h3l2-3h8l2 3h3v13H3Z" fill="none" stroke="#111b21" strokeWidth="1.8" strokeLinejoin="round" /><circle cx="12" cy="11" r="4" fill="none" stroke="#111b21" strokeWidth="1.8" /></svg><Mic c="#111b21" /></>)}
              </div>
            </>
          )}
          <i className="v6-hs-home" />
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="v6-hand-img" src={HAND_SRC} width={HAND_W} height={HAND_H} alt="" loading="lazy" decoding="async" />
      </div>
    </div>
  );
}
