"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

/* A Carbon entrance for content below the fold: productive, not performed.
   moderate-02 (240ms) on the productive entrance curve, 8px of travel — enough
   to register that something arrived, short enough that a user scrolling
   quickly never waits on it.

   Same three-phase shape as components/ui/Reveal: the server renders the
   content at rest, so the page reads with no JS; the offset is applied before
   first paint and only then transitioned away. */
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function Enter({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"rest" | "armed" | "in">("rest");

  useIsoLayoutEffect(() => setPhase("armed"), []);

  useEffect(() => {
    if (phase !== "armed") return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setPhase("in");
        io.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [phase]);

  return (
    <div
      ref={ref}
      style={phase === "in" && delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`${
        phase === "armed"
          ? "translate-y-2 opacity-0"
          : phase === "in"
            ? "translate-y-0 opacity-100 transition-[opacity,transform] duration-[var(--cds-moderate-02)] ease-[var(--cds-entrance-productive)]"
            : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
