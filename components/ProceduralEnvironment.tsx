"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

type Props = { intensity?: number };

/**
 * Procedural IBL for mobile — no download, no HDR file. Three.js's built-in
 * RoomEnvironment produces a synthetic indoor scene with lights;
 * PMREMGenerator bakes it into a cubemap that materials read for
 * reflections. ~5kB JS, ~30-80ms one-time bake. Replaces the studio HDR
 * (~500kB-1MB download) on mobile so LCP stays fast while the lens glass
 * still gets glossy reflections.
 */
export default function ProceduralEnvironment({ intensity = 1.0 }: Props) {
  const { gl, scene } = useThree();

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const envScene = new RoomEnvironment();
    const envMap = pmrem.fromScene(envScene, 0.04).texture;
    scene.environment = envMap;
    (scene as unknown as { environmentIntensity: number }).environmentIntensity = intensity;
    return () => {
      envMap.dispose();
      pmrem.dispose();
      scene.environment = null;
    };
  }, [gl, scene, intensity]);

  return null;
}
