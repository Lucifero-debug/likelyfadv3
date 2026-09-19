"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/* Lenis, mounted once in the root layout.

   IT LIVES IN app/ RATHER THAN components/sections/, WHICH IS WHERE IT STARTED.
   It is not a section: it renders nothing, it is mounted by the layout rather
   than by page.tsx, and it is the only thing in the tree that owns a
   page-global gesture. Filed with the sections it read as one more band that
   had simply forgotten to return markup.

   IT DOES NOT TOUCH `scroll-behavior`. The <html> element deliberately carries
   no `scroll-smooth`: with Lenis running, the native smooth scroll fights it
   for the same gesture and the page arrives at an anchor twice. The reduced-
   motion block in globals.css pins `scroll-behavior: auto` for the same reason
   from the other direction. */
export default function SmoothScroll() {
  useEffect(() => {
    /* BAILS ENTIRELY RATHER THAN RUNNING GENTLY. A shorter duration is still a
       scroll animation the visitor did not ask for, and the whole point of the
       preference is that the page scrolls the way the OS scrolls. Nothing below
       this line runs, so there is also no rAF loop on the frame budget. */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    /* NO `smoothTouch`. It is not a Lenis option in 1.3.x — it was silently
       doing nothing, and TypeScript said so — but it should not come back under
       its current name (`syncTouch`) either. Touch scrolling is momentum the OS
       already owns and the finger is already tracking; intercepting it is how a
       page starts feeling detached from the thumb. */
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    /* ONE DELEGATED LISTENER, NOT ONE PER LINK. The nav, the footer and the
       skip link all point at hashes, and the set is not fixed — reading the
       target at click time means a band that adds a link is handled without
       anything being registered for it. */
    const onClick = (event: MouseEvent) => {
      /* Modified clicks belong to the browser: cmd/ctrl opens a tab, shift a
         window, and a middle click is not a left click at all. Swallowing those
         to animate the current page is the one thing this must not do. */
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      const link = target?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href || href === "#") return;

      /* querySelector types its result as Element, and Lenis wants an
         HTMLElement — the narrow is not a formality: an id can land on an
         <svg>, which has no offsetTop for Lenis to measure. */
      const el = document.querySelector(href);
      if (!(el instanceof HTMLElement)) return;

      event.preventDefault();

      /* NO `offset`, AND THAT IS THE WHOLE POINT OF THE CLEARANCE LIVING IN CSS.
         Lenis already reads it: before applying any offset it does

           target = rect.top + animatedScroll - scrollMarginTop - scrollPaddingTop

         (lenis/dist/lenis.mjs, scrollTo). <html> carries
         `scroll-padding-top: var(--nav-h)`, so the bar is cleared here by the
         same declaration that clears it for a pasted #faq link or a hash
         restored on reload — one number, one mechanism, and this handler does
         not have to know how tall the header is.

         PASSING THE HEIGHT HERE AS WELL IS THE BUG THIS REPLACED. It was a flat
         -100 on top of Lenis's own two subtractions; with the scroll-padding
         added it came to three helpings of the same clearance and put every
         anchor 187px low. If a jump ever lands wrong, change --nav-h — do not
         add an offset back. */
      lenis.scrollTo(el, { duration: 1.1 });

      window.history.pushState(null, "", href);
    };

    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return null;
}
