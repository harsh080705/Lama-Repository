"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useCursor } from "@/context/CursorContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";

/**
 * Decides whether to mount the kinetic cursor at all. Touch devices,
 * coarse pointers, and reduced-motion users all keep the native OS cursor.
 */
function useCursorEnabled() {
  const coarse = useMediaQuery("(pointer: coarse)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  // Default to false during SSR/first paint to avoid a one-frame flash of
  // `cursor: none` on devices that should be using the native cursor.
  if (coarse === undefined || reducedMotion === undefined) return false;
  return !coarse && !reducedMotion;
}

export default function CustomCursor() {
  const enabled = useCursorEnabled();
  const { mode, text } = useCursor();

  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);

  // Tight, low-latency inner dot.
  const dotX = useSpring(mouseX, { stiffness: 1200, damping: 60, mass: 0.2 });
  const dotY = useSpring(mouseY, { stiffness: 1200, damping: 60, mass: 0.2 });

  // Slower outer ring for the agency trailing feel.
  const ringX = useSpring(mouseX, { stiffness: 220, damping: 24, mass: 0.6 });
  const ringY = useSpring(mouseY, { stiffness: 220, damping: 24, mass: 0.6 });

  const ringScale = useMotionValue(1);
  const ringScaleSpring = useSpring(ringScale, { stiffness: 260, damping: 22 });

  const dotScale = useMotionValue(1);
  const dotScaleSpring = useSpring(dotScale, { stiffness: 400, damping: 25 });

  const ringBg = useTransform(
    ringScaleSpring,
    [1, 1.8],
    ["rgba(255,255,255,0.08)", "rgba(255,255,255,0.18)"],
  );
  const ringBorder = useTransform(
    ringScaleSpring,
    [1, 1.6],
    ["rgba(255,255,255,0.35)", "rgba(200,255,0,0.95)"],
  );
  const ringRadius = useTransform(ringScaleSpring, (v) => `${(v - 1) * 16 + 6}px`);
  const textOpacity = useTransform(ringScaleSpring, [1, 1.3], [0, 1]);

  useEffect(() => {
    if (!enabled) return;

    const onMove = (e: PointerEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    const onLeave = () => {
      ringScale.set(0);
      dotScale.set(0);
    };
    const onEnter = () => {
      ringScale.set(1);
      dotScale.set(1);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
    };
  }, [enabled, mouseX, mouseY, ringScale, dotScale]);

  // Apply mode → target scale, hidden by default on a frozen page.
  useEffect(() => {
    if (!enabled) return;
    switch (mode) {
      case "hidden":
        ringScale.set(0);
        dotScale.set(0);
        break;
      case "hover-project":
        ringScale.set(1.8);
        dotScale.set(0);
        break;
      case "hover-button":
        ringScale.set(1.4);
        dotScale.set(1.1);
        break;
      default:
        ringScale.set(1);
        dotScale.set(1);
    }
  }, [mode, enabled, ringScale, dotScale]);

  // Toggle the global CSS class so the page hides the native cursor only
  // while the kinetic cursor is mounted + active.
  useEffect(() => {
    const cls = "cursor-kinetic-active";
    if (enabled) {
      document.documentElement.classList.add(cls);
    } else {
      document.documentElement.classList.remove(cls);
    }
    return () => {
      document.documentElement.classList.remove(cls);
    };
  }, [enabled]);

  if (!enabled) return null;

  const isProject = mode === "hover-project";

  return (
    <>
      <motion.div
        aria-hidden
        style={{
          translateX: ringX,
          translateY: ringY,
          scale: ringScaleSpring,
          borderRadius: ringRadius,
          backgroundColor: ringBg,
          borderColor: ringBorder,
          top: -24,
          left: -24,
        }}
        className="pointer-events-none fixed z-[9999] flex h-12 w-12 items-center justify-center border backdrop-blur-md"
      >
        <motion.span
          style={{ opacity: textOpacity }}
          className="px-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground"
        >
          {text || (isProject ? "View" : "")}
        </motion.span>
      </motion.div>

      <motion.div
        aria-hidden
        style={{
          translateX: dotX,
          translateY: dotY,
          scale: dotScaleSpring,
          top: -3,
          left: -3,
        }}
        className="pointer-events-none fixed z-[9999] h-1.5 w-1.5 rounded-full bg-foreground"
      />
    </>
  );
}
