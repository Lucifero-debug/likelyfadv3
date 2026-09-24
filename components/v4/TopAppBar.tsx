"use client";

import { useEffect, useRef, useState } from "react";
import { content } from "@/lib/content";
import { V4_WRAP, T, Button, Icon, ICON_BTN } from "./primitives";

/* THE TOP APP BAR — M3's small top app bar.

   Flat on surface at the top of the page. Once content scrolls under it, it
   takes the surface-container colour instead of a shadow: M3 separates the
   bar from the page by TONE, not by a line or a drop shadow.

   The destinations carry an active indicator — a secondary-container pill,
   the same one the navigation bar and rail use — that follows the section
   currently on screen.

   On a compact window the destinations move into a MODAL NAVIGATION DRAWER
   that slides in from the leading edge over a scrim. The bar keeps no
   call-to-action there: the extended FAB is the page's persistent action on
   a phone, and a bar with two competing actions is what M3 tells you not to
   build. */

const SECTIONS = content.nav.links.map((l) => l.href.slice(1));

export function TopAppBar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const drawer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* The section whose band crosses a line 40% down the viewport is active. */
  useEffect(() => {
    const els = SECTIONS.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-40% 0px -59% 0px" }
    );
    els.forEach((el) => io.observe(el));
    const top = document.getElementById("top");
    const topIo = new IntersectionObserver(([e]) => e.isIntersecting && setActive(null), {
      rootMargin: "-40% 0px -59% 0px",
    });
    if (top) topIo.observe(top);
    return () => {
      io.disconnect();
      topIo.disconnect();
    };
  }, []);

  /* Drawer: Escape closes, focus moves in on open and back to the button on
     close, and the page behind stops scrolling. */
  useEffect(() => {
    if (!open) return;
    const trigger = menuButton.current;
    drawer.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prev;
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[120] transition-colors duration-200 ease-[var(--m3-ease-standard)] ${
          scrolled ? "bg-m3-surface-container" : "bg-m3-surface"
        }`}
      >
        <div className={`${V4_WRAP} flex h-[var(--v4-bar)] items-center gap-1`}>
          <button
            ref={menuButton}
            type="button"
            aria-expanded={open}
            aria-controls="v4-drawer"
            aria-label="Open navigation"
            onClick={() => setOpen(true)}
            className={`${ICON_BTN} -ml-3 text-m3-on-surface-variant expanded:hidden`}
          >
            <Icon name="menu" />
          </button>

          <a href="#top" className="flex min-h-12 items-center pr-2" aria-label={`${content.brand} home`}>
            {/* eslint-disable-next-line @next/next/no-img-element -- one small PNG mark */}
            <img src="/ls-icon.png" alt="Likelyfad Studio" className="h-6 w-auto" />
          </a>

          <nav className="ml-auto hidden items-center gap-1 expanded:flex" aria-label="Primary">
            {content.nav.links.map((l) => {
              const isActive = active === l.href.slice(1);
              return (
                <a
                  key={l.label}
                  href={l.href}
                  aria-current={isActive ? "location" : undefined}
                  className={`m3-state m3-ripple flex h-10 items-center rounded-full px-4 ${T.labelL} transition-colors duration-200 ${
                    isActive
                      ? "bg-m3-secondary-container text-m3-on-secondary-container"
                      : "text-m3-on-surface-variant"
                  }`}
                >
                  {l.label}
                </a>
              );
            })}
          </nav>

          <span className="ml-auto hidden pl-3 expanded:ml-0 expanded:block">
            <Button contact variant="filled">
              {content.nav.cta}
            </Button>
          </span>
        </div>
      </header>

      {/* THE MODAL DRAWER. Scrim at 32% of the scrim colour; the sheet comes
          in with emphasized-decelerate and leaves with emphasized-accelerate,
          faster out than in, as M3 motion asks. */}
      <div className="expanded:hidden">
        <div
          aria-hidden="true"
          onClick={() => setOpen(false)}
          className={`fixed inset-0 z-[130] bg-m3-scrim transition-opacity ${
            open
              ? "opacity-[0.32] duration-[400ms] ease-[var(--m3-ease-emphasized-decel)]"
              : "pointer-events-none opacity-0 duration-200 ease-[var(--m3-ease-emphasized-accel)]"
          }`}
        />
        <div
          ref={drawer}
          id="v4-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          inert={!open}
          className={`fixed inset-y-0 left-0 z-[140] flex w-[min(360px,calc(100vw-56px))] flex-col rounded-r-2xl bg-m3-surface-container-low px-3 pb-4 pt-3 shadow-[var(--m3-elev-1)] transition-transform ${
            open
              ? "translate-x-0 duration-[400ms] ease-[var(--m3-ease-emphasized-decel)]"
              : "-translate-x-[105%] duration-200 ease-[var(--m3-ease-emphasized-accel)]"
          }`}
        >
          <div className="flex items-center justify-between pl-4">
            <p className={`${T.titleM} text-m3-on-surface-variant`}>{content.brand}</p>
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setOpen(false)}
              className={`${ICON_BTN} text-m3-on-surface-variant`}
            >
              <Icon name="close" />
            </button>
          </div>
          <nav aria-label="Primary mobile" className="mt-2 flex flex-col">
            {content.nav.links.map((l) => {
              const isActive = active === l.href.slice(1);
              return (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive ? "location" : undefined}
                  className={`m3-state m3-ripple flex h-14 items-center rounded-full px-4 ${T.labelL} ${
                    isActive
                      ? "bg-m3-secondary-container text-m3-on-secondary-container"
                      : "text-m3-on-surface-variant"
                  }`}
                >
                  {l.label}
                </a>
              );
            })}
          </nav>
          <div className="mx-4 my-4 h-px bg-m3-outline-variant" />
          <Button contact variant="filled" size="m" icon="chat" className="mx-1">
            {content.nav.cta}
          </Button>
        </div>
      </div>
    </>
  );
}
