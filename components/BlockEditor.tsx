"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import type { ContentBlock, ContentBlockText, ContentBlockImage, ContentBlockGallery } from "@/lib/siteOverrides";

const RichEditor = dynamic(() => import("@/components/RichEditor"), { ssr: false });

// ── helpers ─────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

async function uploadImage(file: File): Promise<string | null> {
  const fd = new FormData();
  fd.append("file", file);
  try {
    const res = await fetch("/api/upload-image", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) { alert(data.error || "Yükleme hatası"); return null; }
    return data.url as string;
  } catch { alert("Resim yüklenemedi"); return null; }
}

// ── sub-editors ─────────────────────────────────────────────────────────────

function TextBlockEditor({ block, onChange }: { block: ContentBlockText; onChange: (b: ContentBlockText) => void }) {
  return (
    <div className="space-y-2">
      <RichEditor value={block.html} onChange={(v) => onChange({ ...block, html: v })} height={200} placeholder="Metin yazın..." />
    </div>
  );
}

const FRAME_OPTIONS: { value: ContentBlockImage["frame"]; label: string }[] = [
  { value: "none",     label: "Çerçevesiz" },
  { value: "border",   label: "Kenarlık" },
  { value: "shadow",   label: "Gölge" },
  { value: "rounded",  label: "Yuvarlak" },
  { value: "polaroid", label: "Polaroid" },
];

const ANIM_OPTIONS: { value: ContentBlockImage["animation"]; label: string }[] = [
  { value: "none",       label: "Animasyon Yok" },
  { value: "fade",       label: "Belir (Fade)" },
  { value: "zoom",       label: "Yakınlaş (Zoom)" },
  { value: "float",      label: "Yüz (Float)" },
  { value: "hover-zoom", label: "Üzerine Zoom" },
];

const ALIGN_OPTIONS: { value: ContentBlockImage["align"]; label: string; icon: string }[] = [
  { value: "left",   label: "Sol",    icon: "⬅" },
  { value: "center", label: "Orta",   icon: "↔" },
  { value: "right",  label: "Sağ",    icon: "➡" },
];

function ImageBlockEditor({ block, onChange }: { block: ContentBlockImage; onChange: (b: ContentBlockImage) => void }) {
  const [uploading, setUploading] = useState(false);

  const pick = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setUploading(true);
      const url = await uploadImage(file);
      setUploading(false);
      if (url) onChange({ ...block, src: url });
    };
  }, [block, onChange]);

  return (
    <div className="space-y-4">
      {/* Image picker */}
      <div className="flex gap-3 items-start">
        {block.src ? (
          <div className="relative w-28 h-20 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 bg-gray-50">
            <img src={block.src} alt="" className="w-full h-full object-cover" />
            <button onClick={() => onChange({ ...block, src: "" })}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white text-xs flex items-center justify-center hover:bg-red-500 transition-colors">✕</button>
          </div>
        ) : (
          <button onClick={pick} disabled={uploading}
            className="w-28 h-20 rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-400 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-blue-500 transition-colors flex-shrink-0 text-xs">
            {uploading ? "Yükleniyor…" : <><span className="text-2xl">🖼️</span><span>Resim Seç</span></>}
          </button>
        )}
        <div className="flex-1 space-y-2">
          <input type="text" value={block.caption || ""} onChange={(e) => onChange({ ...block, caption: e.target.value })}
            placeholder="Açıklama (isteğe bağlı)"
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-900 outline-none focus:border-blue-400" />
          {block.src && (
            <button onClick={pick} className="text-xs text-blue-500 hover:text-blue-700">Resmi değiştir</button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Frame */}
        <div>
          <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">Çerçeve</p>
          <div className="flex flex-wrap gap-1.5">
            {FRAME_OPTIONS.map(o => (
              <button key={o.value} onClick={() => onChange({ ...block, frame: o.value })}
                className={`px-2.5 py-1 rounded-lg text-xs border transition-colors ${block.frame === o.value ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600 hover:border-blue-300"}`}>
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Animation */}
        <div>
          <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">Animasyon</p>
          <div className="flex flex-wrap gap-1.5">
            {ANIM_OPTIONS.map(o => (
              <button key={o.value} onClick={() => onChange({ ...block, animation: o.value })}
                className={`px-2.5 py-1 rounded-lg text-xs border transition-colors ${block.animation === o.value ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600 hover:border-blue-300"}`}>
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Scale */}
        <div>
          <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">Boyut — {block.scale}%</p>
          <input type="range" min={20} max={100} step={5} value={block.scale}
            onChange={(e) => onChange({ ...block, scale: Number(e.target.value) })}
            className="w-full accent-blue-600" />
          <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
            <span>20%</span><span>50%</span><span>100%</span>
          </div>
        </div>

        {/* Align */}
        <div>
          <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">Hizalama</p>
          <div className="flex gap-1.5">
            {ALIGN_OPTIONS.map(o => (
              <button key={o.value} onClick={() => onChange({ ...block, align: o.value })}
                className={`flex-1 py-1.5 rounded-lg text-sm border transition-colors ${block.align === o.value ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600 hover:border-blue-300"}`}>
                {o.icon}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const GALLERY_FRAME_OPTIONS: { value: ContentBlockGallery["frame"]; label: string }[] = [
  { value: "none",    label: "Yok" },
  { value: "border",  label: "Kenarlık" },
  { value: "shadow",  label: "Gölge" },
  { value: "rounded", label: "Yuvarlak" },
];

function GalleryBlockEditor({ block, onChange }: { block: ContentBlockGallery; onChange: (b: ContentBlockGallery) => void }) {
  const [uploading, setUploading] = useState(false);

  const addImages = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.click();
    input.onchange = async () => {
      const files = Array.from(input.files || []);
      if (!files.length) return;
      setUploading(true);
      const urls = await Promise.all(files.map(f => uploadImage(f)));
      setUploading(false);
      const newImgs = urls.filter(Boolean).map(src => ({ src: src! }));
      onChange({ ...block, images: [...block.images, ...newImgs] });
    };
  }, [block, onChange]);

  return (
    <div className="space-y-4">
      {/* Image grid preview */}
      <div className={`grid gap-2 ${block.cols === 2 ? "grid-cols-2" : block.cols === 3 ? "grid-cols-3" : "grid-cols-4"}`}>
        {block.images.map((img, i) => (
          <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
            <img src={img.src} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            <button onClick={() => onChange({ ...block, images: block.images.filter((_, j) => j !== i) })}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500">✕</button>
            <input type="text" value={img.caption || ""} placeholder="Açıklama"
              onChange={(e) => {
                const imgs = block.images.map((im, j) => j === i ? { ...im, caption: e.target.value } : im);
                onChange({ ...block, images: imgs });
              }}
              className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-2 py-1 outline-none opacity-0 group-hover:opacity-100 transition-opacity placeholder:text-white/50" />
          </div>
        ))}
        <button onClick={addImages} disabled={uploading}
          className="aspect-square rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-400 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-blue-500 transition-colors text-xs">
          {uploading ? "Yükleniyor…" : <><span className="text-2xl">+</span><span>Resim Ekle</span></>}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Cols */}
        <div>
          <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">Sütun Sayısı</p>
          <div className="flex gap-1.5">
            {([2, 3, 4] as const).map(c => (
              <button key={c} onClick={() => onChange({ ...block, cols: c })}
                className={`flex-1 py-1.5 rounded-lg text-sm border transition-colors ${block.cols === c ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600 hover:border-blue-300"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Frame */}
        <div>
          <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">Çerçeve</p>
          <div className="flex flex-wrap gap-1.5">
            {GALLERY_FRAME_OPTIONS.map(o => (
              <button key={o.value} onClick={() => onChange({ ...block, frame: o.value })}
                className={`px-2.5 py-1 rounded-lg text-xs border transition-colors ${block.frame === o.value ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600 hover:border-blue-300"}`}>
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── block wrapper ────────────────────────────────────────────────────────────

const BLOCK_LABELS: Record<ContentBlock["type"], string> = {
  text: "📝 Metin",
  image: "🖼️ Resim",
  gallery: "🗃️ Galeri",
};

function BlockWrapper({
  block, index, total, onMove, onDelete, children,
}: {
  block: ContentBlock; index: number; total: number;
  onMove: (dir: -1 | 1) => void; onDelete: () => void;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
        <button onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900">
          <span className={`text-gray-400 transition-transform ${collapsed ? "" : "rotate-90"}`}>▶</span>
          {BLOCK_LABELS[block.type]}
        </button>
        <div className="flex items-center gap-1">
          <button onClick={() => onMove(-1)} disabled={index === 0}
            className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 disabled:opacity-30 transition-colors text-xs">↑</button>
          <button onClick={() => onMove(1)} disabled={index === total - 1}
            className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 disabled:opacity-30 transition-colors text-xs">↓</button>
          <button onClick={onDelete}
            className="w-7 h-7 flex items-center justify-center rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors text-sm">✕</button>
        </div>
      </div>
      {/* Body */}
      {!collapsed && <div className="p-4">{children}</div>}
    </div>
  );
}

// ── main component ───────────────────────────────────────────────────────────

interface Props {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

export default function BlockEditor({ blocks, onChange }: Props) {
  const updateBlock = (i: number, b: ContentBlock) => {
    const next = [...blocks];
    next[i] = b;
    onChange(next);
  };

  const deleteBlock = (i: number) => onChange(blocks.filter((_, j) => j !== i));

  const moveBlock = (i: number, dir: -1 | 1) => {
    const next = [...blocks];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const addBlock = (type: ContentBlock["type"]) => {
    let block: ContentBlock;
    if (type === "text") {
      block = { id: uid(), type: "text", html: "" } satisfies ContentBlockText;
    } else if (type === "image") {
      block = { id: uid(), type: "image", src: "", frame: "shadow", animation: "fade", scale: 100, align: "center" } satisfies ContentBlockImage;
    } else {
      block = { id: uid(), type: "gallery", images: [], cols: 3, frame: "rounded" } satisfies ContentBlockGallery;
    }
    onChange([...blocks, block]);
  };

  return (
    <div className="space-y-3">
      {blocks.length === 0 && (
        <div className="border-2 border-dashed border-gray-200 rounded-xl py-10 text-center text-gray-400 text-sm">
          Henüz blok yok. Aşağıdan blok ekleyin.
        </div>
      )}

      {blocks.map((block, i) => (
        <BlockWrapper key={block.id} block={block} index={i} total={blocks.length}
          onMove={(dir) => moveBlock(i, dir)} onDelete={() => deleteBlock(i)}>
          {block.type === "text" && (
            <TextBlockEditor block={block} onChange={(b) => updateBlock(i, b)} />
          )}
          {block.type === "image" && (
            <ImageBlockEditor block={block} onChange={(b) => updateBlock(i, b)} />
          )}
          {block.type === "gallery" && (
            <GalleryBlockEditor block={block} onChange={(b) => updateBlock(i, b)} />
          )}
        </BlockWrapper>
      ))}

      {/* Add block buttons */}
      <div className="flex gap-2 pt-1">
        {(["text", "image", "gallery"] as const).map(type => (
          <button key={type} onClick={() => addBlock(type)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
            <span>{type === "text" ? "📝" : type === "image" ? "🖼️" : "🗃️"}</span>
            <span>{type === "text" ? "Metin Ekle" : type === "image" ? "Resim Ekle" : "Galeri Ekle"}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
