"use client";

import { useEffect, useRef, useState } from "react";
import { content } from "@/lib/content";
import { V3_WRAP, Pill } from "./primitives";

/* THE BAR — a translucent material, not an opaque strip. Content scrolls
   underneath and shows through the blur, so the bar brings structure without
   taking a fixed band of the page away.

   No hairline border. Once the page has scrolled, a soft edge fades in under
   the bar instead — the scroll edge effect — and only then, because at the
   very top there is nothing underneath for it to separate from.

   On a phone the links fold into a panel that grows OUT OF THE MENU BUTTON
   (transform-origin top right) and returns into it, so where it came from is
   never in doubt. */
export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      button.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-[120]">
      <div className="v3-material relative">
        {/* The scroll edge: a shadow ramp, never a 1px line. */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 top-full h-6 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.06),rgba(0,0,0,0))] transition-opacity duration-300 ${
            scrolled ? "opacity-100" : "opacity-0"
          }`}
        />
        <div className={`${V3_WRAP} flex h-[var(--v3-nav)] items-center gap-6`}>
          <a href="#top" className="flex min-h-11 items-center" aria-label={`${content.brand} home`}>
            {/* eslint-disable-next-line @next/next/no-img-element -- one small PNG mark */}
            <img src="/ls-icon.png" alt="Likelyfad Studio" className="h-6 w-auto" />
          </a>

          <nav className="ml-auto hidden items-center gap-7 tab:flex" aria-label="Primary">
            {content.nav.links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-[0.875rem] tracking-[-0.005em] text-v3-ink/80 transition-colors duration-200 hover:text-v3-ink"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <Pill contact tone="ink" className="ml-auto !min-h-9 !px-4 !py-1.5 !text-[0.875rem] tab:ml-0">
            {content.nav.cta}
          </Pill>

          <button
            ref={button}
            type="button"
            aria-expanded={open}
            aria-controls="v3-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
            className="-mr-2 grid size-11 place-items-center rounded-full active:bg-black/5 tab:hidden"
          >
            {/* Two bars that meet into an X — the same object, redirected. */}
            <span aria-hidden="true" className="relative block h-3 w-[18px]">
              <span
                className={`absolute left-0 top-0 h-[1.5px] w-full rounded bg-v3-ink transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  open ? "translate-y-[5px] rotate-45" : ""
                }`}
              />
              <span
                className={`absolute bottom-0 left-0 h-[1.5px] w-full rounded bg-v3-ink transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  open ? "-translate-y-[5px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Materialises: blur, scale and opacity arrive together, from the
          button's corner. A CSS transition is right here — a toggle, not a
          gesture — and a transition reverses from its current value if the
          button is hit again mid-flight. */}
      <div
        id="v3-menu"
        inert={!open}
        className={`v3-material absolute right-3 top-[calc(var(--v3-nav)+6px)] w-[min(280px,calc(100vw-24px))] origin-top-right rounded-[22px] p-2 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.35)] transition-[opacity,transform,filter] duration-[360ms] ease-[cubic-bezier(0.32,0.72,0,1)] tab:hidden ${
          open ? "scale-100 opacity-100 blur-0" : "pointer-events-none scale-[0.9] opacity-0 blur-[6px]"
        }`}
      >
        <nav aria-label="Primary mobile">
          {content.nav.links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="flex min-h-12 items-center rounded-2xl px-4 font-display text-[1.25rem] font-bold tracking-[-0.02em] text-v3-ink active:bg-black/5"
            >
              {l.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
