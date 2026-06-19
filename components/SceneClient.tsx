"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useContent } from "@/context/ContentContext";
import { markTexturesReady, unlockScroll } from "@/lib/sceneReady";

const Scene = dynamic(() => import("@/components/Scene"), {
  ssr: false,
  loading: () => null,
});

const CROSSFADE = 1.2; // seconds before end to begin fade

function SeamlessVideo({ src }: { src: string }) {
  const refs = [useRef<HTMLVideoElement>(null), useRef<HTMLVideoElement>(null)];
  const [primary, setPrimary] = useState(0);
  const primaryRef = useRef(0);
  const switchingRef = useRef(false);

  primaryRef.current = primary;

  useEffect(() => {
    refs[0].current?.play().catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const handleTimeUpdate = (idx: number) => {
    if (idx !== primaryRef.current) return;
    const vid = refs[idx].current;
    const next = refs[1 - idx].current;
    if (!vid || !next || switchingRef.current || !vid.duration) return;

    if (vid.duration - vid.currentTime <= CROSSFADE) {
      switchingRef.current = true;
      next.currentTime = 0;
      next.play().catch(() => {});
      setPrimary(1 - idx); // CSS opacity transition starts immediately
      setTimeout(() => {
        vid.pause();
        vid.currentTime = 0;
        switchingRef.current = false;
      }, CROSSFADE * 1000);
    }
  };

  return (
    <div className="w-full h-full relative">
      {([0, 1] as const).map((idx) => (
        <video
          key={idx}
          ref={refs[idx]}
          src={src}
          muted
          playsInline
          preload="auto"
          onTimeUpdate={() => handleTimeUpdate(idx)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: idx === primary ? 1 : 0,
            transition: `opacity ${CROSSFADE}s ease`,
          }}
        />
      ))}
    </div>
  );
}

export default function SceneClient() {
  const { overrides, serverLoaded } = useContent();
  const unlockedRef = useRef(false);

  const isVideo = overrides.heroMediaType === "video" && !!overrides.heroVideoPath;

  useEffect(() => {
    if (serverLoaded && isVideo && !unlockedRef.current) {
      unlockedRef.current = true;
      markTexturesReady();
      unlockScroll();
    }
  }, [serverLoaded, isVideo]);

  if (!serverLoaded) return null;

  if (isVideo) {
    return <SeamlessVideo src={overrides.heroVideoPath!} />;
  }

  return <Scene />;
}
