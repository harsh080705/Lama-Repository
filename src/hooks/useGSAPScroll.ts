"use client";

import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "@/context/SmoothScrollProvider";

gsap.registerPlugin(ScrollTrigger);

/**
 * Wires GSAP's ScrollTrigger + ticker to the active Lenis instance and
 * exposes a register/unregister helper so any component can contribute
 * its own ScrollTriggers without re-running the global bridge.
 *
 * Call this once at the top of any section that defines ScrollTriggers.
 * It is safe to call from multiple components — the ticker listener and
 * ScrollTrigger.refresh are idempotent.
 */
export function useGSAPScroll() {
  const lenis = useLenis();

  useLayoutEffect(() => {
    if (!lenis) return;

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const onRefresh = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onRefresh);

    // Allow DOM to settle after layout/font swap before measuring.
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 120);

    return () => {
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(tickerFn);
      window.removeEventListener("resize", onRefresh);
      window.clearTimeout(id);
    };
  }, [lenis]);
}
