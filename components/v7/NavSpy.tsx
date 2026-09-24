"use client";

import { useEffect } from "react";

/* THE NAV'S ACTIVE MARKER — a gradient bar that slides under whichever link's
   section is currently being read, so the bar doubles as a "you are here".

   It enhances the shared Nav rather than forking its 400 lines: one span is
   added to the Primary <nav>, and moved with a transform. React never renders
   that span, so it is never reconciled away. The section in view is decided by
   one IntersectionObserver whose root is a thin strip across the middle of the
   viewport — whichever section crosses that line is the one being read. */
export function NavSpy() {
  useEffect(() => {
    const nav = document.querySelector<HTMLElement>('header nav[aria-label="Primary"]');
    if (!nav) return;
    const links = [...nav.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')];
    const targets = links
      .map((a) => document.querySelector<HTMLElement>(a.getAttribute("href")!))
      .filter((el): el is HTMLElement => !!el);
    if (!targets.length) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const prevPos = nav.style.position;
    nav.style.position = "relative";

    const bar = document.createElement("span");
    bar.setAttribute("aria-hidden", "true");
    bar.style.cssText =
      "position:absolute;left:0;bottom:-6px;height:2px;width:1px;border-radius:2px;" +
      "background:var(--grad);transform-origin:0 50%;opacity:0;pointer-events:none;" +
      (still ? "" : "transition:transform 520ms cubic-bezier(0.16,1,0.3,1),opacity 300ms ease;");
    nav.appendChild(bar);

    let active: HTMLAnchorElement | null = null;
    const place = () => {
      if (!active) {
        bar.style.opacity = "0";
        return;
      }
      const x = active.offsetLeft;
      const w = active.offsetWidth;
      bar.style.transform = `translateX(${x}px) scaleX(${w})`;
      bar.style.opacity = "1";
    };

    const setActive = (id: string | null) => {
      links.forEach((a) => a.removeAttribute("aria-current"));
      active = id ? links.find((a) => a.getAttribute("href") === `#${id}`) ?? null : null;
      active?.setAttribute("aria-current", "location");
      place();
    };

    const live = new Map<Element, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => live.set(e.target, e.isIntersecting));
        /* The last section in document order that is on the line wins; at a
           seam that is the one arriving. */
        const on = targets.filter((t) => live.get(t));
        setActive(on.length ? on[on.length - 1].id : null);
      },
      { rootMargin: "-45% 0px -54% 0px" }
    );
    targets.forEach((t) => io.observe(t));
    window.addEventListener("resize", place);

    return () => {
      io.disconnect();
      window.removeEventListener("resize", place);
      links.forEach((a) => a.removeAttribute("aria-current"));
      bar.remove();
      nav.style.position = prevPos;
    };
  }, []);

  return null;
}
