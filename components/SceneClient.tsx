"use client";

import dynamic from "next/dynamic";

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
  return <Scene />;
}
