"use client";
import { useEffect, useState } from "react";
/* True only for a fine pointer that can hover AND no reduced-motion preference: every React Bits effect on /v6 is off on
   touch and under prefers-reduced-motion (Aman msg 2451). */
export function useFineMotion(): boolean {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const q = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const on = () => setOk(q.matches); on(); q.addEventListener("change", on); return () => q.removeEventListener("change", on);
  }, []);
  return ok;
}
export function useReducedMotion(): boolean {
  const [r, setR] = useState(false);
  useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setR(q.matches); on(); q.addEventListener("change", on); return () => q.removeEventListener("change", on);
  }, []);
  return r;
}
