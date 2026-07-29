"use client";

import { useEffect } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useCursor } from "@/context/CursorContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";

/** Electric Green */
const ACCENT_RGB = "0, 255, 0";

/**
 * Decides whether to mount the kinetic cursor at all. Touch devices,
 * coarse pointers, and reduced-motion users keep the native OS cursor.
 */
function useCursorEnabled() {
  const coarse = useMediaQuery("(pointer: coarse)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  if (coarse === undefined || reducedMotion === undefined) return false;
  return !coarse && !reducedMotion;
}

/**
 * `true` for any cursor mode that should hide the outer ring entirely and
 * snap the inner dot to electric lime at 1.5× scale.
 */
function isClickableTarget(mode: string, hoverImage: string | null): boolean {
  if (mode === "hover-button" || mode === "hover-link") return true;
  if (mode === "hover-project") return Boolean(hoverImage); // image already covers visual identity
  return false;
}

export default function CustomCursor() {
  const enabled = useCursorEnabled();
  const { mode, hoverImage } = useCursor();

  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);

  // Tight, low-latency inner dot.
  const dotX = useSpring(mouseX, { stiffness: 1200, damping: 60, mass: 0.2 });
  const dotY = useSpring(mouseY, { stiffness: 1200, damping: 60, mass: 0.2 });

  // Slower outer ring (only rendered in the default cursor state).
  const ringX = useSpring(mouseX, { stiffness: 220, damping: 24, mass: 0.6 });
  const ringY = useSpring(mouseY, { stiffness: 220, damping: 24, mass: 0.6 });

  const ringScale = useMotionValue(1);
  const ringScaleSpring = useSpring(ringScale, { stiffness: 280, damping: 24 });
  const ringOpacity = useMotionValue(1);
  const ringOpacitySpring = useSpring(ringOpacity, { stiffness: 300, damping: 30 });

  const dotScale = useMotionValue(1);
  const dotScaleSpring = useSpring(dotScale, { stiffness: 400, damping: 25 });

  // Dot colour — solid lime on clickables, soft white otherwise. Hard swap
  // (not interpolated) because the spec asks for an instant accent state.
  const dotColor = useMotionValue<string>("rgba(237,237,237,1)");
  const dotColorSpring = useSpring(
    dotColor,
    { stiffness: 400, damping: 30 },
  );

  useEffect(() => {
    if (!enabled) return;

    const onMove = (e: PointerEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    const onLeave = () => {
      ringScale.set(0);
      ringOpacity.set(0);
      dotScale.set(0);
    };
    const onEnter = () => {
      ringScale.set(1);
      ringOpacity.set(1);
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
  }, [enabled, mouseX, mouseY, ringScale, ringOpacity, dotScale]);

  // Mode-driven targets.
  useEffect(() => {
    if (!enabled) return;
    const clickable = isClickableTarget(mode, hoverImage);

    switch (mode) {
      case "hidden":
        ringScale.set(0);
        ringOpacity.set(0);
        dotScale.set(0);
        break;
      case "hover-project":
        // Image-active: ring fully hidden, dot becomes a vivid accent marker.
        if (clickable) {
          ringScale.set(1);
          ringOpacity.set(0); // visible ring element won't draw anyway (opacity 0)
          dotScale.set(1.5);
          dotColor.set(`rgba(${ACCENT_RGB},1)`);
        } else {
          // No image: keep a slim accent ring.
          ringScale.set(1.3);
          ringOpacity.set(1);
          dotScale.set(1.4);
          dotColor.set(`rgba(${ACCENT_RGB},1)`);
        }
        break;
      case "hover-button":
        ringScale.set(1);
        ringOpacity.set(0); // hide ring
        dotScale.set(1.5); // crisp click target
        dotColor.set(`rgba(${ACCENT_RGB},1)`);
        break;
      case "hover-link":
        ringScale.set(1);
        ringOpacity.set(0); // hide ring
        dotScale.set(1.5);
        dotColor.set(`rgba(${ACCENT_RGB},1)`);
        break;
      default:
        ringScale.set(1);
        ringOpacity.set(1);
        dotScale.set(1);
        dotColor.set("rgba(237,237,237,1)");
    }
  }, [mode, hoverImage, enabled, ringScale, ringOpacity, dotScale, dotColor]);

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

  // Render ring only when opacity > 0.001 (i.e. not in a clickable state).
  const ringVisible = ringOpacitySpring.get() > 0.001;

  return (
    <>
      {ringVisible && (
        <motion.div
          aria-hidden
          style={{
            translateX: ringX,
            translateY: ringY,
            scale: ringScaleSpring,
            opacity: ringOpacitySpring,
            top: -14,
            left: -14,
          }}
          className="pointer-events-none fixed z-[9999] h-7 w-7 rounded-full border border-white/35"
        />
      )}

      <motion.div
        aria-hidden
        style={{
          translateX: dotX,
          translateY: dotY,
          scale: dotScaleSpring,
          backgroundColor: dotColorSpring,
          top: -6,
          left: -6,
          boxShadow:
            mode === "hover-project" && hoverImage
              ? `0 0 18px rgba(${ACCENT_RGB},0.55)`
              : `0 0 0 rgba(0,0,0,0)`,
        }}
        className="pointer-events-none fixed z-[9999] h-3 w-3 rounded-full"
      />
    </>
  );
}
