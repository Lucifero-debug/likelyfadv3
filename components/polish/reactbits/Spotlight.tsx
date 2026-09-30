"use client";
/* Adapted from React Bits "SpotlightCard" (https://reactbits.dev, DavidHDev/react-bits).
   MIT + Commons Clause License Condition v1.0, Copyright (c) 2026 David Haz. Used as part of this website; not redistributed.
   Changes (Reed, 30 Sep 2026): a LAYER placed inside the existing .pillar card (which is already position:relative,
   overflow:hidden, radius 18) so it clips to the card and moves with its hover lift; it listens on its parent card; the
   light follows the pointer through CSS variables (no React re-render per mouse move); off on touch and under reduced motion. */
import { useEffect, useRef } from "react";
import { useFineMotion } from "./pointer";
export function SpotlightLayer({ color = "rgba(197, 46, 103, 0.10)" }: { color?: string }) {
  const ref = useRef<HTMLDivElement>(null); const on = useFineMotion();
  useEffect(() => {
    const layer = ref.current; const card = layer?.parentElement; if (!on || !layer || !card) return;
    const move = (e: PointerEvent) => { const r = card.getBoundingClientRect(); layer.style.setProperty("--spot-x", `${e.clientX - r.left}px`); layer.style.setProperty("--spot-y", `${e.clientY - r.top}px`); };
    const enter = () => { layer.style.opacity = "1"; }; const leave = () => { layer.style.opacity = "0"; };
    card.addEventListener("pointermove", move); card.addEventListener("pointerenter", enter); card.addEventListener("pointerleave", leave);
    return () => { card.removeEventListener("pointermove", move); card.removeEventListener("pointerenter", enter); card.removeEventListener("pointerleave", leave); };
  }, [on]);
  if (!on) return null;
  return <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 ease-out"
    style={{ background: `radial-gradient(420px circle at var(--spot-x, 50%) var(--spot-y, 50%), ${color}, transparent 70%)` }} />;
}
