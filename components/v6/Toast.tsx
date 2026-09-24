"use client";

import { useEffect, useState } from "react";

/* THE TOAST — Polaris's "brief" level of feedback: something happened, it
   needs no action, and it goes away on its own.

   Every CTA on this page leaves for X in a new tab, which on a phone can look
   like nothing happened when the visitor comes back. So a click on any link
   to x.com says what just happened, for 4 seconds. It is announced politely
   and never takes focus. */
export function Toast() {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href^='https://x.com']");
      if (a) setShown((n) => n + 1);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (!shown) return;
    const t = setTimeout(() => setShown(0), 4000);
    return () => clearTimeout(t);
  }, [shown]);

  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[150]">
      {shown > 0 && (
        <p
          key={shown}
          className="p-toast absolute left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-xl bg-[#1a1a1a] px-4 py-3 font-sans text-sm font-medium text-white shadow-[var(--p-shadow-popover)]"
        >
          Opened X in a new tab
        </p>
      )}
    </div>
  );
}
