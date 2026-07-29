"use client";

import { useCallback, useRef } from "react";
import { useCursor, type CursorMode } from "@/context/CursorContext";

interface CursorHoverOptions {
  mode?: CursorMode;
  text?: string;
  image?: string | null;
  imageCaption?: string;
  /** If true, pointer-leave does NOT immediately null the image — it waits
   *  for a sibling `onEnter` to cancel it. Useful when hoverables are
   *  visually adjacent (e.g. adjacent project cards). Default false so
   *  the cursor image clears instantly on mouse-out, matching the spec. */
  bridge?: boolean;
  /** Bridge window in ms — only used when `bridge: true`. Default 60ms. */
  bridgeWindowMs?: number;
}

/**
 * Returns memoised pointer enter/leave handlers that flip cursor mode,
 * label, and floating image together. Spread onto any JSX element:
 *
 *   <div {...useCursorHover({ mode: "hover-project", text: "View",
 *                                image: project.coverImage, imageCaption: project.title })} />
 *
 * Default behaviour is "instant": pointer-leave immediately nulls the
 * image so the floating preview can never get stuck. If `bridge: true`
 * is passed, a short delay allows a sibling enter to cancel the leave —
 * only useful for tightly-packed hoverables.
 */
export function useCursorHover({
  mode = "default",
  text,
  image,
  imageCaption,
  bridge = false,
  bridgeWindowMs = 60,
}: CursorHoverOptions = {}) {
  const { setCursorMode, setCursorText, setHoverImage } = useCursor();
  const leaveTimer = useRef<number | null>(null);
  const token = useRef(0);

  const reset = useCallback(() => {
    setCursorMode("default");
    setCursorText("");
    setHoverImage(null, "");
  }, [setCursorMode, setCursorText, setHoverImage]);

  const onEnter = useCallback(() => {
    if (leaveTimer.current !== null) {
      window.clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
    token.current += 1;
    setCursorMode(mode);
    if (text !== undefined) setCursorText(text);
    if (image !== undefined) setHoverImage(image, imageCaption);
  }, [mode, text, image, imageCaption, setCursorMode, setCursorText, setHoverImage]);

  const onLeave = useCallback(() => {
    if (leaveTimer.current !== null) {
      window.clearTimeout(leaveTimer.current);
    }

    if (!bridge) {
      // Instant clear — the spec: "instantly set hoverImage to null on
      // onMouseLeave without delay".
      reset();
      return;
    }

    const currentToken = token.current;
    leaveTimer.current = window.setTimeout(() => {
      if (currentToken !== token.current) return; // sibling enter cancelled
      leaveTimer.current = null;
      reset();
    }, bridgeWindowMs);
  }, [bridge, bridgeWindowMs, reset]);

  return { onPointerEnter: onEnter, onPointerLeave: onLeave };
}
