"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useContent } from "@/context/ContentContext";
import { markTexturesReady, unlockScroll } from "@/lib/sceneReady";

const Scene = dynamic(() => import("@/components/Scene"), {
  ssr: false,
  loading: () => null,
});

export default function SceneClient() {
  const { overrides, serverLoaded } = useContent();
  const unlockedRef = useRef(false);

  const isVideo = overrides.heroMediaType === "video" && !!overrides.heroVideoPath;

  // Video mode: unlock scroll/loading screen once media type is confirmed
  useEffect(() => {
    if (serverLoaded && isVideo && !unlockedRef.current) {
      unlockedRef.current = true;
      markTexturesReady();
      unlockScroll();
    }
  }, [serverLoaded, isVideo]);

  // Wait for Blob fetch to complete before deciding 3D vs video — prevents
  // loading the heavy 3D scene only to swap it out for video a moment later.
  if (!serverLoaded) return null;

  if (isVideo) {
    return (
      <video
        src={overrides.heroVideoPath}
        autoPlay
        muted
        loop
        playsInline
        className="w-full h-full object-cover"
      />
    );
  }

  return <Scene />;
}
