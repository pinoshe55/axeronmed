"use client";

import dynamic from "next/dynamic";

const GalleryScene = dynamic(() => import("@/components/GalleryScene"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#e8e8e8] rounded-2xl" />,
});

const ITEMS = [
  { label: "Alüminyum Kap",          code: "AX-AL-200", file: "ax-al-200.glb" },
  { label: "SS Sterilizasyon Kasası", code: "AX-SS-100", file: "ax-ss-100.glb" },
  { label: "Silikon Contalı Kap",     code: "AX-SC-100", file: "ax-sc-100.glb" },
  { label: "Tel Örgü Sepet",          code: "AX-TW-100", file: "ax-tw-100.glb" },
  { label: "Büyük Taşıma Kasası",     code: "AX-TK-200", file: "ax-tk-200.glb" },
  { label: "Mini Alüminyum Kap",      code: "AX-AL-400", file: "ax-al-400.glb" },
];

function StripCard({ label, code, file }: { label: string; code: string; file: string }) {
  return (
    <div className="flex-shrink-0 w-56 mx-3 flex flex-col rounded-2xl overflow-hidden border border-ink/10 bg-[#e8e8e8]">
      <div className="w-full" style={{ height: "180px" }}>
        <GalleryScene modelUrl={`/models/products/${file}`} />
      </div>
      <div className="px-4 py-3 border-t border-ink/8 bg-[var(--bg)]">
        <p className="text-xs font-medium text-ink leading-snug">{label}</p>
        <p className="text-[10px] font-mono text-accent mt-0.5">{code}</p>
      </div>
    </div>
  );
}

export default function GalleryStrip() {
  return (
    <div className="w-full py-16 overflow-hidden border-y border-ink/8">

      {/* üst etiket */}
      <div className="px-[8vw] mb-8 flex items-center gap-4">
        <p className="eyebrow">3D Ürün Galerisi</p>
        <span className="flex-1 h-px bg-ink/10" />
        <p className="text-xs text-ink/40">Sürükleyerek döndürün</p>
      </div>

      {/* Kayan şerit — CSS marquee */}
      <div className="flex" style={{ animation: "strip-scroll 28s linear infinite" }}>
        {/* İki set yan yana → seamless loop */}
        {[...ITEMS, ...ITEMS].map((item, i) => (
          <StripCard key={`${item.code}-${i}`} {...item} />
        ))}
      </div>

      <style jsx>{`
        @keyframes strip-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        div:hover > div {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
