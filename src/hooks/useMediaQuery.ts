"use client";

import { useEffect, useState } from "react";

interface UseMediaQueryOptions {
  defaultValue?: boolean;
  initializeWithValue?: boolean;
}

/**
 * Reactive media query hook. Returns `undefined` during SSR when
 * `initializeWithValue` is false, otherwise the resolved boolean.
 */
export function useMediaQuery(
  query: string,
  { defaultValue = false, initializeWithValue = true }: UseMediaQueryOptions = {},
): boolean | undefined {
  const [matches, setMatches] = useState<boolean | undefined>(() =>
    initializeWithValue ? evaluate(query) : undefined,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    setMatches(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches ?? defaultValue;
}

function evaluate(query: string): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(query).matches;
}
