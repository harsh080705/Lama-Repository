"use client";

import { useCallback } from "react";
import { useCursor, type CursorMode } from "@/context/CursorContext";

interface CursorHoverOptions {
  mode: CursorMode;
  text?: string;
}

/**
 * Returns memoised pointer event handlers that flip the cursor into the
 * given mode on hover and reset it to default on leave. Designed for
 * spread directly onto a JSX element:
 *
 *   <button {...useCursorHover({ mode: "hover-button", text: "Click" })} />
 */
export function useCursorHover({ mode, text }: CursorHoverOptions) {
  const { setCursorMode, setCursorText } = useCursor();

  const onEnter = useCallback(() => {
    setCursorMode(mode);
    if (text !== undefined) setCursorText(text);
  }, [mode, text, setCursorMode, setCursorText]);

  const onLeave = useCallback(() => {
    setCursorMode("default");
    setCursorText("");
  }, [setCursorMode, setCursorText]);

  return { onPointerEnter: onEnter, onPointerLeave: onLeave };
}
