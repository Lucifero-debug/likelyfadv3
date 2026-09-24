"use client";

import { useEffect, useRef, type ReactNode } from "react";

/* A MAGNETIC WRAPPER for the page's primary CTAs. The button leans a few
   pixels toward the pointer while it is within reach and springs back when it
   leaves. One transform on the wrapper, written from a rAF that exists only
   while it is settling — the Button inside keeps its own hover styles.

   Fine pointers only: on touch there is no "near", only "on". */
export function Magnetic({
  children,
  strength = 0.28,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let raf = 0;

    const tick = () => {
      raf = 0;
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      el.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)`;
      if (Math.abs(tx - x) > 0.05 || Math.abs(ty - y) > 0.05) raf = requestAnimationFrame(tick);
    };
    const go = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = (e.clientX - (r.left + r.width / 2)) * strength;
      ty = (e.clientY - (r.top + r.height / 2)) * strength;
      go();
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
      go();
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [strength]);

  /* The padding widens the catch area past the button's own edge; the negative
     margin gives that space back so layout is unchanged. */
  return (
    <span ref={ref} className={`-m-3 inline-block p-3 will-change-transform ${className}`}>
      {children}
    </span>
  );
}
