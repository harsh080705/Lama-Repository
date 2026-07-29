"use client";

import { Suspense } from "react";
import { Canvas, type RootState } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import GlassKnot from "./GlassKnot";
import { useCapabilityTier } from "@/hooks/useCapabilityTier";
import { WebGLErrorBoundary } from "./WebGLErrorBoundary";

function StudioLights() {
  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} color="#ffffff" />
      <directionalLight position={[-5, -2, -3]} intensity={1.2} color="#c8ff00" />
      <pointLight position={[0, 3, 2]} intensity={1} color="#ffffff" />
      <pointLight position={[0, -3, -2]} intensity={0.6} color="#a0c4ff" />
      <spotLight
        position={[6, 6, 4]}
        angle={0.35}
        penumbra={0.8}
        intensity={2}
        color="#ffffff"
      />
    </>
  );
}

function CanvasFallback() {
  return (
    <mesh>
      <torusKnotGeometry args={[1, 0.32, 64, 32, 2, 3]} />
      <meshBasicMaterial color="#1a1a1a" wireframe />
    </mesh>
  );
}

function EnvironmentOptional() {
  const cap = useCapabilityTier();
  if (!cap.environmentEnabled) return null;
  return <Environment preset="city" />;
}

/**
 * Single source of truth for WebGL context-loss handling. R3F hands us the
 * RootState in onCreated; we attach webglcontextlost/restored listeners and
 * respond defensively (stop drawing on loss, gently re-render on restore).
 */
function bindContextRecovery(state: RootState) {
  const canvas = state.gl.domElement;
  if (!canvas) return;

  const onLost = (event: Event) => {
    event.preventDefault();
    // Pause rAF-driven updates while the GPU is gone.
    state.gl.info.reset();
  };

  const onRestored = () => {
    // Force a single frame so consumers know we are back.
    state.gl.render(state.scene, state.camera);
  };

  canvas.addEventListener("webglcontextlost", onLost, false);
  canvas.addEventListener("webglcontextrestored", onRestored, false);
}

export default function HeroCanvas() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          stencil: false,
          depth: true,
        }}
        camera={{ position: [0, 0, 5], fov: 35 }}
        style={{ pointerEvents: "none" }}
        onCreated={bindContextRecovery}
        flat={false}
      >
        <color attach="background" args={["#0a0a0a"]} />
        <fog attach="fog" args={["#0a0a0a", 6, 14]} />

        <WebGLErrorBoundary fallback={<CanvasFallback />}>
          <Suspense fallback={<CanvasFallback />}>
            <StudioLights />
            <EnvironmentOptional />
            <GlassKnot />
          </Suspense>
        </WebGLErrorBoundary>
      </Canvas>
    </div>
  );
}
