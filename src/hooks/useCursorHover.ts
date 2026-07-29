"use client";

import { useCallback } from "react";
import { useCursor, type CursorMode } from "@/context/CursorContext";

interface CursorHoverOptions {
  mode?: CursorMode;
  text?: string;
  image?: string | null;
  imageCaption?: string;
}

/**
 * Returns memoised pointer enter/leave handlers that flip cursor mode,
 * label, and floating image together. Spread onto any JSX element:
 *
 *   <div {...useCursorHover({ mode: "hover-project", text: "View",
 *                                image: project.coverImage, imageCaption: project.title })} />
 */
export function useCursorHover({
  mode = "default",
  text,
  image,
  imageCaption,
}: CursorHoverOptions = {}) {
  const { setCursorMode, setCursorText, setHoverImage } = useCursor();

  const onEnter = useCallback(() => {
    setCursorMode(mode);
    if (text !== undefined) setCursorText(text);
    if (image !== undefined) setHoverImage(image, imageCaption);
  }, [mode, text, image, imageCaption, setCursorMode, setCursorText, setHoverImage]);

  const onLeave = useCallback(() => {
    setCursorMode("default");
    setCursorText("");
    setHoverImage(null, "");
  }, [setCursorMode, setCursorText, setHoverImage]);

  return { onPointerEnter: onEnter, onPointerLeave: onLeave };
}
