"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useSpring,
  type MotionValue,
} from "framer-motion";
import { useCursor } from "@/context/CursorContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";

/**
 * Kinetic cursor with four behaviour modes:
 *   default         → small white dot + trailing ring
 *   hover-button    → lime dot, ring hidden
 *   hover-project   → pill badge "VIEW PROJECT →"
 *   hover-preview   → floating thumbnail card offset from the pointer
 *
 * The cursor stays hidden until the pointer has moved at least once,
 * which avoids the initial jump/flicker on first paint.
 */

const KINETIC_CLASS = "cursor-kinetic-active";
const ACCENT = "#bef264";
const DOT_COLOR = "#ededed";

function useCursorEnabled() {
  const coarse = useMediaQuery("(pointer: coarse)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  if (coarse === undefined || reducedMotion === undefined) return false;
  return !coarse && !reducedMotion;
}

function CursorDot({ x, y }: { x: MotionValue<number>; y: MotionValue<number> }) {
  const { mode } = useCursor();
  const scale = useMotionValue(1);
  const scaleSpring = useSpring(scale, { stiffness: 400, damping: 25 });

  useEffect(() => {
    if (mode === "hover-button") {
      scale.set(2.2);
    } else if (mode === "hover-project" || mode === "hover-preview") {
      scale.set(0);
    } else {
      scale.set(1);
    }
  }, [mode, scale]);

  return (
    <motion.div
      aria-hidden
      style={{
        x,
        y,
        scale: scaleSpring,
        pointerEvents: "none",
        backgroundColor: mode === "hover-button" ? ACCENT : DOT_COLOR,
      }}
      className="pointer-events-none h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
    />
  );
}

function CursorProjectPill({
  x,
  y,
}: {
  x: MotionValue<number>;
  y: MotionValue<number>;
}) {
  const { mode } = useCursor();
  const scale = useMotionValue(0.6);
  const scaleSpring = useSpring(scale, { stiffness: 320, damping: 26, mass: 0.4 });

  useEffect(() => {
    scale.set(mode === "hover-project" ? 1 : 0.6);
  }, [mode, scale]);

  if (mode !== "hover-project") return null;

  return (
    <motion.div
      aria-hidden
      style={{
        x,
        y,
        scale: scaleSpring,
        pointerEvents: "none",
      }}
      className="pointer-events-none flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#bef264] text-center text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-black shadow-xl"
    >
      <span>VIEW</span>
    </motion.div>
  );
}

function CursorPreview({
  x,
  y,
}: {
  x: MotionValue<number>;
  y: MotionValue<number>;
}) {
  const { mode, previewImage, previewCaption } = useCursor();
  const opacity = useMotionValue(0);
  const opacitySpring = useSpring(opacity, { stiffness: 300, damping: 22 });
  const scale = useMotionValue(0.85);
  const scaleSpring = useSpring(scale, { stiffness: 300, damping: 22 });

  useEffect(() => {
    if (mode === "hover-preview" && previewImage) {
      opacity.set(1);
      scale.set(1);
    } else {
      opacity.set(0);
      scale.set(0.85);
    }
  }, [mode, previewImage, opacity, scale]);

  if (mode !== "hover-preview" || !previewImage) return null;

  return (
    <motion.div
      aria-hidden
      style={{
        x,
        y,
        opacity: opacitySpring,
        scale: scaleSpring,
        pointerEvents: "none",
        top: 20,
        left: 20,
      }}
      className="w-52 overflow-hidden rounded-xl border border-white/20 bg-black shadow-2xl"
    >
      <div className="relative h-36 w-full bg-black">
        <Image
          src={previewImage}
          alt={previewCaption || "Project preview"}
          fill
          sizes="208px"
          className="object-cover"
        />
      </div>
      {previewCaption && (
        <div className="border-t border-white/10 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/80">
          {previewCaption}
        </div>
      )}
    </motion.div>
  );
}

export default function CustomCursor() {
  const enabled = useCursorEnabled();
  const { mode } = useCursor();
  const [hasMoved, setHasMoved] = useState(false);
  const [mounted, setMounted] = useState(false);

  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  const dotX = useSpring(cursorX, { stiffness: 800, damping: 50, mass: 0.2 });
  const dotY = useSpring(cursorY, { stiffness: 800, damping: 50, mass: 0.2 });
  const previewX = cursorX;
  const previewY = cursorY;
  const pillX = dotX;
  const pillY = dotY;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setHasMoved(false);
      return;
    }

    const onMove = (event: MouseEvent | PointerEvent) => {
      if (!hasMoved) {
        setHasMoved(true);
      }
      cursorX.set(event.clientX);
      cursorY.set(event.clientY);
    };

    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
    };
  }, [enabled, hasMoved, cursorX, cursorY]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (enabled) {
      document.documentElement.classList.add(KINETIC_CLASS);
    } else {
      document.documentElement.classList.remove(KINETIC_CLASS);
    }

    return () => {
      document.documentElement.classList.remove(KINETIC_CLASS);
    };
  }, [enabled]);

  if (!enabled || !mounted || !hasMoved) return null;

  const cursorLayer = (
    <div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[99999] h-screen w-screen overflow-visible"
      style={{ pointerEvents: "none", opacity: hasMoved ? 1 : 0 }}
    >
      <CursorDot x={dotX} y={dotY} />
      {mode === "hover-project" && <CursorProjectPill x={pillX} y={pillY} />}
      <CursorPreview x={previewX} y={previewY} />
    </div>
  );

  if (typeof document === "undefined" || !document.body) return null;

  return createPortal(cursorLayer, document.body);
}
