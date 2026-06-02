"use client";

import dynamic from "next/dynamic";

const GalleryScene = dynamic(() => import("@/components/GalleryScene"), {
  ssr: false,
  loading: () => null,
});

export default function GalleryClient({ modelUrl }: { modelUrl: string }) {
  return <GalleryScene modelUrl={modelUrl} />;
}
