"use client";

import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface ModelPreviewProps {
  modelPath: string;
  scale?: number;
  lightIntensity?: number;
  lightPosition?: [number, number, number];
}

function ModelContent({ modelPath, scale = 1 }: ModelPreviewProps) {
  const { scene } = useGLTF(modelPath);

  const normalized = useMemo(() => {
    const cloned = scene.clone(true);
    const box = new THREE.Box3().setFromObject(cloned);
    const center = box.getCenter(new THREE.Vector3());
    const sizeVec = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(sizeVec.x, sizeVec.y, sizeVec.z) || 1;
    const fit = 1 / maxDim;
    cloned.position.sub(center).multiplyScalar(fit);
    cloned.scale.setScalar(fit * scale);

    return cloned;
  }, [scene, scale]);

  return <primitive object={normalized} />;
}

export default function ModelPreviewCanvas({ modelPath, scale = 1, lightIntensity = 1, lightPosition = [5, 3, 5] }: ModelPreviewProps) {
  return (
    <div className="w-full h-96 bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
      <Canvas
        dpr={[0.85, 1]}
        camera={{ position: [0, 0, 3] }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "low-power",
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 0.35;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[lightPosition[0], lightPosition[1], lightPosition[2]]} intensity={1.4 * lightIntensity} />
        <directionalLight position={[-5, 2, 3]} intensity={0.6} />
        <Suspense fallback={null}>
          <ModelContent modelPath={modelPath} scale={scale} />
          <OrbitControls
            autoRotate
            autoRotateSpeed={3}
            enableZoom={true}
            enablePan={true}
            minDistance={1}
            maxDistance={5}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
