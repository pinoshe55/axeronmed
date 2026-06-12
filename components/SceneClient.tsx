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
  const { overrides } = useContent();
  const unlockedRef = useRef(false);

  const isVideo = overrides.heroMediaType === "video" && !!overrides.heroVideoPath;

  // Video mode: unlock scroll/loading screen once media type is known
  useEffect(() => {
    if (isVideo && !unlockedRef.current) {
      unlockedRef.current = true;
      markTexturesReady();
      unlockScroll();
    }
  }, [isVideo]);

  // Still waiting for overrides to load from server — show nothing (loading screen stays)
  if (!overrides.heroMediaType) return null;

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
