"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  AnimatePresence,
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
      scale.set(2.5);
    } else if (mode === "hover-project" || mode === "hover-preview") {
      scale.set(0);
    } else {
      scale.set(1);
    }
  }, [mode, scale]);

  const isLime = mode === "hover-button";

  return (
    <motion.div
      aria-hidden
      style={{
        x,
        y,
        scale: scaleSpring,
        pointerEvents: "none",
        backgroundColor: isLime ? ACCENT : DOT_COLOR,
        // Subtle electric-lime glow on hover-button. Matches the
        // accent colour at varying alpha for the agency feel.
        boxShadow: isLime
          ? "0 0 24px rgba(190, 242, 100, 0.55), 0 0 56px rgba(190, 242, 100, 0.25)"
          : "none",
      }}
      className="pointer-events-none h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
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

  // Spec: spring-driven scale + opacity so the pill springs in when
  // `hover-project` activates and springs out when it releases. The
  // outer motion.div stays mounted during the spring-out so the
  // exit animation has something to animate.
  const scale = useMotionValue(0.15);
  const scaleSpring = useSpring(scale, { stiffness: 350, damping: 25 });

  const opacity = useMotionValue(0);
  const opacitySpring = useSpring(opacity, { stiffness: 350, damping: 25 });

  useEffect(() => {
    if (mode === "hover-project") {
      scale.set(1);
      opacity.set(1);
    } else {
      scale.set(0.15);
      opacity.set(0);
    }
  }, [mode, scale, opacity]);

  return (
    <motion.div
      aria-hidden
      style={{
        x,
        y,
        scale: scaleSpring,
        opacity: opacitySpring,
        pointerEvents: "none",
        width: 80,
        height: 80,
      }}
      // Glassmorphic — translucent lime with backdrop blur so the
      // underlying card image / text is visible through the pill. Lime
      // text + drop-shadow keeps "VIEW" crisp against any backdrop.
      className="pointer-events-none flex items-center justify-center rounded-full bg-[#bef264]/25 backdrop-blur-md border border-[#bef264]/40 font-semibold text-xs uppercase tracking-wider text-[#bef264] shadow-lg"
    >
      <AnimatePresence>
        {mode === "hover-project" && (
          <motion.span
            key="view-label"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.12 }}
            className="drop-shadow-md select-none"
          >
            VIEW
          </motion.span>
        )}
      </AnimatePresence>
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

  // `mode="wait"` ensures the previous thumbnail fully exits BEFORE the
  // next one mounts. With `key={previewImage}` bound directly on the
  // motion.div, React immediately destroys the old <img> the moment
  // `previewImage` changes — no cached/stale pixel lingers between rows.
  const isVisible = mode === "hover-preview" && Boolean(previewImage);

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key={previewImage}
          aria-hidden
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.12, ease: "easeOut" }}
          style={{
            x,
            y,
            pointerEvents: "none",
          }}
          className="pointer-events-none h-36 w-56 overflow-hidden rounded-xl border border-white/20 bg-black shadow-2xl"
        >
          <img
            src={previewImage as string}
            alt={previewCaption || "Project Preview"}
            className="h-full w-full object-cover"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function CustomCursor() {
  const enabled = useCursorEnabled();
  const { mode, setCursorMode } = useCursor();
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

  /**
   * Global "hover-button" detection. We attach a single delegated
   * pointerover/out pair to `document` and inspect the closest clickable
   * ancestor of the event target. This means we never have to add
   * onMouseEnter to every <button> / <a> / filter pill / tech tag.
   *
   * `closest(CLICKABLE_SELECTOR)` walks up the DOM tree from the target,
   * so a click on an `<svg>` inside a `<button>` still hits the button.
   *
   * `pointerover` / `pointerout` (not `mouseenter` / `mouseleave`) so we
   * get event bubbling + the relatedTarget traversal needed for safe
   * enter/leave detection across nested clickables.
   */
  useEffect(() => {
    if (!enabled || typeof document === "undefined") return;

    const CLICKABLE_SELECTOR =
      "a, button, [role='button'], input, select, textarea, label, [data-cursor='button']";

    const onOver = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (!target) return;
      // Don't clobber explicit project / preview modes — those are
      // owned by per-element handlers (ProjectRow, ProjectCard).
      if (mode === "hover-project" || mode === "hover-preview") return;
      if (target.closest(CLICKABLE_SELECTOR)) {
        setCursorMode("hover-button");
      }
    };

    const onOut = (event: PointerEvent) => {
      const target = event.target as Element | null;
      const related = event.relatedTarget as Element | null;
      if (!target) return;
      // Same carve-out — explicit project / preview handlers own their leave.
      if (mode === "hover-project" || mode === "hover-preview") return;
      // Only reset if both the target AND the related target are
      // outside clickables — otherwise we're just moving between two
      // buttons and the hover state should persist.
      const fromClickable = target.closest(CLICKABLE_SELECTOR);
      const toClickable = related ? related.closest(CLICKABLE_SELECTOR) : null;
      if (fromClickable && !toClickable) {
        setCursorMode("default");
      }
    };

    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onOut);

    return () => {
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
    };
  }, [enabled, setCursorMode, mode]);

  if (!enabled || !mounted || !hasMoved) return null;

  const cursorLayer = (
    <div
      aria-hidden
      className="pointer-events-none overflow-visible"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 9999,
        pointerEvents: "none",
        opacity: hasMoved ? 1 : 0,
        width: "100vw",
        height: "100vh",
      }}
    >
      <CursorDot x={dotX} y={dotY} />
      {/* CursorProjectPill self-manages its mount lifecycle via an
          internal <AnimatePresence>, so the glassmorphic pill springs
          in on hover-project and springs out on default. */}
      <CursorProjectPill x={pillX} y={pillY} />
      <CursorPreview x={previewX} y={previewY} />
    </div>
  );

  if (typeof document === "undefined" || !document.body) return null;

  return createPortal(cursorLayer, document.body);
}
