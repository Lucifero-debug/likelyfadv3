"use client";
/* T-0088 PHONE REVEALS (Aman msg 2536, choice 1): on a touch device the /v6
   reveals are SCROLL-LINKED. They move with the thumb and reverse on scroll
   back, driven by CSS scroll timelines. Safari 26.4 runs those on the
   compositor, so they stay locked to the finger even while the main thread is
   busy.

   This only TAGS elements, once, after hydration; polish.css does the motion.
   It is section-agnostic: it finds the reveal components by their own markup
   (RevealText's word masks, Reveal's classes, [data-reveal-item]), so a
   reorder carries it.

   SAFETY: a view() timeline binds to the nearest scroll container. Inside an
   overflow:hidden box (a carousel track, an accordion panel, the footer) it
   would track a box that never scrolls and could hold the element invisible.
   So only elements whose nearest scroll container is the page are tagged.
   Everything else keeps today's triggered reveal. Desktop, reduced motion and
   browsers without scroll timelines are never tagged. */
import { useEffect } from "react";

const QUERY = "(hover: none) and (pointer: coarse) and (prefers-reduced-motion: no-preference)";

function scrollsWithPage(el: Element) {
  for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
    const o = getComputedStyle(a);
    if (/hidden|auto|scroll/.test(o.overflowX + o.overflowY)) return false;
  }
  return true;
}

export function ScrollLinkedReveals() {
  useEffect(() => {
    if (!matchMedia(QUERY).matches || !CSS.supports("animation-timeline: view()")) return;
    const site = document.querySelector<HTMLElement>('[data-site="polish"]');
    if (!site) return;
    // One frame after hydration, so RevealText and Reveal have armed.
    const frame = requestAnimationFrame(() => {
      const wordRoots = new Set<Element>();
      site.querySelectorAll("span.inline-flex.overflow-hidden > span.inline-block").forEach(w => {
        const root = w.parentElement?.parentElement;
        if (root) wordRoots.add(root);
      });
      wordRoots.forEach(root => {
        if (!scrollsWithPage(root)) return;
        root.setAttribute("data-scroll-words", "");
        [...root.children].forEach((c, i) => (c as HTMLElement).style.setProperty("--wi", String(Math.min(i, 12))));
      });
      site.querySelectorAll('[class*="translate-y-[26px]"], [class*="duration-[950ms]"], [data-reveal-item]').forEach(el => {
        if (scrollsWithPage(el)) el.setAttribute("data-scroll-block", "");
      });
      site.setAttribute("data-scroll-linked", "true");
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  return null;
}
