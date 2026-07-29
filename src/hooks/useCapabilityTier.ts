"use client";

import { useEffect, useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export interface CapabilityTier {
  tier: "low" | "mid" | "high";
  glassSamples: number;
  glassResolution: number;
  knotTubularSegments: number;
  knotRadialSegments: number;
  environmentEnabled: boolean;
  useFullGlass: boolean;
}

/**
 * Detects the current device's rendering capability tier and tunes
 * expensive 3D parameters (transmission samples, env-map, geometry density)
 * to keep a stable 60fps on phones and integrated GPUs.
 */
export function useCapabilityTier(): CapabilityTier {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isLowDpr = useMediaQuery("(max-resolution: 1.5dppx)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [tier, setTier] = useState<CapabilityTier>(highTier);

  useEffect(() => {
    if (reducedMotion) {
      setTier(midTier);
      return;
    }
    if (isMobile) {
      setTier(lowTier);
      return;
    }
    if (isLowDpr) {
      setTier(midTier);
      return;
    }

    const cores = navigator.hardwareConcurrency ?? 4;
    const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 4;

    if (cores <= 4 || mem <= 2) {
      setTier(lowTier);
    } else if (cores <= 6 || mem <= 4) {
      setTier(midTier);
    } else {
      setTier(highTier);
    }
  }, [isMobile, isLowDpr, reducedMotion]);

  return tier;
}

const highTier: CapabilityTier = {
  tier: "high",
  glassSamples: 6,
  glassResolution: 512,
  knotTubularSegments: 256,
  knotRadialSegments: 64,
  environmentEnabled: true,
  useFullGlass: true,
};

const midTier: CapabilityTier = {
  tier: "mid",
  glassSamples: 4,
  glassResolution: 256,
  knotTubularSegments: 128,
  knotRadialSegments: 48,
  environmentEnabled: true,
  useFullGlass: true,
};

const lowTier: CapabilityTier = {
  tier: "low",
  glassSamples: 0,
  glassResolution: 128,
  knotTubularSegments: 64,
  knotRadialSegments: 24,
  environmentEnabled: false,
  useFullGlass: false,
};
