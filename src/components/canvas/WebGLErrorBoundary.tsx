"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Last-line-of-defence boundary for WebGL children. Logs to console and
 * renders a static fallback so a runtime shader / IBL error never freezes
 * the entire canvas tree.
 */
export class WebGLErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    // Surface to devtools — keep silent in prod for non-WebGL consumers.
    if (typeof console !== "undefined") {
      console.error("[WebGL] runtime error caught:", error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <mesh>
            <torusKnotGeometry args={[1, 0.32, 32, 16, 2, 3]} />
            <meshBasicMaterial color="#1a1a1a" wireframe />
          </mesh>
        )
      );
    }
    return this.props.children;
  }
}
