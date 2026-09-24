"use client";

import { useEffect, useRef } from "react";

/* A CURSOR FOLLOWER for fine pointers. The native cursor stays — this is a
   ring that trails it, not a replacement, so nothing about pointing, text
   selection or accessibility changes. The ring:

     grows and fills softly over anything clickable,
     shows a word over the page's media — "Play" on a clip, "Drag" on the
       testimonial row — taken from the nearest [data-cursor] attribute,
     and fades out when the pointer leaves the window.

   One element, one transform per frame, and the rAF only runs while the ring is
   still catching up with the pointer. Touch devices and reduced motion get
   nothing at all. */
export function Cursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!ring || !label) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let tx = -100;
    let ty = -100;
    let x = tx;
    let y = ty;
    let scale = 1;
    let targetScale = 1;
    let raf = 0;
    let lastWord = "";

    const tick = () => {
      raf = 0;
      x += (tx - x) * 0.2;
      y += (ty - y) * 0.2;
      scale += (targetScale - scale) * 0.2;
      ring.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(-50%,-50%) scale(${scale.toFixed(3)})`;
      if (Math.abs(tx - x) > 0.1 || Math.abs(ty - y) > 0.1 || Math.abs(targetScale - scale) > 0.002) {
        raf = requestAnimationFrame(tick);
      }
    };
    const go = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      tx = e.clientX;
      ty = e.clientY;
      ring.style.opacity = "1";

      const t = e.target as HTMLElement;
      const labelled = t.closest<HTMLElement>("[data-cursor]");
      const word = labelled?.dataset.cursor ?? "";
      const interactive = !word && !!t.closest("a,button,summary,[role=button],input,label");
      targetScale = word ? 2.6 : interactive ? 1.7 : 1;
      if (word !== lastWord) {
        lastWord = word;
        label.textContent = word;
      }
      ring.dataset.mode = word ? "label" : interactive ? "hot" : "";
      go();
    };
    const onLeave = () => {
      ring.style.opacity = "0";
    };
    const onDown = () => {
      targetScale *= 0.8;
      go();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={ringRef}
      aria-hidden
      className="v7-cursor pointer-events-none fixed left-0 top-0 z-[190] grid size-7 place-items-center rounded-full border border-pink/70 opacity-0 transition-[opacity,background-color,border-color] duration-200"
    >
      <span
        ref={labelRef}
        className="font-mono text-[0.3rem] font-medium uppercase tracking-[0.12em] text-white"
      />
    </div>
  );
}
