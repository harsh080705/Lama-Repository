"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Cursor states — one visual mapping per state in <CustomCursor />.
 *
 *   default         → minimal white dot
 *   hover-button    → electric-lime dot at 1.6× (CTA / link)
 *   hover-project   → expanded rounded pill badge "VIEW PROJECT →"
 *   hover-preview   → floating thumbnail card (+20/+20 from pointer)
 */
export type CursorMode =
  | "default"
  | "hover-button"
  | "hover-project"
  | "hover-preview";

interface CursorContextValue {
  mode: CursorMode;
  /** URL rendered inside the hover-preview thumbnail. */
  previewImage: string | null;
  /** Optional caption rendered beneath the thumbnail. */
  previewCaption: string;
  /** Badge text rendered inside the hover-project pill. */
  projectLabel: string;
  setCursorMode: (mode: CursorMode) => void;
  setPreviewImage: (url: string | null) => void;
  setPreviewCaption: (caption: string) => void;
  setProjectLabel: (label: string) => void;
  /** Wipe mode + image + caption + label — call from every onPointerLeave. */
  reset: () => void;
}

const CursorContext = createContext<CursorContextValue | null>(null);

interface CursorProviderProps {
  children: ReactNode;
}

export function CursorProvider({ children }: CursorProviderProps) {
  const [mode, setMode] = useState<CursorMode>("default");
  const [previewImage, setPreviewImageState] = useState<string | null>(null);
  const [previewCaption, setPreviewCaptionState] = useState<string>("");
  const [projectLabel, setProjectLabelState] = useState<string>("");

  const setCursorMode = useCallback((next: CursorMode) => {
    setMode(next);
  }, []);

  const setPreviewImage = useCallback((url: string | null) => {
    setPreviewImageState(url);
  }, []);

  const setPreviewCaption = useCallback((caption: string) => {
    setPreviewCaptionState(caption);
  }, []);

  const setProjectLabel = useCallback((label: string) => {
    setProjectLabelState(label);
  }, []);

  const reset = useCallback(() => {
    setMode("default");
    setPreviewImageState(null);
    setPreviewCaptionState("");
    setProjectLabelState("");
  }, []);

  const value = useMemo<CursorContextValue>(
    () => ({
      mode,
      previewImage,
      previewCaption,
      projectLabel,
      setCursorMode,
      setPreviewImage,
      setPreviewCaption,
      setProjectLabel,
      reset,
    }),
    [mode, previewImage, previewCaption, projectLabel, setCursorMode, setPreviewImage, setPreviewCaption, setProjectLabel, reset],
  );

  return <CursorContext.Provider value={value}>{children}</CursorContext.Provider>;
}

export function useCursor(): CursorContextValue {
  const context = useContext(CursorContext);
  if (!context) {
    throw new Error("useCursor must be used within CursorProvider");
  }
  return context;
}
