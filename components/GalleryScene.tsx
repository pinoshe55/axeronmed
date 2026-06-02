"use client";

import { Suspense, useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import * as THREE from "three";

/* ── tek bir GLB'yi yükleyip normalize eden alt bileşen ─────────── */
function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);

  const normalized = (() => {
    const cloned = scene.clone(true);
    const box = new THREE.Box3().setFromObject(cloned);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    // 1.6 ile çarp → modeli canvas'ı dolduracak boyuta getir
    const fit = 3.6 / maxDim;
    cloned.position.sub(center).multiplyScalar(fit);
    cloned.scale.setScalar(fit);
    cloned.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((m) => {
        const std = m as THREE.MeshStandardMaterial;
        std.transparent = false;
        std.opacity = 1;
        std.depthWrite = true;
        std.side = THREE.FrontSide;
        std.needsUpdate = true;
      });
    });
    return cloned;
  })();

  return <primitive object={normalized} />;
}

/* ── placeholder: GLB yokken gösterilen tel kafes kutu ──────────── */
function Placeholder() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#cccccc" wireframe />
    </mesh>
  );
}

/* ── hata sınırı: useGLTF 404 fırlatırsa placeholder'a düşer ───── */
import { Component, ReactNode } from "react";
class ModelErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  render() {
    return this.state.error ? this.props.fallback : this.props.children;
  }
}

/* ── tek kart canvas ────────────────────────────────────────────── */
export default function GalleryScene({ modelUrl }: { modelUrl: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 0.95;
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      style={{ pointerEvents: "auto" }}
    >
      <ambientLight intensity={0.3} />
      <directionalLight position={[-4, 3, 4]} intensity={1.4} />
      <directionalLight position={[4, 1, 3]} intensity={0.5} />

      <Suspense fallback={<Placeholder />}>
        <Environment preset="studio" environmentIntensity={1.1} />
        <ModelErrorBoundary fallback={<Placeholder />}>
          <Model url={modelUrl} />
        </ModelErrorBoundary>
      </Suspense>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={!hovered}
        autoRotateSpeed={1.8}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.6}
      />
    </Canvas>
  );
}
