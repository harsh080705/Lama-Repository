"use client";

import { useEffect, useRef, useState } from "react";

interface MouseParallaxOptions {
  /** How much the cursor tilt/position translates into rotation/translation. */
  intensity?: number;
  /** Easing factor for the lerp (lower = smoother/slower). */
  smoothing?: number;
}

interface MouseParallaxReturn {
  /** Normalised tilt derived from cursor offset, in [-1, 1] range. */
  tilt: { x: number; y: number };
  /** Normalised world position offset derived from cursor, in [-1, 1] range. */
  position: { x: number; y: number };
}

/**
 * Tracks the cursor across the viewport and exposes eased tilt + offset values
 * that can be fed into a Three.js object for parallax motion. Values are
 * normalised so the consumer can scale `intensity` themselves.
 */
export function useMouseParallax({
  intensity = 0.35,
  smoothing: _smoothing = 0.08,
}: MouseParallaxOptions = {}): MouseParallaxReturn {
  const targetRef = useRef({ x: 0, y: 0 });
  const [state, setState] = useState<MouseParallaxReturn>({
    tilt: { x: 0, y: 0 },
    position: { x: 0, y: 0 },
  });

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -((e.clientY / window.innerHeight) * 2 - 1);
      targetRef.current = { x, y };
    };

    window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      setState((prev) => ({
        tilt: {
          x: lerp(prev.tilt.x, targetRef.current.x, _smoothing),
          y: lerp(prev.tilt.y, targetRef.current.y, _smoothing),
        },
        position: {
          x: lerp(prev.position.x, targetRef.current.x * intensity, _smoothing),
          y: lerp(prev.position.y, targetRef.current.y * intensity, _smoothing),
        },
      }));
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [intensity, _smoothing]);

  return state;
}
