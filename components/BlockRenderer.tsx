"use client";

import { useEffect, useRef, useState } from "react";
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

function RenderText({ title, html, image }: {
  title?: string; html: string;
  image?: { src: string; align: "left" | "right" | "bottom"; scale: number; frame?: string; animation?: string };
}) {
  const frameClass = FRAME_CLASSES[(image?.frame as ContentBlockImage["frame"]) || "none"] || "";
  const animClass = ANIM_CLASSES[(image?.animation as ContentBlockImage["animation"]) || "none"] || "";

  const imgNode = image?.src ? (
    <AnimatedImage
      src={image.src} alt=""
      animation={(image.animation as ContentBlockImage["animation"]) || "none"}
      frameClass={frameClass}
      style={{ width: "100%" }}
    />
  ) : null;

  if (!imgNode) {
    return (
      <div>
        {title && <h2 className="text-xl md:text-2xl font-semibold text-ink/85 mb-3 tracking-tight">{title}</h2>}
        <div className="prose prose-gray max-w-none text-ink/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    );
  }

  if (image!.align === "bottom") {
    return (
      <div>
        {title && <h2 className="text-xl md:text-2xl font-semibold text-ink/85 mb-3 tracking-tight">{title}</h2>}
        <div className="prose prose-gray max-w-none text-ink/80 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: html }} />
        <div style={{ width: "100%" }}>{imgNode}</div>
      </div>
    );
  }

  // Sol veya sağ — başlık üstte tam genişlikte, metin+resim yan yana
  const isRight = image!.align === "right";
  return (
    <div>
      {title && <h2 className="text-xl md:text-2xl font-semibold text-ink/85 mb-3 tracking-tight">{title}</h2>}
      <div className={`flex gap-6 items-start ${isRight ? "flex-row" : "flex-row-reverse"}`}>
        <div className="flex-1 min-w-0">
          <div className="prose prose-gray max-w-none text-ink/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
        <div className="flex-shrink-0" style={{ width: `${image!.scale}%` }}>{imgNode}</div>
      </div>
    </div>
  );
}

function RenderImage({ block }: { block: ContentBlockImage }) {
  if (!block.src) return null;

  const frameClass = FRAME_CLASSES[block.frame];
  const isFloat = block.align === "left" || block.align === "right";

  if (isFloat) {
    // Float: yazı etrafında akar
    const floatStyle: React.CSSProperties = {
      float: block.align as "left" | "right",
      width: `${block.scale}%`,
      margin: block.align === "left" ? "0 1.5rem 1rem 0" : "0 0 1rem 1.5rem",
      clear: block.align as "left" | "right",
    };
    return (
      <figure style={floatStyle}>
        <AnimatedImage
          src={block.src}
          alt={block.caption || ""}
          animation={block.animation}
          frameClass={frameClass}
          style={{ width: "100%" }}
        />
        {block.caption && (
          <figcaption className="mt-1 text-xs text-ink/40 text-center">{block.caption}</figcaption>
        )}
      </figure>
    );
  }

  // Center: normal blok
  return (
    <figure className="my-2 mx-auto" style={{ width: `${block.scale}%`, textAlign: "center" }}>
      <AnimatedImage
        src={block.src}
        alt={block.caption || ""}
        animation={block.animation}
        frameClass={`${frameClass} mx-auto`}
        style={{ width: "100%" }}
      />
      {block.caption && (
        <figcaption className="mt-2 text-sm text-ink/40 text-center">{block.caption}</figcaption>
      )}
    </figure>
  );
}

function StripCarousel({ images, frameClass, onOpen }: {
  images: { src: string; caption?: string }[];
  frameClass: string;
  onOpen: (i: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(0);
  const itemW = 280; // px — her resim genişliği
  const gap = 12;

  useEffect(() => {
    const interval = setInterval(() => {
      setPos((p) => {
        const maxPos = images.length * (itemW + gap) - (trackRef.current?.parentElement?.offsetWidth || 0);
        return p + itemW + gap >= maxPos ? 0 : p + itemW + gap;
      });
    }, 2800);
    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(-${pos}px)`;
    }
  }, [pos]);

  return (
    <div className="overflow-hidden relative" style={{ width: "calc(100vw - 16vw)", marginLeft: "calc(50% - (100vw - 16vw) / 2)" }}>
      <div ref={trackRef} className="flex transition-transform duration-700 ease-in-out" style={{ gap: `${gap}px` }}>
        {/* Sonsuz döngü için resimleri 3x tekrarla */}
        {[...images, ...images, ...images].map((img, i) => (
          <figure key={i} className="flex-shrink-0 cursor-zoom-in group" style={{ width: `${itemW}px` }}
            onClick={() => onOpen(i % images.length)}>
            <div className={`h-48 overflow-hidden ${frameClass} bg-gray-100`}>
              <img src={img.src} alt={img.caption || ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            {img.caption && <figcaption className="mt-1 text-xs text-ink/40 text-center">{img.caption}</figcaption>}
          </figure>
        ))}
      </div>
      {/* Navigasyon */}
      <button onClick={() => setPos((p) => Math.max(0, p - (itemW + gap)))}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 shadow flex items-center justify-center text-ink/50 hover:text-ink transition-colors text-lg">‹</button>
      <button onClick={() => setPos((p) => {
        const maxPos = images.length * (itemW + gap);
        return p + itemW + gap >= maxPos ? 0 : p + itemW + gap;
      })}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 shadow flex items-center justify-center text-ink/50 hover:text-ink transition-colors text-lg">›</button>
    </div>
  );
}

function RenderGallery({ block }: { block: ContentBlockGallery }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  if (!block.images.length) return null;

  const frameClass = GALLERY_FRAME_CLASSES[block.frame];
  const layout = block.layout || "grid";

  const open = (i: number) => setLightbox(i);
  const close = () => setLightbox(null);
  const prev = () => setLightbox((n) => (n! - 1 + block.images.length) % block.images.length);
  const next = () => setLightbox((n) => (n! + 1) % block.images.length);

  const imgEl = (img: { src: string; caption?: string }, i: number, cls = "") => (
    <figure key={i} className={`group cursor-zoom-in ${cls}`} onClick={() => open(i)}>
      <div className={`overflow-hidden ${frameClass} bg-gray-100`}>
        <img src={img.src} alt={img.caption || ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
      {img.caption && <figcaption className="mt-1 text-xs text-ink/40 text-center">{img.caption}</figcaption>}
    </figure>
  );

  let gallery: React.ReactNode;

  if (layout === "strip") {
    gallery = <StripCarousel images={block.images} frameClass={frameClass} onOpen={open} />;
  } else if (layout === "masonry") {
    // Masonry: CSS columns
    const colCls = block.cols === 2 ? "columns-2" : block.cols === 3 ? "columns-3" : "columns-4";
    gallery = (
      <div className={`${colCls} gap-3`}>
        {block.images.map((img, i) => (
          <figure key={i} className="break-inside-avoid mb-3 cursor-zoom-in group" onClick={() => open(i)}>
            <div className={`overflow-hidden ${frameClass} bg-gray-100`}>
              <img src={img.src} alt={img.caption || ""} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            {img.caption && <figcaption className="mt-1 text-xs text-ink/40 text-center">{img.caption}</figcaption>}
          </figure>
        ))}
      </div>
    );
  } else if (layout === "featured") {
    // Featured: ilk resim büyük, diğerleri sağda küçük
    const [first, ...rest] = block.images;
    gallery = (
      <div className="flex gap-3">
        <figure className="flex-1 cursor-zoom-in group" onClick={() => open(0)}>
          <div className={`aspect-[4/3] overflow-hidden ${frameClass} bg-gray-100`}>
            <img src={first.src} alt={first.caption || ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
          {first.caption && <figcaption className="mt-1 text-xs text-ink/40 text-center">{first.caption}</figcaption>}
        </figure>
        {rest.length > 0 && (
          <div className="flex flex-col gap-3 w-1/3">
            {rest.map((img, i) => (
              <figure key={i} className="flex-1 cursor-zoom-in group" onClick={() => open(i + 1)}>
                <div className={`aspect-[4/3] overflow-hidden ${frameClass} bg-gray-100`}>
                  <img src={img.src} alt={img.caption || ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                {img.caption && <figcaption className="mt-1 text-xs text-ink/40 text-center">{img.caption}</figcaption>}
              </figure>
            ))}
          </div>
        )}
      </div>
    );
  } else {
    // Grid (default)
    const gridCls = block.cols === 2 ? "grid-cols-2" : block.cols === 3 ? "grid-cols-3" : "grid-cols-4";
    gallery = (
      <div className={`grid ${gridCls} gap-3`}>
        {block.images.map((img, i) => (
          <figure key={i} className="group cursor-zoom-in" onClick={() => open(i)}>
            <div className={`aspect-square overflow-hidden ${frameClass} bg-gray-100`}>
              <img src={img.src} alt={img.caption || ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            {img.caption && <figcaption className="mt-1 text-xs text-ink/40 text-center">{img.caption}</figcaption>}
          </figure>
        ))}
      </div>
    );
  }

  return (
    <>
      {gallery}

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center" onClick={close}>
          <button onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-white/70 hover:text-white text-2xl bg-white/10 hover:bg-white/20 rounded-full transition-colors">‹</button>
          <div className="max-w-5xl max-h-[90vh] flex flex-col items-center gap-3 px-16" onClick={(e) => e.stopPropagation()}>
            <img src={block.images[lightbox].src} alt={block.images[lightbox].caption || ""}
              className="max-w-full max-h-[80vh] object-contain" />
            {block.images[lightbox].caption && (
              <p className="text-white/60 text-sm text-center">{block.images[lightbox].caption}</p>
            )}
            <p className="text-white/30 text-xs">{lightbox + 1} / {block.images.length}</p>
          </div>
          <button onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-white/70 hover:text-white text-2xl bg-white/10 hover:bg-white/20 rounded-full transition-colors">›</button>
          <button onClick={close}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white/60 hover:text-white text-xl">✕</button>
        </div>
      )}
    </>
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
          <div key={block.id} className="clearfix">
            {block.type === "text"    && <RenderText title={block.title} html={block.html} image={block.image} />}
            {block.type === "image"   && <RenderImage block={block} />}
            {block.type === "gallery" && <RenderGallery block={block} />}
          </div>
        ))}
      </div>
    </>
  );
}
