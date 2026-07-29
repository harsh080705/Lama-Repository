"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
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

  const mouseX = useMotionValue(-400);
  const mouseY = useMotionValue(-400);

  // Snappy, near-instant tracking — the preview must not drag behind the
  // pointer. Tuned to feel like a 1:1 follow while still spring-smoothed
  // (so micro-jitter is absorbed).
  const x = useSpring(mouseX, { stiffness: 400, damping: 28, mass: 0.3 });
  const y = useSpring(mouseY, { stiffness: 400, damping: 28, mass: 0.3 });
  const tilt = useVelocityTilt(mouseX);
  const rotateZ = useTransform(tilt, (v) => `${v.toFixed(2)}deg`);

  useEffect(() => {
    if (!enabled) return;
    const onMove = (e: PointerEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled, mouseX, mouseY]);

  // AnimatePresence drives the exit transition — no setTimeout, no race.
  // `key` is the URL so swapping projects re-mounts with a fresh entry tween.
  // Critically: pointer-leave sets hoverImage = null synchronously via the
  // hook, and AnimatePresence handles the rest. There is no deferred
  // setState that can be cancelled by a rapid re-hover and leave a stale
  // image rendered.
  if (!enabled) return null;

  return (
    <AnimatePresence>
      {hoverImage && (
        <motion.div
          key={hoverImage}
          aria-hidden
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
          transition={{
            opacity: { duration: 0.2 },
            scale: { type: "spring", stiffness: 260, damping: 24, mass: 0.5 },
          }}
          style={{ translateX: x, translateY: y, rotate: rotateZ }}
          className="pointer-events-none fixed left-0 top-0 z-[9998] -translate-x-1/2 -translate-y-1/2"
        >
          <div className="relative h-44 w-64 overflow-hidden rounded-2xl border border-white/15 bg-surface shadow-2xl shadow-black/50 md:h-56 md:w-80">
            <Image
              src={hoverImage}
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
      )}
    </AnimatePresence>
  );
}
