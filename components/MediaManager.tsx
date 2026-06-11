"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ModelPreviewCanvas = dynamic(() => import("@/components/ModelPreviewCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[200px] bg-slate-800 flex items-center justify-center text-slate-400 text-sm">
      3D önizleme yükleniyor...
    </div>
  ),
});

export interface MediaItem {
  name: string;
  path: string;
  size: number;
  sizeFormatted: string;
  uploadedAt?: string;
  kind: "video" | "model";
}

const MAX_PER_KIND = 3;
const MAX_SIZE = 50 * 1024 * 1024; // 50MB

interface Props {
  heroMediaType: "3d" | "video";
  heroVideoPath: string;
  modelPath: string;
  onPublish: (item: MediaItem) => void;
  onActiveDeleted: () => void;
  notify: (msg: string, type: "success" | "error") => void;
}

export default function MediaManager({ heroMediaType, heroVideoPath, modelPath, onPublish, onActiveDeleted, notify }: Props) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);

  const isActive = (item: MediaItem) =>
    item.kind === "video"
      ? heroMediaType === "video" && heroVideoPath === item.path
      : heroMediaType === "3d" && modelPath === item.path;

  const refreshLists = async () => {
    setLoading(true);
    try {
      const [mRes, vRes] = await Promise.all([
        fetch("/api/models/list").then((r) => r.json()),
        fetch("/api/videos/list").then((r) => r.json()),
      ]);
      const models: MediaItem[] = (mRes.models || []).map((m: any) => ({
        ...m,
        name: m.path.split("/").pop(),
        kind: "model" as const,
      }));
      const videos: MediaItem[] = (vRes.videos || []).map((v: any) => ({ ...v, kind: "video" as const }));
      setItems([...models, ...videos]);
    } catch {
      notify("Medya listesi yüklenemedi", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshLists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const modelCount = items.filter((i) => i.kind === "model").length;
  const videoCount = items.filter((i) => i.kind === "video").length;

  const handleFiles = async (files: FileList | File[]) => {
    const file = Array.from(files)[0];
    if (!file) return;

    const name = file.name.toLowerCase();
    let kind: "video" | "model" | null = null;
    if (name.endsWith(".mp4") || name.endsWith(".webm")) kind = "video";
    else if (name.endsWith(".glb") || name.endsWith(".gltf")) kind = "model";

    if (!kind) {
      notify("Desteklenmeyen format. İzin verilen: .glb .gltf .mp4 .webm", "error");
      return;
    }
    if (file.size > MAX_SIZE) {
      notify("Dosya çok büyük (Max: 50 MB)", "error");
      return;
    }
    const count = kind === "video" ? videoCount : modelCount;
    if (count >= MAX_PER_KIND) {
      notify(
        `En fazla ${MAX_PER_KIND} ${kind === "video" ? "video" : "3D model"} yüklenebilir. Önce bir tanesini silin.`,
        "error"
      );
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const endpoint = kind === "video" ? "/api/videos/upload" : "/api/models/upload";
      const res = await fetch(endpoint, { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        notify(`${file.name} yüklendi (${data.file.sizeFormatted}) ✓ Yayınlamak için karttaki butonu kullanın`, "success");
        await refreshLists();
      } else {
        notify(data.error || "Yükleme başarısız", "error");
      }
    } catch {
      notify("Yükleme başarısız", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (item: MediaItem) => {
    if (!confirm(`"${item.name}" silinecek. Bu medyayı silmek istediğinize emin misiniz?`)) return;
    const wasActive = isActive(item);
    try {
      const endpoint = item.kind === "video" ? "/api/videos/delete" : "/api/models/delete";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: item.name }),
      });
      const data = await res.json();
      if (data.success) {
        notify(`${item.name} silindi ✓${wasActive ? " Aktif medya kalmadı, varsayılan içerik gösteriliyor." : ""}`, "success");
        if (wasActive) onActiveDeleted();
        await refreshLists();
      } else {
        notify(data.error || "Silme başarısız", "error");
      }
    } catch {
      notify("Silme başarısız", "error");
    }
  };

  const activeItem = items.find(isActive) || null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
      {/* ── Left column: upload + list ── */}
      <div className="space-y-4">
        {/* Upload dropzone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
            dragOver ? "border-blue-500 bg-blue-500/10" : "border-slate-700 bg-slate-900"
          }`}
        >
          <input
            type="file"
            accept=".glb,.gltf,.mp4,.webm"
            disabled={uploading}
            onChange={(e) => { if (e.target.files?.length) { handleFiles(e.target.files); e.target.value = ""; } }}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <p className="text-sm font-semibold text-slate-300">
            {uploading ? "⏳ Yükleniyor..." : "📤 Medya Yükle"}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Dosyayı sürükleyip bırakın veya tıklayıp seçin
          </p>
          <p className="text-[11px] text-slate-600 mt-2">
            3D: .glb .gltf • Video: .mp4 .webm • Max 50 MB
          </p>
          <div className="flex justify-center gap-4 mt-3 text-[11px]">
            <span className={modelCount >= MAX_PER_KIND ? "text-amber-400" : "text-slate-500"}>
              🧊 3D: {modelCount}/{MAX_PER_KIND}
            </span>
            <span className={videoCount >= MAX_PER_KIND ? "text-amber-400" : "text-slate-500"}>
              🎬 Video: {videoCount}/{MAX_PER_KIND}
            </span>
          </div>
        </div>

        {/* Media cards */}
        {loading ? (
          <div className="text-slate-400 text-sm py-4 text-center">Medyalar yükleniyor...</div>
        ) : items.length === 0 ? (
          <div className="text-slate-500 text-sm py-4 text-center">Henüz medya yüklenmedi.</div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const active = isActive(item);
              return (
                <div
                  key={item.path}
                  className={`rounded-xl border p-4 bg-slate-900 transition-colors ${
                    active ? "border-blue-500" : "border-slate-800"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {item.kind === "video" ? "🎬" : "🧊"} {item.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {item.kind === "video" ? "Video" : "3D Model"} • {item.sizeFormatted}
                        {item.uploadedAt ? ` • ${new Date(item.uploadedAt).toLocaleDateString("tr-TR")}` : ""}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold tracking-wide uppercase rounded-full px-2.5 py-1 flex-shrink-0 ${
                        active ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-700/50 text-slate-400"
                      }`}
                    >
                      {active ? "● Aktif" : "Pasif"}
                    </span>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => onPublish(item)}
                      disabled={active}
                      className={`flex-1 text-xs font-semibold rounded-lg px-3 py-2 transition-colors ${
                        active
                          ? "bg-slate-800 text-slate-500 cursor-default"
                          : "bg-blue-600 hover:bg-blue-500 text-white"
                      }`}
                    >
                      {active ? "Yayında" : "▶ Yayınla"}
                    </button>
                    <button
                      onClick={() => setPreviewItem(item)}
                      className="text-xs font-semibold rounded-lg px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white transition-colors"
                    >
                      👁 Önizle
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="text-xs font-semibold rounded-lg px-3 py-2 bg-red-600/80 hover:bg-red-600 text-white transition-colors"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Right column: live preview of active media ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 h-fit lg:sticky lg:top-20">
        <p className="text-xs font-semibold tracking-widest uppercase text-slate-500 mb-3">
          Canlı Önizleme — Anasayfada Yayında
        </p>
        <div className="rounded-lg overflow-hidden bg-slate-950 border border-slate-800 aspect-video">
          {!activeItem ? (
            <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs px-4 text-center">
              Aktif medya yok — anasayfada varsayılan içerik gösteriliyor
            </div>
          ) : activeItem.kind === "video" ? (
            <video
              key={activeItem.path}
              src={activeItem.path}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full">
              <ModelPreviewCanvas modelPath={activeItem.path} scale={1} lightIntensity={1} lightPosition={[5, 3, 5]} />
            </div>
          )}
        </div>
        {activeItem && (
          <p className="text-xs text-slate-500 mt-2 font-mono truncate">{activeItem.path}</p>
        )}
      </div>

      {/* ── Fullscreen preview modal ── */}
      {previewItem && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6"
          onClick={() => setPreviewItem(null)}
        >
          <button
            onClick={() => setPreviewItem(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl leading-none z-10"
            title="Kapat"
          >
            ✕
          </button>
          <div className="w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <p className="text-white/80 text-sm mb-3 font-semibold">
              {previewItem.kind === "video" ? "🎬" : "🧊"} {previewItem.name} ({previewItem.sizeFormatted})
            </p>
            {previewItem.kind === "video" ? (
              <video
                key={previewItem.path}
                src={previewItem.path}
                autoPlay
                muted
                loop
                controls
                playsInline
                className="w-full max-h-[80vh] rounded-xl bg-black"
              />
            ) : (
              <div className="w-full h-[70vh] rounded-xl overflow-hidden bg-slate-950">
                <ModelPreviewCanvas modelPath={previewItem.path} scale={1} lightIntensity={1} lightPosition={[5, 3, 5]} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
