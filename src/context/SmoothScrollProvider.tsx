"use client";

import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface SmoothScrollContextValue {
  lenis: Lenis | null;
}

const SmoothScrollContext = createContext<SmoothScrollContextValue>({ lenis: null });

interface SmoothScrollProviderProps {
  children: ReactNode;
  /** Duration in seconds — higher = slower. 1.2 is the sweet spot for agency sites. */
  duration?: number;
  /** Easing function for the scroll tween. */
  easing?: (t: number) => number;
  /** Disable smooth scroll (e.g. when user prefers reduced motion). */
  enabled?: boolean;
}

export function SmoothScrollProvider({
  children,
  duration = 1.2,
  easing = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  enabled = true,
}: SmoothScrollProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // If the user prefers reduced motion, do nothing — native scroll stays.
    if (reduced) return;

    // Defensive cleanup: ensure no stale `lenis-stopped` class is lingering
    // on <html> from a previous HMR / navigation, which would silently lock
    // the page after React fast-refresh.
    document.documentElement.classList.remove("lenis-stopped");
    document.documentElement.classList.add("lenis", "lenis-smooth");
    document.body.classList.remove("lenis-stopped");

    const lenis = new Lenis({
      duration,
      easing,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
    });

    // Explicit start — guards against any internal Lenis state that left
    // the instance in a paused state on construction (rare, but possible
    // when StrictMode double-invokes effects in dev).
    lenis.start();

    lenisRef.current = lenis;

    // Bridge Lenis → ScrollTrigger so any GSAP scroll animation stays in sync.
    lenis.on("scroll", ScrollTrigger.update);

    // RAF loop driving Lenis.
    // CRITICAL: GSAP's ticker callback receives time in SECONDS. Lenis.raf()
    // expects MILLISECONDS. Multiplying by 1000 is what makes the tween
    // progress — without it the loop fires but scroll never advances and
    // the page appears frozen.
    const tickerFn = (timeSeconds: number) => {
      lenis.raf(timeSeconds * 1000);
    };
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    // Re-measure ScrollTrigger after Lenis settles and on resize.
    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);

    // One refresh after the first paint so ScrollTrigger picks up the real
    // document height (fonts, images, mounted sections).
    const refreshId = window.setTimeout(() => ScrollTrigger.refresh(), 120);

    return () => {
      window.clearTimeout(refreshId);
      window.removeEventListener("resize", onResize);
      gsap.ticker.remove(tickerFn);
      lenis.off("scroll", ScrollTrigger.update);
      lenis.stop();
      lenis.destroy();
      // Strip Lenis classes from <html>/<body> so any later render of the
      // app without the provider has a clean, natively-scrollable DOM.
      document.documentElement.classList.remove("lenis", "lenis-smooth", "lenis-stopped");
      document.body.classList.remove("lenis", "lenis-smooth", "lenis-stopped");
      lenisRef.current = null;
    };
  }, [duration, easing, enabled]);

  return (
    <SmoothScrollContext.Provider value={{ lenis: lenisRef.current }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}

export function useLenis() {
  return useContext(SmoothScrollContext).lenis;
}
