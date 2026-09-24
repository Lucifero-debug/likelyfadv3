"use client";

import { useEffect, useState } from "react";
import { content } from "@/lib/content";
import { contactUrl } from "@/lib/site";
import { Icon } from "./primitives";

/* THE EXTENDED FAB — the page's one persistent action.

   M3 behaviour, exactly: it EXTENDS (icon + label) while the reader scrolls
   up or rests, and COLLAPSES to the icon-only FAB while they scroll down,
   because scrolling down is reading and a wide button in the corner is in
   the way of that. Its width change rides the spatial spring.

   It stays out of the way where the page already shows the same action
   large: over the hero, and once the closing band is on screen. */
export function Fab() {
  const [visible, setVisible] = useState(false);
  const [extended, setExtended] = useState(true);

  useEffect(() => {
    const hero = document.getElementById("top");
    const closing = document.getElementById("close");
    let heroOn = true;
    let closeOn = false;
    const sync = () => setVisible(!heroOn && !closeOn);

    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === hero) heroOn = e.isIntersecting;
        if (e.target === closing) closeOn = e.isIntersecting;
      }
      sync();
    });
    if (hero) io.observe(hero);
    if (closing) io.observe(closing);

    let lastY = window.scrollY;
    let idle = 0;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - lastY) > 8) {
        setExtended(y < lastY);
        lastY = y;
      }
      window.clearTimeout(idle);
      idle = window.setTimeout(() => setExtended(true), 900);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(idle);
    };
  }, []);

  return (
    <a
      href={contactUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Send us a DM on X"
      inert={!visible}
      className={`m3-state m3-ripple fixed bottom-4 right-4 z-[110] flex h-14 items-center rounded-2xl bg-m3-primary-container text-m3-on-primary-container shadow-[var(--m3-elev-3)] transition-[translate,opacity,box-shadow] duration-[var(--m3-spring-default-ms)] ease-[var(--m3-spring-default)] hover:shadow-[var(--m3-elev-4)] expanded:bottom-6 expanded:right-6 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <span className="grid size-14 shrink-0 place-items-center">
        <Icon name="chat" />
      </span>
      {/* The label's box animates 0fr -> 1fr, so the FAB's width is always
          its content's own and nothing is measured. */}
      <span
        className={`grid transition-[grid-template-columns] duration-[var(--m3-spring-default-ms)] ease-[var(--m3-spring-default)] ${
          extended ? "grid-cols-[1fr]" : "grid-cols-[0fr]"
        }`}
      >
        <span className={`overflow-hidden whitespace-nowrap font-sans font-medium text-base leading-6`}>
          <span className="block pr-5">{content.nav.cta}</span>
        </span>
      </span>
    </a>
  );
}
