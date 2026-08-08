"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

/**
 * 3D Character Roll typography.
 *
 * Splits a string into individual letters, each wrapped in an
 * `overflow-hidden` inline-block "tile". Every tile holds two stacked
 * layers:
 *   - Primary: the visible character, rotates up & out on hover
 *     (`rotateX: 90deg`, `y: "-100%"`).
 *   - Secondary: a duplicate below, rotates in from underneath
 *     (`rotateX: 0deg`, `y: "0%"` from `rotateX: -90deg`, `y: "100%"`).
 *
 * `perspective: 600px` on the tile gives the physical tile-flip depth.
 * Letters animate with a staggered spring (`delay: index * staggerDelay`,
 * `stiffness: 300`, `damping: 20`).
 *
 * Spaces render as a fixed-width non-breaking space so the roll never
 * collapses layout.
 */

interface TextRollProps {
  children: string;
  className?: string;
  /** Per-letter stagger in seconds. Default 0.02. */
  staggerDelay?: number;
}

export default function TextRoll({
  children,
  className,
  staggerDelay = 0.02,
}: TextRollProps) {
  const chars = Array.from(children);

  return (
    <span
      className={cn("inline-flex", className)}
      aria-label={children}
      role="text"
    >
      {chars.map((char, i) => {
        const isSpace = char === " ";
        const glyph = isSpace ? "\u00A0" : char;

        return (
          <span
            key={i}
            aria-hidden
            className="inline-block overflow-hidden"
            style={{ perspective: 600 }}
          >
            <motion.span
              className="inline-block"
              style={{ transformStyle: "preserve-3d" }}
              whileHover="roll"
              initial="rest"
              animate="rest"
              variants={{
                rest: {},
                roll: {},
              }}
            >
              {/* Primary layer — flips up & out */}
              <motion.span
                className="block"
                variants={{
                  rest: { rotateX: 0, y: "0%" },
                  roll: { rotateX: 90, y: "-100%" },
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  delay: i * staggerDelay,
                }}
              >
                {glyph}
              </motion.span>

              {/* Secondary layer — flips in from below */}
              <motion.span
                className="block"
                variants={{
                  rest: { rotateX: -90, y: "100%" },
                  roll: { rotateX: 0, y: "0%" },
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  delay: i * staggerDelay,
                }}
              >
                {glyph}
              </motion.span>
            </motion.span>
          </span>
        );
      })}
    </span>
  );
}