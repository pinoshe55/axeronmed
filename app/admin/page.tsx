"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useContent } from "@/context/ContentContext";
import { loadOverrides, saveOverrides, type GalleryItem, type StatItem, type EmailConfig, type AdminUser, type SEOConfig } from "@/lib/siteOverrides";
import { translations } from "@/lib/i18n";
import { hashPassword, verifyPassword, generateUserId } from "@/lib/auth";
import "react-quill/dist/quill.core.css";
import "react-quill/dist/quill.snow.css";

// Lazy load ModelPreviewCanvas to avoid Three.js in SSR
const ModelPreviewCanvas = dynamic(() => import("@/components/ModelPreviewCanvas"), {
  ssr: false,
  loading: () => <div className="w-full h-64 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center text-slate-400">Model yükleniyor...</div>,
});

// Lazy load ReactQuill for rich text editing
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const ADMIN_PASSWORD = "axeron2024";

// ─── Flattenler i18n objesini key→value çiftlerine ───────────────────────────
function flattenObj(obj: Record<string, unknown>, prefix = ""): Record<string, string> {
  return Object.entries(obj).reduce<Record<string, string>>((acc, [k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "string") {
      acc[key] = v;
    } else if (Array.isArray(v)) {
      // stats, faqs, columns, contactBlocks, formSubjectOptions — ayrı sekmede
    } else if (typeof v === "object" && v !== null) {
      Object.assign(acc, flattenObj(v as Record<string, unknown>, key));
    }
    return acc;
  }, {});
}

const TR_FIELDS = flattenObj(translations.tr as unknown as Record<string, unknown>);
const EN_FIELDS = flattenObj(translations.en as unknown as Record<string, unknown>);

const DEFAULT_TR_STATS: StatItem[] = translations.tr.static.stats;
const DEFAULT_EN_STATS: StatItem[] = translations.en.static.stats;

const DEFAULT_GALLERY: GalleryItem[] = [
  { src: "/hero-1.jpg",  caption: "", active: true, w: 310, h: 228, top: "6%",  left: "24%", rotate: "-4deg", z: 2 },
  { src: "/hero-2.jpg",  caption: "", active: true, w: 270, h: 198, top: "4%",  left: "50%", rotate:  "3deg", z: 3 },
  { src: "/hero-3.jpg",  caption: "", active: true, w: 240, h: 176, top: "3%",  left: "72%", rotate: "-2deg", z: 2 },
  { src: "/hero-4.jpg",  caption: "", active: true, w: 290, h: 212, top: "44%", left: "34%", rotate: "-3deg", z: 2 },
  { src: "/hero-5.jpg",  caption: "", active: true, w: 275, h: 186, top: "40%", left: "58%", rotate:  "4deg", z: 3 },
  { src: "/hero-6.jpg",  caption: "", active: true, w: 230, h: 168, top: "50%", left: "76%", rotate: "-1deg", z: 1 },
  { src: "/hero-7.jpg",  caption: "", active: true, w: 210, h: 154, top: "20%", left: "14%", rotate:  "3deg", z: 1 },
  { src: "/hero-8.jpg",  caption: "", active: true, w: 200, h: 148, top: "58%", left: "18%", rotate: "-5deg", z: 2 },
  { src: "/hero-9.jpg",  caption: "", active: true, w: 185, h: 136, top: "14%", left: "84%", rotate:  "2deg", z: 1 },
  { src: "/hero-10.jpg", caption: "", active: true, w: 310, h: 228, top: "9%",  left: "34%", rotate: "-7deg", z: 6 },
  { src: "/hero-11.jpg", caption: "", active: true, w: 310, h: 228, top: "9%",  left: "34%", rotate: "-8deg", z: 6 },
];

function prettyKey(key: string) {
  const last = key.split(".").pop() ?? key;
  return last.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()).trim();
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-bold tracking-[0.15em] uppercase text-slate-400 mt-8 mb-3 pb-2 border-b border-slate-700">
      {children}
    </h3>
  );
}

// ─── Ana Panel ───────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [tab, setTab] = useState<"gallery" | "stats" | "tr" | "en" | "3d" | "mail" | "users" | "seo" | "about">("gallery");
  const { overrides, updateText, updateGallery, updateStats, updateEmailConfig, getStats, resetAll } = useContent();

  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [trStats, setTrStats] = useState<StatItem[]>([]);
  const [enStats, setEnStats] = useState<StatItem[]>([]);
  const [trSEOTitle, setTrSEOTitle] = useState("");
  const [trSEODesc, setTrSEODesc] = useState("");
  const [trSEOKeywords, setTrSEOKeywords] = useState("");
  const [trSEOOgTitle, setTrSEOOgTitle] = useState("");
  const [trSEOOgDesc, setTrSEOOgDesc] = useState("");
  const [trSEOOgImage, setTrSEOOgImage] = useState("");
  const [enSEOTitle, setEnSEOTitle] = useState("");
  const [enSEODesc, setEnSEODesc] = useState("");
  const [enSEOKeywords, setEnSEOKeywords] = useState("");
  const [enSEOOgTitle, setEnSEOOgTitle] = useState("");
  const [enSEOOgDesc, setEnSEOOgDesc] = useState("");
  const [enSEOOgImage, setEnSEOOgImage] = useState("");
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [emailConfig, setEmailConfig] = useState<EmailConfig | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [testingEmail, setTestingEmail] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [modelPath, setModelPath] = useState("/models/camera.glb");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [modelScale, setModelScale] = useState(1);
  const [lightIntensity, setLightIntensity] = useState(1);
  const [lightPositionX, setLightPositionX] = useState(5);
  const [lightPositionY, setLightPositionY] = useState(3);
  const [lightPositionZ, setLightPositionZ] = useState(5);
  const [modelList, setModelList] = useState<Array<{ name: string; path: string; size: number; sizeFormatted: string }>>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);
  const addFileRef = useRef<HTMLInputElement>(null);

  // About section states
  const [trAbout, setTrAbout] = useState("");
  const [enAbout, setEnAbout] = useState("");
  const [trMission, setTrMission] = useState("");
  const [enMission, setEnMission] = useState("");
  const [trVision, setTrVision] = useState("");
  const [enVision, setEnVision] = useState("");
  // Quality Values - 3 cards
  const [trQualityValue1, setTrQualityValue1] = useState({ value: "", label: "", desc: "" });
  const [enQualityValue1, setEnQualityValue1] = useState({ value: "", label: "", desc: "" });
  const [trQualityValue2, setTrQualityValue2] = useState({ value: "", label: "", desc: "" });
  const [enQualityValue2, setEnQualityValue2] = useState({ value: "", label: "", desc: "" });
  const [trQualityValue3, setTrQualityValue3] = useState({ value: "", label: "", desc: "" });
  const [enQualityValue3, setEnQualityValue3] = useState({ value: "", label: "", desc: "" });
  // Old format (backward compatibility)
  const [trQualityValues, setTrQualityValues] = useState("");
  const [enQualityValues, setEnQualityValues] = useState("");
  const [trProductionQuality, setTrProductionQuality] = useState("");
  const [enProductionQuality, setEnProductionQuality] = useState("");
  const [trCertification, setTrCertification] = useState("");
  const [enCertification, setEnCertification] = useState("");

  useEffect(() => {
    const raw = loadOverrides();
    // sessionStorage'dan base64 verisini geri yükle
    const galleryWithImages = raw.gallery?.length
      ? raw.gallery.map(img => {
          if (img.src.startsWith('session:')) {
            const key = img.src.replace('session:', '');
            const base64 = sessionStorage.getItem(key);
            return { ...img, src: base64 || '' };
          }
          return img;
        })
      : DEFAULT_GALLERY.map(g => ({ ...g }));

    setGallery(galleryWithImages);
    setTrStats(raw.trStats?.length ? raw.trStats : DEFAULT_TR_STATS.map(s => ({ ...s })));
    setEnStats(raw.enStats?.length ? raw.enStats : DEFAULT_EN_STATS.map(s => ({ ...s })));

    // Load SEO data
    setTrSEOTitle(raw.trSEO?.metaTitle || "");
    setTrSEODesc(raw.trSEO?.metaDescription || "");
    setTrSEOKeywords(raw.trSEO?.keywords || "");
    setTrSEOOgTitle(raw.trSEO?.ogTitle || "");
    setTrSEOOgDesc(raw.trSEO?.ogDescription || "");
    setTrSEOOgImage(raw.trSEO?.ogImage || "");
    setEnSEOTitle(raw.enSEO?.metaTitle || "");
    setEnSEODesc(raw.enSEO?.metaDescription || "");
    setEnSEOKeywords(raw.enSEO?.keywords || "");
    setEnSEOOgTitle(raw.enSEO?.ogTitle || "");
    setEnSEOOgDesc(raw.enSEO?.ogDescription || "");
    setEnSEOOgImage(raw.enSEO?.ogImage || "");
    setEmailConfig(raw.emailConfig || null);
    setAdminUsers(raw.adminUsers || []);
    setModelPath(raw.modelPath || "/models/camera.glb");
    setModelScale(raw.modelScale || 1);
    setLightIntensity(raw.lightIntensity || 1);
    setLightPositionX(raw.lightPositionX || 5);
    setLightPositionY(raw.lightPositionY || 3);
    setLightPositionZ(raw.lightPositionZ || 5);

    // Load About section fields
    setTrAbout(raw.trAbout || "");
    setEnAbout(raw.enAbout || "");
    setTrMission(raw.trMission || "");
    setEnMission(raw.enMission || "");
    setTrVision(raw.trVision || "");
    setEnVision(raw.enVision || "");
    // Quality Values - 3 cards
    setTrQualityValue1(raw.trQualityValue1 || { value: "", label: "", desc: "" });
    setEnQualityValue1(raw.enQualityValue1 || { value: "", label: "", desc: "" });
    setTrQualityValue2(raw.trQualityValue2 || { value: "", label: "", desc: "" });
    setEnQualityValue2(raw.enQualityValue2 || { value: "", label: "", desc: "" });
    setTrQualityValue3(raw.trQualityValue3 || { value: "", label: "", desc: "" });
    setEnQualityValue3(raw.enQualityValue3 || { value: "", label: "", desc: "" });
    // Old format
    setTrQualityValues(raw.trQualityValues || "");
    setEnQualityValues(raw.enQualityValues || "");
    setTrProductionQuality(raw.trProductionQuality || "");
    setEnProductionQuality(raw.enProductionQuality || "");
    setTrCertification(raw.trCertification || "");
    setEnCertification(raw.enCertification || "");

    // Load available models
    setLoadingModels(true);
    fetch("/api/models/list")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.models) {
          setModelList(data.models);
        }
      })
      .catch((err) => console.error("Failed to load models:", err))
      .finally(() => setLoadingModels(false));
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const overrides = loadOverrides();
    let adminUsers = overrides.adminUsers || [];

    // Eğer admin user yok, default admin'i oluştur
    if (adminUsers.length === 0) {
      const defaultAdminHash = await hashPassword(ADMIN_PASSWORD);
      const defaultAdmin: AdminUser = {
        id: generateUserId(),
        email: "admin@axeron.local",
        passwordHash: defaultAdminHash,
        role: "admin",
        createdAt: Date.now(),
        verifiedAt: Date.now(),
        lastLoginAt: null,
      };
      adminUsers = [defaultAdmin];
      overrides.adminUsers = adminUsers;
      saveOverrides(overrides);
    }

    // Admin user'ı bul
    const admin = adminUsers[0]; // İlk admin user
    const passwordValid = await verifyPassword(pw, admin.passwordHash);

    if (passwordValid) {
      setAuthed(true);
      setPwError(false);
      setCurrentAdmin(admin);
      admin.lastLoginAt = Date.now();
      saveOverrides(overrides);
    } else {
      setPwError(true);
    }
  }

  function handleImageUpload(idx: number, file: File) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setGallery((prev) => {
        const next = [...prev];
        next[idx] = { ...next[idx], src: base64 };
        return next;
      });
    };
    reader.readAsDataURL(file);
  }

  function handleAddImage(file: File) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      const newItem: GalleryItem = {
        src: base64,
        caption: "",
        active: true,
        w: 280, h: 200,
        top: "10%", left: "30%",
        rotate: "0deg", z: 2,
      };
      setGallery((prev) => [...prev, newItem]);
    };
    reader.readAsDataURL(file);
  }

  function handleCaption(idx: number, value: string) {
    setGallery((prev) => { const n = [...prev]; n[idx] = { ...n[idx], caption: value }; return n; });
  }

  function handleToggleActive(idx: number) {
    setGallery((prev) => { const n = [...prev]; n[idx] = { ...n[idx], active: !n[idx].active }; return n; });
  }

  function saveGallery() {
    // Sadece metadata (açıklama, aktif/pasif) localStorage'a koy
    // Base64'ları kaydetme (yüklenen custom resimler state'te kalır, sayfa kapatılırsa kaybolur)
    const toSave = gallery.map((img, i) => {
      if (img.src.startsWith('data:')) {
        // Base64 verisini kaydetme, boş src ile işaretle
        // Site açılırken /public default resim ile replace edilecek
        return { ...img, src: '' };
      }
      // /public resimleri olduğu gibi sakla
      return img;
    });
    updateGallery(toSave);
    flashSaved();
  }

  function saveStats() {
    updateStats("tr", trStats);
    updateStats("en", enStats);
    flashSaved();
  }

  function handleTextChange(lang: "tr" | "en", key: string, value: string) {
    updateText(lang, key, value);
  }

  function flashSaved() {
    setSaved(true);
    setToast({ msg: "✓ Kaydedildi", type: "success" });
    setTimeout(() => setSaved(false), 2000);
    setTimeout(() => setToast(null), 3000);
  }

  function handleReset() {
    if (!confirm("Tüm değişiklikler sıfırlanacak. Emin misiniz?")) return;
    resetAll();
    setGallery(DEFAULT_GALLERY.map(g => ({ ...g })));
    setTrStats(DEFAULT_TR_STATS.map(s => ({ ...s })));
    setEnStats(DEFAULT_EN_STATS.map(s => ({ ...s })));
    flashSaved();
  }

  // ── Login ──────────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <form onSubmit={handleLogin}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-10 w-full max-w-sm flex flex-col gap-6">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-slate-500 mb-1">Axeron Medical</p>
            <h1 className="text-2xl font-semibold text-white">Admin Paneli</h1>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-slate-400">Şifre</label>
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)}
              placeholder="Şifrenizi girin"
              className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500 transition-colors"
              autoFocus />
            {pwError && <p className="text-xs text-red-400">Hatalı şifre.</p>}
          </div>
          <button type="submit"
            className="bg-blue-600 hover:bg-blue-500 transition-colors text-white font-semibold rounded-xl py-3 text-sm">
            Giriş Yap
          </button>
          <a href="/" className="text-center text-xs text-slate-500 hover:text-slate-300 transition-colors">← Siteye Dön</a>
        </form>
      </div>
    );
  }

  // ── Panel ──────────────────────────────────────────────────────────────────
  const TABS = [
    { id: "gallery" as const, label: "Galeri" },
    { id: "stats"   as const, label: "İstatistikler" },
    { id: "tr"      as const, label: "Metinler (TR)" },
    { id: "en"      as const, label: "Texts (EN)" },
    { id: "3d"      as const, label: "3D Model" },
    { id: "mail"    as const, label: "Mail Ayarları" },
    { id: "users"   as const, label: "Kullanıcılar" },
    { id: "seo"     as const, label: "SEO Ayarları" },
    { id: "about"   as const, label: "Hakkımızda" },
  ];

  const fields = tab === "tr" ? TR_FIELDS : EN_FIELDS;
  const langOverrides = tab === "tr" ? (overrides.tr ?? {}) : (overrides.en ?? {});

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Top bar */}
      <div className="border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 bg-slate-950/95 backdrop-blur z-10">
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-white">Axeron Admin</span>
          {saved && <span className="text-xs text-emerald-400 font-medium animate-pulse">Kaydedildi ✓</span>}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleReset}
            className="text-xs text-red-400 hover:text-red-300 transition-colors border border-red-900 hover:border-red-700 rounded-lg px-3 py-1.5">
            Sıfırla
          </button>
          <a href="/" target="_blank"
            className="text-xs text-slate-400 hover:text-white transition-colors border border-slate-700 hover:border-slate-500 rounded-lg px-3 py-1.5">
            Siteyi Gör ↗
          </a>
          <button onClick={() => setAuthed(false)} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            Çıkış
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-slate-900 rounded-xl mb-8 w-fit flex-wrap">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.id ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── GALERİ ─────────────────────────────────────────────────────── */}
        {tab === "gallery" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold">Ürün Galerisi</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Resim yükleyin, açıklama ekleyin veya pasife alın. Pasif resimler sitede görünmez.
                </p>
              </div>
              <button onClick={saveGallery}
                className="bg-blue-600 hover:bg-blue-500 transition-colors text-white text-sm font-semibold rounded-xl px-5 py-2.5">
                Kaydet
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {gallery.map((img, i) => (
                <div key={i}
                  className={`bg-slate-900 border rounded-2xl overflow-hidden transition-opacity ${
                    img.active ? "border-slate-800" : "border-slate-700 opacity-50"
                  }`}>
                  {/* Resim önizleme */}
                  <div className="relative w-full h-44 bg-slate-800 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.src} alt="" className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.2"; }} />

                    {/* Yükle butonu */}
                    <button
                      onClick={() => fileRefs.current[i]?.click()}
                      className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center"
                    >
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-white font-medium bg-white/10 border border-white/20 rounded-lg px-3 py-1.5">
                        Resim Değiştir
                      </span>
                    </button>

                    {/* Badge */}
                    <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold rounded px-1.5 py-0.5">
                      {i + 1}
                    </span>

                    {/* Aktif/Pasif toggle */}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        onClick={() => handleToggleActive(i)}
                        title={img.active ? "Pasife Al" : "Aktifleştir"}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-colors ${
                          img.active
                            ? "bg-emerald-600/80 hover:bg-red-600/80 text-white"
                            : "bg-red-600/80 hover:bg-emerald-600/80 text-white"
                        }`}
                      >
                        {img.active ? "AKTİF" : "PASİF"}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Bu resmi silmek istediğinizden emin misiniz?")) {
                            setGallery(gallery.filter((_, idx) => idx !== i));
                          }
                        }}
                        title="Resmi Sil"
                        className="bg-red-700/80 hover:bg-red-600/80 text-white text-[10px] font-bold px-2 py-1 rounded-lg transition-colors"
                      >
                        ✕
                      </button>
                    </div>

                    <input ref={(el) => { fileRefs.current[i] = el; }}
                      type="file" accept="image/*" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(i, f); }} />
                  </div>

                  {/* Caption */}
                  <div className="p-3 space-y-3">
                    <div>
                      <label className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 mb-1.5 block">
                        Açıklama (opsiyonel)
                      </label>
                      <input type="text" value={img.caption} onChange={(e) => handleCaption(i, e.target.value)}
                        placeholder="Resim üzerine çıkacak açıklama..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-blue-500 transition-colors" />
                    </div>

                    {/* Boyutlar */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 mb-1 block">
                          Genişlik (W)
                        </label>
                        <input type="number" value={img.w}
                          onChange={(e) => setGallery(prev => { const n=[...prev]; n[i]={...n[i], w: parseInt(e.target.value) || 0}; return n; })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-sm text-white outline-none focus:border-blue-500 transition-colors" />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 mb-1 block">
                          Yükseklik (H)
                        </label>
                        <input type="number" value={img.h}
                          onChange={(e) => setGallery(prev => { const n=[...prev]; n[i]={...n[i], h: parseInt(e.target.value) || 0}; return n; })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-sm text-white outline-none focus:border-blue-500 transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Yeni resim ekle kartı */}
              <div
                className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl h-44 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group"
                onClick={() => addFileRef.current?.click()}
              >
                <span className="text-3xl text-slate-600 group-hover:text-blue-400 transition-colors">+</span>
                <span className="text-xs text-slate-500 group-hover:text-blue-400 transition-colors font-medium">Yeni Resim Ekle</span>
                <input ref={addFileRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) { handleAddImage(f); e.target.value = ""; } }} />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button onClick={saveGallery}
                className="bg-blue-600 hover:bg-blue-500 transition-colors text-white text-sm font-semibold rounded-xl px-6 py-3">
                Galeriyi Kaydet
              </button>
            </div>
          </div>
        )}

        {/* ── İSTATİSTİKLER ──────────────────────────────────────────────── */}
        {tab === "stats" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold">İstatistik Kartları</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Hakkımızda bölümündeki 4 istatistik kartını düzenleyin (TR ve EN ayrı ayrı).
                </p>
              </div>
              <button onClick={saveStats}
                className="bg-blue-600 hover:bg-blue-500 transition-colors text-white text-sm font-semibold rounded-xl px-5 py-2.5">
                Kaydet
              </button>
            </div>

            {/* TR Stats */}
            <SectionHeader>Türkçe</SectionHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {trStats.map((st, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3">
                  <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500">Kart {i + 1}</p>
                  <div>
                    <label className="text-[10px] text-slate-500 mb-1 block">Değer (ör. 15+)</label>
                    <input type="text" value={st.value}
                      onChange={(e) => setTrStats(prev => { const n=[...prev]; n[i]={...n[i],value:e.target.value}; return n; })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500 transition-colors font-bold" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 mb-1 block">Başlık (ör. Yıl Deneyim)</label>
                    <input type="text" value={st.label}
                      onChange={(e) => setTrStats(prev => { const n=[...prev]; n[i]={...n[i],label:e.target.value}; return n; })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 mb-1 block">Alt Açıklama</label>
                    <input type="text" value={st.desc}
                      onChange={(e) => setTrStats(prev => { const n=[...prev]; n[i]={...n[i],desc:e.target.value}; return n; })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500 transition-colors" />
                  </div>
                </div>
              ))}
            </div>

            {/* EN Stats */}
            <SectionHeader>English</SectionHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {enStats.map((st, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3">
                  <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500">Card {i + 1}</p>
                  <div>
                    <label className="text-[10px] text-slate-500 mb-1 block">Value (e.g. 15+)</label>
                    <input type="text" value={st.value}
                      onChange={(e) => setEnStats(prev => { const n=[...prev]; n[i]={...n[i],value:e.target.value}; return n; })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500 transition-colors font-bold" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 mb-1 block">Label (e.g. Years Experience)</label>
                    <input type="text" value={st.label}
                      onChange={(e) => setEnStats(prev => { const n=[...prev]; n[i]={...n[i],label:e.target.value}; return n; })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 mb-1 block">Description</label>
                    <input type="text" value={st.desc}
                      onChange={(e) => setEnStats(prev => { const n=[...prev]; n[i]={...n[i],desc:e.target.value}; return n; })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500 transition-colors" />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button onClick={saveStats}
                className="bg-blue-600 hover:bg-blue-500 transition-colors text-white text-sm font-semibold rounded-xl px-6 py-3">
                İstatistikleri Kaydet
              </button>
            </div>
          </div>
        )}

        {/* ── METİNLER ───────────────────────────────────────────────────── */}
        {(tab === "tr" || tab === "en") && (
          <div>
            <div className="mb-2">
              <h2 className="text-lg font-semibold">
                {tab === "tr" ? "Türkçe Metinler" : "English Texts"}
              </h2>
              <p className="text-xs text-slate-400 mt-1">Alanı değiştirin — her alan otomatik kaydedilir.</p>
            </div>

            <div className="space-y-1">
              {Object.entries(fields).map(([key, defaultVal]) => {
                const currentVal = langOverrides[key] ?? defaultVal;
                const isMultiline = defaultVal.includes("\n") || defaultVal.length > 120;
                const isChanged = !!langOverrides[key] && langOverrides[key] !== defaultVal;

                const section = key.split(".")[0];
                const prevKey = Object.keys(fields)[Object.keys(fields).indexOf(key) - 1];
                const prevSection = prevKey?.split(".")[0];
                const showSection = section !== prevSection;

                return (
                  <div key={key}>
                    {showSection && (
                      <SectionHeader>
                        {section === "nav" ? "Navigasyon" : section === "scroll" ? "Kaydırma Bölümleri" : section === "static" ? "Statik Bölümler" : section}
                      </SectionHeader>
                    )}
                    <div className="flex gap-3 items-start py-2 border-b border-slate-800/50">
                      <div className="w-48 flex-shrink-0 pt-1">
                        <p className="text-xs text-slate-400 font-medium">{prettyKey(key)}</p>
                        <p className="text-[10px] text-slate-600 mt-0.5 truncate">{key}</p>
                      </div>
                      <div className="flex-1 relative">
                        {isMultiline ? (
                          <textarea
                            rows={Math.min(6, Math.ceil(currentVal.length / 70) + 1)}
                            value={currentVal}
                            onChange={(e) => handleTextChange(tab as "tr" | "en", key, e.target.value)}
                            className={`w-full bg-slate-900 border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500 transition-colors resize-none leading-relaxed ${
                              isChanged ? "border-blue-800" : "border-slate-800"
                            }`}
                          />
                        ) : (
                          <input type="text" value={currentVal}
                            onChange={(e) => handleTextChange(tab as "tr" | "en", key, e.target.value)}
                            className={`w-full bg-slate-900 border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500 transition-colors ${
                              isChanged ? "border-blue-800" : "border-slate-800"
                            }`}
                          />
                        )}
                        {isChanged && (
                          <button onClick={() => handleTextChange(tab as "tr" | "en", key, defaultVal)}
                            className="absolute right-2 top-2 text-[10px] text-slate-500 hover:text-red-400 transition-colors"
                            title="Varsayılana sıfırla">↩</button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── 3D MODEL ───────────────────────────────────────────────────── */}
        {tab === "3d" && (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold">3D Model Yönetimi</h2>
              <p className="text-xs text-slate-400 mt-1">Anasayfa'da gösterilecek 3D model'i seçin ve önizleyin.</p>
            </div>

            <div className="space-y-6">
              {/* Model Upload */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
                <div>
                  <label className="text-sm text-slate-400 mb-2 block font-semibold">Yeni Model Yükle</label>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept=".glb,.gltf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const MAX_SIZE = 50 * 1024 * 1024; // 50MB
                        if (file.size > MAX_SIZE) {
                          setToast({ msg: `Dosya çok büyük (Max: 50 MB)`, type: "error" });
                          e.target.value = "";
                          return;
                        }
                        setSelectedFile(file);
                      }}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-600 file:text-white"
                    />
                    <button
                      onClick={async () => {
                        if (!selectedFile) return;
                        setUploading(true);
                        const formData = new FormData();
                        formData.append("file", selectedFile);
                        try {
                          const res = await fetch("/api/models/upload", { method: "POST", body: formData });
                          const data = await res.json();
                          if (data.success) {
                            setToast({ msg: `${selectedFile.name} yüklendi ✓`, type: "success" });
                            const listRes = await fetch("/api/models/list");
                            const listData = await listRes.json();
                            setModelList(listData.models || []);
                            setSelectedFile(null);
                          } else {
                            setToast({ msg: data.error, type: "error" });
                          }
                        } catch {
                          setToast({ msg: "Yükleme başarısız", type: "error" });
                        } finally {
                          setUploading(false);
                        }
                      }}
                      disabled={!selectedFile || uploading}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white text-sm font-semibold rounded-lg px-6 py-2 transition-colors"
                    >
                      {uploading ? "Yükleniyor..." : "Yükle"}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Max 100 MB • .glb veya .gltf dosyası</p>
                </div>
              </div>

              {/* Model Selection */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
                <div>
                  <label className="text-sm text-slate-400 mb-2 block font-semibold">Mevcut Modelleri Seç</label>
                  {loadingModels ? (
                    <div className="text-slate-400 text-sm py-2">Modeller yükleniyor...</div>
                  ) : modelList.length === 0 ? (
                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                      <p className="text-sm text-slate-400">
                        📁 /public/models/ klasöründe model bulunmuyor.
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        Yukarıdaki forma .glb veya .gltf dosyası yükleyin.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {modelList.map((model) => (
                        <div key={model.path} className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-lg p-3">
                          <button
                            onClick={() => setModelPath(model.path)}
                            className={`flex-1 text-left text-sm ${modelPath === model.path ? "text-blue-400 font-semibold" : "text-slate-300 hover:text-white"}`}
                          >
                            {model.name} ({model.sizeFormatted})
                            {model.size > 50 ? " ⚠️" : ""}
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm(`${model.name} silinecek. Emin misin?`)) return;
                              try {
                                const res = await fetch("/api/models/delete", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ fileName: model.name + (model.path.endsWith(".glb") ? ".glb" : ".gltf") }),
                                });
                                const data = await res.json();
                                if (data.success) {
                                  setToast({ msg: `${model.name} silindi ✓`, type: "success" });
                                  if (modelPath === model.path) setModelPath("");
                                  const listRes = await fetch("/api/models/list");
                                  const listData = await listRes.json();
                                  setModelList(listData.models || []);
                                } else {
                                  setToast({ msg: data.error, type: "error" });
                                }
                              } catch {
                                setToast({ msg: "Silme başarısız", type: "error" });
                              }
                            }}
                            className="ml-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded px-3 py-1 transition-colors"
                          >
                            Sil
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {modelPath && (
                  <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                    <p className="text-xs text-slate-400 mb-1">Seçilen Model:</p>
                    <p className="text-sm font-mono text-blue-400">{modelPath}</p>
                    {modelList.find((m) => m.path === modelPath) && (
                      <p className="text-xs text-slate-500 mt-1">
                        Dosya Boyutu: {modelList.find((m) => m.path === modelPath)?.sizeFormatted}
                      </p>
                    )}
                    {modelPath && (modelList.find((m) => m.path === modelPath)?.size ?? 0) > 50 && (
                      <p className="text-xs text-yellow-400 mt-1">
                        ⚠️ Bu model büyük boyutta. Sayfa yüklemesi yavaşlayabilir.
                      </p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      updateEmailConfig(emailConfig);
                      const overrides = loadOverrides();
                      overrides.modelPath = modelPath;
                      saveOverrides(overrides);
                      flashSaved();
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg px-6 py-2 transition-colors"
                  >
                    Kaydet
                  </button>
                  <button
                    onClick={() => {
                      setModelPath("/models/camera.glb");
                      const overrides = loadOverrides();
                      overrides.modelPath = "/models/camera.glb";
                      saveOverrides(overrides);
                      setToast({ msg: "Varsayılan model restore edildi", type: "success" });
                    }}
                    className="bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-lg px-6 py-2 transition-colors"
                  >
                    Varsayılana Sıfırla
                  </button>
                </div>
              </div>

              {/* Model Preview & Scale */}
              {modelPath && (
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
                  <div>
                    <label className="text-sm text-slate-400 mb-2 block font-semibold">Ölçekleme (Scale)</label>
                    <div className="flex items-center gap-4 mb-3">
                      <input
                        type="range"
                        min="0.5"
                        max="3"
                        step="0.1"
                        value={modelScale}
                        onChange={(e) => setModelScale(parseFloat(e.target.value))}
                        className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <span className="text-sm font-semibold text-white min-w-12 text-right">{modelScale.toFixed(1)}x</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">
                      Model boyutunu ayarlayın (0.5x - 3.0x). Anasayfa'da da bu ölçek kullanılacaktır.
                    </p>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <label className="text-sm text-slate-400 mb-2 block font-semibold">Işık Yoğunluğu</label>
                      <div className="flex items-center gap-4 mb-3">
                        <input
                          type="range"
                          min="0.1"
                          max="2"
                          step="0.1"
                          value={lightIntensity}
                          onChange={(e) => setLightIntensity(parseFloat(e.target.value))}
                          className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <span className="text-sm font-semibold text-white min-w-12 text-right">{lightIntensity.toFixed(1)}</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-4">
                        Model'e vuran ışığın yoğunluğunu ayarlayın (0.1 - 2.0)
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setLightIntensity(1);
                        setLightPositionX(-6);
                        setLightPositionY(3);
                        setLightPositionZ(5);
                      }}
                      className="mt-2 bg-slate-700 hover:bg-slate-600 transition-colors text-white text-xs font-semibold rounded-lg px-3 py-2 whitespace-nowrap h-fit"
                      title="Işık ayarlarını optimal değerlere sıfırla"
                    >
                      Varsayılana Sıfırla
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-500 mb-1 block font-semibold">Işık X Pozisyonu</label>
                      <input type="number" value={lightPositionX} onChange={(e) => setLightPositionX(parseFloat(e.target.value) || 0)} step="0.5"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-sm text-white outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 mb-1 block font-semibold">Işık Y Pozisyonu</label>
                      <input type="number" value={lightPositionY} onChange={(e) => setLightPositionY(parseFloat(e.target.value) || 0)} step="0.5"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-sm text-white outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 mb-1 block font-semibold">Işık Z Pozisyonu</label>
                      <input type="number" value={lightPositionZ} onChange={(e) => setLightPositionZ(parseFloat(e.target.value) || 0)} step="0.5"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-sm text-white outline-none focus:border-blue-500" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 mb-4">
                    Işığın uzay konumunu ayarlayın (X, Y, Z koordinatları)
                  </p>

                  <div>
                    <label className="text-sm text-slate-400 mb-2 block font-semibold">Önizleme</label>
                    <p className="text-xs text-slate-500 mb-3">Modeli 3D olarak görüntüle (döndürmek için sürükle, zoom için scroll)</p>
                    <ModelPreviewCanvas modelPath={modelPath} scale={modelScale} lightIntensity={lightIntensity} lightPosition={[lightPositionX, lightPositionY, lightPositionZ]} />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => {
                        updateEmailConfig(emailConfig);
                        const overrides = loadOverrides();
                        overrides.modelPath = modelPath;
                        overrides.modelScale = modelScale;
                        overrides.lightIntensity = lightIntensity;
                        overrides.lightPositionX = lightPositionX;
                        overrides.lightPositionY = lightPositionY;
                        overrides.lightPositionZ = lightPositionZ;
                        saveOverrides(overrides);
                        flashSaved();
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg px-6 py-2 transition-colors"
                    >
                      Kaydet
                    </button>
                    <button
                      onClick={() => {
                        setModelScale(1);
                      }}
                      className="bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-lg px-6 py-2 transition-colors"
                    >
                      1.0x'e Sıfırla
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── MAIL AYARLARI ───────────────────────────────────────────────────── */}
        {tab === "mail" && (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold">Mail Ayarları</h2>
              <p className="text-xs text-slate-400 mt-1">SMTP konfigürasyonunu ayarlayın ve test edin.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="SMTP Host"
                  value={emailConfig?.smtpHost || ""}
                  onChange={(e) => setEmailConfig(emailConfig ? { ...emailConfig, smtpHost: e.target.value } : { smtpHost: e.target.value, smtpPort: 587, smtpUser: "", smtpPassword: "", fromEmail: "", fromName: "", recipientEmails: [] })}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                />
                <input
                  type="number"
                  placeholder="SMTP Port"
                  value={emailConfig?.smtpPort || ""}
                  onChange={(e) => setEmailConfig(emailConfig ? { ...emailConfig, smtpPort: parseInt(e.target.value) } : { smtpHost: "", smtpPort: parseInt(e.target.value) || 587, smtpUser: "", smtpPassword: "", fromEmail: "", fromName: "", recipientEmails: [] })}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="email"
                  placeholder="SMTP User"
                  value={emailConfig?.smtpUser || ""}
                  onChange={(e) => setEmailConfig(emailConfig ? { ...emailConfig, smtpUser: e.target.value } : { smtpHost: "", smtpPort: 587, smtpUser: e.target.value, smtpPassword: "", fromEmail: "", fromName: "", recipientEmails: [] })}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                />
                <input
                  type="password"
                  placeholder="SMTP Password"
                  value={emailConfig?.smtpPassword || ""}
                  onChange={(e) => setEmailConfig(emailConfig ? { ...emailConfig, smtpPassword: e.target.value } : { smtpHost: "", smtpPort: 587, smtpUser: "", smtpPassword: e.target.value, fromEmail: "", fromName: "", recipientEmails: [] })}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="email"
                  placeholder="From Email"
                  value={emailConfig?.fromEmail || ""}
                  onChange={(e) => setEmailConfig(emailConfig ? { ...emailConfig, fromEmail: e.target.value } : { smtpHost: "", smtpPort: 587, smtpUser: "", smtpPassword: "", fromEmail: e.target.value, fromName: "", recipientEmails: [] })}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="From Name"
                  value={emailConfig?.fromName || ""}
                  onChange={(e) => setEmailConfig(emailConfig ? { ...emailConfig, fromName: e.target.value } : { smtpHost: "", smtpPort: 587, smtpUser: "", smtpPassword: "", fromEmail: "", fromName: e.target.value, recipientEmails: [] })}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              <textarea
                placeholder="Alıcı E-postalar (virgülle ayrılmış)"
                value={emailConfig?.recipientEmails?.join(",") || ""}
                onChange={(e) => setEmailConfig(emailConfig ? { ...emailConfig, recipientEmails: e.target.value.split(",").map(e => e.trim()) } : { smtpHost: "", smtpPort: 587, smtpUser: "", smtpPassword: "", fromEmail: "", fromName: "", recipientEmails: e.target.value.split(",").map(e => e.trim()) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500 resize-none"
                rows={2}
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (emailConfig) {
                      updateEmailConfig(emailConfig);
                      flashSaved();
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg px-6 py-2 transition-colors"
                >
                  Kaydet
                </button>
                <button
                  onClick={async () => {
                    setTestingEmail(true);
                    try {
                      const res = await fetch("/api/email/test-send", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ emailConfig })
                      });
                      const data = await res.json();
                      if (data.success) {
                        setToast({ msg: "Test e-postası gönderildi", type: "success" });
                      } else {
                        setToast({ msg: data.error || "Test başarısız", type: "error" });
                      }
                    } catch (e) {
                      setToast({ msg: "Test başarısız", type: "error" });
                    }
                    setTestingEmail(false);
                  }}
                  disabled={testingEmail}
                  className="bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white text-sm font-semibold rounded-lg px-6 py-2 transition-colors"
                >
                  {testingEmail ? "Test Gönderiliyor..." : "Test Gönder"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── KULLANICILAR ───────────────────────────────────────────────────── */}
        {tab === "users" && (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold">Kullanıcı Yönetimi</h2>
              <p className="text-xs text-slate-400 mt-1">Admin kullanıcılarını ekleyin, yönetin ve rimov edin.</p>
            </div>

            {/* Password Change Form */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-6">
              <h3 className="text-sm font-semibold mb-4 flex items-center justify-between">
                <span>Parolanızı Değiştirin</span>
                <button
                  onClick={() => setShowPasswordChange(!showPasswordChange)}
                  className="text-xs text-slate-400 hover:text-blue-400 transition-colors"
                >
                  {showPasswordChange ? "Gizle" : "Göster"}
                </button>
              </h3>
              {showPasswordChange && (
                <div className="space-y-3">
                  <input
                    type="password"
                    placeholder="Mevcut parola"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                  />
                  <input
                    type="password"
                    placeholder="Yeni parola (en az 8 karakter, 1 rakam, 1 özel karakter)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                  />
                  <input
                    type="password"
                    placeholder="Yeni parolayı onayla"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={async () => {
                      if (!oldPassword || !newPassword || !confirmPassword) {
                        setToast({ msg: "Tüm alanlar gereklidir", type: "error" });
                        return;
                      }
                      if (newPassword !== confirmPassword) {
                        setToast({ msg: "Yeni parolalar eşleşmemektedir", type: "error" });
                        return;
                      }
                      if (newPassword.length < 8) {
                        setToast({ msg: "Parola en az 8 karakter olmalıdır", type: "error" });
                        return;
                      }

                      // Mevcut parolayı verify et
                      if (!currentAdmin) {
                        setToast({ msg: "Kullanıcı bulunamadı", type: "error" });
                        return;
                      }

                      try {
                        const passwordValid = await verifyPassword(oldPassword, currentAdmin.passwordHash);

                        if (!passwordValid) {
                          setToast({ msg: "Mevcut parola yanlış", type: "error" });
                          return;
                        }

                        // Yeni parolayı hash'le
                        const newHash = await hashPassword(newPassword);

                        // Admin user'ını update et
                        const overrides = loadOverrides();
                        const adminUsers = overrides.adminUsers || [];
                        const adminIndex = adminUsers.findIndex(u => u.id === currentAdmin.id);

                        if (adminIndex >= 0) {
                          adminUsers[adminIndex].passwordHash = newHash;
                          overrides.adminUsers = adminUsers;
                          saveOverrides(overrides);

                          // Current admin'i update et
                          setCurrentAdmin({ ...currentAdmin, passwordHash: newHash });
                          setToast({ msg: "Parola başarıyla değiştirildi", type: "success" });
                          setOldPassword("");
                          setNewPassword("");
                          setConfirmPassword("");
                          setShowPasswordChange(false);
                        } else {
                          setToast({ msg: "Kullanıcı bulunamadı", type: "error" });
                        }
                      } catch (e) {
                        setToast({ msg: "Sunucu hatası", type: "error" });
                      }
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg px-6 py-2 transition-colors"
                  >
                    Parolayı Değiştir
                  </button>
                </div>
              )}
            </div>

            {/* Invite Form */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-6">
              <h3 className="text-sm font-semibold mb-4">Yeni Kullanıcı Davet Et</h3>
              <div className="flex gap-3">
                <input
                  type="email"
                  placeholder="E-posta adresi"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                />
                <button
                  onClick={async () => {
                    if (!inviteEmail) {
                      setToast({ msg: "E-posta gereklidir", type: "error" });
                      return;
                    }
                    try {
                      const res = await fetch("/api/users/create", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: inviteEmail }),
                      });
                      const data = await res.json();
                      if (data.success) {
                        setToast({ msg: "Davetiye gönderildi", type: "success" });
                        setInviteEmail("");
                      } else {
                        setToast({ msg: data.error || "Başarısız", type: "error" });
                      }
                    } catch (e) {
                      setToast({ msg: "Sunucu hatası", type: "error" });
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg px-6 py-2 transition-colors"
                >
                  Davet Gönder
                </button>
              </div>
            </div>

            {/* Users List */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
              {adminUsers.length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  <p>Henüz kullanıcı eklenmemiş</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400">E-posta</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400">Rol</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400">Durum</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-400">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers.map((user) => (
                      <tr key={user.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                        <td className="px-6 py-3 text-sm text-white">{user.email}</td>
                        <td className="px-6 py-3 text-sm text-slate-400">{user.role}</td>
                        <td className="px-6 py-3 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            user.verifiedAt ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                          }`}>
                            {user.verifiedAt ? "Doğrulanmış" : "Beklemede"}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm text-right space-x-2">
                          <button
                            onClick={async () => {
                              try {
                                const res = await fetch(`/api/users/${user.id}/reset-password`, {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ sendReset: true }),
                                });
                                const data = await res.json();
                                setToast({
                                  msg: data.success ? "Sıfırlama e-postası gönderildi" : data.error,
                                  type: data.success ? "success" : "error"
                                });
                              } catch (e) {
                                setToast({ msg: "Sunucu hatası", type: "error" });
                              }
                            }}
                            className="text-blue-400 hover:text-blue-300 text-xs"
                          >
                            Sıfırla
                          </button>
                          <button
                            onClick={() => {
                              const newRole = user.role === "admin" ? "editor" : "admin";
                              if (!confirm(`Rolü ${newRole} olarak değiştirmek istediğinizden emin misiniz?`)) return;
                              setAdminUsers(adminUsers.map(u =>
                                u.id === user.id ? { ...u, role: newRole as "admin" | "editor" } : u
                              ));
                              setToast({ msg: "Rol güncellendi", type: "success" });
                            }}
                            className="text-yellow-400 hover:text-yellow-300 text-xs"
                          >
                            Güncelle
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz?")) return;
                              try {
                                const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
                                const data = await res.json();
                                if (data.success) {
                                  setAdminUsers(adminUsers.filter(u => u.id !== user.id));
                                  setToast({ msg: "Kullanıcı silindi", type: "success" });
                                }
                              } catch (e) {
                                setToast({ msg: "Sunucu hatası", type: "error" });
                              }
                            }}
                            className="text-red-400 hover:text-red-300 text-xs"
                          >
                            Sil
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Save Changes Button */}
            <div className="mt-6 flex justify-end">
              <button onClick={() => {
                const overrides = loadOverrides();
                overrides.adminUsers = adminUsers;
                saveOverrides(overrides);
                flashSaved();
              }}
                className="bg-blue-600 hover:bg-blue-500 transition-colors text-white text-sm font-semibold rounded-xl px-6 py-3">
                Kullanıcı Değişikliklerini Kaydet
              </button>
            </div>
          </div>
        )}

        {/* ── SEO AYARLARI ──────────────────────────────────────────────── */}
        {tab === "seo" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold">SEO Ayarları</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Google arama sonuçlarında görünecek meta tagları ve anahtar kelimeleri yönetin (Türkçe ve İngilizce)
                </p>
              </div>
              <button onClick={() => {
                const overrides = loadOverrides();
                overrides.trSEO = { metaTitle: trSEOTitle, metaDescription: trSEODesc, keywords: trSEOKeywords, ogTitle: trSEOOgTitle, ogDescription: trSEOOgDesc, ogImage: trSEOOgImage };
                overrides.enSEO = { metaTitle: enSEOTitle, metaDescription: enSEODesc, keywords: enSEOKeywords, ogTitle: enSEOOgTitle, ogDescription: enSEOOgDesc, ogImage: enSEOOgImage };
                saveOverrides(overrides);
                flashSaved();
              }}
                className="bg-blue-600 hover:bg-blue-500 transition-colors text-white text-sm font-semibold rounded-xl px-5 py-2.5">
                Kaydet
              </button>
            </div>

            {/* TR SEO */}
            <SectionHeader>Türkçe SEO</SectionHeader>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 mb-8">
              <div>
                <label className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 mb-1.5 block">
                  Sayfa Başlığı (Meta Title)
                </label>
                <input type="text" value={trSEOTitle} onChange={(e) => setTrSEOTitle(e.target.value)}
                  placeholder="Örn: Axeron Medical - Sterilizasyon Konteyner Sistemleri"
                  maxLength={60}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500 transition-colors" />
                <p className="text-xs text-slate-500 mt-1">{trSEOTitle.length}/60 karakter</p>
              </div>
              <div>
                <label className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 mb-1.5 block">
                  Sayfa Açıklaması (Meta Description)
                </label>
                <textarea value={trSEODesc} onChange={(e) => setTrSEODesc(e.target.value)}
                  placeholder="Google'da görünen açıklama yazın..."
                  maxLength={160}
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500 transition-colors resize-none" />
                <p className="text-xs text-slate-500 mt-1">{trSEODesc.length}/160 karakter</p>
              </div>
              <div>
                <label className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 mb-1.5 block">
                  Anahtar Kelimeler (Keywords)
                </label>
                <input type="text" value={trSEOKeywords} onChange={(e) => setTrSEOKeywords(e.target.value)}
                  placeholder="Örn: sterilizasyon, konteyner, tıbbi, hastane (virgülle ayrılmış)"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500 transition-colors font-mono" />
              </div>
              <div className="border-t border-slate-700 pt-4 mt-4">
                <p className="text-xs font-semibold text-slate-400 mb-3">Open Graph (Sosyal Medya)</p>
                <div className="space-y-3">
                  <input type="text" value={trSEOOgTitle} onChange={(e) => setTrSEOOgTitle(e.target.value)}
                    placeholder="OG Başlık (sosyal medyada paylaşıldığında)"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500 transition-colors" />
                  <textarea value={trSEOOgDesc} onChange={(e) => setTrSEOOgDesc(e.target.value)}
                    placeholder="OG Açıklama"
                    rows={2}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500 transition-colors resize-none" />
                  <input type="text" value={trSEOOgImage} onChange={(e) => setTrSEOOgImage(e.target.value)}
                    placeholder="OG Resim (örn: /og-image.jpg)"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500 transition-colors font-mono" />
                </div>
              </div>
            </div>

            {/* EN SEO */}
            <SectionHeader>English SEO</SectionHeader>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 mb-8">
              <div>
                <label className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 mb-1.5 block">
                  Page Title (Meta Title)
                </label>
                <input type="text" value={enSEOTitle} onChange={(e) => setEnSEOTitle(e.target.value)}
                  placeholder="E.g.: Axeron Medical - Sterilization Container Systems"
                  maxLength={60}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500 transition-colors" />
                <p className="text-xs text-slate-500 mt-1">{enSEOTitle.length}/60 characters</p>
              </div>
              <div>
                <label className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 mb-1.5 block">
                  Page Description (Meta Description)
                </label>
                <textarea value={enSEODesc} onChange={(e) => setEnSEODesc(e.target.value)}
                  placeholder="Description that appears in Google search results..."
                  maxLength={160}
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500 transition-colors resize-none" />
                <p className="text-xs text-slate-500 mt-1">{enSEODesc.length}/160 characters</p>
              </div>
              <div>
                <label className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 mb-1.5 block">
                  Keywords
                </label>
                <input type="text" value={enSEOKeywords} onChange={(e) => setEnSEOKeywords(e.target.value)}
                  placeholder="E.g.: sterilization, container, medical, hospital (comma-separated)"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500 transition-colors font-mono" />
              </div>
              <div className="border-t border-slate-700 pt-4 mt-4">
                <p className="text-xs font-semibold text-slate-400 mb-3">Open Graph (Social Media)</p>
                <div className="space-y-3">
                  <input type="text" value={enSEOOgTitle} onChange={(e) => setEnSEOOgTitle(e.target.value)}
                    placeholder="OG Title (appears when shared on social media)"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500 transition-colors" />
                  <textarea value={enSEOOgDesc} onChange={(e) => setEnSEOOgDesc(e.target.value)}
                    placeholder="OG Description"
                    rows={2}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500 transition-colors resize-none" />
                  <input type="text" value={enSEOOgImage} onChange={(e) => setEnSEOOgImage(e.target.value)}
                    placeholder="OG Image (e.g.: /og-image.jpg)"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500 transition-colors font-mono" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── HAKKIMIZDA ─────────────────────────────────────────────────── */}
        {tab === "about" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold">Hakkımızda Bölümü</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Hakkımızda, Misyon, Vizyon, Kalite Değerlerimiz, Üretim Kalitesi ve Sertifikasyon metinlerini yönetin.
                </p>
              </div>
              <button onClick={() => {
                const overrides = loadOverrides();
                overrides.trAbout = trAbout;
                overrides.enAbout = enAbout;
                overrides.trMission = trMission;
                overrides.enMission = enMission;
                overrides.trVision = trVision;
                overrides.enVision = enVision;
                overrides.trQualityValue1 = trQualityValue1;
                overrides.enQualityValue1 = enQualityValue1;
                overrides.trQualityValue2 = trQualityValue2;
                overrides.enQualityValue2 = enQualityValue2;
                overrides.trQualityValue3 = trQualityValue3;
                overrides.enQualityValue3 = enQualityValue3;
                overrides.trQualityValues = trQualityValues;
                overrides.enQualityValues = enQualityValues;
                overrides.trProductionQuality = trProductionQuality;
                overrides.enProductionQuality = enProductionQuality;
                overrides.trCertification = trCertification;
                overrides.enCertification = enCertification;
                saveOverrides(overrides);
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
                setToast({ msg: "Hakkımızda bölümü kaydedildi", type: "success" });
              }}
                className="bg-blue-600 hover:bg-blue-500 transition-colors text-white text-sm font-semibold rounded-xl px-5 py-2.5">
                Kaydet
              </button>
            </div>

            {/* TR ABOUT */}
            <SectionHeader>Türkçe</SectionHeader>

            {/* Hakkımızda (Ana Başlık) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
              <div>
                <label className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 mb-1.5 block">
                  Hakkımızda (Ana Açıklama)
                </label>
                <div className="quill-editor bg-slate-800 rounded-lg overflow-hidden border border-slate-700 focus-within:border-blue-500 transition-colors">
                  <ReactQuill
                    theme="snow"
                    value={trAbout}
                    onChange={setTrAbout}
                    placeholder="Şirket hakkında genel bilgi yazın..."
                    modules={{
                      toolbar: [
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['link']
                      ]
                    }}
                    style={{ height: '280px' }}
                  />
                </div>
              </div>
            </div>

            {/* Misyon - Vizyon - Kalite Değerleri (Bir Alanda) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 mb-6">
              <div>
                <label className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 mb-1.5 block">
                  Misyon
                </label>
                <div className="quill-editor bg-slate-800 rounded-lg overflow-hidden border border-slate-700 focus-within:border-blue-500 transition-colors">
                  <ReactQuill
                    theme="snow"
                    value={trMission}
                    onChange={setTrMission}
                    placeholder="Axeron'un misyonunu yazın..."
                    modules={{
                      toolbar: [
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['link']
                      ]
                    }}
                    style={{ height: '200px' }}
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 mb-1.5 block">
                  Vizyon
                </label>
                <div className="quill-editor bg-slate-800 rounded-lg overflow-hidden border border-slate-700 focus-within:border-blue-500 transition-colors">
                  <ReactQuill
                    theme="snow"
                    value={trVision}
                    onChange={setTrVision}
                    placeholder="Axeron'un vizyonunu yazın..."
                    modules={{
                      toolbar: [
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['link']
                      ]
                    }}
                    style={{ height: '200px' }}
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 mb-1.5 block">
                  Kalite Değerlerimiz
                </label>
                <div className="quill-editor bg-slate-800 rounded-lg overflow-hidden border border-slate-700 focus-within:border-blue-500 transition-colors">
                  <ReactQuill
                    theme="snow"
                    value={trQualityValues}
                    onChange={setTrQualityValues}
                    placeholder="Kalite değerlerini yazın..."
                    modules={{
                      toolbar: [
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['link']
                      ]
                    }}
                    style={{ height: '200px' }}
                  />
                </div>
              </div>
            </div>

            {/* Üretim Kalitesi */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
              <div>
                <label className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 mb-1.5 block">
                  Üretim Kalitesi
                </label>
                <div className="quill-editor bg-slate-800 rounded-lg overflow-hidden border border-slate-700 focus-within:border-blue-500 transition-colors">
                  <ReactQuill
                    theme="snow"
                    value={trProductionQuality}
                    onChange={setTrProductionQuality}
                    placeholder="Üretim kalitesi hakkında bilgi yazın..."
                    modules={{
                      toolbar: [
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['link']
                      ]
                    }}
                    style={{ height: '280px' }}
                  />
                </div>
              </div>
            </div>

            {/* Sertifikasyon */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
              <div>
                <label className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 mb-1.5 block">
                  Sertifikasyon
                </label>
                <div className="quill-editor bg-slate-800 rounded-lg overflow-hidden border border-slate-700 focus-within:border-blue-500 transition-colors">
                  <ReactQuill
                    theme="snow"
                    value={trCertification}
                    onChange={setTrCertification}
                    placeholder="Sertifikaları yazın..."
                    modules={{
                      toolbar: [
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['link']
                      ]
                    }}
                    style={{ height: '280px' }}
                  />
                </div>
              </div>
            </div>

            {/* EN ABOUT */}
            <SectionHeader>English</SectionHeader>

            {/* About Us (Main Description) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
              <div>
                <label className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 mb-1.5 block">
                  About Us (Main Description)
                </label>
                <div className="quill-editor bg-slate-800 rounded-lg overflow-hidden border border-slate-700 focus-within:border-blue-500 transition-colors">
                  <ReactQuill
                    theme="snow"
                    value={enAbout}
                    onChange={setEnAbout}
                    placeholder="Write general company information..."
                    modules={{
                      toolbar: [
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['link']
                      ]
                    }}
                    style={{ height: '280px' }}
                  />
                </div>
              </div>
            </div>

            {/* Mission - Vision - Quality Values (One Section) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 mb-6">
              <div>
                <label className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 mb-1.5 block">
                  Mission
                </label>
                <div className="quill-editor bg-slate-800 rounded-lg overflow-hidden border border-slate-700 focus-within:border-blue-500 transition-colors">
                  <ReactQuill
                    theme="snow"
                    value={enMission}
                    onChange={setEnMission}
                    placeholder="Write Axeron's mission..."
                    modules={{
                      toolbar: [
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['link']
                      ]
                    }}
                    style={{ height: '200px' }}
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 mb-1.5 block">
                  Vision
                </label>
                <div className="quill-editor bg-slate-800 rounded-lg overflow-hidden border border-slate-700 focus-within:border-blue-500 transition-colors">
                  <ReactQuill
                    theme="snow"
                    value={enVision}
                    onChange={setEnVision}
                    placeholder="Write Axeron's vision..."
                    modules={{
                      toolbar: [
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['link']
                      ]
                    }}
                    style={{ height: '200px' }}
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 mb-1.5 block">
                  Our Quality Values
                </label>
                <div className="quill-editor bg-slate-800 rounded-lg overflow-hidden border border-slate-700 focus-within:border-blue-500 transition-colors">
                  <ReactQuill
                    theme="snow"
                    value={enQualityValues}
                    onChange={setEnQualityValues}
                    placeholder="Write about quality values..."
                    modules={{
                      toolbar: [
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['link']
                      ]
                    }}
                    style={{ height: '200px' }}
                  />
                </div>
              </div>
            </div>

            {/* Production Quality */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
              <div>
                <label className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 mb-1.5 block">
                  Production Quality
                </label>
                <div className="quill-editor bg-slate-800 rounded-lg overflow-hidden border border-slate-700 focus-within:border-blue-500 transition-colors">
                  <ReactQuill
                    theme="snow"
                    value={enProductionQuality}
                    onChange={setEnProductionQuality}
                    placeholder="Write about production quality..."
                    modules={{
                      toolbar: [
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['link']
                      ]
                    }}
                    style={{ height: '280px' }}
                  />
                </div>
              </div>
            </div>

            {/* Certification */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
              <div>
                <label className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 mb-1.5 block">
                  Certification
                </label>
                <div className="quill-editor bg-slate-800 rounded-lg overflow-hidden border border-slate-700 focus-within:border-blue-500 transition-colors">
                  <ReactQuill
                    theme="snow"
                    value={enCertification}
                    onChange={setEnCertification}
                    placeholder="Write about certifications..."
                    modules={{
                      toolbar: [
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['link']
                      ]
                    }}
                    style={{ height: '280px' }}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button onClick={() => {
                const overrides = loadOverrides();
                overrides.trAbout = trAbout;
                overrides.enAbout = enAbout;
                overrides.trMission = trMission;
                overrides.enMission = enMission;
                overrides.trVision = trVision;
                overrides.enVision = enVision;
                overrides.trQualityValue1 = trQualityValue1;
                overrides.enQualityValue1 = enQualityValue1;
                overrides.trQualityValue2 = trQualityValue2;
                overrides.enQualityValue2 = enQualityValue2;
                overrides.trQualityValue3 = trQualityValue3;
                overrides.enQualityValue3 = enQualityValue3;
                overrides.trQualityValues = trQualityValues;
                overrides.enQualityValues = enQualityValues;
                overrides.trProductionQuality = trProductionQuality;
                overrides.enProductionQuality = enProductionQuality;
                overrides.trCertification = trCertification;
                overrides.enCertification = enCertification;
                saveOverrides(overrides);
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
                setToast({ msg: "Hakkımızda bölümü kaydedildi", type: "success" });
              }}
                className="bg-blue-600 hover:bg-blue-500 transition-colors text-white text-sm font-semibold rounded-xl px-6 py-3">
                Kaydet
              </button>
            </div>
          </div>
        )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-5 py-3 rounded-lg text-white font-semibold text-sm shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300 ${
          toast.type === "success" ? "bg-emerald-500" : "bg-red-500"
        }`}>
          {toast.msg}
        </div>
      )}
      </div>
    </div>
  );
}
