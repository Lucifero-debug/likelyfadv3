"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export function ProductBar({ children }: { children: ReactNode }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const hero = document.getElementById("hero");
    const observer = new IntersectionObserver(([entry]) => setShown(!entry.isIntersecting && entry.boundingClientRect.bottom <= 0));
    if (hero) observer.observe(hero);
    return () => observer.disconnect();
  }, []);
  return <header className="v7-product-bar" data-shown={shown} inert={!shown} aria-hidden={!shown}><div className="v7-bar-inner">{children}</div></header>;
}

export function ResultReveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { ref.current?.classList.add("v7-entered"); observer.disconnect(); }
    }, { threshold: 0.2 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className="v7-result-callout">{children}</div>;
}
