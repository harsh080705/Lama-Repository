"use client";

import { useCallback, useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/cn";

/**
 * High-performance text scramble / decode effect.
 *
 * - rAF-driven animation mutates `textContent` on pre-rendered char spans
 *   directly — zero React re-renders during the animation, so it stays at
 *   60fps even in scroll-heavy sections.
 * - Characters lock their layout box (`inline-block` + tabular-nums), and
 *   callers should pair this with `font-mono` when the surrounding text
 *   isn't already monospaced, to guarantee zero layout shift/jitter while
 *   symbols shuffle.
 * - Decodes sequentially left → right (`speed` ms per character), with the
 *   unresolved tail reshuffling every `scrambleSpeed` ms.
 * - Triggers on scroll-into-view (once) and optionally re-arms on hover.
 * - Respects `prefers-reduced-motion`: renders the final text, no animation.
 * - A11y: the container exposes `role="text"` + `aria-label` so screen
 *   readers announce the real value, never the scrambled glyphs.
 */

const CHARSET =
  "!@#$%^&*()_+-=[]{}|;:,.<>?0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

interface ScrambleTextProps {
  text: string;
  /** Milliseconds per character revealed (lower = faster). Default 50. */
  speed?: number;
  /** Milliseconds between symbol reshuffles (lower = faster). Default 30. */
  scrambleSpeed?: number;
  /** Re-trigger the decode on pointer enter and re-arm on pointer leave. */
  triggerOnHover?: boolean;
  className?: string;
}

export default function ScrambleText({
  text,
  speed = 50,
  scrambleSpeed = 30,
  triggerOnHover = false,
  className,
}: ScrambleTextProps) {
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const phaseRef = useRef<"idle" | "decoding">("idle");
  const reducedRef = useRef(false);

  // Latest params live in a ref so the rAF loop never captures stale values.
  const paramsRef = useRef({ speed, scrambleSpeed });
  paramsRef.current = { speed, scrambleSpeed };

  /** Iterate the pre-rendered char spans in text order. */
  const forEachChar = useCallback(
    (fn: (el: HTMLSpanElement, index: number) => void) => {
      const root = rootRef.current;
      if (!root) return;
      let index = 0;
      root.childNodes.forEach((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        const el = node as HTMLElement;
        if (el.dataset.char === undefined) return;
        fn(el as HTMLSpanElement, index);
        index += 1;
      });
    },
    [],
  );

  const setFullText = useCallback(() => {
    forEachChar((el, i) => {
      el.textContent = text[i] === " " ? "\u00A0" : text[i];
    });
  }, [forEachChar, text]);

  const scrambleAll = useCallback(() => {
    forEachChar((el, i) => {
      el.textContent =
        text[i] === " "
          ? "\u00A0"
          : CHARSET[Math.floor(Math.random() * CHARSET.length)];
    });
  }, [forEachChar, text]);

  const stopAnimation = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    phaseRef.current = "idle";
  }, []);

  /** Seed all glyphs with random symbols, then decode left → right. */
  const runDecode = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;

    if (reducedRef.current) {
      setFullText();
      return;
    }

    stopAnimation();

    const chars: HTMLSpanElement[] = [];
    forEachChar((el, i) => {
      chars.push(el);
      el.textContent =
        text[i] === " "
          ? "\u00A0"
          : CHARSET[Math.floor(Math.random() * CHARSET.length)];
    });
    if (chars.length === 0) return;

    const { speed: spd, scrambleSpeed: sspd } = paramsRef.current;
    const startedAt = performance.now();
    let lastShuffle = 0;
    let revealed = 0;
    phaseRef.current = "decoding";

    const tick = (now: number) => {
      if (phaseRef.current !== "decoding") return;

      const elapsed = now - startedAt;
      const nextRevealed = Math.min(
        chars.length,
        Math.floor(elapsed / Math.max(1, spd)),
      );
      const shuffleBucket = Math.floor(elapsed / Math.max(1, sspd));

      // Every `scrambleSpeed` ms, re-shuffle the unresolved tail.
      if (shuffleBucket > lastShuffle) {
        lastShuffle = shuffleBucket;
        for (let i = nextRevealed; i < chars.length; i++) {
          if (text[i] === " ") continue;
          chars[i].textContent =
            CHARSET[Math.floor(Math.random() * CHARSET.length)];
        }
      }

      // Commit newly revealed chars, left → right.
      if (nextRevealed > revealed) {
        for (let i = revealed; i < nextRevealed; i++) {
          chars[i].textContent = text[i] === " " ? "\u00A0" : text[i];
        }
        revealed = nextRevealed;
      }

      if (revealed >= chars.length) {
        setFullText();
        phaseRef.current = "idle";
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [forEachChar, setFullText, stopAnimation, text]);

  const onPointerLeave = useCallback(() => {
    stopAnimation();
    scrambleAll();
  }, [scrambleAll, stopAnimation]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    reducedRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedRef.current) {
      setFullText();
      return;
    }

    // Scroll-triggered elements park in scrambled state so the in-view
    // decode reads as a reveal. Hover-only elements start at the final
    // text and decode on pointer enter.
    if (triggerOnHover) {
      setFullText();
    } else {
      scrambleAll();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            runDecode();
            observer.disconnect();
            break;
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.2 },
    );
    observer.observe(root);

    return () => {
      observer.disconnect();
      stopAnimation();
    };
  }, [runDecode, scrambleAll, setFullText, stopAnimation, triggerOnHover]);

  return (
    <span
      ref={rootRef}
      role="text"
      aria-label={text}
      aria-live="off"
      onPointerEnter={triggerOnHover ? runDecode : undefined}
      onPointerLeave={triggerOnHover ? onPointerLeave : undefined}
      className={cn("inline-block whitespace-pre", className)}
    >
      {Array.from(text).map((char, i) => (
        <span
          key={i}
          data-char
          aria-hidden
          className="inline-block"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}