"use client";

import { useEffect, useRef, useState } from "react";
import { content } from "@/lib/content";
import { contactUrl } from "@/lib/site";
import { T, Icon, type IconName } from "./primitives";

/* THE FRAME — the Shopify admin's chrome, holding the landing page.

   A 56px top bar in the near-black the admin uses, with the mark on the left
   and one quiet action on the right. Under it, from md up, the 240px grey
   NAVIGATION column: 32px items with a 20px icon, the current one lifted to a
   white fill in bold, the way the admin marks where you are. Below md the
   column becomes a drawer behind a hamburger, over a scrim; Escape closes it
   and focus goes back to the button.

   Nothing here is a primary action. The page's primary action lives in the
   page header, per Polaris; the top bar's is a secondary one. */

const NAV: { label: string; href: string; icon: IconName }[] = [
  { label: "Home", href: "#top", icon: "home" },
  ...content.nav.links.map((l, i) => ({
    ...l,
    icon: (["star", "grid", "receipt", "question"] as const)[i] ?? "star",
  })),
];

export function Frame() {
  const [active, setActive] = useState("top");
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const drawer = useRef<HTMLElement>(null);

  useEffect(() => {
    const els = NAV.map((n) => document.getElementById(n.href.slice(1))).filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-40% 0px -59% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const trigger = menuButton.current;
    drawer.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prev;
      trigger?.focus();
    };
  }, [open]);

  const items = (onPick?: () => void) => (
    <ul className="flex flex-col gap-0.5">
      {NAV.map((n) => {
        const isActive = active === n.href.slice(1);
        return (
          <li key={n.href}>
            <a
              href={n.href}
              onClick={onPick}
              aria-current={isActive ? "location" : undefined}
              className={`flex min-h-11 items-center gap-2 rounded-lg px-2 text-p-text transition-colors duration-[var(--p-duration-100)] ease-[var(--p-ease)] p-md:min-h-8 ${T.bodyMd} ${
                isActive
                  ? "bg-p-bg-surface font-bold shadow-[var(--p-shadow-card)]"
                  : "font-medium hover:bg-p-bg-fill-secondary"
              }`}
            >
              <Icon name={n.icon} size={20} className={isActive ? "text-p-text" : "text-p-icon"} />
              {n.label}
            </a>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[120] flex h-[var(--v6-topbar)] items-center gap-2 bg-p-bg-topbar px-2 p-md:px-4">
        <button
          ref={menuButton}
          type="button"
          aria-expanded={open}
          aria-controls="v6-drawer"
          aria-label={open ? "Close navigation" : "Open navigation"}
          onClick={() => setOpen((o) => !o)}
          className="grid size-11 place-items-center rounded-lg text-p-text-inverse transition-colors duration-[var(--p-duration-100)] hover:bg-white/10 p-md:hidden"
        >
          <Icon name={open ? "close" : "menu"} />
        </button>

        <a href="#top" className="flex min-h-11 items-center gap-2 px-1" aria-label={`${content.brand} Studio, back to top`}>
          {/* eslint-disable-next-line @next/next/no-img-element -- one small PNG mark */}
          <img src="/ls-icon.png" alt="" className="h-5 w-auto" />
          <span className="rounded-md bg-white/10 px-1.5 py-0.5 font-sans text-xs font-medium text-p-text-inverse">Studio</span>
        </a>

        <a
          href={contactUrl()}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Send us a DM on X, opens in a new tab"
          className="ml-auto flex h-11 items-center gap-1.5 rounded-lg bg-white/10 px-3 font-sans text-sm font-medium text-p-text-inverse transition-colors duration-[var(--p-duration-100)] hover:bg-white/15 p-md:h-8"
        >
          <Icon name="chat" size={16} />
          <span className="hidden p-sm:inline">DM us</span>
        </a>
      </header>

      {/* THE NAVIGATION COLUMN, md and up. */}
      <nav
        aria-label="Primary"
        className="fixed bottom-0 left-0 top-[var(--v6-topbar)] z-[100] hidden w-[240px] flex-col bg-p-bg-nav px-3 py-3 p-md:flex"
      >
        {items()}
        <div className={`mt-auto flex gap-2 rounded-lg px-2 py-2 text-p-text-secondary ${T.bodySm}`}>
          <Icon name="info" size={16} className="mt-px text-p-icon-secondary" />
          <p>{content.hero.reassurance}.</p>
        </div>
      </nav>

      {/* THE DRAWER, below md. */}
      <div className="p-md:hidden">
        <div
          aria-hidden="true"
          onClick={() => setOpen(false)}
          className={`fixed inset-0 top-[var(--v6-topbar)] z-[105] bg-black/50 transition-opacity duration-[var(--p-duration-200)] ease-[var(--p-ease)] ${
            open ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        />
        <nav
          ref={drawer}
          id="v6-drawer"
          aria-label="Primary"
          inert={!open}
          className={`fixed bottom-0 left-0 top-[var(--v6-topbar)] z-[110] flex w-[min(280px,85vw)] flex-col bg-p-bg-nav px-3 py-3 transition-transform duration-[var(--p-duration-250)] ease-[var(--p-ease)] ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {items(() => setOpen(false))}
        </nav>
      </div>
    </>
  );
}
