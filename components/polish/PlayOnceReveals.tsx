"use client";

import { useEffect } from "react";

// Component markup, never section IDs or order. Shared reveals are made static
// by polish.css; this observer owns their entry along with the remaining copy.
const BLOCK = '[class*="translate-y-[26px]"], [class*="duration-[950ms]"]';
const TEXT = 'h1, h2, h3, h4, h5, h6, [role="heading"], p, li, blockquote, figcaption, dt, dd, a, button, [class*="uppercase"], .pillar-num';
const GROUP = '[data-v6-reveal-group], article, figure, [data-reveal-root="self"], [data-reveal-item]';
const SKIP = '[data-polish-nav], [data-polish-pitch], [data-video-wall], [data-polish-lanes], [data-polish-reel], [data-scroll-expand], [data-gradual-blur], [role="dialog"], .sr-only';

export function PlayOnceReveals() {
  useEffect(() => {
    const site = document.querySelector<HTMLElement>('[data-site="polish"]');
    if (!site) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const pitches = [...site.querySelectorAll<HTMLElement>("[data-polish-pitch]")];
    const tagged: HTMLElement[] = [];
    let observer: IntersectionObserver | undefined;

    const finish = (el: HTMLElement) => {
      observer?.unobserve(el);
      el.setAttribute("data-v6-shown", "");
      el.setAttribute("data-v6-done", "");
    };
    const finishAll = () => {
      if (!motion.matches) return;
      tagged.forEach(finish);
      pitches.forEach(el => el.setAttribute("data-v6-hero-done", ""));
    };
    const onEnd = (event: AnimationEvent) => {
      if (event.animationName !== "v6-reveal" || !(event.target instanceof HTMLElement)) return;
      if (event.target.hasAttribute("data-v6-reveal")) finish(event.target);
      if (event.target.hasAttribute("data-polish-pitch")) event.target.setAttribute("data-v6-hero-done", "");
    };
    // Keyboard navigation must never land on invisible copy.
    const onFocus = (event: FocusEvent) => {
      if (!(event.target instanceof Element)) return;
      const target = event.target.closest<HTMLElement>("[data-v6-reveal]");
      if (target) finish(target);
      event.target.closest("[data-polish-pitch]")?.setAttribute("data-v6-hero-done", "");
    };

    const frame = requestAnimationFrame(() => {
      if (motion.matches || !("IntersectionObserver" in window)) return;

      const candidates = new Set<HTMLElement>();
      site.querySelectorAll<HTMLElement>(`${TEXT}, ${BLOCK}, ${GROUP}`).forEach(el => {
        if (el.closest(SKIP)) return;
        if (el.closest("button")?.querySelector("video, img")) return;

        let target = el;
        // Select the outermost semantic/reveal unit, so a card, heading or
        // grouped introduction never multiplies its children's blur/opacity.
        for (let parent: HTMLElement | null = el; parent && parent !== site; parent = parent.parentElement) {
          if (parent.matches(`${GROUP}, ${BLOCK}, h1, h2, h3, h4, h5, h6, p, li, blockquote, figcaption`)) target = parent;
          // A horizontal carousel enters together, including offscreen cards.
          if (parent.scrollWidth > parent.clientWidth + 1 && /auto|scroll/.test(getComputedStyle(parent).overflowX)) target = parent;
        }
        if (!target.closest(SKIP)) candidates.add(target);
      });

      // Nested selections are removed before measuring or hiding anything.
      const units = [...candidates].filter(el => {
        for (let parent = el.parentElement; parent && parent !== site; parent = parent.parentElement) {
          if (candidates.has(parent)) return false;
        }
        return true;
      });
      const belowFold = units.filter(el => el.getClientRects().length > 0 && el.getBoundingClientRect().top >= window.innerHeight);

      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          observer!.unobserve(el);
          el.setAttribute("data-v6-shown", "");
        }
      }, { threshold: 0 });
      belowFold.forEach(el => {
        el.setAttribute("data-v6-reveal", "");
        tagged.push(el);
        observer!.observe(el);
      });
    });

    site.addEventListener("animationend", onEnd);
    site.addEventListener("focusin", onFocus);
    motion.addEventListener("change", finishAll);
    finishAll();
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      site.removeEventListener("animationend", onEnd);
      site.removeEventListener("focusin", onFocus);
      motion.removeEventListener("change", finishAll);
      pitches.forEach(el => el.removeAttribute("data-v6-hero-done"));
      tagged.forEach(el => {
        el.removeAttribute("data-v6-reveal");
        el.removeAttribute("data-v6-shown");
        el.removeAttribute("data-v6-done");
      });
    };
  }, []);
  return null;
}
