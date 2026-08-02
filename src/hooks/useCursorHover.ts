"use client";

import { useCallback, useRef } from "react";
import { useCursor, type CursorMode } from "@/context/CursorContext";

interface CursorHoverOptions {
  mode?: CursorMode;
  /** Image URL for hover-preview mode (thumbnail). */
  previewImage?: string | null;
  /** Caption rendered beneath the hover-preview thumbnail. */
  previewCaption?: string;
  /** Badge text for hover-project mode (pill). */
  projectLabel?: string;
  /** If true, pointer-leave does NOT immediately reset — it waits for
   *  a sibling `onEnter` to cancel the pending reset within
   *  `bridgeWindowMs`. Default false. */
  bridge?: boolean;
  bridgeWindowMs?: number;
}

/**
 * Returns memoised pointer enter/leave handlers that flip the cursor
 * mode + preview/label state together. Spread onto any JSX element:
 *
 *   <button {...useCursorHover({ mode: "hover-button" })} />
 *   <div {...useCursorHover({ mode: "hover-preview", previewImage: url, previewCaption: "Lumen" })} />
 *   <article {...useCursorHover({ mode: "hover-project", projectLabel: "View Project" })} />
 *
 * Default behaviour is "instant": pointer-leave immediately resets to
 * `default` + clears preview/label. Pass `bridge: true` for tightly-packed
 * hoverables where a sibling `onEnter` should cancel the leave.
 */
export function useCursorHover({
  mode = "default",
  previewImage,
  previewCaption,
  projectLabel,
  bridge = false,
  bridgeWindowMs = 60,
}: CursorHoverOptions = {}) {
  const { setCursorMode, setPreviewImage, setPreviewCaption, setProjectLabel, reset } =
    useCursor();
  const leaveTimer = useRef<number | null>(null);
  const token = useRef(0);

  const onEnter = useCallback(() => {
    if (leaveTimer.current !== null) {
      window.clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
    token.current += 1;
    setCursorMode(mode);
    if (previewImage !== undefined) setPreviewImage(previewImage);
    if (previewCaption !== undefined) setPreviewCaption(previewCaption);
    if (projectLabel !== undefined) setProjectLabel(projectLabel);
  }, [
    mode,
    previewImage,
    previewCaption,
    projectLabel,
    setCursorMode,
    setPreviewImage,
    setPreviewCaption,
    setProjectLabel,
  ]);

  const onLeave = useCallback(() => {
    if (leaveTimer.current !== null) {
      window.clearTimeout(leaveTimer.current);
    }

    if (!bridge) {
      reset();
      return;
    }

    const currentToken = token.current;
    leaveTimer.current = window.setTimeout(() => {
      if (currentToken !== token.current) return;
      leaveTimer.current = null;
      reset();
    }, bridgeWindowMs);
  }, [bridge, bridgeWindowMs, reset]);

  return { onPointerEnter: onEnter, onPointerLeave: onLeave };
}
