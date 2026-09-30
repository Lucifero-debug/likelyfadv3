"use client";
/* T-0088 ONE REVEAL, unit by unit (Aman msgs 2570 + 2572). Reed, after
   Astra's ec0f284 (whole-group units, which played before they were seen).

   UNITS: each LINE of a RevealText heading (its words grouped by rendered
   line, all words of a line together), each paragraph / label / CTA, and each
   CARD (article, figure, list item, why card, number cell). Cards in the same
   RENDERED row (same parent, same top) arrive together; rows follow one
   another, so it holds at every width.
   ORDER: within a section, units play one after another in reading order,
   STEP ms apart, even when they cross the trigger at slightly different times.
   TRIGGER: about 18% up from the bottom of the viewport (above the bottom blur
   strip), so the blur plays where the eye is. At the very end of the page,
   whatever is on screen plays anyway.
   Once: each unit is unobserved when it starts; it never reverses.
   Only units BELOW the viewport at load are tagged (nothing on screen is
   hidden, so nothing flashes); the hero is pure CSS. Section-agnostic: units
   are found by markup, never by section id or order. Reduced motion: nothing
   is tagged. polish.css ("ONE REVEAL, unit by unit") does the motion. */
import { useEffect } from "react";

const STEP = 110, MAX_QUEUE = 330;
const CARD = 'article, figure, li, [data-reveal-item], [data-placeholder="true"], .v6-number-tile';
const TEXT = 'h1, h2, h3, h4, h5, h6, [role="heading"], p, blockquote, figcaption, dt, dd, [class*="uppercase"][class*="tracking-"], a, button';
const SKIP = 'nav, header, [data-polish-pitch], [data-video-wall], [data-polish-lanes], [data-polish-reel], [data-scroll-expand], [data-gradual-blur], [role="dialog"], .sr-only, [aria-hidden="true"]';
const WORD = "span.inline-flex.overflow-hidden";

export function PlayOnceReveals() {
  useEffect(() => {
    const site = document.querySelector<HTMLElement>('[data-site="polish"]');
    if (!site || matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    let io: IntersectionObserver | undefined, full: IntersectionObserver | undefined;
    const pending = new Set<HTMLElement>();
    const slotOf = new Map<HTMLElement, string>(); // key shared by units that arrive together
    const start = new Map<string, number>();         // slot key -> start time
    const next = new Map<Element, number>();         // section -> next free start time
    const ids = new WeakMap<Element, number>();
    let counter = 0;
    const idOf = (el: Element) => { let v = ids.get(el); if (v === undefined) { v = counter++; ids.set(el, v); } return v; };

    const below = (el: Element) => el.getBoundingClientRect().top >= innerHeight && !collapsed(el);
    // Content the page itself hides (a closed FAQ answer, a zero-height panel) is
    // never a unit: it appears with its own control, not with the scroll.
    const collapsed = (el: Element) => {
      if (el.getBoundingClientRect().height < 2) return true;
      for (let a: Element | null = el; a && a !== site; a = a.parentElement) {
        const c = getComputedStyle(a);
        if (c.opacity === "0" || c.visibility === "hidden") return true;
        if (a !== el && c.overflowY !== "visible" && a.getBoundingClientRect().height < 4) return true;
      }
      return false;
    };
    const tag = (el: HTMLElement, slot: string) => { el.setAttribute("data-v6-unit", ""); slotOf.set(el, slot); pending.add(el); };

    const play = (els: HTMLElement[]) => {
      const now = performance.now();
      els.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
      for (const el of els) {
        if (!pending.delete(el)) continue;
        io?.unobserve(el); full?.unobserve(el);
        const section = el.closest("section, footer") ?? site;
        const slot = slotOf.get(el)!;
        let at = start.get(slot);
        if (at === undefined) {
          // Queue at most MAX_QUEUE behind, so a fast scroll never leaves units waiting off screen.
          at = Math.max(now, Math.min(next.get(section) ?? 0, now + MAX_QUEUE));
          start.set(slot, at);
          next.set(section, at + STEP);
        }
        el.style.setProperty("--v6-delay", `${Math.round(at - now)}ms`);
        el.setAttribute("data-v6-shown", "");
      }
    };
    const onEnd = (e: AnimationEvent) => {
      if (e.animationName === "v6-unit" && e.target instanceof HTMLElement && e.target.hasAttribute("data-v6-unit")) e.target.setAttribute("data-v6-done", "");
    };
    // Keyboard focus never lands on invisible copy.
    const onFocus = (e: FocusEvent) => {
      const u = e.target instanceof Element ? e.target.closest<HTMLElement>("[data-v6-unit]") : null;
      if (u) { play([u]); u.setAttribute("data-v6-done", ""); }
    };
    // Near the end of the page nothing can rise to the trigger line: play what is on screen.
    // Less scroll left than the trigger margin: units below the line can never reach it.
    const nearEnd = () => document.documentElement.scrollHeight - (innerHeight + scrollY) <= innerHeight * 0.18;
    let raf = 0;
    const onScroll = () => {
      if (raf || !pending.size) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (!nearEnd()) return;
        play([...pending].filter(el => { const r = el.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0 && r.right > 0 && r.left < innerWidth; }));
      });
    };

    const frame = requestAnimationFrame(() => {
      // 1. Cards: one unit each; same parent + same rendered top = one row.
      const cards = [...site.querySelectorAll<HTMLElement>(CARD)].filter(el =>
        !el.closest(SKIP) && el.textContent?.trim() && !el.parentElement?.closest(CARD));
      for (const el of cards) {
        if (!below(el)) continue;
        tag(el, `row:${el.parentElement ? idOf(el.parentElement) : 0}:${Math.round(el.getBoundingClientRect().top + scrollY)}`);
      }
      const inCard = (el: Element) => !!el.parentElement?.closest(CARD) && cards.some(c => c !== el && c.contains(el));

      // 2. RevealText headings: one unit per rendered line of its word masks.
      const roots = new Set<HTMLElement>();
      site.querySelectorAll<HTMLElement>(`${WORD} > span.inline-block`).forEach(w => { const r = w.parentElement?.parentElement; if (r) roots.add(r); });
      for (const root of roots) {
        if (root.closest(SKIP) || inCard(root) || !below(root)) continue;
        const id = idOf(root);
        for (const w of root.querySelectorAll<HTMLElement>(`:scope > ${WORD}`)) tag(w, `line:${id}:${Math.round(w.getBoundingClientRect().top)}`);
      }

      // 3. Every other text block: the outermost one, once.
      for (const el of site.querySelectorAll<HTMLElement>(TEXT)) {
        if (el.closest(SKIP) || el.closest("[data-v6-unit]") || inCard(el) || !el.textContent?.trim()) continue;
        if (el.querySelector(WORD) || el.querySelector("[data-v6-unit]")) continue; // handled by lines, or a wrapper of units
        if (el.closest("button")?.querySelector("video, img")) continue;               // video tile captions
        if (el.parentElement?.closest(TEXT)) continue;                                 // inside another text block
        if (!below(el)) continue;
        tag(el, `text:${idOf(el)}`);
      }

      io = new IntersectionObserver(entries => {
        play(entries.filter(e => e.isIntersecting).map(e => e.target as HTMLElement));
      }, { rootMargin: "0px 0px -18% 0px" });
      pending.forEach(el => io!.observe(el));
      // Second exit: a unit that is fully on screen plays even if it can never
      // reach the trigger line (the end of the page, a short last section).
      full = new IntersectionObserver(entries => {
        if (!nearEnd()) return; // elsewhere the trigger line decides, so nothing plays at the bottom edge
        play(entries.filter(e => e.intersectionRatio >= 0.99).map(e => e.target as HTMLElement));
      }, { threshold: [0.99] });
      pending.forEach(el => full!.observe(el));
    });

    site.addEventListener("animationend", onEnd);
    site.addEventListener("focusin", onFocus);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scrollend", onScroll);
    return () => {
      cancelAnimationFrame(frame); cancelAnimationFrame(raf); io?.disconnect(); full?.disconnect();
      site.removeEventListener("animationend", onEnd);
      site.removeEventListener("focusin", onFocus);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scrollend", onScroll);
    };
  }, []);
  return null;
}
