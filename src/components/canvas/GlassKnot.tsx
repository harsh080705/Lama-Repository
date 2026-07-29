"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Float,
  MeshTransmissionMaterial,
  type MeshTransmissionMaterialProps,
} from "@react-three/drei";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMouseParallax } from "@/hooks/useMouseParallax";
import { useCapabilityTier } from "@/hooks/useCapabilityTier";
import * as THREE from "three";

gsap.registerPlugin(ScrollTrigger);

/**
 * Defensive frame hook. Wraps the parallax / auto-rotation logic in
 * readiness checks so a still-mounting mesh can never be mutated.
 */
function useSafeFrame(
  groupRef: React.RefObject<THREE.Group | null>,
  tilt: { x: number; y: number },
  position: { x: number; y: number },
) {
  useFrame((_state, delta) => {
    const target = groupRef.current;
    if (!target || target.parent === null) return;
    if (!Number.isFinite(delta) || delta <= 0) return;

    const dt = Math.min(delta, 0.05); // hard cap so a tab-switch can't fire a 30s step
    const tx = target.rotation.x;
    const ty = target.rotation.y;
    const px = target.position.x;
    const py = target.position.y;

    target.rotation.x += (tilt.y * 0.6 - tx) * 0.06 + dt * 0.05;
    target.rotation.y += (tilt.x * 0.6 - ty) * 0.06 + dt * 0.15;
    target.position.x += (position.x - px) * 0.08;
    target.position.y += (position.y - py) * 0.08;
  });
}

export default function GlassKnot() {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const materialDreiRef = useRef<any>(null);
  const cap = useCapabilityTier();
  const { tilt, position } = useMouseParallax({ intensity: 0.35 });

  useSafeFrame(groupRef, tilt, position);

  // Scroll-driven: shrink + push back into Z + crank distortion while the
  // user leaves the hero. Safe-target checks on every step.
  useEffect(() => {
    const target = groupRef.current;
    const material: THREE.MeshPhysicalMaterial | null =
      materialRef.current ??
      (materialDreiRef.current as THREE.MeshPhysicalMaterial | null);
    if (!target || !material) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "100% top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      tl.to(target.scale, { x: 0.55, y: 0.55, z: 0.55, ease: "none" }, 0)
        .to(target.position, { z: -3.2, x: 1.8, y: -0.6, ease: "none" }, 0)
        .to(target.rotation, { x: "+=0.8", y: "+=1.2", ease: "none" }, 0)
        .to(material, { distortion: 1.4, distortionScale: 1.1, ease: "none" }, 0)
        .to(material, { temporalDistortion: 0.6, ease: "none" }, 0);
    });

    return () => ctx.revert();
  }, []);

  const tubularSegments = cap.knotTubularSegments;
  const radialSegments = cap.knotRadialSegments;

  const fallbackProps = {
    color: "#222222",
    metalness: 0.6,
    roughness: 0.25,
    clearcoat: 0.8,
    clearcoatRoughness: 0.15,
  } satisfies Partial<MeshTransmissionMaterialProps>;

  const fullProps: MeshTransmissionMaterialProps = {
    transmission: 1,
    thickness: 1.2,
    roughness: 0.15,
    chromaticAberration: 0.06,
    anisotropy: 0.3,
    distortion: 0.4,
    distortionScale: 0.4,
    temporalDistortion: 0.15,
    ior: 1.4,
    backside: false,
    samples: Math.max(0, Math.min(cap.glassSamples, 3)),
    resolution: Math.max(64, Math.min(cap.glassResolution, 256)),
    color: "#ffffff",
    attenuationDistance: 0.5,
    attenuationColor: "#ffffff",
  };

  return (
    <group ref={groupRef}>
      <Float
        speed={1.2}
        rotationIntensity={0.3}
        floatIntensity={0.6}
        floatingRange={[-0.1, 0.1]}
      >
        <mesh castShadow receiveShadow frustumCulled={false}>
          <torusKnotGeometry
            args={[1, 0.32, tubularSegments, radialSegments, 2, 3]}
          />
          {cap.useFullGlass ? (
            <MeshTransmissionMaterial
              {...fullProps}
              ref={materialDreiRef}
            />
          ) : (
            <meshPhysicalMaterial
              {...fallbackProps}
              ref={materialRef}
            />
          )}
        </mesh>
      </Float>
    </group>
  );
}
