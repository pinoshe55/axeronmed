"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import CameraModel from "./CameraModel";
import ProceduralEnvironment from "./ProceduralEnvironment";
import { loadOverrides } from "@/lib/siteOverrides";

export default function Scene() {
  // ≤1023px = mobile + tablet. All expensive GPU options drop on this tier.
  const isMobile = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 1023px)").matches;
  }, []);

  const [lightIntensity, setLightIntensity] = useState(1.7);
  const [lightPosition, setLightPosition] = useState<[number, number, number]>([-6, 3, 5]);

  useEffect(() => {
    const overrides = loadOverrides();
    const intensity = overrides.lightIntensity || 1;
    const posX = overrides.lightPositionX || -6;
    const posY = overrides.lightPositionY || 3;
    const posZ = overrides.lightPositionZ || 5;
    setLightIntensity(1.7 * intensity);
    setLightPosition([posX, posY, posZ]);
  }, []);

  return (
    <Canvas
      dpr={isMobile ? [0.85, 1.1] : [1, 2]}
      gl={{
        antialias: !isMobile,
        alpha: true,
        powerPreference: isMobile ? "low-power" : "high-performance",
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = isMobile ? 0.38 : 0.42;
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
    >
      <PerspectiveCamera makeDefault position={[0, 0, 4.5]} fov={32} />
      {/* 3-light studio rig. Mobile drops the rim light to save fragment work. */}
      <ambientLight intensity={0.22} />
      <directionalLight position={lightPosition} intensity={lightIntensity} color="#ffffff" />
      <directionalLight position={[ 5, 2, 4]} intensity={0.6} color="#ffffff" />
      {!isMobile && (
        <directionalLight position={[3, 3, -6]} intensity={1.4} color="#e6efff" />
      )}
      <Suspense fallback={null}>
        {isMobile ? (
          <ProceduralEnvironment intensity={1.0} />
        ) : (
          <Environment preset="studio" environmentIntensity={1.35} />
        )}
        <CameraModel />
      </Suspense>
    </Canvas>
  );
}
