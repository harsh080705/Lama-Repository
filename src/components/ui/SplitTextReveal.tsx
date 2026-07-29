"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type SplitMode = "lines" | "words" | "chars";

interface SplitTextRevealProps {
  text: string;
  /** How to split the string. "lines" splits on \n, "words" preserves whitespace, "chars" splits every character. */
  mode?: SplitMode;
  /** Per-element stagger in seconds. */
  stagger?: number;
  /** Total reveal duration in seconds. */
  duration?: number;
  /** ScrollTrigger start. Default: "top 80%". */
  start?: string;
  /** Y offset the text travels from (px). Default: 20. */
  y?: number;
  /** Inline-block by default; flip for full-width blocks. */
  inline?: boolean;
  className?: string;
  chunkClassName?: string;
}

function chunkText(text: string, mode: SplitMode): string[] {
  if (mode === "chars") return Array.from(text);
  if (mode === "words") return text.split(/(\s+)/);
  return text.split("\n");
}

/**
 * Splits a string into chunks (lines / words / chars) and reveals each
 * with a staggered y + opacity tween as it enters the viewport.
 */
export default function SplitTextReveal({
  text,
  mode = "lines",
  stagger = 0.06,
  duration = 0.9,
  start = "top 80%",
  y = 20,
  inline = true,
  className,
  chunkClassName,
}: SplitTextRevealProps) {
  const containerRef = useRef<HTMLParagraphElement | null>(null);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      gsap.set(el.querySelectorAll("[data-reveal]"), { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      const chunks = el.querySelectorAll<HTMLElement>("[data-reveal]");
      gsap.fromTo(
        chunks,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration,
          stagger,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start,
            once: true,
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [text, mode, stagger, duration, start, y]);

  const chunks = chunkText(text, mode);
  const nodes: ReactNode[] = [];

  chunks.forEach((chunk, i) => {
    const isLast = i === chunks.length - 1;
    nodes.push(
      <span
        key={`${mode}-${i}`}
        data-reveal
        className={chunkClassName}
        style={{
          display: inline ? "inline-block" : "block",
          willChange: "transform, opacity",
        }}
      >
        {chunk === "" ? "\u00A0" : chunk}
        {mode === "lines" && !isLast ? "\u00A0" : null}
      </span>,
    );
  });

  return (
    <p ref={containerRef} className={className}>
      {nodes}
    </p>
  );
}
