"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { loadOverrides } from "@/lib/siteOverrides";
import { markTexturesReady, unlockScroll } from "@/lib/sceneReady";

// MUST be "use client" so next/dynamic({ ssr: false }) actually code-splits.
// In Next 14 App Router, a dynamic({ ssr: false }) call from a server
// component often keeps the dynamic module in the initial chunk. Wrapping
// it in a client component creates a proper lazy chunk boundary:
// Initial First Load JS ~390kB → ~90kB

const Scene = dynamic(() => import("@/components/Scene"), {
  ssr: false,
  loading: () => null,
});

export default function SceneClient() {
  // null = overrides not loaded yet (avoids loading the heavy 3D chunk
  // when admin selected video mode)
  const [media, setMedia] = useState<{ type: "3d" | "video"; videoPath: string } | null>(null);

  useEffect(() => {
    let next: { type: "3d" | "video"; videoPath: string };
    try {
      const overrides = loadOverrides();
      next = {
        type: overrides.heroMediaType === "video" && overrides.heroVideoPath ? "video" : "3d",
        videoPath: overrides.heroVideoPath || "",
      };
    } catch {
      next = { type: "3d", videoPath: "" };
    }
    setMedia(next);

    // Video mode: the 3D pipeline (CameraModel) never mounts, so the
    // loading-screen fade and scroll unlock must be triggered here.
    if (next.type === "video") {
      markTexturesReady();
      unlockScroll();
    }
  }, []);

  if (!media) return null;

  if (media.type === "video") {
    return (
      <video
        src={media.videoPath}
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
