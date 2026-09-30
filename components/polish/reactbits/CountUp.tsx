"use client";
/* Adapted from React Bits CountUp (DavidHDev/react-bits).
   MIT + Commons Clause, Copyright (c) 2026 David Haz.
   Website use; not distributed as a component product. No motion dependency.
   Server HTML is final. The featured expansion triggers this once; observing
   the number itself is the fallback for deep links and a missing expand band. */
import { useEffect, useRef } from "react";
import { EXPAND_COMPLETE_EVENT } from "../motion";

/* Reed (T-0088): `group` formats with thousands separators, e.g. 1,000 (Numbers tile). */
const fmt = (n: number, group: boolean) => (group ? n.toLocaleString("en-US") : String(n));
export function CountUp({ to, from = 0, ms = 1600, group = false }: { to: number; from?: number; ms?: number; group?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0, started = false;
    const finish = () => { cancelAnimationFrame(frame); el.textContent = fmt(to, group); };
    const start = () => {
      if (started) return;
      started = true;
      if (preference.matches) { finish(); return; }
      const t0 = performance.now();
      el.textContent = fmt(from, group);
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / ms);
        el.textContent = fmt(Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))), group);
        if (p < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };
    const change = () => { if (preference.matches) { started = true; finish(); } };
    const io = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { start(); io.disconnect(); } }, { threshold: 0.6 });
    // Catch an expansion that completed before this component hydrated.
    if (preference.matches) { started = true; finish(); }
    else if (document.querySelector('[data-expand-complete="true"]')) start();
    io.observe(el);
    window.addEventListener(EXPAND_COMPLETE_EVENT, start);
    preference.addEventListener("change", change);
    return () => { cancelAnimationFrame(frame); io.disconnect(); window.removeEventListener(EXPAND_COMPLETE_EVENT, start); preference.removeEventListener("change", change); finish(); };
  }, [to, from, ms, group]);
  return <span ref={ref} data-count-to={fmt(to, group)} className="tabular-nums">{fmt(to, group)}</span>;
}
