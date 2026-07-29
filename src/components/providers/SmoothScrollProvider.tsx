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
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !enabled) return;

    // 1. Force start DOM scroll — remove any paused state
    document.documentElement.classList.remove("lenis-stopped");

    const lenis = new Lenis({
      duration,
      easing,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    // 2. Start Lenis explicitly to ensure it's not stuck
    lenis.start();

    // 3. Bridge Lenis → ScrollTrigger so any GSAP scroll animation stays in sync.
    lenis.on("scroll", ScrollTrigger.update);

    // RAF loop driving Lenis (multiply by 1000 for millisecond → second conversion).
    const updateTicker = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    // Re-measure ScrollTrigger after Lenis settles and on resize.
    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
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
