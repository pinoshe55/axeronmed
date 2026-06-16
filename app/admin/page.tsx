"use client";



import { useState, useEffect, useRef } from "react";

import dynamic from "next/dynamic";

import { useContent } from "@/context/ContentContext";

import { loadOverrides, loadOverridesFromServer, saveOverrides, cacheLocally, type GalleryItem, type StatItem, type EmailConfig, type AdminUser, type SEOConfig, type SiteOverrides, type PageContent, type ActivePages, type ActiveSections, type ThemeConfig } from "@/lib/siteOverrides";
import { applyTheme } from "@/components/ThemeInjector";

import { translations } from "@/lib/i18n";

import { hashPassword, verifyPassword, generateUserId } from "@/lib/auth";

import MediaManager from "@/components/MediaManager";

import HeroImageUpload from "@/components/HeroImageUpload";
import BlockEditor from "@/components/BlockEditor";
import type { ContentBlock } from "@/lib/siteOverrides";



// Lazy load ModelPreviewCanvas to avoid Three.js in SSR

const ModelPreviewCanvas = dynamic(() => import("@/components/ModelPreviewCanvas"), {

  ssr: false,

  loading: () => <div className="w-full h-64 bg-gray-50 border border-gray-300 rounded-lg flex items-center justify-center text-slate-400">Model yükleniyor...</div>,

});



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

    <h3 className="text-xs font-bold tracking-[0.15em] uppercase text-gray-400 mt-8 mb-3 pb-2 border-b border-gray-300">

      {children}

    </h3>

  );

}



// ─── Ana Panel ───────────────────────────────────────────────────────────────

export default function AdminPage() {

  const [authed, setAuthed] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const [pw, setPw] = useState("");

  const [pwError, setPwError] = useState(false);

  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);

  const [tab, setTab] = useState<TabId>("dashboard");

  const { overrides, serverLoaded, updateText, updateGallery, updateStats, updateEmailConfig, getStats, resetAll } = useContent();



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

  const [darkBgColor, setDarkBgColor] = useState("#3a3a3a");

  const [accentColor, setAccentColor] = useState("#4a9eff");

  const [whatsappNumber, setWhatsappNumber] = useState("");

  // Tema state
  const [themeColorBg, setThemeColorBg] = useState("#ece9e3");
  const [themeColorInk, setThemeColorInk] = useState("#0d0c0a");
  const [themeColorAccent, setThemeColorAccent] = useState("#4A7FD7");
  const [themeColorDark, setThemeColorDark] = useState("#3a3730");
  const [themeFontFamily, setThemeFontFamily] = useState<"system"|"inter"|"playfair"|"space-grotesk"|"dm-sans"|"roboto-slab">("system");
  const [themeHeadingWeight, setThemeHeadingWeight] = useState<"600"|"700"|"800"|"900">("700");
  const [themeNavStyle, setThemeNavStyle] = useState<"hamburger"|"topbar"|"sidebar">("hamburger");
  const [themeNavBg, setThemeNavBg] = useState("rgba(236, 233, 227, 0.92)");
  const [themeButtonRadius, setThemeButtonRadius] = useState<"none"|"sm"|"lg"|"full">("full");
  const [themeCardRadius, setThemeCardRadius] = useState<"none"|"sm"|"md"|"lg"|"xl">("lg");
  const [themeGlassBlur, setThemeGlassBlur] = useState(true);
  const [themeAnimations, setThemeAnimations] = useState(true);

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

  const [heroMediaType, setHeroMediaType] = useState<"3d" | "video">("3d");

  const [heroVideoPath, setHeroVideoPath] = useState("");

  const [videoUrlInput, setVideoUrlInput] = useState("");

  const [galleryLayout, setGalleryLayout] = useState<"collage" | "masonry" | "strip" | "catalog">("catalog");

  const [hiddenMediaFiles, setHiddenMediaFiles] = useState<string[]>([]);

  const [activePages, setActivePages] = useState<ActivePages>({});

  const [activeSections, setActiveSections] = useState<ActiveSections>({});

  const [pagesContent, setPagesContent] = useState<{

    urunler: PageContent; kurumsal: PageContent; kalitePolitikamiz: PageContent;

    kaliteBelgeleri: PageContent; referanslarimiz: PageContent; kvkk: PageContent;

    hero: PageContent; hakkimizda: PageContent; sss: PageContent; iletisim: PageContent;

  }>({ urunler: {}, kurumsal: {}, kalitePolitikamiz: {}, kaliteBelgeleri: {}, referanslarimiz: {}, kvkk: {}, hero: {}, hakkimizda: {}, sss: {}, iletisim: {} });

  const [customPages, setCustomPages] = useState<import("@/lib/siteOverrides").CustomPage[]>([]);

  const [newPageSlug, setNewPageSlug] = useState("");

  const [newPageLabel, setNewPageLabel] = useState("");

  const [showNewPageForm, setShowNewPageForm] = useState(false);

  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);

  const [uploadingVideo, setUploadingVideo] = useState(false);

  const [videoList, setVideoList] = useState<Array<{ name: string; path: string; size: number; sizeFormatted: string }>>([]);

  const [loadingVideos, setLoadingVideos] = useState(false);

  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);

  const addFileRef = useRef<HTMLInputElement>(null);



  // About section states

  const [trAbout, setTrAbout] = useState("");

  const [enAbout, setEnAbout] = useState("");

  const [certImages, setCertImages] = useState<(string|null)[]>([null, null, null]);
  const [certLinks, setCertLinks] = useState<(string|null)[]>([null, null, null]);

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

  const [trFaqs, setTrFaqs] = useState<{q: string; a: string}[]>([]);

  const [enFaqs, setEnFaqs] = useState<{q: string; a: string}[]>([]);

  const [trContactBlocks, setTrContactBlocks] = useState<{label: string; lines: string[]}[]>([]);

  const [enContactBlocks, setEnContactBlocks] = useState<{label: string; lines: string[]}[]>([]);

  const [trCompanyInfo, setTrCompanyInfo] = useState("");

  const [enCompanyInfo, setEnCompanyInfo] = useState("");



  function applyRawToState(raw: SiteOverrides) {

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

    setDarkBgColor(raw.darkBgColor || "#3a3a3a");

    setAccentColor(raw.accentColor || "#4a9eff");

    setWhatsappNumber(raw.whatsappNumber || "");

    // Tema
    const t = raw.theme || {};
    setThemeColorBg(t.colorBg || "#ece9e3");
    setThemeColorInk(t.colorInk || "#0d0c0a");
    setThemeColorAccent(t.colorAccent || "#4A7FD7");
    setThemeColorDark(t.colorDark || "#3a3730");
    setThemeFontFamily(t.fontFamily || "system");
    setThemeHeadingWeight(t.headingWeight || "700");
    setThemeNavStyle(t.navStyle || "hamburger");
    setThemeNavBg(t.navBg || "rgba(236, 233, 227, 0.92)");
    setThemeButtonRadius(t.buttonRadius || "full");
    setThemeCardRadius(t.cardRadius || "lg");
    setThemeGlassBlur(t.glassBlur !== false);
    setThemeAnimations(t.animationsEnabled !== false);

    setHeroMediaType(raw.heroMediaType || "3d");

    setHeroVideoPath(raw.heroVideoPath || "");

    setGalleryLayout(raw.galleryLayout || "collage");

    setTrAbout(raw.trAbout || "");

    setEnAbout(raw.enAbout || "");

    setCertImages((raw.certImages as (string|null)[]) || [null, null, null]);
    setCertLinks((raw.certLinks as (string|null)[]) || [null, null, null]);

    setTrMission(raw.trMission || "");

    setEnMission(raw.enMission || "");

    setTrVision(raw.trVision || "");

    setEnVision(raw.enVision || "");

    setTrQualityValue1(raw.trQualityValue1 || { value: "", label: "", desc: "" });

    setEnQualityValue1(raw.enQualityValue1 || { value: "", label: "", desc: "" });

    setTrQualityValue2(raw.trQualityValue2 || { value: "", label: "", desc: "" });

    setEnQualityValue2(raw.enQualityValue2 || { value: "", label: "", desc: "" });

    setTrQualityValue3(raw.trQualityValue3 || { value: "", label: "", desc: "" });

    setEnQualityValue3(raw.enQualityValue3 || { value: "", label: "", desc: "" });

    setTrQualityValues(raw.trQualityValues || "");

    setEnQualityValues(raw.enQualityValues || "");

    setTrProductionQuality(raw.trProductionQuality || "");

    setEnProductionQuality(raw.enProductionQuality || "");

    setTrCertification(raw.trCertification || "");

    setEnCertification(raw.enCertification || "");

    setHiddenMediaFiles(raw.hiddenMediaFiles || []);

    setActivePages(raw.activePages || {});

    setActiveSections(raw.activeSections || {});

    setTrFaqs(raw.trFaqs || []);

    setEnFaqs(raw.enFaqs || []);

    setTrContactBlocks(raw.trContactBlocks || []);

    setEnContactBlocks(raw.enContactBlocks || []);

    setTrCompanyInfo(raw.trCompanyInfo || "");

    setEnCompanyInfo(raw.enCompanyInfo || "");

    setCustomPages(raw.customPages || []);

    setPagesContent({

      urunler: raw.pages?.urunler || {},

      kurumsal: raw.pages?.kurumsal || {},

      kalitePolitikamiz: raw.pages?.kalitePolitikamiz || {},

      kaliteBelgeleri: raw.pages?.kaliteBelgeleri || {},

      referanslarimiz: raw.pages?.referanslarimiz || {},

      kvkk: raw.pages?.kvkk || {},

      hero: raw.pages?.hero || {},

      hakkimizda: raw.pages?.hakkimizda || {},

      sss: raw.pages?.sss || {},

      iletisim: raw.pages?.iletisim || {},

    });

  }



  useEffect(() => {
    const isAuthed = sessionStorage.getItem("axeron_admin_authed") === "1";
    setAuthed(isAuthed);
    setAuthChecked(true);
  }, []);

  useEffect(() => {

    const localData = loadOverrides();

    // Load local cache immediately for fast UI

    applyRawToState(localData);

    loadOverridesFromServer().then((serverData) => {

      if (serverData) {

        // Server has data → use it as source of truth, only cache locally (don't write back to blob)

        applyRawToState(serverData);

        cacheLocally(serverData);

      } else {

        // Server empty (first deploy) → push local data to server

        saveOverrides(localData);

      }

    });



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



    // Load available videos

    setLoadingVideos(true);

    fetch("/api/videos/list")

      .then((res) => res.json())

      .then((data) => {

        if (data.success && data.videos) {

          setVideoList(data.videos);

        }

      })

      .catch((err) => console.error("Failed to load videos:", err))

      .finally(() => setLoadingVideos(false));

  }, []);



  // ─── Helper: Preserve colors + other settings when saving ───

  const saveWithColors = (updates: Partial<SiteOverrides>) => {

    const base = loadOverrides(); // localStorage is always current after cacheLocally fix

    const merged = {

      ...base,

      ...updates,

      // Always preserve current state values

      darkBgColor,

      accentColor,

      whatsappNumber,

    };

    saveOverrides(merged);

  };



  const [pushing, setPushing] = useState(false);



  async function saveActiveSectionsToServer(next: ActiveSections) {
    const ov = loadOverrides();
    ov.activeSections = next;
    saveOverrides(ov);
  }

  async function pushAllToServer() {

    setPushing(true);

    try {

      // Build payload: use context overrides (server-loaded, has real gallery URLs) as base
      // then overlay React state values that may have changed since load

      const local = loadOverrides();

      const payload = {

        ...local,

        // Use server-loaded gallery so CDN URLs aren't lost (localStorage strips them)
        gallery: overrides.gallery?.length ? overrides.gallery : local.gallery,

        // Ensure latest form state values are included

        darkBgColor,

        accentColor,

        whatsappNumber,

        heroMediaType,

        heroVideoPath,

        galleryLayout,

        modelPath,

        trAbout, enAbout, trMission, enMission, trVision, enVision,

        trQualityValue1, enQualityValue1,

        trQualityValue2, enQualityValue2,

        trQualityValue3, enQualityValue3,

        trFaqs, enFaqs,

        trContactBlocks, enContactBlocks,

        trCompanyInfo, enCompanyInfo,

        adminUsers: [], // never send password hashes

        verificationTokens: [],

        hiddenMediaFiles,

        activePages,

        activeSections,

        customPages,

        pages: pagesContent,

      };

      const res = await fetch("/api/site-data", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify(payload),

      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);

      setToast({ msg: "✓ Sunucu güncellendi — tüm cihazlarda geçerli", type: "success" });

    } catch (e) {

      setToast({ msg: `Hata: ${e instanceof Error ? e.message : String(e)}`, type: "error" });

    } finally {

      setPushing(false);

    }

  }



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

      sessionStorage.setItem("axeron_admin_authed", "1");

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

    // En güncel ayarları localStorage'dan oku ki galleryLayout / renk / medya

    // gibi başka tab'larda yazılan alanlar ezilmesin

    const fresh = loadOverrides();

    saveOverrides({ ...fresh, gallery: toSave });

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

  if (!authChecked) return null;

  if (!authed) {

    return (

      <div className="min-h-screen flex items-center justify-center bg-gray-50">

        <form onSubmit={handleLogin}

          className="bg-white border border-gray-200 rounded-2xl p-10 w-full max-w-sm flex flex-col gap-6">

          <div>

            <p className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400 mb-1">Axeron Medical</p>

            <h1 className="text-2xl font-semibold text-gray-900">Admin Paneli</h1>

          </div>

          <div className="flex flex-col gap-2">

            <label className="text-xs text-slate-400">Şifre</label>

            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)}

              placeholder="Şifrenizi girin"

              className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 transition-colors"

              autoFocus />

            {pwError && <p className="text-xs text-red-400">Hatalı şifre.</p>}

          </div>

          <button type="submit"

            className="bg-blue-600 hover:bg-blue-500 transition-colors text-white font-semibold rounded-xl py-3 text-sm">

            Giriş Yap

          </button>

          <a href="/" className="text-center text-xs text-gray-400 hover:text-gray-700 transition-colors">← Siteye Dön</a>

        </form>

      </div>

    );

  }



  // ── Panel ──────────────────────────────────────────────────────────────────

  type TabId = "dashboard" | "gallery" | "about" | "sayfalar" | "tr" | "en" | "seo" | "3d" | "stats" | "colors" | "mail" | "users" | "page_urunler" | "page_kurumsal" | "page_referanslarimiz" | "page_kvkk" | "page_hero" | "page_hakkimizda" | "page_sss" | "page_iletisim" | (string & {});



  const TAB_LABELS: Record<string, string> = {

    dashboard: "Genel Bakış", gallery: "Galeri", about: "Hakkımızda",

    sayfalar: "Sayfalar", tr: "Metinler (TR)", en: "Metinler (EN)",

    seo: "SEO Ayarları", "3d": "3D / Video", stats: "İstatistikler",

    colors: "Tema & Tasarım", mail: "Mail Ayarları", users: "Kullanıcılar",

    page_urunler: "Ürünler", page_kurumsal: "Kurumsal",

    page_referanslarimiz: "Referanslarımız", page_kvkk: "KVKK",

    page_hero: "Ana Sayfa", page_hakkimizda: "Hakkımızda", page_sss: "SSS", page_iletisim: "İletişim",

  };



  const PAGE_ITEMS = [

    { id: "page_urunler" as TabId, label: "Ürünler", key: "urunler" as const, path: "/urunler" },

    { id: "page_kurumsal" as TabId, label: "Kurumsal", key: "kurumsal" as const, path: "/kurumsal" },

    { id: "page_referanslarimiz" as TabId, label: "Referanslarımız", key: "referanslarimiz" as const, path: "/referanslarimiz" },

    { id: "page_kvkk" as TabId, label: "KVKK", key: "kvkk" as const, path: "/kvkk" },

  ];



  const NAV_GROUPS = [

    { label: "GENEL", items: [{ id: "dashboard", label: "Genel Bakış", icon: "📊" }] },

    { label: "SAYFALAR", items: [
      { id: "page_hero",       label: "Ana Sayfa / Hero", icon: "🏠" },
      { id: "page_hakkimizda", label: "Hakkımızda",       icon: "ℹ️" },
      { id: "page_sss",        label: "SSS",              icon: "❓" },
      { id: "page_iletisim",   label: "İletişim",         icon: "📞" },
    ]},

    { label: "MEDYA", items: [
      { id: "gallery", label: "Galeri", icon: "🖼️" },
      { id: "3d", label: "3D / Video", icon: "🎬" },
    ]},

    { label: "VERİLER", items: [

      { id: "stats",  label: "İstatistikler", icon: "📈" },

      { id: "colors", label: "Tema", icon: "🎨" },

    ]},

    { label: "AYARLAR", items: [

      { id: "seo",   label: "SEO", icon: "🔍" },

      { id: "mail",  label: "Mail", icon: "📧" },

      { id: "users", label: "Kullanıcılar", icon: "👥" },

    ]},

  ] as const;



  const fields = tab === "tr" ? TR_FIELDS : EN_FIELDS;

  const langOverrides = tab === "tr" ? (overrides.tr ?? {}) : (overrides.en ?? {});



  const navBtnCls = (id: string) =>

    "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left " +

    (tab === id ? "bg-blue-600 text-white font-medium" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100");



  return (

    <div className="min-h-screen bg-gray-50 text-gray-900 flex">



      {/* ── Sidebar (light) ───────────────────────────────────────────────── */}

      <aside className="w-64 fixed top-0 left-0 h-full bg-white border-r border-gray-200 flex flex-col z-20 overflow-y-auto">

        {/* Brand */}

        <div className="px-5 py-5 border-b border-gray-100">

          <div className="flex items-center gap-2.5">

            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-xs font-bold text-white">A</div>

            <div>

              <p className="text-sm font-bold text-gray-900 leading-none">AXERON</p>

              <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Yönetim Paneli</p>

            </div>

          </div>

        </div>



        {/* Nav */}

        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">

          {NAV_GROUPS.map((group) => (

            <div key={group.label}>

              <p className="text-[9px] font-bold tracking-[0.18em] text-gray-400 uppercase mb-1.5 px-2">{group.label}</p>

              <div className="space-y-0.5">

                {group.items.map((item) => (
                  <button key={item.id} onClick={() => setTab(item.id as TabId)} className={navBtnCls(item.id)}>
                    <span className="text-base leading-none">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}

                {/* Sayfalar sub-section — only under SAYFALAR */}

                {group.label === "SAYFALAR" && (

                  <div className="mt-2 pt-2 border-t border-gray-100">

                    <p className="text-[9px] font-bold tracking-[0.15em] text-gray-400 uppercase mb-1.5 px-2">Diğer Sayfalar</p>

                    {PAGE_ITEMS.map((page) => {

                      const isActive = activePages[page.key] ?? false;

                      const isSelected = tab === page.id;

                      return (

                        <button key={page.id} onClick={() => setTab(page.id)}

                          className={"w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors text-left " +

                            (isSelected ? "bg-blue-600 text-white font-medium" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100")}>

                          <span>{page.label}</span>

                          <span className={"w-1.5 h-1.5 rounded-full flex-shrink-0 " + (isActive ? "bg-emerald-500" : "bg-gray-300")} />

                        </button>

                      );

                    })}

                    {/* Custom pages */}

                    {customPages.map((cp) => {

                      const cpTabId = "custom_" + cp.id;

                      const isSelected = tab === cpTabId;

                      return (

                        <button key={cp.id} onClick={() => setTab(cpTabId)}

                          className={"w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors text-left " +

                            (isSelected ? "bg-blue-600 text-white font-medium" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100")}>

                          <span className="truncate">{cp.navLabel}</span>

                          <span className={"w-1.5 h-1.5 rounded-full flex-shrink-0 " + (cp.active ? "bg-emerald-500" : "bg-gray-300")} />

                        </button>

                      );

                    })}

                    {/* Add new page */}

                    {showNewPageForm ? (

                      <div className="mt-1 px-2 space-y-2">

                        <input type="text" value={newPageLabel} onChange={(e) => setNewPageLabel(e.target.value)}

                          placeholder="Sayfa adı (örn: Haberler)"

                          className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-xs text-gray-900 outline-none focus:border-blue-400" />

                        <input type="text" value={newPageSlug} onChange={(e) => setNewPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}

                          placeholder="slug (örn: haberler)"

                          className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-xs text-gray-900 outline-none focus:border-blue-400 font-mono" />

                        <div className="flex gap-1.5">

                          <button onClick={() => {

                            if (!newPageLabel.trim() || !newPageSlug.trim()) return;

                            const newPage: import("@/lib/siteOverrides").CustomPage = {

                              id: Date.now().toString(),

                              slug: newPageSlug.trim(),

                              navLabel: newPageLabel.trim(),

                              trTitle: newPageLabel.trim(),

                              enTitle: newPageLabel.trim(),

                              active: false,

                              showInNav: true,

                            };

                            const updated = [...customPages, newPage];

                            setCustomPages(updated);

                            saveWithColors({ customPages: updated });

                            setTab("custom_" + newPage.id);

                            setNewPageLabel(""); setNewPageSlug(""); setShowNewPageForm(false);

                            setToast({ msg: newPage.navLabel + " sayfası oluşturuldu", type: "success" });

                          }} className="flex-1 text-xs bg-blue-600 text-white rounded px-2 py-1.5 font-medium hover:bg-blue-500 transition-colors">

                            Oluştur

                          </button>

                          <button onClick={() => { setShowNewPageForm(false); setNewPageLabel(""); setNewPageSlug(""); }}

                            className="text-xs text-gray-400 hover:text-gray-600 px-2">İptal</button>

                        </div>

                      </div>

                    ) : (

                      <button onClick={() => setShowNewPageForm(true)}

                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors mt-1">

                        <span className="text-base leading-none">+</span>

                        <span>Yeni Sayfa Ekle</span>

                      </button>

                    )}

                  </div>

                )}

              </div>

            </div>

          ))}





        </nav>



        {/* Footer */}

        <div className="px-3 py-4 border-t border-gray-100 space-y-1">

          <a href="/" target="_blank"

            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">

            <span>↗</span><span>Siteyi Gör</span>

          </a>

          <button onClick={() => { sessionStorage.removeItem("axeron_admin_authed"); setAuthed(false); }}

            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors">

            <span>→</span><span>Güvenli Çıkış</span>

          </button>

        </div>

      </aside>



      {/* ── Main content ─────────────────────────────────────────────────── */}

      <div className="flex-1 ml-64 min-h-screen flex flex-col">



        {/* Top bar */}

        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-200 px-6 py-3.5 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <h1 className="text-sm font-semibold text-gray-900">{TAB_LABELS[tab] ?? tab}</h1>

            {saved && <span className="text-xs text-emerald-600 font-medium">✓ Kaydedildi</span>}

          </div>

          <div className="flex items-center gap-2">

            <button onClick={handleReset}

              className="text-xs text-gray-400 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg border border-gray-200 hover:border-red-200">

              Sıfırla

            </button>

            <button onClick={pushAllToServer} disabled={pushing}

              className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-colors rounded-lg px-4 py-1.5">

              {pushing ? "⏳ Güncelleniyor..." : "🌐 Sunucuyu Güncelle"}

            </button>

          </div>

        </div>



      <div className="flex-1 p-6 max-w-5xl">



        {/* ── DASHBOARD ────────────────────────────────────────────────── */}

        {tab === "dashboard" && (

          <div className="space-y-6">

            <div>

              <h2 className="text-xl font-semibold">Genel Bakış</h2>

              <p className="text-xs text-gray-400 mt-1">Site durumu ve hızlı erişim</p>

            </div>



            {/* Stat cards */}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

              {[

                { label: "Galeri Görseli", value: gallery.filter(g => g.active).length + " / " + gallery.length, icon: "🖼️", color: "bg-blue-600/10 border-blue-600/20" },

                { label: "Aktif Medya", value: heroMediaType === "video" ? "Video" : "3D Model", icon: heroMediaType === "video" ? "🎬" : "🧊", color: "bg-purple-600/10 border-purple-600/20" },

                { label: "Aktif Sayfa", value: Object.values(activePages).filter(Boolean).length + " sayfa", icon: "📄", color: "bg-emerald-600/10 border-emerald-600/20" },

                { label: "Dil", value: "TR + EN", icon: "🌐", color: "bg-amber-600/10 border-amber-600/20" },

              ].map((card) => (

                <div key={card.label} className={"rounded-xl border p-4 " + card.color}>

                  <p className="text-2xl mb-2">{card.icon}</p>

                  <p className="text-xl font-bold text-white">{card.value}</p>

                  <p className="text-xs text-gray-400 mt-0.5">{card.label}</p>

                </div>

              ))}

            </div>



            {/* Quick access */}

            <div>

              <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-3">Hızlı Erişim</p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

                {[

                  { id: "gallery", label: "Galeri Düzenle", desc: "Görselleri yönet", icon: "🖼️" },

                  { id: "sayfalar", label: "Sayfa Yönetimi", desc: "Aktif/pasif & içerik", icon: "📄" },

                  { id: "3d", label: "Hero Medya", desc: "3D model veya video", icon: "🎬" },

                  { id: "about", label: "Hakkımızda", desc: "Şirket bilgileri", icon: "ℹ️" },

                  { id: "colors", label: "Renkler", desc: "Tema renkleri", icon: "🎨" },

                  { id: "seo", label: "SEO", desc: "Arama motoru ayarları", icon: "🔍" },

                ].map((item: {id: string; label: string; desc: string; icon: string}) => (

                  <button key={item.id} onClick={() => setTab(item.id as never)}

                    className="flex items-start gap-3 p-4 bg-white border border-gray-100 hover:border-slate-600 rounded-xl transition-colors text-left">

                    <span className="text-xl">{item.icon}</span>

                    <div>

                      <p className="text-sm font-semibold text-gray-900">{item.label}</p>

                      <p className="text-[11px] text-gray-400 mt-0.5">{item.desc}</p>

                    </div>

                  </button>

                ))}

              </div>

            </div>

          </div>

        )}



        {/* ── GALERİ ─────────────────────────────────────────────────────── */}

        {tab === "gallery" && (

          <div>

            <div className="flex items-center justify-between mb-6">

              <div>

                <h2 className="text-lg font-semibold">Ürün Galerisi</h2>

                <p className="text-xs text-gray-400 mt-1">

                  Resim yükleyin, açıklama ekleyin veya pasife alın. Pasif resimler sitede görünmez.

                </p>

              </div>

              <button onClick={saveGallery}

                className="bg-blue-600 hover:bg-blue-500 transition-colors text-white text-sm font-semibold rounded-xl px-5 py-2.5">

                Kaydet

              </button>

            </div>



            {/* Galeri bölümü görünürlük toggle */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">Galeri bölümünü sitede göster</p>
                <p className="text-xs text-gray-400 mt-0.5">Kapalıysa Ürün Galerisi bölümü sitede görünmez</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = { ...activeSections, gallery: activeSections.gallery === false ? true : false };
                  setActiveSections(next);
                  saveActiveSectionsToServer(next);
                }}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${activeSections.gallery === false ? "bg-gray-300" : "bg-emerald-500"}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${activeSections.gallery === false ? "translate-x-0" : "translate-x-5"}`} />
              </button>
            </div>

            {/* Galeri tasarım stili seçici */}

            <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6">

              <label className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-3 block">

                Galeri Tasarım Stili

              </label>

              <div className="flex flex-wrap gap-2">

                {([

                  { id: "catalog", title: "Katalog" },

                  { id: "collage", title: "Kolaj" },

                  { id: "masonry", title: "Izgara" },

                  { id: "strip", title: "Şerit" },

                ] as { id: "catalog"|"collage"|"masonry"|"strip"; title: string }[]).map((opt) => (

                  <button

                    key={opt.id}

                    onClick={() => {

                      setGalleryLayout(opt.id);

                      saveWithColors({ galleryLayout: opt.id });

                      setToast({ msg: `Galeri stili: ${opt.title} ✓`, type: "success" });

                    }}

                    className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${

                      galleryLayout === opt.id

                        ? "bg-blue-600 border-blue-600 text-white"

                        : "bg-gray-100 border-gray-300 text-gray-700 hover:border-gray-500"

                    }`}

                  >

                    {opt.title}

                  </button>

                ))}

              </div>

            </div>



            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

              {gallery.map((img, i) => (

                <div key={i}

                  className={`bg-white border rounded-2xl overflow-hidden transition-opacity ${

                    img.active ? "border-gray-200" : "border-gray-300 opacity-50"

                  }`}>

                  {/* Resim önizleme */}

                  <div className="relative w-full h-32 bg-gray-100 group">

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

                  <div className="p-3">

                    <input type="text" value={img.caption} onChange={(e) => handleCaption(i, e.target.value)}

                      placeholder="Açıklama (opsiyonel)"

                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-blue-500 transition-colors" />

                  </div>

                </div>

              ))}



              {/* Yeni resim ekle kartı */}

              <div

                className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-2xl h-32 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group"

                onClick={() => addFileRef.current?.click()}

              >

                <span className="text-3xl text-gray-400 group-hover:text-blue-400 transition-colors">+</span>

                <span className="text-xs text-gray-400 group-hover:text-blue-400 transition-colors font-medium">Yeni Resim Ekle</span>

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

                <p className="text-xs text-gray-400 mt-1">

                  Hakkımızda bölümündeki 4 istatistik kartını düzenleyin (TR ve EN ayrı ayrı).

                </p>

              </div>

              <button onClick={saveStats}

                className="bg-blue-600 hover:bg-blue-500 transition-colors text-white text-sm font-semibold rounded-xl px-5 py-2.5">

                Kaydet

              </button>

            </div>

            {/* Aktif/Pasif togglelar */}
            <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100 mb-6">
              {([
                { key: "stats" as const, label: "İstatistik Kartları", desc: "Rakamlarla Biz başlığı ve kartlar" },
                { key: "ctaBand" as const, label: "Alt CTA Bandı", desc: '"Tedarike Açık" koyu arka planlı bölüm' },
              ]).map(({ key, label, desc }) => (
                <div key={key} className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = { ...activeSections, [key]: activeSections[key] === false ? true : false };
                      setActiveSections(next);
                      saveActiveSectionsToServer(next);
                    }}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${activeSections[key] === false ? "bg-gray-300" : "bg-emerald-500"}`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${activeSections[key] === false ? "translate-x-0" : "translate-x-5"}`} />
                  </button>
                </div>
              ))}
            </div>



            {/* TR Stats */}

            <SectionHeader>Türkçe</SectionHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">

              {trStats.map((st, i) => (

                <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-3">

                  <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Kart {i + 1}</p>

                  <div>

                    <label className="text-[10px] text-gray-400 mb-1 block">Değer (ör. 15+)</label>

                    <input type="text" value={st.value}

                      onChange={(e) => setTrStats(prev => { const n=[...prev]; n[i]={...n[i],value:e.target.value}; return n; })}

                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 transition-colors font-bold" />

                  </div>

                  <div>

                    <label className="text-[10px] text-gray-400 mb-1 block">Başlık (ör. Yıl Deneyim)</label>

                    <input type="text" value={st.label}

                      onChange={(e) => setTrStats(prev => { const n=[...prev]; n[i]={...n[i],label:e.target.value}; return n; })}

                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 transition-colors" />

                  </div>

                  <div>

                    <label className="text-[10px] text-gray-400 mb-1 block">Alt Açıklama</label>

                    <input type="text" value={st.desc}

                      onChange={(e) => setTrStats(prev => { const n=[...prev]; n[i]={...n[i],desc:e.target.value}; return n; })}

                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 transition-colors" />

                  </div>

                </div>

              ))}

            </div>



            {/* EN Stats */}

            <SectionHeader>English</SectionHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {enStats.map((st, i) => (

                <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-3">

                  <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Card {i + 1}</p>

                  <div>

                    <label className="text-[10px] text-gray-400 mb-1 block">Value (e.g. 15+)</label>

                    <input type="text" value={st.value}

                      onChange={(e) => setEnStats(prev => { const n=[...prev]; n[i]={...n[i],value:e.target.value}; return n; })}

                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 transition-colors font-bold" />

                  </div>

                  <div>

                    <label className="text-[10px] text-gray-400 mb-1 block">Label (e.g. Years Experience)</label>

                    <input type="text" value={st.label}

                      onChange={(e) => setEnStats(prev => { const n=[...prev]; n[i]={...n[i],label:e.target.value}; return n; })}

                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 transition-colors" />

                  </div>

                  <div>

                    <label className="text-[10px] text-gray-400 mb-1 block">Description</label>

                    <input type="text" value={st.desc}

                      onChange={(e) => setEnStats(prev => { const n=[...prev]; n[i]={...n[i],desc:e.target.value}; return n; })}

                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 transition-colors" />

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

              <p className="text-xs text-gray-400 mt-1">Alanı değiştirin — her alan otomatik kaydedilir.</p>

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

                    <div className="flex gap-3 items-start py-2 border-b border-gray-200/50">

                      <div className="w-48 flex-shrink-0 pt-1">

                        <p className="text-xs text-slate-400 font-medium">{prettyKey(key)}</p>

                        <p className="text-[10px] text-gray-400 mt-0.5 truncate">{key}</p>

                      </div>

                      <div className="flex-1 relative">

                        {isMultiline ? (

                          <textarea

                            rows={Math.min(6, Math.ceil(currentVal.length / 70) + 1)}

                            value={currentVal}

                            onChange={(e) => handleTextChange(tab as "tr" | "en", key, e.target.value)}

                            className={`w-full bg-white border rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 transition-colors resize-none leading-relaxed ${

                              isChanged ? "border-blue-800" : "border-gray-200"

                            }`}

                          />

                        ) : (

                          <input type="text" value={currentVal}

                            onChange={(e) => handleTextChange(tab as "tr" | "en", key, e.target.value)}

                            className={`w-full bg-white border rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 transition-colors ${

                              isChanged ? "border-blue-800" : "border-gray-200"

                            }`}

                          />

                        )}

                        {isChanged && (

                          <button onClick={() => handleTextChange(tab as "tr" | "en", key, defaultVal)}

                            className="absolute right-2 top-2 text-[10px] text-gray-400 hover:text-red-400 transition-colors"

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

              <h2 className="text-lg font-semibold">Anasayfa Medya Yönetimi</h2>

              <p className="text-xs text-gray-400 mt-1">Anasayfa'da 3D model, yüklenen video veya direkt video linki gösterin.</p>

            </div>



            {/* ── Video URL Girişi ── */}

            <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">

              <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-3">🔗 Video URL ile Ekle</p>

              <p className="text-xs text-gray-400 mb-4">CDN veya sunucudaki direkt .mp4 / .webm linkini girin. Dosya yüklemeye gerek yok — sayfa daha hızlı açılır.</p>

              <div className="flex gap-3 items-start">

                <div className="flex-1 space-y-2">

                  <input

                    type="url"

                    placeholder="https://cdn.ornek.com/video.mp4"

                    value={videoUrlInput}

                    onChange={(e) => setVideoUrlInput(e.target.value)}

                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 font-mono placeholder:font-sans text-gray-900"

                  />

                  {heroMediaType === "video" && heroVideoPath.startsWith("http") && (

                    <p className="text-[11px] text-emerald-400 font-mono truncate">

                      ● Aktif: {heroVideoPath}

                    </p>

                  )}

                </div>

                <div className="flex gap-2 flex-shrink-0">

                  <button

                    onClick={() => {

                      const url = videoUrlInput.trim();

                      if (!url) return setToast({ msg: "Lütfen bir URL girin", type: "error" });

                      if (!url.startsWith("http")) return setToast({ msg: "Geçerli bir URL girin (http/https)", type: "error" });

                      setHeroMediaType("video");

                      setHeroVideoPath(url);

                      saveWithColors({ heroMediaType: "video", heroVideoPath: url });

                      setVideoUrlInput("");

                      setToast({ msg: "Video URL yayınlandı ✓ Anasayfada aktif", type: "success" });

                    }}

                    className="text-xs font-semibold rounded-lg px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white transition-colors whitespace-nowrap"

                  >

                    ▶ Yayınla

                  </button>

                  {heroMediaType === "video" && heroVideoPath.startsWith("http") && (

                    <button

                      onClick={() => {

                        setHeroMediaType("3d");

                        setHeroVideoPath("");

                        saveWithColors({ heroMediaType: "3d", heroVideoPath: "" });

                        setToast({ msg: "URL kaldırıldı — 3D model aktif", type: "success" });

                      }}

                      className="text-xs font-semibold rounded-lg px-3 py-2 bg-red-600/70 hover:bg-red-600 text-white transition-colors"

                    >

                      Kaldır

                    </button>

                  )}

                </div>

              </div>

            </div>



            <div className="space-y-6">

              {/* Unified media manager: upload, list, preview, publish */}

              <MediaManager

                heroMediaType={heroMediaType}

                heroVideoPath={heroVideoPath}

                modelPath={modelPath}

                hiddenMediaFiles={hiddenMediaFiles}

                onPublish={(item) => {

                  if (item.kind === "video") {

                    setHeroMediaType("video");

                    setHeroVideoPath(item.path);

                    saveWithColors({ heroMediaType: "video", heroVideoPath: item.path });

                  } else {

                    setHeroMediaType("3d");

                    setModelPath(item.path);

                    saveWithColors({ heroMediaType: "3d", modelPath: item.path });

                  }

                  setToast({ msg: `${item.name} yayınlandı ✓ Anasayfada aktif`, type: "success" });

                }}

                onActiveDeleted={() => {

                  setHeroMediaType("3d");

                  setModelPath("/models/camera.glb");

                  saveWithColors({ heroMediaType: "3d", modelPath: "/models/camera.glb" });

                }}

                onHide={(fileName) => {

                  const updated = [...hiddenMediaFiles, fileName];

                  setHiddenMediaFiles(updated);

                  saveWithColors({ hiddenMediaFiles: updated });

                }}

                notify={(msg, type) => setToast({ msg, type })}

              />

            </div>

          </div>

        )}



        {/* ── MAIL AYARLARI ───────────────────────────────────────────────────── */}

        {tab === "mail" && (

          <div>

            <div className="mb-6">

              <h2 className="text-lg font-semibold">Mail Ayarları</h2>

              <p className="text-xs text-gray-400 mt-1">SMTP konfigürasyonunu ayarlayın ve test edin.</p>

            </div>



            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">

              <div className="grid grid-cols-2 gap-4">

                <input

                  type="text"

                  placeholder="SMTP Host"

                  value={emailConfig?.smtpHost || ""}

                  onChange={(e) => setEmailConfig(emailConfig ? { ...emailConfig, smtpHost: e.target.value } : { smtpHost: e.target.value, smtpPort: 587, smtpUser: "", smtpPassword: "", fromEmail: "", fromName: "", recipientEmails: [] })}

                  className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500"

                />

                <input

                  type="number"

                  placeholder="SMTP Port"

                  value={emailConfig?.smtpPort || ""}

                  onChange={(e) => setEmailConfig(emailConfig ? { ...emailConfig, smtpPort: parseInt(e.target.value) } : { smtpHost: "", smtpPort: parseInt(e.target.value) || 587, smtpUser: "", smtpPassword: "", fromEmail: "", fromName: "", recipientEmails: [] })}

                  className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500"

                />

              </div>



              <div className="grid grid-cols-2 gap-4">

                <input

                  type="email"

                  placeholder="SMTP User"

                  value={emailConfig?.smtpUser || ""}

                  onChange={(e) => setEmailConfig(emailConfig ? { ...emailConfig, smtpUser: e.target.value } : { smtpHost: "", smtpPort: 587, smtpUser: e.target.value, smtpPassword: "", fromEmail: "", fromName: "", recipientEmails: [] })}

                  className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500"

                />

                <input

                  type="password"

                  placeholder="SMTP Password"

                  value={emailConfig?.smtpPassword || ""}

                  onChange={(e) => setEmailConfig(emailConfig ? { ...emailConfig, smtpPassword: e.target.value } : { smtpHost: "", smtpPort: 587, smtpUser: "", smtpPassword: e.target.value, fromEmail: "", fromName: "", recipientEmails: [] })}

                  className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500"

                />

              </div>



              <div className="grid grid-cols-2 gap-4">

                <input

                  type="email"

                  placeholder="From Email"

                  value={emailConfig?.fromEmail || ""}

                  onChange={(e) => setEmailConfig(emailConfig ? { ...emailConfig, fromEmail: e.target.value } : { smtpHost: "", smtpPort: 587, smtpUser: "", smtpPassword: "", fromEmail: e.target.value, fromName: "", recipientEmails: [] })}

                  className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500"

                />

                <input

                  type="text"

                  placeholder="From Name"

                  value={emailConfig?.fromName || ""}

                  onChange={(e) => setEmailConfig(emailConfig ? { ...emailConfig, fromName: e.target.value } : { smtpHost: "", smtpPort: 587, smtpUser: "", smtpPassword: "", fromEmail: "", fromName: e.target.value, recipientEmails: [] })}

                  className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500"

                />

              </div>



              <textarea

                placeholder="Alıcı E-postalar (virgülle ayrılmış)"

                value={emailConfig?.recipientEmails?.join(",") || ""}

                onChange={(e) => setEmailConfig(emailConfig ? { ...emailConfig, recipientEmails: e.target.value.split(",").map(e => e.trim()) } : { smtpHost: "", smtpPort: 587, smtpUser: "", smtpPassword: "", fromEmail: "", fromName: "", recipientEmails: e.target.value.split(",").map(e => e.trim()) })}

                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 resize-none"

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

                  className="bg-slate-700 hover:bg-gray-200 disabled:bg-gray-100 text-white text-sm font-semibold rounded-lg px-6 py-2 transition-colors"

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

              <p className="text-xs text-gray-400 mt-1">Admin kullanıcılarını ekleyin, yönetin ve rimov edin.</p>

            </div>



            {/* Password Change Form */}

            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">

              <h3 className="text-sm font-semibold mb-4 flex items-center justify-between">

                <span>Parolanızı Değiştirin</span>

                <button

                  onClick={() => setShowPasswordChange(!showPasswordChange)}

                  className="text-xs text-gray-500 hover:text-blue-400 transition-colors"

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

                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500"

                  />

                  <input

                    type="password"

                    placeholder="Yeni parola (en az 8 karakter, 1 rakam, 1 özel karakter)"

                    value={newPassword}

                    onChange={(e) => setNewPassword(e.target.value)}

                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500"

                  />

                  <input

                    type="password"

                    placeholder="Yeni parolayı onayla"

                    value={confirmPassword}

                    onChange={(e) => setConfirmPassword(e.target.value)}

                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500"

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

                          saveWithColors({ adminUsers });



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

            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">

              <h3 className="text-sm font-semibold mb-4">Yeni Kullanıcı Davet Et</h3>

              <div className="flex gap-3">

                <input

                  type="email"

                  placeholder="E-posta adresi"

                  value={inviteEmail}

                  onChange={(e) => setInviteEmail(e.target.value)}

                  className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500"

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

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">

              {adminUsers.length === 0 ? (

                <div className="p-6 text-center text-slate-400">

                  <p>Henüz kullanıcı eklenmemiş</p>

                </div>

              ) : (

                <table className="w-full">

                  <thead>

                    <tr className="border-b border-gray-200">

                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400">E-posta</th>

                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400">Rol</th>

                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400">Durum</th>

                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-400">İşlem</th>

                    </tr>

                  </thead>

                  <tbody>

                    {adminUsers.map((user) => (

                      <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-100/50">

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

                saveWithColors({ adminUsers });

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

                <p className="text-xs text-gray-400 mt-1">

                  Google arama sonuçlarında görünecek meta tagları ve anahtar kelimeleri yönetin (Türkçe ve İngilizce)

                </p>

              </div>

              <button onClick={() => {

                saveWithColors({

                  trSEO: { metaTitle: trSEOTitle, metaDescription: trSEODesc, keywords: trSEOKeywords, ogTitle: trSEOOgTitle, ogDescription: trSEOOgDesc, ogImage: trSEOOgImage },

                  enSEO: { metaTitle: enSEOTitle, metaDescription: enSEODesc, keywords: enSEOKeywords, ogTitle: enSEOOgTitle, ogDescription: enSEOOgDesc, ogImage: enSEOOgImage },

                });

                flashSaved();

              }}

                className="bg-blue-600 hover:bg-blue-500 transition-colors text-white text-sm font-semibold rounded-xl px-5 py-2.5">

                Kaydet

              </button>

            </div>



            {/* TR SEO */}

            <SectionHeader>Türkçe SEO</SectionHeader>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 mb-8">

              <div>

                <label className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-1.5 block">

                  Sayfa Başlığı (Meta Title)

                </label>

                <input type="text" value={trSEOTitle} onChange={(e) => setTrSEOTitle(e.target.value)}

                  placeholder="Örn: Axeron Medical - Sterilizasyon Konteyner Sistemleri"

                  maxLength={60}

                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 transition-colors" />

                <p className="text-xs text-gray-400 mt-1">{trSEOTitle.length}/60 karakter</p>

              </div>

              <div>

                <label className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-1.5 block">

                  Sayfa Açıklaması (Meta Description)

                </label>

                <textarea value={trSEODesc} onChange={(e) => setTrSEODesc(e.target.value)}

                  placeholder="Google'da görünen açıklama yazın..."

                  maxLength={160}

                  rows={3}

                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 transition-colors resize-none" />

                <p className="text-xs text-gray-400 mt-1">{trSEODesc.length}/160 karakter</p>

              </div>

              <div>

                <label className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-1.5 block">

                  Anahtar Kelimeler (Keywords)

                </label>

                <input type="text" value={trSEOKeywords} onChange={(e) => setTrSEOKeywords(e.target.value)}

                  placeholder="Örn: sterilizasyon, konteyner, tıbbi, hastane (virgülle ayrılmış)"

                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 transition-colors font-mono" />

              </div>

              <div className="border-t border-gray-300 pt-4 mt-4">

                <p className="text-xs font-semibold text-gray-400 mb-3">Open Graph (Sosyal Medya)</p>

                <div className="space-y-3">

                  <input type="text" value={trSEOOgTitle} onChange={(e) => setTrSEOOgTitle(e.target.value)}

                    placeholder="OG Başlık (sosyal medyada paylaşıldığında)"

                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 transition-colors" />

                  <textarea value={trSEOOgDesc} onChange={(e) => setTrSEOOgDesc(e.target.value)}

                    placeholder="OG Açıklama"

                    rows={2}

                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 transition-colors resize-none" />

                  <input type="text" value={trSEOOgImage} onChange={(e) => setTrSEOOgImage(e.target.value)}

                    placeholder="OG Resim (örn: /og-image.jpg)"

                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 transition-colors font-mono" />

                </div>

              </div>

            </div>



            {/* EN SEO */}

            <SectionHeader>English SEO</SectionHeader>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 mb-8">

              <div>

                <label className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-1.5 block">

                  Page Title (Meta Title)

                </label>

                <input type="text" value={enSEOTitle} onChange={(e) => setEnSEOTitle(e.target.value)}

                  placeholder="E.g.: Axeron Medical - Sterilization Container Systems"

                  maxLength={60}

                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 transition-colors" />

                <p className="text-xs text-gray-400 mt-1">{enSEOTitle.length}/60 characters</p>

              </div>

              <div>

                <label className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-1.5 block">

                  Page Description (Meta Description)

                </label>

                <textarea value={enSEODesc} onChange={(e) => setEnSEODesc(e.target.value)}

                  placeholder="Description that appears in Google search results..."

                  maxLength={160}

                  rows={3}

                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 transition-colors resize-none" />

                <p className="text-xs text-gray-400 mt-1">{enSEODesc.length}/160 characters</p>

              </div>

              <div>

                <label className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-1.5 block">

                  Keywords

                </label>

                <input type="text" value={enSEOKeywords} onChange={(e) => setEnSEOKeywords(e.target.value)}

                  placeholder="E.g.: sterilization, container, medical, hospital (comma-separated)"

                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 transition-colors font-mono" />

              </div>

              <div className="border-t border-gray-300 pt-4 mt-4">

                <p className="text-xs font-semibold text-gray-400 mb-3">Open Graph (Social Media)</p>

                <div className="space-y-3">

                  <input type="text" value={enSEOOgTitle} onChange={(e) => setEnSEOOgTitle(e.target.value)}

                    placeholder="OG Title (appears when shared on social media)"

                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 transition-colors" />

                  <textarea value={enSEOOgDesc} onChange={(e) => setEnSEOOgDesc(e.target.value)}

                    placeholder="OG Description"

                    rows={2}

                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 transition-colors resize-none" />

                  <input type="text" value={enSEOOgImage} onChange={(e) => setEnSEOOgImage(e.target.value)}

                    placeholder="OG Image (e.g.: /og-image.jpg)"

                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 transition-colors font-mono" />

                </div>

              </div>

            </div>

          </div>

        )}



        {/* ── HAKKIMIZDA ─────────────────────────────────────────────────── */}

        {tab === "page_hero" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold">Ana Sayfa / Hero Metinleri</h2>
                <p className="text-xs text-gray-400 mt-1">Kaydırma animasyonu bölümündeki tüm metinleri düzenleyin.</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <span className="text-sm text-gray-500">{activePages.hero !== false ? "Aktif" : "Pasif"}</span>
                <button
                  onClick={() => { const next = { ...activePages, hero: activePages.hero === false ? true : false }; setActivePages(next); saveWithColors({ activePages: next }); }}
                  className={"relative w-11 h-6 rounded-full transition-colors duration-200 " + (activePages.hero !== false ? "bg-emerald-500" : "bg-gray-300")}
                >
                  <span className={"absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 " + (activePages.hero !== false ? "translate-x-5" : "translate-x-0")} />
                </button>
              </label>
            </div>

            {/* TR */}
            <SectionHeader>Türkçe</SectionHeader>
            {(["scroll.heroEyebrow","scroll.heroTitle","scroll.heroParagraph","scroll.scrollHint","scroll.closeupEyebrow","scroll.closeupH2","scroll.closeupP","scroll.frontEyebrow","scroll.frontH2","scroll.frontP","scroll.frontStat1","scroll.frontStat2","scroll.frontStat3","scroll.frontStat4","scroll.topEyebrow","scroll.topHeading","scroll.topP","scroll.backEyebrow","scroll.backHeading","scroll.backP","scroll.finalEyebrow","scroll.finalHeading","scroll.finalP","scroll.finalCta"] as const).map((key) => {
              const parts = key.split(".");
              let val: unknown = translations.tr;
              for (const p of parts) val = (val as Record<string, unknown>)?.[p];
              const currentVal = (overrides.tr?.[key] ?? String(val ?? ""));
              return (
                <div key={key} className="bg-white border border-gray-200 rounded-xl p-4 mb-3">
                  <label className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-1.5 block">{key.replace("scroll.", "")}</label>
                  <textarea
                    rows={2}
                    value={currentVal}
                    onChange={(e) => updateText("tr", key, e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400 resize-y"
                  />
                </div>
              );
            })}

            {/* EN */}
            <SectionHeader>English</SectionHeader>
            {(["scroll.heroEyebrow","scroll.heroTitle","scroll.heroParagraph","scroll.scrollHint","scroll.closeupEyebrow","scroll.closeupH2","scroll.closeupP","scroll.frontEyebrow","scroll.frontH2","scroll.frontP","scroll.frontStat1","scroll.frontStat2","scroll.frontStat3","scroll.frontStat4","scroll.topEyebrow","scroll.topHeading","scroll.topP","scroll.backEyebrow","scroll.backHeading","scroll.backP","scroll.finalEyebrow","scroll.finalHeading","scroll.finalP","scroll.finalCta"] as const).map((key) => {
              const parts = key.split(".");
              let val: unknown = translations.en;
              for (const p of parts) val = (val as Record<string, unknown>)?.[p];
              const currentVal = (overrides.en?.[key] ?? String(val ?? ""));
              return (
                <div key={key} className="bg-white border border-gray-200 rounded-xl p-4 mb-3">
                  <label className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-1.5 block">{key.replace("scroll.", "")}</label>
                  <textarea
                    rows={2}
                    value={currentVal}
                    onChange={(e) => updateText("en", key, e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400 resize-y"
                  />
                </div>
              );
            })}

          {/* Blok İçerik — Hero */}
          <SectionHeader>Blok İçerik (Ek Alan)</SectionHeader>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-[10px] font-semibold uppercase text-gray-400 mb-2">Türkçe Bloklar</p>
              <BlockEditor blocks={pagesContent.hero.trBlocks || []} onChange={(blocks: ContentBlock[]) => { const u = { ...pagesContent, hero: { ...pagesContent.hero, trBlocks: blocks } }; setPagesContent(u); saveWithColors({ pages: u }); }} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase text-gray-400 mb-2">English Blocks</p>
              <BlockEditor blocks={pagesContent.hero.enBlocks || []} onChange={(blocks: ContentBlock[]) => { const u = { ...pagesContent, hero: { ...pagesContent.hero, enBlocks: blocks } }; setPagesContent(u); saveWithColors({ pages: u }); }} />
            </div>
          </div>
          </div>
        )}

        {tab === "page_sss" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold">Sık Sorulan Sorular</h2>
                <p className="text-xs text-gray-400 mt-1">SSS listesini düzenleyin. Boş bırakırsanız varsayılan sorular gösterilir.</p>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="text-sm text-gray-500">{activePages.sss !== false ? "Aktif" : "Pasif"}</span>
                  <button
                    onClick={() => { const next = { ...activePages, sss: activePages.sss === false ? true : false }; setActivePages(next); saveWithColors({ activePages: next }); }}
                    className={"relative w-11 h-6 rounded-full transition-colors duration-200 " + (activePages.sss !== false ? "bg-emerald-500" : "bg-gray-300")}
                  >
                    <span className={"absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 " + (activePages.sss !== false ? "translate-x-5" : "translate-x-0")} />
                  </button>
                </label>
                <button onClick={() => {
                const ov = loadOverrides();
                ov.trFaqs = trFaqs.length ? trFaqs : undefined;
                ov.enFaqs = enFaqs.length ? enFaqs : undefined;
                saveOverrides(ov);
                setToast({ msg: "SSS kaydedildi", type: "success" });
              }} className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl px-5 py-2.5">Kaydet</button>
              </div>
            </div>

            {/* Bölüm başlığı */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
              <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">Bölüm Başlığı</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-semibold uppercase text-gray-400 mb-1 block">Üst Etiket (TR)</label>
                  <input type="text" value={overrides.tr?.["faqEyebrow"] ?? "Sık Sorulan Sorular"} onChange={(e) => updateText("tr", "faqEyebrow", e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase text-gray-400 mb-1 block">Eyebrow (EN)</label>
                  <input type="text" value={overrides.en?.["faqEyebrow"] ?? "Frequently Asked Questions"} onChange={(e) => updateText("en", "faqEyebrow", e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400" />
                </div>
              </div>
            </div>

            {/* Türkçe SSS */}
            <SectionHeader>Türkçe</SectionHeader>
            <div className="space-y-3 mb-6">
              {(trFaqs.length ? trFaqs : translations.tr.static.faqs).map((faq, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400">#{i + 1}</span>
                    <input
                      type="text"
                      value={faq.q}
                      onChange={(e) => {
                        const next = [...(trFaqs.length ? trFaqs : translations.tr.static.faqs.map(f => ({...f})))];
                        next[i] = { ...next[i], q: e.target.value };
                        setTrFaqs(next);
                      }}
                      placeholder="Soru"
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-900 outline-none focus:border-blue-400"
                    />
                    <button onClick={() => setTrFaqs((trFaqs.length ? trFaqs : translations.tr.static.faqs.map(f => ({...f}))).filter((_, j) => j !== i))}
                      className="text-gray-300 hover:text-red-400 text-lg leading-none px-1">✕</button>
                  </div>
                  <textarea
                    rows={2}
                    value={faq.a}
                    onChange={(e) => {
                      const next = [...(trFaqs.length ? trFaqs : translations.tr.static.faqs.map(f => ({...f})))];
                      next[i] = { ...next[i], a: e.target.value };
                      setTrFaqs(next);
                    }}
                    placeholder="Cevap"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400 resize-y"
                  />
                </div>
              ))}
              <button onClick={() => setTrFaqs([...(trFaqs.length ? trFaqs : translations.tr.static.faqs.map(f => ({...f}))), { q: "", a: "" }])}
                className="w-full border-2 border-dashed border-gray-200 hover:border-blue-300 rounded-xl py-3 text-sm text-gray-400 hover:text-blue-500 transition-colors">
                + Soru Ekle
              </button>
            </div>

            {/* English SSS */}
            <SectionHeader>English</SectionHeader>
            <div className="space-y-3 mb-6">
              {(enFaqs.length ? enFaqs : translations.en.static.faqs).map((faq, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400">#{i + 1}</span>
                    <input
                      type="text"
                      value={faq.q}
                      onChange={(e) => {
                        const next = [...(enFaqs.length ? enFaqs : translations.en.static.faqs.map(f => ({...f})))];
                        next[i] = { ...next[i], q: e.target.value };
                        setEnFaqs(next);
                      }}
                      placeholder="Question"
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-900 outline-none focus:border-blue-400"
                    />
                    <button onClick={() => setEnFaqs((enFaqs.length ? enFaqs : translations.en.static.faqs.map(f => ({...f}))).filter((_, j) => j !== i))}
                      className="text-gray-300 hover:text-red-400 text-lg leading-none px-1">✕</button>
                  </div>
                  <textarea
                    rows={2}
                    value={faq.a}
                    onChange={(e) => {
                      const next = [...(enFaqs.length ? enFaqs : translations.en.static.faqs.map(f => ({...f})))];
                      next[i] = { ...next[i], a: e.target.value };
                      setEnFaqs(next);
                    }}
                    placeholder="Answer"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400 resize-y"
                  />
                </div>
              ))}
              <button onClick={() => setEnFaqs([...(enFaqs.length ? enFaqs : translations.en.static.faqs.map(f => ({...f}))), { q: "", a: "" }])}
                className="w-full border-2 border-dashed border-gray-200 hover:border-blue-300 rounded-xl py-3 text-sm text-gray-400 hover:text-blue-500 transition-colors">
                + Add Question
              </button>
            </div>

            <div className="flex justify-end mb-6">
              <button onClick={() => {
                const ov = loadOverrides();
                ov.trFaqs = trFaqs.length ? trFaqs : undefined;
                ov.enFaqs = enFaqs.length ? enFaqs : undefined;
                saveOverrides(ov);
                setToast({ msg: "SSS kaydedildi", type: "success" });
              }} className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl px-6 py-3">Kaydet</button>
            </div>

            {/* Blok İçerik — SSS */}
            <SectionHeader>Blok İçerik (Ek Alan)</SectionHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase text-gray-400 mb-2">Türkçe Bloklar</p>
                <BlockEditor blocks={pagesContent.sss.trBlocks || []} onChange={(blocks: ContentBlock[]) => { const u = { ...pagesContent, sss: { ...pagesContent.sss, trBlocks: blocks } }; setPagesContent(u); saveWithColors({ pages: u }); }} />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase text-gray-400 mb-2">English Blocks</p>
                <BlockEditor blocks={pagesContent.sss.enBlocks || []} onChange={(blocks: ContentBlock[]) => { const u = { ...pagesContent, sss: { ...pagesContent.sss, enBlocks: blocks } }; setPagesContent(u); saveWithColors({ pages: u }); }} />
              </div>
            </div>
          </div>
        )}

        {tab === "page_iletisim" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold">İletişim</h2>
                <p className="text-xs text-gray-400 mt-1">Başlık, adres bilgileri ve iletişim formu içeriğini düzenleyin.</p>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="text-sm text-gray-500">{activePages.iletisim !== false ? "Aktif" : "Pasif"}</span>
                  <button
                    onClick={() => { const next = { ...activePages, iletisim: activePages.iletisim === false ? true : false }; setActivePages(next); saveWithColors({ activePages: next }); }}
                    className={"relative w-11 h-6 rounded-full transition-colors duration-200 " + (activePages.iletisim !== false ? "bg-emerald-500" : "bg-gray-300")}
                  >
                    <span className={"absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 " + (activePages.iletisim !== false ? "translate-x-5" : "translate-x-0")} />
                  </button>
                </label>
                <button onClick={() => {
                const ov = loadOverrides();
                ov.trContactBlocks = trContactBlocks.length ? trContactBlocks : undefined;
                ov.enContactBlocks = enContactBlocks.length ? enContactBlocks : undefined;
                ov.trCompanyInfo = trCompanyInfo || undefined;
                ov.enCompanyInfo = enCompanyInfo || undefined;
                saveOverrides(ov);
                setToast({ msg: "İletişim bilgileri kaydedildi", type: "success" });
              }} className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl px-5 py-2.5">Kaydet</button>
              </div>
            </div>

            {/* Sayfa Başlıkları */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
              <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">Sayfa Başlıkları</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {([
                  { key: "contactEyebrow", labelTr: "Üst Etiket (TR)", labelEn: "Eyebrow (EN)", defTr: "Bize Ulaşın", defEn: "Reach Us" },
                  { key: "contactTitle",   labelTr: "Başlık (TR)",     labelEn: "Title (EN)",   defTr: "İletişime",  defEn: "Get in" },
                  { key: "contactTitleAccent", labelTr: "Vurgulu Sözcük (TR)", labelEn: "Accent Word (EN)", defTr: "Geçin", defEn: "Touch" },
                  { key: "contactSubtitle", labelTr: "Alt Yazı (TR)", labelEn: "Subtitle (EN)", defTr: "", defEn: "" },
                ] as {key:string;labelTr:string;labelEn:string;defTr:string;defEn:string}[]).map(({ key, labelTr, labelEn, defTr, defEn }) => (
                  <div key={key} className="contents">
                    <div>
                      <label className="text-[10px] font-semibold uppercase text-gray-400 mb-1 block">{labelTr}</label>
                      <input type="text" value={overrides.tr?.[key] ?? defTr} onChange={(e) => updateText("tr", key, e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400" />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold uppercase text-gray-400 mb-1 block">{labelEn}</label>
                      <input type="text" value={overrides.en?.[key] ?? defEn} onChange={(e) => updateText("en", key, e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Türkçe */}
            <SectionHeader>Türkçe</SectionHeader>
            <div className="space-y-3 mb-4">
              {(trContactBlocks.length ? trContactBlocks : translations.tr.static.contactBlocks).map((block, bi) => (
                <div key={bi} className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
                  <input
                    type="text"
                    value={block.label}
                    onChange={(e) => {
                      const next = [...(trContactBlocks.length ? trContactBlocks : translations.tr.static.contactBlocks.map(b => ({...b, lines: [...b.lines]})))];
                      next[bi] = { ...next[bi], label: e.target.value };
                      setTrContactBlocks(next);
                    }}
                    placeholder="Başlık (ör: Adres)"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-900 outline-none focus:border-blue-400"
                  />
                  {block.lines.map((line, li) => (
                    <div key={li} className="flex gap-2">
                      <input
                        type="text"
                        value={line}
                        onChange={(e) => {
                          const next = [...(trContactBlocks.length ? trContactBlocks : translations.tr.static.contactBlocks.map(b => ({...b, lines: [...b.lines]})))];
                          next[bi] = { ...next[bi], lines: next[bi].lines.map((l, j) => j === li ? e.target.value : l) };
                          setTrContactBlocks(next);
                        }}
                        placeholder="Satır"
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-900 outline-none focus:border-blue-400"
                      />
                      <button onClick={() => {
                        const next = [...(trContactBlocks.length ? trContactBlocks : translations.tr.static.contactBlocks.map(b => ({...b, lines: [...b.lines]})))];
                        next[bi] = { ...next[bi], lines: next[bi].lines.filter((_, j) => j !== li) };
                        setTrContactBlocks(next);
                      }} className="text-gray-300 hover:text-red-400 px-2">✕</button>
                    </div>
                  ))}
                  <button onClick={() => {
                    const next = [...(trContactBlocks.length ? trContactBlocks : translations.tr.static.contactBlocks.map(b => ({...b, lines: [...b.lines]})))];
                    next[bi] = { ...next[bi], lines: [...next[bi].lines, ""] };
                    setTrContactBlocks(next);
                  }} className="text-xs text-blue-500 hover:text-blue-700">+ Satır ekle</button>
                </div>
              ))}
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
              <label className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-1.5 block">Şirket Bilgisi (footer)</label>
              <textarea rows={2} value={trCompanyInfo || translations.tr.static.companyInfo}
                onChange={(e) => setTrCompanyInfo(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400 resize-y" />
            </div>

            {/* English */}
            <SectionHeader>English</SectionHeader>
            <div className="space-y-3 mb-4">
              {(enContactBlocks.length ? enContactBlocks : translations.en.static.contactBlocks).map((block, bi) => (
                <div key={bi} className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
                  <input
                    type="text"
                    value={block.label}
                    onChange={(e) => {
                      const next = [...(enContactBlocks.length ? enContactBlocks : translations.en.static.contactBlocks.map(b => ({...b, lines: [...b.lines]})))];
                      next[bi] = { ...next[bi], label: e.target.value };
                      setEnContactBlocks(next);
                    }}
                    placeholder="Label (e.g: Address)"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-900 outline-none focus:border-blue-400"
                  />
                  {block.lines.map((line, li) => (
                    <div key={li} className="flex gap-2">
                      <input
                        type="text"
                        value={line}
                        onChange={(e) => {
                          const next = [...(enContactBlocks.length ? enContactBlocks : translations.en.static.contactBlocks.map(b => ({...b, lines: [...b.lines]})))];
                          next[bi] = { ...next[bi], lines: next[bi].lines.map((l, j) => j === li ? e.target.value : l) };
                          setEnContactBlocks(next);
                        }}
                        placeholder="Line"
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-900 outline-none focus:border-blue-400"
                      />
                      <button onClick={() => {
                        const next = [...(enContactBlocks.length ? enContactBlocks : translations.en.static.contactBlocks.map(b => ({...b, lines: [...b.lines]})))];
                        next[bi] = { ...next[bi], lines: next[bi].lines.filter((_, j) => j !== li) };
                        setEnContactBlocks(next);
                      }} className="text-gray-300 hover:text-red-400 px-2">✕</button>
                    </div>
                  ))}
                  <button onClick={() => {
                    const next = [...(enContactBlocks.length ? enContactBlocks : translations.en.static.contactBlocks.map(b => ({...b, lines: [...b.lines]})))];
                    next[bi] = { ...next[bi], lines: [...next[bi].lines, ""] };
                    setEnContactBlocks(next);
                  }} className="text-xs text-blue-500 hover:text-blue-700">+ Add line</button>
                </div>
              ))}
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
              <label className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-1.5 block">Company Info (footer)</label>
              <textarea rows={2} value={enCompanyInfo || translations.en.static.companyInfo}
                onChange={(e) => setEnCompanyInfo(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400 resize-y" />
            </div>

            <div className="flex justify-end">
              <button onClick={() => {
                const ov = loadOverrides();
                ov.trContactBlocks = trContactBlocks.length ? trContactBlocks : undefined;
                ov.enContactBlocks = enContactBlocks.length ? enContactBlocks : undefined;
                ov.trCompanyInfo = trCompanyInfo || undefined;
                ov.enCompanyInfo = enCompanyInfo || undefined;
                saveOverrides(ov);
                setToast({ msg: "İletişim bilgileri kaydedildi", type: "success" });
              }} className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl px-6 py-3">Kaydet</button>
            </div>

            {/* Blok İçerik — İletişim */}
            <SectionHeader>Blok İçerik (Ek Alan)</SectionHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase text-gray-400 mb-2">Türkçe Bloklar</p>
                <BlockEditor blocks={pagesContent.iletisim.trBlocks || []} onChange={(blocks: ContentBlock[]) => { const u = { ...pagesContent, iletisim: { ...pagesContent.iletisim, trBlocks: blocks } }; setPagesContent(u); saveWithColors({ pages: u }); }} />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase text-gray-400 mb-2">English Blocks</p>
                <BlockEditor blocks={pagesContent.iletisim.enBlocks || []} onChange={(blocks: ContentBlock[]) => { const u = { ...pagesContent, iletisim: { ...pagesContent.iletisim, enBlocks: blocks } }; setPagesContent(u); saveWithColors({ pages: u }); }} />
              </div>
            </div>
          </div>
        )}

        {(tab === "about" || tab === "page_hakkimizda") && (
          <div className="space-y-5">
            <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Hakkımızda</h2>
                <span className="text-xs text-gray-400 font-mono">#hakkimizda</span>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="text-xs text-gray-500">{activePages.hakkimizda !== false ? "Aktif" : "Pasif"}</span>
                  <button
                    onClick={() => { const next = { ...activePages, hakkimizda: activePages.hakkimizda === false ? true : false }; setActivePages(next); saveWithColors({ activePages: next }); }}
                    className={"relative w-11 h-6 rounded-full transition-colors duration-200 " + (activePages.hakkimizda !== false ? "bg-emerald-500" : "bg-gray-300")}
                  >
                    <span className={"absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 " + (activePages.hakkimizda !== false ? "translate-x-5" : "translate-x-0")} />
                  </button>
                </label>
              </div>
            </div>

            {/* Bölüm başlıkları */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
              <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">Bölüm Başlıkları</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {([
                  { key: "aboutEyebrow",      labelTr: "Üst Etiket (TR)",    labelEn: "Eyebrow (EN)",       defTr: "Neden Axeron",    defEn: "Why Axeron" },
                  { key: "aboutTitle",        labelTr: "Başlık (TR)",        labelEn: "Title (EN)",         defTr: "Rakamlarla",      defEn: "By the" },
                  { key: "aboutTitleAccent",  labelTr: "Vurgulu Sözcük (TR)",labelEn: "Accent Word (EN)",   defTr: "Biz",             defEn: "Numbers" },
                  { key: "aboutSubtitle",     labelTr: "Alt Yazı (TR)",      labelEn: "Subtitle (EN)",      defTr: "",                defEn: "" },
                ] as {key:string;labelTr:string;labelEn:string;defTr:string;defEn:string}[]).map(({ key, labelTr, labelEn, defTr, defEn }) => (
                  <div key={key} className="contents">
                    <div>
                      <label className="text-[10px] font-semibold uppercase text-gray-400 mb-1 block">{labelTr}</label>
                      <input type="text" value={overrides.tr?.[key] ?? defTr} onChange={(e) => updateText("tr", key, e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400" />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold uppercase text-gray-400 mb-1 block">{labelEn}</label>
                      <input type="text" value={overrides.en?.[key] ?? defEn} onChange={(e) => updateText("en", key, e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Misyon / Üretim Kalitesi / Sertifikasyon sütunları */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
              <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">Alt Sütunlar (Misyon · Üretim · Sertifikasyon)</p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-100">
                  <div>
                    <label className="text-[10px] font-semibold uppercase text-gray-400 mb-1.5 block">Misyon (TR)</label>
                    <textarea rows={3} value={trMission} onChange={(e) => setTrMission(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400 resize-y" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold uppercase text-gray-400 mb-1.5 block">Mission (EN)</label>
                    <textarea rows={3} value={enMission} onChange={(e) => setEnMission(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400 resize-y" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-100">
                  <div>
                    <label className="text-[10px] font-semibold uppercase text-gray-400 mb-1.5 block">Üretim Kalitesi (TR)</label>
                    <textarea rows={3} value={trProductionQuality} onChange={(e) => setTrProductionQuality(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400 resize-y" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold uppercase text-gray-400 mb-1.5 block">Production Quality (EN)</label>
                    <textarea rows={3} value={enProductionQuality} onChange={(e) => setEnProductionQuality(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400 resize-y" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-semibold uppercase text-gray-400 mb-1.5 block">Sertifikasyon (TR)</label>
                    <textarea rows={3} value={trCertification} onChange={(e) => setTrCertification(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400 resize-y" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold uppercase text-gray-400 mb-1.5 block">Certification (EN)</label>
                    <textarea rows={3} value={enCertification} onChange={(e) => setEnCertification(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400 resize-y" />
                  </div>
                </div>
              </div>
              <button onClick={() => {
                const ov = loadOverrides();
                ov.trMission = trMission || undefined;
                ov.enMission = enMission || undefined;
                ov.trProductionQuality = trProductionQuality || undefined;
                ov.enProductionQuality = enProductionQuality || undefined;
                ov.trCertification = trCertification || undefined;
                ov.enCertification = enCertification || undefined;
                saveOverrides(ov);
                setToast({ msg: "Alt sütunlar kaydedildi", type: "success" });
              }} className="mt-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl px-5 py-2 transition-colors">Kaydet</button>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">Sayfa İçeriği</p>
              <div className="space-y-5">
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-1.5 block">Başlık TR <span className="text-gray-300 font-normal normal-case tracking-normal">(opsiyonel — boş bırakılırsa başlık gösterilmez)</span></label>
                    <input type="text" value={pagesContent.hakkimizda.trTitle || ""} onChange={(e) => { const u = { ...pagesContent, hakkimizda: { ...pagesContent.hakkimizda, trTitle: e.target.value } }; setPagesContent(u); saveWithColors({ pages: u }); }} placeholder="Başlık girilmezse sayfada başlık çıkmaz" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400" />
                  </div>
                  <label className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-2 block">İçerik TR</label>
                  <BlockEditor blocks={pagesContent.hakkimizda.trBlocks || []} onChange={(blocks: ContentBlock[]) => { const u = { ...pagesContent, hakkimizda: { ...pagesContent.hakkimizda, trBlocks: blocks } }; setPagesContent(u); saveWithColors({ pages: u }); }} />
                </div>
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <div>
                    <label className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-1.5 block">Title EN <span className="text-gray-300 font-normal normal-case tracking-normal">(optional — hidden if empty)</span></label>
                    <input type="text" value={pagesContent.hakkimizda.enTitle || ""} onChange={(e) => { const u = { ...pagesContent, hakkimizda: { ...pagesContent.hakkimizda, enTitle: e.target.value } }; setPagesContent(u); saveWithColors({ pages: u }); }} placeholder="No title shown if left empty" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400" />
                  </div>
                  <label className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-2 block">Content EN</label>
                  <BlockEditor blocks={pagesContent.hakkimizda.enBlocks || []} onChange={(blocks: ContentBlock[]) => { const u = { ...pagesContent, hakkimizda: { ...pagesContent.hakkimizda, enBlocks: blocks } }; setPagesContent(u); saveWithColors({ pages: u }); }} />
                </div>
              </div>
            </div>

            {/* Sertifika Görselleri */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-1">Sertifika Görselleri</p>
              <p className="text-xs text-gray-400 mb-5">Footer'da logo yanında küçük yuvarlak olarak gösterilir.</p>
              <div className="flex items-start gap-8 justify-center">
                {[0, 1, 2].map((i) => {
                  const src = certImages[i] || null;
                  return (
                    <div key={i} className="flex flex-col items-center gap-2 w-32">
                      <label className="cursor-pointer group">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-dashed border-gray-300 group-hover:border-blue-400 bg-gray-50 flex items-center justify-center transition-colors mx-auto">
                          {src ? (
                            <img src={src} alt={`Sertifika ${i + 1}`} className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-3xl text-gray-200 group-hover:text-blue-200 transition-colors">+</span>
                          )}
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const fd = new FormData();
                          fd.append("file", file);
                          const res = await fetch("/api/upload-image", { method: "POST", body: fd });
                          const data = await res.json();
                          if (data.url) {
                            const imgs = [...certImages];
                            imgs[i] = data.url;
                            setCertImages(imgs);
                            const ov = loadOverrides();
                            ov.certImages = imgs;
                            saveOverrides(ov);
                            saveWithColors({ certImages: imgs });
                            setToast({ msg: `Sertifika ${i + 1} yüklendi`, type: "success" });
                          }
                        }} />
                      </label>
                      <span className="text-[10px] text-gray-400 font-medium">{`Sertifika ${i + 1}`}</span>
                      <input
                        type="text"
                        placeholder="Link (opsiyonel)"
                        value={certLinks[i] || ""}
                        onChange={(e) => {
                          const links = [...certLinks];
                          links[i] = e.target.value || null;
                          setCertLinks(links);
                          const ov = loadOverrides();
                          ov.certLinks = links;
                          saveOverrides(ov);
                          saveWithColors({ certLinks: links });
                        }}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700 outline-none focus:border-blue-400 text-center"
                      />
                      {src && (
                        <button onClick={() => {
                          const imgs = [...certImages];
                          imgs[i] = null;
                          setCertImages(imgs);
                          const ov = loadOverrides();
                          ov.certImages = imgs;
                          saveOverrides(ov);
                          saveWithColors({ certImages: imgs });
                          setToast({ msg: `Sertifika ${i + 1} silindi`, type: "success" });
                        }} className="text-[10px] text-red-400 hover:text-red-600 transition-colors">Kaldır</button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}



        {/* Colors Tab */}

        {tab === "colors" && (() => {
          const currentTheme: ThemeConfig = {
            colorBg: themeColorBg, colorInk: themeColorInk,
            colorAccent: themeColorAccent, colorDark: themeColorDark,
            fontFamily: themeFontFamily, headingWeight: themeHeadingWeight,
            navStyle: themeNavStyle, navBg: themeNavBg, buttonRadius: themeButtonRadius,
            cardRadius: themeCardRadius, glassBlur: themeGlassBlur,
            animationsEnabled: themeAnimations,
          };
          function saveTheme() {
            const ov = loadOverrides();
            ov.theme = currentTheme;
            ov.accentColor = themeColorAccent;
            ov.darkBgColor = themeColorDark;
            saveOverrides(ov);
            applyTheme(currentTheme);
            setToast({ msg: "Tema kaydedildi ✓", type: "success" });
          }
          function previewTheme() { applyTheme(currentTheme); }

          const ColorRow = ({ label, value, onChange, presets }: {
            label: string; value: string;
            onChange: (v: string) => void;
            presets?: { label: string; color: string }[];
          }) => (
            <div className="flex flex-col gap-3">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-500">{label}</p>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative">
                  <input type="color" value={value} onChange={(e) => { onChange(e.target.value); }}
                    className="w-12 h-12 rounded-xl cursor-pointer border-2 border-gray-200 p-0.5 bg-white" />
                </div>
                <span className="font-mono text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded">{value.toUpperCase()}</span>
                {presets?.map((p) => (
                  <button key={p.color} onClick={() => onChange(p.color)}
                    title={p.label}
                    className="w-7 h-7 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform"
                    style={{ backgroundColor: p.color }} />
                ))}
              </div>
            </div>
          );

          const PillSelect = <T extends string>({ label, value, onChange, options }: {
            label: string; value: T;
            onChange: (v: T) => void;
            options: { id: T; label: string; desc?: string }[];
          }) => (
            <div>
              <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-2">{label}</p>
              <div className="flex flex-wrap gap-2">
                {options.map((o) => (
                  <button key={o.id} onClick={() => onChange(o.id)}
                    title={o.desc}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${value === o.id ? "bg-blue-600 border-blue-600 text-white" : "bg-gray-100 border-gray-300 text-gray-700 hover:border-gray-500"}`}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          );

          const Toggle = ({ label, desc, value, onChange }: { label: string; desc?: string; value: boolean; onChange: (v: boolean) => void }) => (
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-800">{label}</p>
                {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
              </div>
              <button type="button" onClick={() => onChange(!value)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${value ? "bg-emerald-500" : "bg-gray-300"}`}>
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${value ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>
          );

          return (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Tema & Tasarım</h2>
                  <p className="text-xs text-gray-400 mt-1">Sitenin görünümünü buradan özelleştirin. Değişiklikler anında önizlenebilir.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={previewTheme}
                    className="border border-gray-300 text-gray-700 text-sm font-medium rounded-xl px-4 py-2.5 hover:bg-gray-50 transition-colors">
                    Önizle
                  </button>
                  <button onClick={saveTheme}
                    className="bg-blue-600 hover:bg-blue-500 transition-colors text-white text-sm font-semibold rounded-xl px-5 py-2.5">
                    Kaydet
                  </button>
                </div>
              </div>

              {/* ── RENKLER ── */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6">
                <p className="text-xs font-bold tracking-widest uppercase text-gray-400 border-b border-gray-100 pb-3">Renkler</p>

                {/* Canlı önizleme bandı */}
                <div className="rounded-xl overflow-hidden border border-gray-200 flex h-10">
                  {[themeColorBg, themeColorInk, themeColorAccent, themeColorDark].map((c, i) => (
                    <div key={i} className="flex-1" style={{ backgroundColor: c }} title={c} />
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <ColorRow label="Sayfa Arka Planı" value={themeColorBg} onChange={setThemeColorBg}
                    presets={[
                      { label: "Krem", color: "#ece9e3" }, { label: "Beyaz", color: "#ffffff" },
                      { label: "Gri", color: "#f5f5f4" }, { label: "Koyu", color: "#1a1a1a" },
                      { label: "Lacivert", color: "#0f172a" }, { label: "Yeşil", color: "#f0fdf4" },
                    ]} />
                  <ColorRow label="Metin Rengi" value={themeColorInk} onChange={setThemeColorInk}
                    presets={[
                      { label: "Siyah", color: "#0d0c0a" }, { label: "Koyu Gri", color: "#1e1e1e" },
                      { label: "Beyaz", color: "#f8f8f8" }, { label: "Lacivert", color: "#1e3a5f" },
                    ]} />
                  <ColorRow label="Vurgu / Buton Rengi" value={themeColorAccent} onChange={setThemeColorAccent}
                    presets={[
                      { label: "Mavi", color: "#4A7FD7" }, { label: "Koyu Mavi", color: "#1d4ed8" },
                      { label: "Teal", color: "#0d9488" }, { label: "Yeşil", color: "#16a34a" },
                      { label: "Turuncu", color: "#ea580c" }, { label: "Kırmızı", color: "#dc2626" },
                      { label: "Mor", color: "#7c3aed" }, { label: "Gül", color: "#e11d48" },
                    ]} />
                  <ColorRow label="Koyu Panel Rengi" value={themeColorDark} onChange={setThemeColorDark}
                    presets={[
                      { label: "Sıcak", color: "#3a3730" }, { label: "Nötr", color: "#2d2d2d" },
                      { label: "Lacivert", color: "#1e293b" }, { label: "Koyu Yeşil", color: "#14532d" },
                      { label: "Bordo", color: "#4c0519" },
                    ]} />
                </div>

                {/* Canlı ön izleme kartı */}
                <div className="rounded-xl p-5 mt-2" style={{ backgroundColor: themeColorBg, border: `1px solid ${themeColorInk}18` }}>
                  <p style={{ color: themeColorAccent }} className="text-[10px] tracking-widest uppercase font-semibold">Hakkımızda</p>
                  <p style={{ color: themeColorInk }} className="text-2xl font-bold mt-1">Kaliteli Üretim</p>
                  <p style={{ color: themeColorInk, opacity: 0.6 }} className="text-sm mt-2">Axeron Medical, sterilizasyon konteyner sistemleri alanında...</p>
                  <button className="mt-4 px-5 py-2 text-sm font-semibold text-white rounded-full" style={{ backgroundColor: themeColorAccent }}>
                    İletişime Geç →
                  </button>
                </div>
              </div>

              {/* ── TİPOGRAFİ ── */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
                <p className="text-xs font-bold tracking-widest uppercase text-gray-400 border-b border-gray-100 pb-3">Tipografi</p>

                <PillSelect label="Yazı Tipi" value={themeFontFamily} onChange={setThemeFontFamily} options={[
                  { id: "system", label: "Sistem (Varsayılan)" },
                  { id: "inter", label: "Inter" },
                  { id: "space-grotesk", label: "Space Grotesk" },
                  { id: "dm-sans", label: "DM Sans" },
                  { id: "playfair", label: "Playfair Display" },
                  { id: "roboto-slab", label: "Roboto Slab" },
                ]} />

                <PillSelect label="Başlık Kalınlığı" value={themeHeadingWeight} onChange={setThemeHeadingWeight} options={[
                  { id: "600", label: "Orta (600)" },
                  { id: "700", label: "Kalın (700)" },
                  { id: "800", label: "Çok Kalın (800)" },
                  { id: "900", label: "Siyah (900)" },
                ]} />

                {/* Font önizleme */}
                <div className="rounded-xl p-4 bg-gray-50 border border-gray-200">
                  <p className="text-[10px] tracking-widest uppercase font-semibold text-gray-400 mb-2">Yazı Önizleme</p>
                  <p className={`text-3xl text-gray-900`} style={{ fontWeight: themeHeadingWeight }}>
                    Axeron Medical
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Sterilizasyon konteyner sistemleri</p>
                </div>
              </div>

              {/* ── NAVİGASYON ── */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
                <p className="text-xs font-bold tracking-widest uppercase text-gray-400 border-b border-gray-100 pb-3">Navigasyon Stili</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {([
                    { id: "hamburger" as const, label: "Hamburger", desc: "Sol üstte ≡ ikonu, tıklayınca dropdown açılır", icon: "☰" },
                    { id: "topbar" as const, label: "Üst Bar", desc: "Masaüstünde linkler header'da görünür", icon: "—" },
                    { id: "sidebar" as const, label: "Kenar Çubuk", desc: "Soldan kayan panel navigasyonu", icon: "⬡" },
                  ]).map((o) => (
                    <button key={o.id} onClick={() => setThemeNavStyle(o.id)}
                      className={`text-left p-4 rounded-xl border-2 transition-all ${themeNavStyle === o.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-400"}`}>
                      <p className="text-2xl mb-2">{o.icon}</p>
                      <p className={`text-sm font-semibold ${themeNavStyle === o.id ? "text-blue-700" : "text-gray-800"}`}>{o.label}</p>
                      <p className="text-xs text-gray-500 mt-1">{o.desc}</p>
                    </button>
                  ))}
                </div>

                {/* Menü arka plan rengi */}
                <div className="mt-5 pt-5 border-t border-gray-100">
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-3">Menü Arka Plan Rengi</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {[
                      { label: "Krem", val: "rgba(236, 233, 227, 0.92)", dark: false },
                      { label: "Beyaz", val: "rgba(255, 255, 255, 0.95)", dark: false },
                      { label: "Koyu", val: "rgba(20, 20, 20, 0.95)", dark: true },
                      { label: "Lacivert", val: "rgba(15, 23, 42, 0.95)", dark: true },
                      { label: "Şeffaf Krem", val: "rgba(236, 233, 227, 0.55)", dark: false },
                    ].map((p) => (
                      <button key={p.val} onClick={() => setThemeNavBg(p.val)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${themeNavBg === p.val ? "border-blue-500 ring-1 ring-blue-400" : "border-gray-300 hover:border-gray-500"}`}
                        style={{ backgroundColor: p.dark ? p.val : p.val, color: p.dark ? "#fff" : "#000" }}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <div className="rounded-xl h-14 flex items-center px-5 gap-5 border border-gray-200" style={{ backgroundColor: themeNavBg, backdropFilter: "blur(16px)" }}>
                    {["ANASAYFA","HAKKIMIZDA","İLETİŞİM"].map((l) => (
                      <span key={l} className="text-[10px] font-semibold tracking-widest opacity-50">{l}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── ŞEKİL & FORM ── */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
                <p className="text-xs font-bold tracking-widest uppercase text-gray-400 border-b border-gray-100 pb-3">Şekil & Form</p>

                <PillSelect label="Buton Köşe Yuvarlaması" value={themeButtonRadius} onChange={setThemeButtonRadius} options={[
                  { id: "none", label: "Keskin", desc: "0px" },
                  { id: "sm", label: "Hafif", desc: "6px" },
                  { id: "lg", label: "Yuvarlak", desc: "14px" },
                  { id: "full", label: "Hap (Pill)", desc: "999px" },
                ]} />

                <PillSelect label="Kart Köşe Yuvarlaması" value={themeCardRadius} onChange={setThemeCardRadius} options={[
                  { id: "none", label: "Keskin" },
                  { id: "sm", label: "Küçük" },
                  { id: "md", label: "Orta" },
                  { id: "lg", label: "Büyük" },
                  { id: "xl", label: "Çok Büyük" },
                ]} />

                {/* Önizleme */}
                <div className="flex gap-3 flex-wrap">
                  {(["none","sm","lg","full"] as const).map((r) => {
                    const radii: Record<string,string> = { none:"0px", sm:"6px", lg:"14px", full:"999px" };
                    return (
                      <div key={r} onClick={() => setThemeButtonRadius(r)}
                        className={`px-5 py-2.5 text-sm font-medium cursor-pointer transition-all ${themeButtonRadius === r ? "opacity-100" : "opacity-40"}`}
                        style={{ backgroundColor: themeColorAccent, color: "#fff", borderRadius: radii[r] }}>
                        {r === "none" ? "Keskin" : r === "sm" ? "Hafif" : r === "lg" ? "Yuvarlak" : "Pill"}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── EFEKTLER ── */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <p className="text-xs font-bold tracking-widest uppercase text-gray-400 border-b border-gray-100 pb-3 mb-4">Efektler</p>
                <div className="divide-y divide-gray-100">
                  <Toggle label="Cam Efekti (Glass Blur)" desc="Header ve kartlarda buzlu cam görünümü" value={themeGlassBlur} onChange={setThemeGlassBlur} />
                  <Toggle label="Animasyonlar" desc="Hover, geçiş ve scroll animasyonları" value={themeAnimations} onChange={setThemeAnimations} />
                </div>
              </div>

              {/* ── WHATSAPP ── */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-3 block">WhatsApp Numarası</p>
                <input type="tel" placeholder="+90 555 123 4567 (Ülke kodu ile)" value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 placeholder-gray-400" />
                <p className="text-xs text-gray-400 mt-2">Örnek: +905551234567 — WhatsApp butonunu aktifleştirir</p>
                {whatsappNumber && (
                  <a href={`https://wa.me/${whatsappNumber.replace(/[^\d+]/g, "")}`} target="_blank" rel="noopener noreferrer"
                    className="inline-block mt-3 text-xs px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded text-white">Test: WhatsApp'ta Aç →</a>
                )}
              </div>

              {/* Alt kaydet */}
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={previewTheme} className="border border-gray-300 text-gray-700 text-sm font-medium rounded-xl px-5 py-2.5 hover:bg-gray-50 transition-colors">
                  Önizle
                </button>
                <button onClick={saveTheme} className="bg-blue-600 hover:bg-blue-500 transition-colors text-white text-sm font-semibold rounded-xl px-6 py-3">
                  Temayı Kaydet
                </button>
              </div>
            </div>
          );
        })()}





        {/* ── BİREYSEL SAYFA EDİTÖRLERİ ────────────────────────────── */}

        {(tab === "page_urunler" || tab === "page_kurumsal" || tab === "page_referanslarimiz" || tab === "page_kvkk") && (() => {

          const pageMap = {

            page_urunler: { key: "urunler" as const, label: "Ürünler", path: "/urunler", note: "" },

            page_kurumsal: { key: "kurumsal" as const, label: "Kurumsal", path: "/kurumsal", note: "Alt sayfalar: /kurumsal/kalite-politikamiz · /kurumsal/kalite-belgeleri" },

            page_referanslarimiz: { key: "referanslarimiz" as const, label: "Referanslarımız", path: "/referanslarimiz", note: "" },

            page_kvkk: { key: "kvkk" as const, label: "KVKK", path: "/kvkk", note: "" },

          };

          const current = pageMap[tab as keyof typeof pageMap];

          const pc = pagesContent[current.key];

          const isActive = activePages[current.key] ?? false;

          return (

            <div className="space-y-5">

              {/* Page header card */}

              <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between">

                <div>

                  <h2 className="text-base font-semibold text-gray-900">{current.label}</h2>

                  <div className="flex items-center gap-3 mt-1">

                    <span className="text-xs text-gray-400 font-mono">{current.path}</span>

                    {current.note && <span className="text-[10px] text-gray-400">{current.note}</span>}

                  </div>

                </div>

                <div className="flex items-center gap-3">

                  <a href={current.path} target="_blank"

                    className="text-xs text-blue-600 hover:underline">Sayfayı Gör ↗</a>

                  <label className="flex items-center gap-2 cursor-pointer">

                    <span className="text-xs text-gray-500">{isActive ? "Aktif" : "Pasif"}</span>

                    <button onClick={() => {

                      const updated = { ...activePages, [current.key]: !isActive };

                      setActivePages(updated);

                      saveWithColors({ activePages: updated });

                      setToast({ msg: current.label + (isActive ? " pasif yapıldı" : " aktif yapıldı"), type: "success" });

                    }}

                      className={"relative w-11 h-6 rounded-full transition-colors duration-200 " + (isActive ? "bg-emerald-500" : "bg-gray-300")}>

                      <span className={"absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 " + (isActive ? "translate-x-5" : "translate-x-0")} />

                    </button>

                  </label>

                  <button onClick={() => pushAllToServer()}

                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors">

                    Kaydet

                  </button>

                </div>

              </div>



              {/* Hero image */}

              <div className="bg-white border border-gray-200 rounded-xl p-5">

                <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">Kapak Görseli</p>

                <HeroImageUpload
                  value={pc.heroImage || ""}
                  onChange={(url) => { const u = { ...pagesContent, [current.key]: { ...pc, heroImage: url } }; setPagesContent(u); saveWithColors({ pages: u }); }}
                />

              </div>



              {/* Content TR/EN */}

              <div className="bg-white border border-gray-200 rounded-xl p-5">

                <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">Sayfa İçeriği</p>

                <div className="space-y-5">

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-1.5 block">Başlık TR <span className="text-gray-300 font-normal normal-case tracking-normal">(opsiyonel — boş bırakılırsa başlık gösterilmez)</span></label>
                      <input type="text" value={pc.trTitle || ""} onChange={(e) => { const u = { ...pagesContent, [current.key]: { ...pc, trTitle: e.target.value } }; setPagesContent(u); saveWithColors({ pages: u }); }} placeholder="Başlık girilmezse sayfada başlık çıkmaz" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400" />
                    </div>
                    <label className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-2 block">İçerik TR</label>
                    <BlockEditor blocks={pc.trBlocks || []} onChange={(blocks: ContentBlock[]) => { const u = { ...pagesContent, [current.key]: { ...pc, trBlocks: blocks } }; setPagesContent(u); saveWithColors({ pages: u }); }} />
                  </div>

                  <div className="space-y-3 pt-2 border-t border-gray-100">
                    <div>
                      <label className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-1.5 block">Title EN <span className="text-gray-300 font-normal normal-case tracking-normal">(optional — hidden if empty)</span></label>
                      <input type="text" value={pc.enTitle || ""} onChange={(e) => { const u = { ...pagesContent, [current.key]: { ...pc, enTitle: e.target.value } }; setPagesContent(u); saveWithColors({ pages: u }); }} placeholder="No title shown if left empty" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400" />
                    </div>
                    <label className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-2 block">Content EN</label>
                    <BlockEditor blocks={pc.enBlocks || []} onChange={(blocks: ContentBlock[]) => { const u = { ...pagesContent, [current.key]: { ...pc, enBlocks: blocks } }; setPagesContent(u); saveWithColors({ pages: u }); }} />
                  </div>

                </div>

              </div>



              {/* Sub-pages for kurumsal */}

              {current.key === "kurumsal" && (

                <div className="bg-white border border-gray-200 rounded-xl p-5">

                  <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">Alt Sayfalar</p>

                  {([

                    { key: "kalitePolitikamiz" as const, label: "Kalite Politikamız", path: "/kurumsal/kalite-politikamiz" },

                    { key: "kaliteBelgeleri" as const, label: "Kalite Belgeleri", path: "/kurumsal/kalite-belgeleri" },

                  ]).map(({ key, label, path }) => {

                    const spc = pagesContent[key];

                    return (

                      <div key={key} className="border border-gray-100 rounded-lg p-4 mb-3">

                        <div className="flex items-center justify-between mb-3">

                          <div>

                            <span className="text-sm font-medium text-gray-900">{label}</span>

                            <span className="text-xs text-gray-400 font-mono ml-2">{path}</span>

                          </div>

                          <a href={path} target="_blank" className="text-xs text-blue-600 hover:underline">Gör ↗</a>

                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3">

                          <div>

                            <label className="text-[10px] font-semibold uppercase text-gray-400 mb-1 block">Başlık TR</label>

                            <input type="text" value={spc.trTitle || ""}

                              onChange={(e) => { const u = { ...pagesContent, [key]: { ...spc, trTitle: e.target.value } }; setPagesContent(u); saveWithColors({ pages: u }); }}

                              className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-sm text-gray-900 outline-none focus:border-blue-400" />

                          </div>

                          <div>

                            <label className="text-[10px] font-semibold uppercase text-gray-400 mb-1 block">Title EN</label>

                            <input type="text" value={spc.enTitle || ""}

                              onChange={(e) => { const u = { ...pagesContent, [key]: { ...spc, enTitle: e.target.value } }; setPagesContent(u); saveWithColors({ pages: u }); }}

                              className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-sm text-gray-900 outline-none focus:border-blue-400" />

                          </div>

                        </div>

                        <div className="space-y-4">

                          <div>

                            <label className="text-[10px] font-semibold uppercase text-gray-400 mb-2 block">İçerik TR</label>

                            <BlockEditor blocks={spc.trBlocks || []} onChange={(blocks: ContentBlock[]) => { const u = { ...pagesContent, [key]: { ...spc, trBlocks: blocks } }; setPagesContent(u); saveWithColors({ pages: u }); }} />

                          </div>

                          <div>

                            <label className="text-[10px] font-semibold uppercase text-gray-400 mb-2 block">Content EN</label>

                            <BlockEditor blocks={spc.enBlocks || []} onChange={(blocks: ContentBlock[]) => { const u = { ...pagesContent, [key]: { ...spc, enBlocks: blocks } }; setPagesContent(u); saveWithColors({ pages: u }); }} />

                          </div>

                        </div>

                      </div>

                    );

                  })}

                </div>

              )}

            </div>

          );

        })()}



        {/* ── CUSTOM PAGE EDITOR ────────────────────────────────────────── */}

        {tab.startsWith("custom_") && (() => {

          const cpId = tab.replace("custom_", "");

          const cpIdx = customPages.findIndex((p) => p.id === cpId);

          const cp = customPages[cpIdx];

          if (!cp) return <p className="text-gray-400 text-sm">Sayfa bulunamadı.</p>;

          const updateCp = (updated: import("@/lib/siteOverrides").CustomPage) => {

            const arr = customPages.map((p) => p.id === cpId ? updated : p);

            setCustomPages(arr);

            saveWithColors({ customPages: arr });

          };

          return (

            <div className="space-y-5">

              {/* Header card */}

              <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between">

                <div>

                  <h2 className="text-base font-semibold text-gray-900">{cp.navLabel}</h2>

                  <span className="text-xs text-gray-400 font-mono">/p/{cp.slug}</span>

                </div>

                <div className="flex items-center gap-3">

                  <a href={"/p/" + cp.slug} target="_blank" className="text-xs text-blue-600 hover:underline">Sayfayı Gör ↗</a>

                  <label className="flex items-center gap-2 cursor-pointer">

                    <span className="text-xs text-gray-500">{cp.active ? "Aktif" : "Pasif"}</span>

                    <button onClick={() => updateCp({ ...cp, active: !cp.active })}

                      className={"relative w-11 h-6 rounded-full transition-colors duration-200 " + (cp.active ? "bg-emerald-500" : "bg-gray-300")}>

                      <span className={"absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 " + (cp.active ? "translate-x-5" : "translate-x-0")} />

                    </button>

                  </label>

                  <button onClick={() => {

                    if (!confirm(cp.navLabel + " sayfasını silmek istediğinize emin misiniz?")) return;

                    const arr = customPages.filter((p) => p.id !== cpId);

                    setCustomPages(arr);

                    saveWithColors({ customPages: arr });

                    setTab("dashboard");

                    setToast({ msg: cp.navLabel + " silindi", type: "success" });

                  }} className="text-xs text-red-400 hover:text-red-600 transition-colors">Sil</button>

                  <button onClick={() => pushAllToServer()}

                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors">

                    Kaydet

                  </button>

                </div>

              </div>

              {/* Nav label + slug */}

              <div className="bg-white border border-gray-200 rounded-xl p-5">

                <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">Sayfa Ayarları</p>

                <div className="grid grid-cols-2 gap-4">

                  <div>

                    <label className="text-[10px] font-semibold uppercase text-gray-400 mb-1.5 block">Menü Adı</label>

                    <input type="text" value={cp.navLabel}

                      onChange={(e) => updateCp({ ...cp, navLabel: e.target.value })}

                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400" />

                  </div>

                  <div>

                    <label className="text-[10px] font-semibold uppercase text-gray-400 mb-1.5 block">URL Slug</label>

                    <div className="flex items-center gap-1">

                      <span className="text-xs text-gray-400 font-mono">/p/</span>

                      <input type="text" value={cp.slug}

                        onChange={(e) => updateCp({ ...cp, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}

                        className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400 font-mono" />

                    </div>

                  </div>

                </div>

                <div className="flex items-center gap-2 mt-3">

                  <input type="checkbox" id="showInNav" checked={cp.showInNav}

                    onChange={(e) => updateCp({ ...cp, showInNav: e.target.checked })}

                    className="w-4 h-4 rounded border-gray-300" />

                  <label htmlFor="showInNav" className="text-xs text-gray-600">Navigasyon menüsünde göster</label>

                </div>

              </div>

              {/* Titles */}

              <div className="bg-white border border-gray-200 rounded-xl p-5">

                <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">Sayfa Başlığı</p>

                <div className="grid grid-cols-2 gap-4">

                  <div>

                    <label className="text-[10px] font-semibold uppercase text-gray-400 mb-1.5 block">TR</label>

                    <input type="text" value={cp.trTitle}

                      onChange={(e) => updateCp({ ...cp, trTitle: e.target.value })}

                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400" />

                  </div>

                  <div>

                    <label className="text-[10px] font-semibold uppercase text-gray-400 mb-1.5 block">EN</label>

                    <input type="text" value={cp.enTitle}

                      onChange={(e) => updateCp({ ...cp, enTitle: e.target.value })}

                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400" />

                  </div>

                </div>

              </div>

              {/* Hero image */}

              <div className="bg-white border border-gray-200 rounded-xl p-5">

                <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">Kapak Görseli</p>

                <HeroImageUpload
                  value={cp.heroImage || ""}
                  onChange={(url) => updateCp({ ...cp, heroImage: url })}
                />

              </div>

              {/* Content */}

              <div className="bg-white border border-gray-200 rounded-xl p-5">

                <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">Sayfa İçeriği — Türkçe</p>

                <BlockEditor
                  blocks={cp.trBlocks || []}
                  onChange={(blocks: ContentBlock[]) => updateCp({ ...cp, trBlocks: blocks })}
                />

              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-5">

                <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">Sayfa İçeriği — English</p>

                <BlockEditor
                  blocks={cp.enBlocks || []}
                  onChange={(blocks: ContentBlock[]) => updateCp({ ...cp, enBlocks: blocks })}
                />

              </div>

            </div>

          );

        })()}



        {/* SAYFALAR TAB */}

        {tab === "sayfalar" && (

          <div>

            <div className="mb-6">

              <h2 className="text-lg font-semibold">Sayfa Yönetimi</h2>

              <p className="text-xs text-gray-400 mt-1">

                Sayfaları aktif/pasif yapın ve içeriklerini düzenleyin. Değişiklikler için Sunucuyu Güncelle kullanın.

              </p>

            </div>



            {([

              { key: "urunler", label: "Ürünler", path: "/urunler" },

              { key: "kurumsal", label: "Kurumsal", path: "/kurumsal", note: "Alt sayfalar: Kalite Politikamız, Kalite Belgeleri" },

              { key: "referanslarimiz", label: "Referanslarımız", path: "/referanslarimiz" },

              { key: "kvkk", label: "KVKK", path: "/kvkk" },

            ] as Array<{ key: keyof typeof activePages; label: string; path: string; note?: string }>).map(({ key, label, path, note }) => {

              const isActive = activePages[key] ?? false;

              const pc = pagesContent[key as keyof typeof pagesContent];

              return (

                <div key={key} className="bg-white border border-gray-200 rounded-xl mb-4 overflow-hidden">

                  <div className="flex items-center justify-between px-5 py-4">

                    <div>

                      <span className="font-semibold text-gray-900">{label}</span>

                      <span className="text-xs text-gray-400 ml-3 font-mono">{path}</span>

                      {note && <p className="text-[11px] text-gray-400 mt-0.5">{note}</p>}

                    </div>

                    <button

                      onClick={() => {

                        const updated = { ...activePages, [key]: !isActive };

                        setActivePages(updated);

                        saveWithColors({ activePages: updated });

                        setToast({ msg: label + (isActive ? " pasif yapıldı" : " aktif yapıldı"), type: "success" });

                      }}

                      className={"relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 " + (isActive ? "bg-emerald-500" : "bg-gray-300")}

                    >

                      <span className={"absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 " + (isActive ? "translate-x-5" : "translate-x-0")} />

                    </button>

                  </div>

                  <div className="border-t border-gray-200 px-5 py-4 space-y-4">

                    <div className="grid grid-cols-2 gap-4">

                      <div>

                        <label className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-1.5 block">Başlık (TR)</label>

                        <input type="text" value={pc.trTitle || ""}

                          onChange={(e) => { const u = { ...pagesContent, [key]: { ...pc, trTitle: e.target.value } }; setPagesContent(u); saveWithColors({ pages: u }); }}

                          placeholder={label}

                          className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500" />

                      </div>

                      <div>

                        <label className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-1.5 block">Title (EN)</label>

                        <input type="text" value={pc.enTitle || ""}

                          onChange={(e) => { const u = { ...pagesContent, [key]: { ...pc, enTitle: e.target.value } }; setPagesContent(u); saveWithColors({ pages: u }); }}

                          placeholder={label}

                          className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500" />

                      </div>

                    </div>

                    <div className="grid grid-cols-2 gap-4">

                      <div>

                        <label className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-1.5 block">İçerik (TR)</label>

                        <textarea rows={5} value={pc.trBody || ""} onChange={(e) => { const u = { ...pagesContent, [key]: { ...pc, trBody: e.target.value } }; setPagesContent(u); saveWithColors({ pages: u }); }} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400 resize-y" />

                      </div>

                      <div>

                        <label className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-1.5 block">Content (EN)</label>

                        <textarea rows={5} value={pc.enBody || ""} onChange={(e) => { const u = { ...pagesContent, [key]: { ...pc, enBody: e.target.value } }; setPagesContent(u); saveWithColors({ pages: u }); }} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400 resize-y" />

                      </div>

                    </div>

                    {/* Hero image */}

                    <div>

                      <label className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-1.5 block">Kapak Görseli</label>

                      <HeroImageUpload
                        value={pc.heroImage || ""}
                        onChange={(url) => { const u = { ...pagesContent, [key]: { ...pc, heroImage: url } }; setPagesContent(u); saveWithColors({ pages: u }); }}
                      />

                    </div>

                  </div>

                </div>

              );

            })}



            <div className="mt-6 mb-2">

              <p className="text-xs font-bold tracking-widest uppercase text-gray-400">Kurumsal Alt Sayfaları</p>

            </div>

            {([

              { key: "kalitePolitikamiz", label: "Kalite Politikamız", path: "/kurumsal/kalite-politikamiz" },

              { key: "kaliteBelgeleri", label: "Kalite Belgeleri", path: "/kurumsal/kalite-belgeleri" },

            ] as Array<{ key: "kalitePolitikamiz" | "kaliteBelgeleri"; label: string; path: string }>).map(({ key, label, path }) => {

              const pc = pagesContent[key];

              return (

                <div key={key} className="bg-white border border-gray-200 rounded-xl mb-4 overflow-hidden">

                  <div className="flex items-center justify-between px-5 py-4">

                    <div>

                      <span className="font-semibold text-gray-900">{label}</span>

                      <span className="text-xs text-gray-400 ml-3 font-mono">{path}</span>

                    </div>

                    <span className="text-[10px] text-gray-400">Kurumsal aktifken görünür</span>

                  </div>

                  <div className="border-t border-gray-200 px-5 py-4 space-y-4">

                    <div className="grid grid-cols-2 gap-4">

                      <div>

                        <label className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-1.5 block">Başlık (TR)</label>

                        <input type="text" value={pc.trTitle || ""}

                          onChange={(e) => { const u = { ...pagesContent, [key]: { ...pc, trTitle: e.target.value } }; setPagesContent(u); saveWithColors({ pages: u }); }}

                          placeholder={label}

                          className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500" />

                      </div>

                      <div>

                        <label className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-1.5 block">Title (EN)</label>

                        <input type="text" value={pc.enTitle || ""}

                          onChange={(e) => { const u = { ...pagesContent, [key]: { ...pc, enTitle: e.target.value } }; setPagesContent(u); saveWithColors({ pages: u }); }}

                          placeholder={label}

                          className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500" />

                      </div>

                    </div>

                    <div className="grid grid-cols-2 gap-4">

                      <div>

                        <label className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-1.5 block">İçerik (TR)</label>

                        <textarea rows={5} value={pc.trBody || ""} onChange={(e) => { const u = { ...pagesContent, [key]: { ...pc, trBody: e.target.value } }; setPagesContent(u); saveWithColors({ pages: u }); }} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400 resize-y" />

                      </div>

                      <div>

                        <label className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-1.5 block">Content (EN)</label>

                        <textarea rows={5} value={pc.enBody || ""} onChange={(e) => { const u = { ...pagesContent, [key]: { ...pc, enBody: e.target.value } }; setPagesContent(u); saveWithColors({ pages: u }); }} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400 resize-y" />

                      </div>

                    </div>

                  </div>

                </div>

              );

            })}

          </div>

        )}



      </div> {/* /max-w-5xl */}

      </div> {/* /main-content */}



      {/* Toast Notification */}

      {toast && (

        <div className={`fixed bottom-6 right-6 px-5 py-3 rounded-lg text-white font-semibold text-sm shadow-xl z-50 ${

          toast.type === "success" ? "bg-emerald-500" : "bg-red-500"

        }`}>

          {toast.msg}

        </div>

      )}

    </div>

  );

}

