"use client";
/* T-0088 END CTA PHONE (Aman msg 2659; copy: Alex, alex-cta-copy.md).
   A real iPhone 14 Pro frame (devices.css, MIT, vendored in
   app/v6/devices-iphone14pro.css) with a chat open inside. The sequence:
   the visitor types "Here's my product: <link>" -> it sends -> "Likelyfad is
   typing…" -> our reply. Desktop loops; phone plays once and holds (Alex), so
   the guarantee line is never under a moving element. Pauses off screen.
   Reduced motion: the finished conversation, static.
   Two skins, switchable by the `skin` prop: "imessage" | "whatsapp". */
import { useEffect, useRef, useState } from "react";
import { content } from "@/lib/content-v6";

type Phase = "typing" | "sent" | "replying" | "replied";

export function PhoneChat({ skin = "imessage" }: { skin?: "imessage" | "whatsapp" }) {
  const { closeChat: c } = content;
  const full = c.typed + c.link;
  const root = useRef<HTMLDivElement>(null);
  const [chars, setChars] = useState(full.length); // server HTML = the finished state
  const [phase, setPhase] = useState<Phase>("replied");

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return; // keep the finished state
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
        await wait(700); if (cancelled) return; setPhase("replying");
        await wait(1600); if (cancelled) return; setPhase("replied");
        if (loop) await wait(4200);
      } while (loop && !cancelled);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !started) { started = true; void run(); }
    }, { threshold: 0.35 });
    io.observe(el);
    return () => { cancelled = true; clearTimeout(timer); io.disconnect(); };
  }, [full, c.typed.length]);

  const typedNow = full.slice(0, chars);
  const inInput = phase === "typing";
  const showSent = phase !== "typing";
  const showTyping = phase === "replying";
  const showReply = phase === "replied";

  return (
    <div ref={root} className="v6-phone" data-skin={skin} aria-hidden="true">
      <div className="device device-iphone-14-pro device-black">
        <div className="device-frame">
          <div className="device-screen v6-chat">
            <div className="v6-chat-top">
              <span className="v6-chat-avatar">L</span>
              <span className="v6-chat-name">{c.contact}</span>
              <span className="v6-chat-status">{showTyping ? "typing…" : "online"}</span>
            </div>
            <div className="v6-chat-thread">
              {showSent && <p className="v6-bubble v6-out">{c.typed}<span className="v6-link">{c.link}</span></p>}
              {showTyping && (
                <div className="v6-typing">
                  <span className="v6-typing-label">{c.typing}</span>
                  <span className="v6-bubble v6-in v6-dots"><i /><i /><i /></span>
                </div>
              )}
              {showReply && <p className="v6-bubble v6-in">{c.reply}</p>}
            </div>
            <div className="v6-chat-input">
              <span className="v6-chat-field">
                {inInput ? (<>{typedNow.slice(0, c.typed.length)}<span className="v6-link">{typedNow.slice(c.typed.length)}</span><span className="v6-caret" /></>) : <span className="v6-placeholder">{skin === "whatsapp" ? "Message" : "iMessage"}</span>}
              </span>
              <span className="v6-chat-send" data-active={inInput && chars > 0} />
            </div>
          </div>
        </div>
        <div className="device-stripe" />
        <div className="device-header" />
        <div className="device-sensors" />
        <div className="device-btns" />
        <div className="device-power" />
        <div className="device-home" />
      </div>
    </div>
  );
}
