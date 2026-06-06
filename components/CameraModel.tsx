"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import { loadOverrides } from "@/lib/siteOverrides";
import {
  SCROLL_STATES,
  MOBILE_SCALE_FACTOR,
  MOBILE_POSITION_FACTOR,
} from "./scrollStates";
import {
  lockScroll,
  unlockScroll,
  markTexturesReady,
  onIntroStart,
} from "@/lib/sceneReady";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const GLASS_NAME_HINTS = [
  "glass",
  "crystal",
  "optic",
  "lens_front",
  "lensfront",
  "lens_glass",
  "lensglass",
];

function isGlassMaterial(matName: string, meshName: string): boolean {
  const n = ((matName || "") + " " + (meshName || "")).toLowerCase();
  return GLASS_NAME_HINTS.some((h) => n.includes(h));
}

type PhysicalLike = THREE.MeshStandardMaterial & {
  transmission?: number;
  thickness?: number;
};

export default function CameraModel() {
  const groupRef = useRef<THREE.Group>(null);
  const [modelPath, setModelPath] = useState("/models/camera.glb");
  const [modelScale, setModelScale] = useState(1);
  const [lightIntensity, setLightIntensity] = useState(1);
  const [lightPosition, setLightPosition] = useState<[number, number, number]>([5, 3, 5]);

  // Load model path, scale, and lighting from localStorage
  useEffect(() => {
    const overrides = loadOverrides();
    const path = overrides.modelPath || "/models/camera.glb";
    const scale = overrides.modelScale || 1;
    const intensity = overrides.lightIntensity || 1;
    const posX = overrides.lightPositionX || 5;
    const posY = overrides.lightPositionY || 3;
    const posZ = overrides.lightPositionZ || 5;
    setModelPath(path);
    setModelScale(scale);
    setLightIntensity(intensity);
    setLightPosition([posX, posY, posZ]);
  }, []);

  // Capture full GLTF (we need gltf.parser for spec-gloss texture rescue).
  // Pass Draco decoder path as second parameter
  const gltf = useGLTF(modelPath, '/draco/') as unknown as {
    scene: THREE.Object3D;
    parser: {
      json: any;
      getDependency: (type: string, index: number) => Promise<unknown>;
    };
  };

  const scene = gltf.scene;
  const { size } = useThree();

  const normalized = useMemo(() => {
    const cloned = scene.clone(true);
    const box = new THREE.Box3().setFromObject(cloned);
    const center = box.getCenter(new THREE.Vector3());
    const sizeVec = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(sizeVec.x, sizeVec.y, sizeVec.z) || 1;
    const fit = 1 / maxDim;
    cloned.position.sub(center).multiplyScalar(fit);
    cloned.scale.setScalar(fit * modelScale);

    const clonedMats = new WeakMap<THREE.Material, THREE.Material>();
    cloned.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;

      const replaceOne = (mat: THREE.Material): THREE.Material => {
        if (!mat) return mat;
        let next = clonedMats.get(mat);
        if (!next) {
          next = mat.clone();
          next.name = mat.name;
          clonedMats.set(mat, next);
        }
        const std = next as PhysicalLike;
        const glass = isGlassMaterial(mat.name, child.name);

        if (glass) {
          next.transparent = true;
          next.opacity     = 0.35;
          next.depthWrite  = false;
          next.depthTest   = true;
          next.side        = THREE.FrontSide;
          next.alphaTest   = 0;
          if ("roughness" in std) std.roughness = 0.05;
          if ("metalness" in std) std.metalness = 0;
        } else {
          next.transparent = false;
          next.opacity     = 1;
          next.depthWrite  = true;
          next.depthTest   = true;
          next.side        = THREE.FrontSide;
          next.alphaTest   = 0;
          if ("transmission" in std) std.transmission = 0;
          if ("roughness" in std) std.roughness = 0.18;
          if ("metalness" in std) std.metalness = 0.82;
          if ("color" in std && std.color instanceof THREE.Color) {
            std.color.multiplyScalar(0.28);
          }
        }
        next.needsUpdate = true;

        // Diagnostic log — useful when extending GLASS_NAME_HINTS.
        const orig = mat as PhysicalLike;
        // eslint-disable-next-line no-console
        console.log("[GLB material]", {
          mesh: child.name, material: mat.name,
          branch: glass ? "GLASS (kept transparent)" : "SOLID (forced opaque)",
          wasTransparent: mat.transparent, wasOpacity: mat.opacity,
          wasSide: mat.side, wasDepthWrite: mat.depthWrite,
          color: orig.color?.getHexString?.(),
          transmission: orig.transmission ?? 0,
          roughness: orig.roughness ?? null, metalness: orig.metalness ?? null,
          hasMap: !!orig.map, hasNormal: !!orig.normalMap,
        });
        return next;
      };

      if (Array.isArray(child.material)) {
        child.material = child.material.map(replaceOne);
      } else if (child.material) {
        child.material = replaceOne(child.material);
      }
    });
    return cloned;
  }, [scene, modelScale]);

  // Texture rescue for GLBs that use KHR_materials_pbrSpecularGlossiness.
  // Three.js dropped that extension in r152+; GLTFLoader produces a default
  // material with map=null. The pixels ARE still in the GLB's bufferViews,
  // so we ask the parser to load textures by their JSON index and wire them
  // onto the cloned materials. Skip the glass branch — lens glass stays clear.
  useEffect(() => {
    const parser = gltf.parser;
    if (!parser?.json?.materials?.length) return;

    const mat0 = parser.json.materials[0];
    const specGloss = mat0?.extensions?.KHR_materials_pbrSpecularGlossiness;
    const diffuseIdx: number | undefined = specGloss?.diffuseTexture?.index;
    const normalIdx:  number | undefined = mat0?.normalTexture?.index;

    if (typeof diffuseIdx !== "number") {
      // eslint-disable-next-line no-console
      console.warn("[CameraModel] GLB has no spec-gloss diffuseTexture; texture rescue skipped.");
      markTexturesReady();
      return;
    }

    let cancelled = false;

    Promise.all([
      parser.getDependency("texture", diffuseIdx) as Promise<THREE.Texture>,
      typeof normalIdx === "number"
        ? (parser.getDependency("texture", normalIdx) as Promise<THREE.Texture>)
        : Promise.resolve<THREE.Texture | null>(null),
    ]).then(([diffuse, normal]) => {
      if (cancelled) return;

      diffuse.colorSpace = THREE.SRGBColorSpace;
      diffuse.needsUpdate = true;
      diffuse.name ||= "DSLR_diffuse";

      if (normal) {
        normal.colorSpace = THREE.NoColorSpace;
        normal.needsUpdate = true;
        normal.name ||= "DSLR_normal";
      }

      normalized.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((m) => {
          const std = m as THREE.MeshStandardMaterial;
          if (!std) return;
          if (isGlassMaterial(std.name, child.name)) return;
          std.map = diffuse;
          if (normal) std.normalMap = normal;
          std.needsUpdate = true;
          // eslint-disable-next-line no-console
          console.log("[CameraModel] texture wired", {
            mesh: child.name, material: std.name,
            hasMap: !!std.map, mapColorSpace: std.map?.colorSpace,
            hasNormal: !!std.normalMap, color: std.color?.getHexString?.(),
          });
        });
      });

      markTexturesReady();
    });

    return () => { cancelled = true; };
  }, [gltf, normalized]);

  useLayoutEffect(() => {
    const g = groupRef.current;
    if (!g) return;
    const group = g;

    lockScroll();

    let cancelIntroSub: (() => void) | null = null;

    const ctx = gsap.context((self) => {
      const isMobile = window.matchMedia("(max-width: 1023px)").matches;
      const ps = isMobile ? MOBILE_POSITION_FACTOR : 1;
      const ss = isMobile ? MOBILE_SCALE_FACTOR    : 1;
      // Mobile-only world-Y lift: +0.3 world units ≈ 5vh up.
      const yOffset = isMobile ? 0.3 : 0;

      const hero = SCROLL_STATES[0];

      // Set the OFFSET start pose SYNCHRONOUSLY so the first paint has it
      // (useLayoutEffect runs pre-paint). Position EXACTLY at hero — no
      // X slide. Rotation Y offset = +2.5 rad (~143°): lens points roughly
      // to viewer-right at start. Scale = exactly hero.
      g.position.set(
        hero.position[0] * ps,
        hero.position[1] * ps + yOffset,
        hero.position[2] * ps
      );
      g.rotation.set(
        hero.rotation[0],
        hero.rotation[1] + 2.5,
        hero.rotation[2]
      );
      g.scale.setScalar(hero.scale * ss);

      gsap.set("[data-hero-text]", { opacity: 0, y: 22 });

      const intro = gsap.timeline({
        paused: true,
        onComplete: () => {
          unlockScroll();
          self.add(() => buildScrollTimeline());
        },
      });

      cancelIntroSub = onIntroStart(() => intro.play());

      // Turntable: rotation.y ONLY. 3.6s sine.inOut from +2.5 rad to hero.ry.
      // No position tween — the camera does not slide; it spins in place.
      intro.to(
        g.rotation,
        { y: hero.rotation[1], duration: 3.6, ease: "sine.inOut" },
        0
      );

      // Hero text stagger-reveal at 1.8s into the intro.
      intro.to(
        "[data-hero-text]",
        { opacity: 1, y: 0, stagger: 0.12, duration: 0.85, ease: "power2.out" },
        1.8
      );

      function buildScrollTimeline() {
        const tl = gsap.timeline({
          defaults: { duration: 1, ease: "none" },
          scrollTrigger: {
            trigger: "main",
            start: "top top",
            end:   "bottom bottom",
            scrub: 1.5,
            invalidateOnRefresh: true,
          },
        });

        for (let i = 1; i < SCROLL_STATES.length; i++) {
          const next = SCROLL_STATES[i];
          const at = i - 1;
          tl.to(group.position, {
            x: next.position[0] * ps,
            y: next.position[1] * ps + yOffset,
            z: next.position[2] * ps,
          }, at)
          .to(group.rotation, {
            x: next.rotation[0], y: next.rotation[1], z: next.rotation[2],
          }, at)
          .to(group.scale, {
            x: next.scale * ss, y: next.scale * ss, z: next.scale * ss,
          }, at);
        }

        ScrollTrigger.refresh();
      }
    });

    return () => {
      cancelIntroSub?.();
      unlockScroll();
      ctx.revert();
    };
  }, []);

  return (
    <group ref={groupRef} dispose={null}>
      <primitive object={normalized} />
    </group>
  );
}
