"use client";

import { useEffect, useRef } from "react";
import type { ContentBlock, ContentBlockImage, ContentBlockGallery } from "@/lib/siteOverrides";

// ── CSS animasyonları (globals.css yoksa buraya inline) ──────────────────────

const ANIM_CLASSES: Record<ContentBlockImage["animation"], string> = {
  none:       "",
  fade:       "animate-block-fade",
  zoom:       "animate-block-zoom",
  float:      "animate-block-float",
  "hover-zoom": "hover:scale-105 transition-transform duration-500 cursor-zoom-in",
};

const FRAME_CLASSES: Record<ContentBlockImage["frame"], string> = {
  none:     "",
  border:   "border-4 border-gray-200",
  shadow:   "shadow-2xl shadow-black/20",
  rounded:  "rounded-2xl overflow-hidden",
  polaroid: "bg-white p-3 pb-8 shadow-xl rotate-1 hover:rotate-0 transition-transform duration-300",
};

const GALLERY_FRAME_CLASSES: Record<ContentBlockGallery["frame"], string> = {
  none:    "",
  border:  "border-2 border-gray-200",
  shadow:  "shadow-lg shadow-black/10",
  rounded: "rounded-xl overflow-hidden",
};

// ── observer for scroll animations ──────────────────────────────────────────

function useInView(ref: React.RefObject<HTMLElement | null>, onEnter: () => void) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { onEnter(); obs.disconnect(); }
    }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
}

function AnimatedImage({ src, alt, animation, frameClass, style }: {
  src: string; alt: string;
  animation: ContentBlockImage["animation"];
  frameClass: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const needsObserver = animation === "fade" || animation === "zoom";

  useInView(ref as React.RefObject<HTMLElement>, () => {
    if (ref.current && needsObserver) {
      ref.current.classList.add("in-view");
    }
  });

  return (
    <div ref={ref} className={`inline-block ${ANIM_CLASSES[animation]} ${frameClass}`} style={style}>
      <img src={src} alt={alt} className="w-full h-auto block" />
    </div>
  );
}

// ── renderers ────────────────────────────────────────────────────────────────

function RenderText({ html }: { html: string }) {
  return (
    <div
      className="prose prose-gray max-w-none text-ink/80 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function RenderImage({ block }: { block: ContentBlockImage }) {
  if (!block.src) return null;

  const alignClass = block.align === "left" ? "mr-auto" : block.align === "right" ? "ml-auto" : "mx-auto";
  const frameClass = FRAME_CLASSES[block.frame];

  return (
    <figure className="my-2" style={{ textAlign: block.align }}>
      <AnimatedImage
        src={block.src}
        alt={block.caption || ""}
        animation={block.animation}
        frameClass={`${frameClass} ${alignClass}`}
        style={{ width: `${block.scale}%`, display: "inline-block" }}
      />
      {block.caption && (
        <figcaption className="mt-2 text-sm text-ink/40 text-center">{block.caption}</figcaption>
      )}
    </figure>
  );
}

function RenderGallery({ block }: { block: ContentBlockGallery }) {
  if (!block.images.length) return null;

  const gridCls = block.cols === 2 ? "grid-cols-2" : block.cols === 3 ? "grid-cols-3" : "grid-cols-4";
  const frameClass = GALLERY_FRAME_CLASSES[block.frame];

  return (
    <div className={`grid ${gridCls} gap-3 my-2`}>
      {block.images.map((img, i) => (
        <figure key={i} className="group">
          <div className={`aspect-square overflow-hidden ${frameClass} bg-gray-100`}>
            <img
              src={img.src}
              alt={img.caption || ""}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          {img.caption && (
            <figcaption className="mt-1 text-xs text-ink/40 text-center">{img.caption}</figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}

// ── main ─────────────────────────────────────────────────────────────────────

export default function BlockRenderer({ blocks }: { blocks: ContentBlock[] }) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <>
      {/* Inline animation keyframes */}
      <style>{`
        .animate-block-fade { opacity: 0; transition: opacity 0.7s ease; }
        .animate-block-fade.in-view { opacity: 1; }
        .animate-block-zoom { opacity: 0; transform: scale(0.92); transition: opacity 0.6s ease, transform 0.6s ease; }
        .animate-block-zoom.in-view { opacity: 1; transform: scale(1); }
        @keyframes block-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .animate-block-float { animation: block-float 3s ease-in-out infinite; }
      `}</style>

      <div className="space-y-8">
        {blocks.map((block) => (
          <div key={block.id}>
            {block.type === "text"    && <RenderText html={block.html} />}
            {block.type === "image"   && <RenderImage block={block} />}
            {block.type === "gallery" && <RenderGallery block={block} />}
          </div>
        ))}
      </div>
    </>
  );
}
