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
  setCursorMode: (mode: CursorMode) => void;
  setCursorText: (text: string) => void;
}

const CursorContext = createContext<CursorContextValue | null>(null);

interface CursorProviderProps {
  children: ReactNode;
}

/**
 * Global cursor controller. Components call `useCursor()` to read or mutate
 * the current mode + label; the visual layer subscribes to changes via the
 * `<CustomCursor />` consumer.
 */
export function CursorProvider({ children }: CursorProviderProps) {
  const [mode, setMode] = useState<CursorMode>("default");
  const [text, setText] = useState<string>("");

  const setCursorMode = useCallback((next: CursorMode) => {
    setMode(next);
  }, []);

  const setCursorText = useCallback((next: string) => {
    setText(next);
  }, []);

  const value = useMemo(
    () => ({ mode, text, setCursorMode, setCursorText }),
    [mode, text, setCursorMode, setCursorText],
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
