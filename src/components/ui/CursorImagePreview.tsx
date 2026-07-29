"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
 * Decides whether the floating image preview should mount at all.
 * Touch / coarse-pointer devices and reduced-motion users keep the
 * native cursor with no overlay image attached.
 */
function useFloatingPreviewEnabled() {
  const coarse = useMediaQuery("(pointer: coarse)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  if (coarse === undefined || reducedMotion === undefined) return false;
  return !coarse && !reducedMotion;
}

/**
 * Map horizontal cursor velocity to a tiny tilt angle. Reads the
 * MotionValue without subscribing to React state, so the spring still
 * runs at full framerate.
 */
function useVelocityTilt(x: MotionValue<number>) {
  const tilt = useMotionValue(0);
  const tiltSpring = useSpring(tilt, { stiffness: 220, damping: 18, mass: 0.4 });

  useEffect(() => {
    let prev = x.get();
    const unsub = x.on("change", (next) => {
      const delta = next - prev;
      prev = next;
      // Normalise: clamp delta to ±120px/sec equivalent → ±8deg tilt.
      const target = Math.max(-8, Math.min(8, delta * 0.6));
      tilt.set(target);
    });
    return () => unsub();
  }, [x, tilt]);

  return tiltSpring;
}

export default function CursorImagePreview() {
  const enabled = useFloatingPreviewEnabled();
  const { hoverImage, hoverImageCaption } = useCursor();

  // Live cursor position (no spring — used for the float x/y).
  const mouseX = useMotionValue(-400);
  const mouseY = useMotionValue(-400);

  // Lag-follow springs for the floating image — slower than the cursor
  // itself so the image visibly trails behind the pointer.
  const x = useSpring(mouseX, { stiffness: 180, damping: 22, mass: 0.6 });
  const y = useSpring(mouseY, { stiffness: 180, damping: 22, mass: 0.6 });

  // Tilt driven by horizontal velocity.
  const tilt = useVelocityTilt(mouseX);
  const rotateZ = useTransform(tilt, (v) => `${v.toFixed(2)}deg`);

  // Entry/exit spring on opacity + scale.
  const active = useMotionValue(0);
  const scale = useSpring(useTransform(active, [0, 1], [0.6, 1]), {
    stiffness: 260,
    damping: 24,
    mass: 0.5,
  });
  const opacity = useSpring(active, { stiffness: 200, damping: 28 });

  useEffect(() => {
    if (!enabled) return;
    const onMove = (e: PointerEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled, mouseX, mouseY]);

  // Drive active state from hoverImage. React state drives motion values
  // here so a null → url transition animates cleanly.
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!enabled) return;
    if (hoverImage) {
      setActiveUrl(hoverImage);
      active.set(1);
    } else {
      active.set(0);
      // Wait for the exit tween to finish before swapping the src.
      const t = window.setTimeout(() => setActiveUrl(null), 320);
      return () => window.clearTimeout(t);
    }
  }, [hoverImage, enabled, active]);

  if (!enabled || !activeUrl) return null;

  return (
    <motion.div
      aria-hidden
      style={{
        translateX: x,
        translateY: y,
        scale,
        opacity,
        rotate: rotateZ,
      }}
      className="pointer-events-none fixed left-0 top-0 z-[9998] -translate-x-1/2 -translate-y-1/2"
    >
      <div className="relative h-44 w-64 overflow-hidden rounded-2xl border border-white/15 bg-surface shadow-2xl shadow-black/50 md:h-56 md:w-80">
        <Image
          src={activeUrl}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 320px"
          quality={75}
          className="object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {hoverImageCaption && (
          <span className="absolute bottom-3 left-3 right-3 truncate text-[10px] uppercase tracking-[0.25em] text-foreground">
            {hoverImageCaption}
          </span>
        )}
      </div>
    </motion.div>
  );
}
