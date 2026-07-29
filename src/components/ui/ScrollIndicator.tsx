"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useLenis } from "@/context/SmoothScrollProvider";
import { useCursor } from "@/context/CursorContext";

/**
 * Bottom-left floating scroll indicator.
 * - Click → Lenis smooth-scrolls to the next section (`#about`).
 * - Hover → cursor mode flips to `hover-button` so the dot becomes the
 *   electric-lime accent state defined in `<CustomCursor />`.
 * - Scrolling past `hideThreshold` (default 240px) fades the indicator out
 *   so it never overlaps mid-page content.
 */
interface ScrollIndicatorProps {
  /** Section to scroll to on click. Default: `#about`. */
  target?: string;
  /** Pixel scroll past which the indicator fades out. Default: 240. */
  hideThreshold?: number;
  /** Scroll duration in seconds. Default: 1.5. */
  duration?: number;
}

const DEFAULT_EASING = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

export default function ScrollIndicator({
  target = "#about",
  hideThreshold = 240,
  duration = 1.5,
}: ScrollIndicatorProps) {
  const lenis = useLenis();
  const { setCursorMode, setCursorText } = useCursor();
  const ref = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(true);

  // Fade driver (0 = hidden, 1 = visible). Spring smooths the toggle.
  const opacity = useMotionValue(1);
  const opacitySpring = useSpring(opacity, {
    stiffness: 220,
    damping: 26,
    mass: 0.5,
  });

  // Compute scroll position and toggle visibility. RAF-throttled to avoid
  // setting state on every scroll tick.
  useEffect(() => {
    const update = () => {
      const y = window.scrollY;
      setVisible(y < hideThreshold);
    };
    update();

    const onScroll = () => {
      if (ref.current === null) return;
      window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hideThreshold]);

  // Drive the opacity motion value whenever `visible` flips.
  useEffect(() => {
    opacity.set(visible ? 1 : 0);
  }, [visible, opacity]);

  const onClick = () => {
    if (lenis) {
      lenis.scrollTo(target, { duration, easing: DEFAULT_EASING });
      return;
    }
    // Fallback if Lenis failed to mount (reduced-motion, etc.).
    const el =
      document.querySelector(target) ??
      document.documentElement;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onEnter = () => {
    setCursorMode("hover-button");
    setCursorText("Scroll");
  };

  const onLeave = () => {
    setCursorMode("default");
    setCursorText("");
  };

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onClick}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      aria-label={`Scroll to ${target.replace("#", "")}`}
      style={{
        opacity: opacitySpring,
        pointerEvents: visible ? "auto" : "none",
      }}
      className="fixed bottom-6 left-6 z-40 flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-4 py-2 backdrop-blur-xl transition-colors hover:bg-white/10"
    >
      <motion.span
        aria-hidden
        animate={{ y: [0, 4, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <ArrowDown className="h-3.5 w-3.5" strokeWidth={1.5} />
      </motion.span>
      <span className="text-[10px] uppercase tracking-[0.3em] text-foreground/90">
        Scroll
      </span>
    </motion.button>
  );
}
