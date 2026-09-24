"use client";

import { useEffect, useRef, useState } from "react";
import { content } from "@/lib/content";
import { contactUrl } from "@/lib/site";
import { T, Icon } from "./primitives";

/* THE UI SHELL HEADER — Carbon's frame, on Gray 100 in both themes.

   48px tall, flush to the viewport edges, a 1px border-subtle rule under it.
   The name follows Carbon's "IBM [Product]" pattern: the mark, then the
   product name in semibold. Header menu items are full-height, 16px padded;
   the one on screen carries the 2px interactive bar along its bottom edge.
   The call to action is a full-height primary button at the far right, the
   way ibm.com's masthead ends.

   Below lg the menu items move into the SIDE NAV: a 256px Gray 100 panel
   under the header, with the 3px interactive bar on the left of the current
   item. It enters on fast-02 / productive entrance and leaves on
   fast-02 / productive exit. Escape closes it and focus returns to the
   hamburger. */

const SECTIONS = content.nav.links.map((l) => l.href.slice(1));

const MENU_ITEM =
  "relative flex h-full items-center px-4 transition-[background-color,color] duration-[var(--cds-fast-01)] ease-[var(--cds-standard-productive)] hover:bg-cds-layer-hover hover:text-cds-text-primary";

export function Header() {
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);

  /* The band crossing a line 40% down the viewport is the current one. */
  useEffect(() => {
    const els = [document.getElementById("top"), ...SECTIONS.map((id) => document.getElementById(id))].filter(
      (el): el is HTMLElement => !!el
    );
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id === "top" ? null : e.target.id);
      },
      { rootMargin: "-40% 0px -59% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const trigger = menuButton.current;
    panel.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [open]);

  return (
    <div className="cds-g100">
      <header className="fixed inset-x-0 top-0 z-[120] flex h-[var(--v5-header)] items-stretch border-b border-cds-border-subtle bg-cds-background text-cds-text-secondary">
        <button
          ref={menuButton}
          type="button"
          aria-expanded={open}
          aria-controls="v5-sidenav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
          className="grid w-12 shrink-0 place-items-center text-cds-text-primary transition-colors duration-[var(--cds-fast-01)] hover:bg-cds-layer-hover cds-lg:hidden"
        >
          <Icon name={open ? "close" : "menu"} size={20} />
        </button>

        <a
          href="#top"
          className="flex items-center gap-2 pl-2 pr-8 text-cds-text-primary cds-lg:pl-4"
          aria-label={`${content.brand} Studio, back to top`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- one small PNG mark */}
          <img src="/ls-icon.png" alt="" className="h-[18px] w-auto" />
          <span className={T.headingCompact01}>Studio</span>
        </a>

        <nav aria-label="Primary" className="hidden cds-lg:block">
          <ul className="flex h-full">
            {content.nav.links.map((l) => {
              const isActive = active === l.href.slice(1);
              return (
                <li key={l.label} className="h-full">
                  <a
                    href={l.href}
                    aria-current={isActive ? "location" : undefined}
                    className={`${MENU_ITEM} ${T.bodyCompact01} ${isActive ? "text-cds-text-primary" : ""}`}
                  >
                    {l.label}
                    <span
                      aria-hidden="true"
                      className={`absolute inset-x-0 bottom-0 h-0.5 bg-cds-border-interactive transition-opacity duration-[var(--cds-fast-02)] ${
                        isActive ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* The global action. Label from md up; on sm it is a 48px icon
            button, which is what Carbon's header actions are. */}
        <a
          href={contactUrl()}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Send us a DM on X"
          className={`cds-btn ml-auto flex items-center gap-4 bg-cds-btn-primary px-4 text-cds-text-on-color transition-colors duration-[var(--cds-fast-01)] ease-[var(--cds-standard-productive)] hover:bg-cds-btn-primary-hover active:bg-cds-btn-primary-active cds-md:pr-4 cds-md:pl-4 ${T.bodyCompact01}`}
        >
          <span className="hidden cds-md:inline">{content.nav.cta}</span>
          <Icon name="chat" size={20} className="cds-md:hidden" />
          <Icon name="arrowRight" size={16} className="hidden cds-md:block" />
        </a>
      </header>

      {/* THE SIDE NAV. Overlay under it, per Carbon's rail-less side nav. */}
      <div className="cds-lg:hidden">
        <div
          aria-hidden="true"
          onClick={() => setOpen(false)}
          className={`fixed inset-0 top-[var(--v5-header)] z-[110] bg-cds-overlay transition-opacity ${
            open
              ? "opacity-100 duration-[var(--cds-moderate-01)] ease-[var(--cds-entrance-productive)]"
              : "pointer-events-none opacity-0 duration-[var(--cds-fast-02)] ease-[var(--cds-exit-productive)]"
          }`}
        />
        <nav
          ref={panel}
          id="v5-sidenav"
          aria-label="Primary"
          inert={!open}
          className={`fixed bottom-0 left-0 top-[var(--v5-header)] z-[115] flex w-64 flex-col border-r border-cds-border-subtle bg-cds-background pt-4 transition-transform ${
            open
              ? "translate-x-0 duration-[var(--cds-fast-02)] ease-[var(--cds-entrance-productive)]"
              : "-translate-x-full duration-[var(--cds-fast-02)] ease-[var(--cds-exit-productive)]"
          }`}
        >
          <ul>
            {content.nav.links.map((l) => {
              const isActive = active === l.href.slice(1);
              return (
                <li key={l.label}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive ? "location" : undefined}
                    className={`relative flex h-10 items-center px-4 ${T.headingCompact01} transition-colors duration-[var(--cds-fast-01)] hover:bg-cds-layer-hover hover:text-cds-text-primary ${
                      isActive ? "bg-cds-layer-selected text-cds-text-primary" : "text-cds-text-secondary"
                    }`}
                  >
                    {isActive && <span aria-hidden="true" className="absolute inset-y-0 left-0 w-[3px] bg-cds-border-interactive" />}
                    {l.label}
                  </a>
                </li>
              );
            })}
          </ul>
          <p className={`mt-auto border-t border-cds-border-subtle px-4 py-4 text-cds-text-helper ${T.label01}`}>
            {content.hero.reassurance}
          </p>
        </nav>
      </div>
    </div>
  );
}
