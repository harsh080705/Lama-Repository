"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CursorMode = "default" | "hover-project" | "hover-button" | "hidden";

interface CursorContextValue {
  mode: CursorMode;
  text: string;
  /** URL of the image to follow the cursor, or null to hide it. */
  hoverImage: string | null;
  /** Subtle caption rendered beneath the floating image. */
  hoverImageCaption: string;
  setCursorMode: (mode: CursorMode) => void;
  setCursorText: (text: string) => void;
  setHoverImage: (url: string | null, caption?: string) => void;
}

const CursorContext = createContext<CursorContextValue | null>(null);

interface CursorProviderProps {
  children: ReactNode;
}

/**
 * Global cursor controller. Components call `useCursor()` to read or mutate
 * the current mode, label, and floating image. The visual layer
 * (`<CustomCursor />`, `<CursorImagePreview />`) subscribes via context.
 */
export function CursorProvider({ children }: CursorProviderProps) {
  const [mode, setMode] = useState<CursorMode>("default");
  const [text, setText] = useState<string>("");
  const [hoverImage, setHoverImageState] = useState<string | null>(null);
  const [hoverImageCaption, setHoverImageCaption] = useState<string>("");

  const setCursorMode = useCallback((next: CursorMode) => {
    setMode(next);
  }, []);

  const setCursorText = useCallback((next: string) => {
    setText(next);
  }, []);

  const setHoverImage = useCallback((url: string | null, caption?: string) => {
    setHoverImageState(url);
    setHoverImageCaption(caption ?? "");
  }, []);

  const value = useMemo(
    () => ({
      mode,
      text,
      hoverImage,
      hoverImageCaption,
      setCursorMode,
      setCursorText,
      setHoverImage,
    }),
    [mode, text, hoverImage, hoverImageCaption, setCursorMode, setCursorText, setHoverImage],
  );

  return <CursorContext.Provider value={value}>{children}</CursorContext.Provider>;
}

export function useCursor(): CursorContextValue {
  const ctx = useContext(CursorContext);
  if (!ctx) {
    throw new Error("useCursor must be used inside <CursorProvider>");
  }
  return ctx;
}
