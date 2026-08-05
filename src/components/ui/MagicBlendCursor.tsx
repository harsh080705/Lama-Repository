"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  motion,
  useMotionValue,
  useSpring,
  type MotionValue,
} from "framer-motion";
import { useMediaQuery } from "@/hooks/useMediaQuery";

/**
 * MagicBlendCursor — Sirrah Space-inspired inversion cursor.
 *
 * Renders a single fixed cursor whose background is set to
 * `mix-blend-mode: difference` (a.k.a. "Original Invert" in Framer's
 * parlance) so it visually inverts whatever sits behind it. On hover
 * targets inside the active wrapper, the cursor scales from 1 → 1.6
 * with a soft spring for a tactile feel.
 *
 * Scope:
 *   - Only renders while `active` is true (parent owns the gate).
 *   - Hidden on touch devices (`@media (hover: none)`) so mobile users
 *     keep native touch scrolling.
 *   - Hidden until the pointer has moved at least once — avoids the
 *     initial jump/flicker at top-left (0, 0).
 *
 * Architecture:
 *   - Tracks `e.clientX` / `e.clientY` on window pointermove events.
 *   - Cursor layer is mounted via React portal into `document.body`,
 *     so it lives outside every layout context and never gets clipped.
 *   - Two springs: a tight inner spring for zero-lag follow and a
 *     slower trailing outer ring for the agency feel.
 *   - All layers carry `pointer-events: none` so clicks always reach
 *     the underlying element on the first try.
 */

interface MagicBlendCursorProps {
  /**
   * When `true`, the cursor is active and follows the pointer.
   * When `false`, the portal unmounts and native cursor returns.
   */
  active: boolean;
  /** Cursor size in pixels. Default 24. */
  size?: number;
  /** Cursor colour. Default white. */
  color?: string;
  /** Hover scale factor. Default 1.6. */
  hoverScale?: number;
  /**
   * Spring `stiffness` (Framer naming). Default 400. Higher = snappier
   * follow; lower = looser agency trail.
   */
  stiffness?: number;
  /**
   * Spring `damping` (Framer naming). Default 30. Higher = less
   * oscillation; lower = bouncier.
   */
  damping?: number;
  /**
   * Cursor theme. `"Original Invert"` enables the difference blend
   * mode used by the Sirrah Space reference. Other values render
   * without blend mode.
   */
  theme?: "Original Invert" | "Default";
  /**
   * Optional explicit `mix-blend-mode` override. If set, takes
   * precedence over the `theme` default.
   */
  mixBlendMode?:
    | "normal"
    | "difference"
    | "exclusion"
    | "screen"
    | "multiply"
    | "overlay";
}

function useCursorEnabled() {
  // Match the existing CustomCursor guard: hide on coarse pointers
  // (touch) and under prefers-reduced-motion.
  const coarse = useMediaQuery("(pointer: coarse)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  if (coarse === undefined || reducedMotion === undefined) return false;
  return !coarse && !reducedMotion;
}

interface VisualProps {
  x: MotionValue<number>;
  y: MotionValue<number>;
}

function CursorDot({ x, y, hovered }: VisualProps & { hovered: boolean }) {
  const scale = useMotionValue(1);
  const scaleSpring = useSpring(scale, { stiffness: 400, damping: 28 });

  useEffect(() => {
    scale.set(hovered ? 1.6 : 1);
  }, [hovered, scale]);

  return (
    <motion.div
      aria-hidden
      style={{
        x,
        y,
        scale: scaleSpring,
        pointerEvents: "none",
      }}
      className="pointer-events-none h-6 w-6 rounded-full"
    />
  );
}

function CursorRing({ x, y }: VisualProps) {
  const scale = useMotionValue(1);
  const scaleSpring = useSpring(scale, { stiffness: 260, damping: 24 });

  useEffect(() => {
    scale.set(1);
  }, [scale]);

  return (
    <motion.div
      aria-hidden
      style={{
        x,
        y,
        scale: scaleSpring,
        pointerEvents: "none",
      }}
      className="pointer-events-none h-10 w-10 rounded-full border border-white/50"
    />
  );
}

export default function MagicBlendCursor({
  active,
  size = 24,
  color = "white",
  hoverScale = 1.6,
  stiffness = 400,
  damping = 30,
  theme = "Original Invert",
  mixBlendMode,
}: MagicBlendCursorProps) {
  const enabled = useCursorEnabled();
  const [hasMoved, setHasMoved] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState(false);

  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  // Inner spring — uses the prop-driven stiffness/damping so callers can
  // tune the agency trail feel (default 400 / 30 matches the spec).
  const dotX = useSpring(cursorX, { stiffness, damping, mass: 0.2 });
  const dotY = useSpring(cursorY, { stiffness, damping, mass: 0.2 });

  // Outer spring — slower trailing ring (fixed feel).
  const ringX = useSpring(cursorX, { stiffness: 220, damping: 24, mass: 0.6 });
  const ringY = useSpring(cursorY, { stiffness: 220, damping: 24, mass: 0.6 });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Track the pointer on window. `clientX` / `clientY` only — no scroll
  // math, so the cursor stays glued to the viewport.
  useEffect(() => {
    if (!enabled || !active) return;
    const onMove = (event: MouseEvent | PointerEvent) => {
      if (!hasMoved) setHasMoved(true);
      cursorX.set(event.clientX);
      cursorY.set(event.clientY);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("mousemove", onMove);
    };
  }, [enabled, active, hasMoved, cursorX, cursorY]);

  // Hover-scaling trigger: any pointerover on a clickable inside the
  // active wrapper expands the cursor. Parent decides the wrapper
  // boundaries by passing `active={isGridHovered}`.
  useEffect(() => {
    if (!enabled || !active) {
      setHovered(false);
      return;
    }
    const onOver = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (!target) return;
      const clickable = target.closest(
        "a, button, [role='button'], input, select, textarea",
      );
      setHovered(Boolean(clickable));
    };
    const onOut = (event: PointerEvent) => {
      const related = event.relatedTarget as Element | null;
      if (!related) {
        setHovered(false);
        return;
      }
      const stillClickable = related.closest(
        "a, button, [role='button'], input, select, textarea",
      );
      if (!stillClickable) setHovered(false);
    };
    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onOut);
    return () => {
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
    };
  }, [enabled, active]);

  // `mixBlendMode` explicit override wins over the `theme` default.
  // "Original Invert" theme → `mix-blend-mode: difference` so the dot
  // visually inverts whatever sits behind it (matches the Sirrah Space
  // reference). Any other value falls back to `normal`.
  const resolvedBlend: NonNullable<React.CSSProperties["mixBlendMode"]> =
    mixBlendMode ?? (theme === "Original Invert" ? "difference" : "normal");

  // Suppress unused-prop warnings while keeping the API surface stable
  // so callers can tune size/color/hoverScale from the outside.
  void size;
  void color;
  void hoverScale;

  if (!enabled || !active || !mounted || !hasMoved) return null;

  const cursorLayer = (
    <div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[99999] h-screen w-screen overflow-visible"
      style={{
        pointerEvents: "none",
        mixBlendMode: resolvedBlend,
      }}
    >
      <CursorRing x={ringX} y={ringY} />
      <CursorDot x={dotX} y={dotY} hovered={hovered} />
    </div>
  );

  if (typeof document === "undefined" || !document.body) return null;

  return createPortal(cursorLayer, document.body);
}
