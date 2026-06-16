"use client";

import { useRef, useState } from "react";

interface Props {
  value: string;
  onChange: (url: string) => void;
}

export default function HeroImageUpload({ value, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) { alert("Sadece resim dosyası seçin"); return; }
    if (file.size > 10 * 1024 * 1024) { alert("Dosya çok büyük (maks 10 MB)"); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload-image", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Yükleme hatası"); return; }
      onChange(data.url);
    } catch { alert("Yükleme başarısız"); }
    finally { setUploading(false); }
  };

  return (
    <div className="space-y-3">
      {/* Specs info */}
      <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5">
        <span className="text-blue-400 text-sm mt-0.5 flex-shrink-0">ℹ️</span>
        <div className="text-[11px] text-blue-600 leading-relaxed">
          <span className="font-semibold">Önerilen ölçüler:</span> 1920×480 px (4:1 en-boy oranı) &nbsp;·&nbsp;
          <span className="font-semibold">Min:</span> 1200×300 px &nbsp;·&nbsp;
          <span className="font-semibold">Formatlar:</span> JPG, PNG, WebP &nbsp;·&nbsp;
          <span className="font-semibold">Maks:</span> 10 MB
        </div>
      </div>

      {/* URL input + upload button */}
      <div className="flex gap-2 items-stretch">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... veya resim yüklemek için butona basın"
          className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400 font-mono placeholder:font-sans min-w-0"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 transition-colors disabled:opacity-50 flex-shrink-0 whitespace-nowrap"
        >
          {uploading ? (
            <><span className="animate-spin">⏳</span> Yükleniyor…</>
          ) : (
            <><span>📁</span> Dosyadan Yükle</>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="px-2 py-2 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
            title="Görseli kaldır"
          >✕</button>
        )}
      </div>

      {/* Preview */}
      {value ? (
        <div className="relative w-full aspect-[4/1] rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
          <img
            src={value}
            alt="Kapak görseli önizleme"
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = ""; }}
          />
          <span className="absolute bottom-1.5 right-2 text-[10px] text-white/70 bg-black/30 px-1.5 py-0.5 rounded">
            Önizleme (4:1)
          </span>
        </div>
      ) : (
        <div
          className="w-full aspect-[4/1] rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <span className="text-2xl text-gray-300">🖼️</span>
          <span className="text-xs text-gray-400">Kapak görseli eklemek için tıklayın</span>
          <span className="text-[10px] text-gray-300">1920×480 px · JPG / PNG / WebP</span>
        </div>
      )}
    </div>
  );
}
