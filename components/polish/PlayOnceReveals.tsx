"use client";
/* T-0088 ONE REVEAL (Aman msg 2542). Every text element on /v6 plays the same
   entry animation once (blur + fade, polish.css "ONE REVEAL"). RevealText,
   Reveal and the why cards already have a trigger; this tags the text that has
   none (eyebrows, leads, card text, the Work heading, the footer) and reveals
   it once when it enters. It never reverses.

   Section-agnostic: it finds text by element type, not by section, so a
   reorder carries it. It skips video tiles, the featured ad, the nav, and
   anything already inside a reveal. It only tags what is BELOW the viewport
   at load, so nothing on screen is hidden and nothing flashes. A horizontally
   scrolling track (the testimonial carousel) is tagged as one unit, so cards
   do not reveal one by one on each swipe. Reduced motion: nothing is tagged. */
import { useEffect } from "react";

const TEXT = "h1, h2, h3, h4, p, li, blockquote, figcaption, dt, dd, [class*='uppercase'][class*='tracking-']";
const SKIP = "nav, header, [data-video-wall], [data-polish-lanes], #featured-ad, [data-gradual-blur]";
const HAS_REVEAL = "[class*='translate-y-[26px]'], [class*='duration-[950ms]'], [data-reveal-item], [data-reveal-root], [data-v6-reveal]";
const STEP = 70, MAX_DELAY = 280;

export function PlayOnceReveals() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const site = document.querySelector<HTMLElement>('[data-site="polish"]');
    if (!site) return;
    let io: IntersectionObserver | null = null;
    const timers: number[] = [];
    const frame = requestAnimationFrame(() => {
      const unit = (el: HTMLElement): HTMLElement => {
        for (let a = el.parentElement; a && a !== site; a = a.parentElement) {
          if (a.scrollWidth > a.clientWidth + 1 && /hidden|auto|scroll|clip/.test(getComputedStyle(a).overflowX)) return a;
        }
        return el;
      };
      const tagged: HTMLElement[] = [];
      site.querySelectorAll<HTMLElement>(TEXT).forEach(el => {
        if (el.closest(SKIP) || el.closest(HAS_REVEAL)) return;
        if (el.querySelector("span.inline-flex.overflow-hidden > span.inline-block")) return; // a RevealText root
        const tile = el.closest("button");
        if (tile && tile.querySelector("video, img")) return; // a video tile caption
        const target = unit(el);
        if (target.closest(HAS_REVEAL)) return;
        if (target.getBoundingClientRect().top < innerHeight) return; // on screen or above: leave visible
        target.setAttribute("data-v6-reveal", "");
        tagged.push(target);
      });
      io = new IntersectionObserver(entries => {
        let n = 0;
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          io!.unobserve(el);
          const delay = Math.min(n++ * STEP, MAX_DELAY);
          el.style.setProperty("--v6-rv-delay", `${delay}ms`);
          el.setAttribute("data-v6-shown", "");
          // Hand the element's own transitions back once the reveal is over.
          timers.push(window.setTimeout(() => el.setAttribute("data-v6-done", ""), 900 + delay + 80));
        }
      }, { rootMargin: "0px 0px -8% 0px" });
      tagged.forEach(el => io!.observe(el));
    });
    return () => { cancelAnimationFrame(frame); io?.disconnect(); timers.forEach(clearTimeout); };
  }, []);
  return null;
}
