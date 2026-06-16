export interface GalleryItem {
  src: string;       // /public path veya base64 data URL
  caption: string;   // resim üzerindeki açıklama (boş olabilir)
  active: boolean;   // false → galeride gösterilmez
  // layout (değiştirilemiyor, sadece orijinal değerler kullanılır)
  w: number;
  h: number;
  top: string;
  left: string;
  rotate: string;
  z: number;
}

export interface StatItem {
  value: string;
  label: string;
  desc: string;
}

export interface AdminUser {
  id: string;
  email: string;
  passwordHash: string;
  role: "admin" | "editor";
  createdAt: number;
  verifiedAt: number | null;
  lastLoginAt: number | null;
}

export interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  fromName?: string;
  recipientEmails: string[];
}

export interface VerificationToken {
  token: string;
  email: string;
  type: "email_verify" | "password_reset";
  expiresAt: number;
  used: boolean;
}

export interface SEOConfig {
  metaTitle: string;          // Sayfa başlığı (Google'da görünen)
  metaDescription: string;    // Sayfa açıklaması (Google'da görünen)
  keywords: string;           // Arama anahtar kelimeleri (virgülle ayrılmış)
  ogTitle?: string;           // Open Graph başlığı
  ogDescription?: string;     // Open Graph açıklaması
  ogImage?: string;           // Sosyal medyada paylaşıldığında görünecek resim
}

export interface ContentBlockText {
  id: string;
  type: "text";
  html: string;
}

export interface ContentBlockImage {
  id: string;
  type: "image";
  src: string;
  caption?: string;
  frame: "none" | "border" | "shadow" | "rounded" | "polaroid";
  animation: "none" | "fade" | "zoom" | "float" | "hover-zoom";
  scale: number; // 25–100 (%)
  align: "left" | "center" | "right";
}

export interface ContentBlockGallery {
  id: string;
  type: "gallery";
  images: { src: string; caption?: string }[];
  cols: 2 | 3 | 4;
  frame: "none" | "border" | "shadow" | "rounded";
}

export type ContentBlock = ContentBlockText | ContentBlockImage | ContentBlockGallery;

export interface PageContent {
  trTitle?: string;
  enTitle?: string;
  trBody?: string;
  enBody?: string;
  heroImage?: string;
  trBlocks?: ContentBlock[];
  enBlocks?: ContentBlock[];
}

export interface ActivePages {
  urunler?: boolean;
  kurumsal?: boolean;
  referanslarimiz?: boolean;
  kvkk?: boolean;
  hero?: boolean;
  hakkimizda?: boolean;
  sss?: boolean;
  iletisim?: boolean;
}

export interface ActiveSections {
  gallery?: boolean;       // Ürün Galerisi bölümü
  stats?: boolean;         // İstatistikler kartları
  aboutText?: boolean;     // Hakkımızda açıklama metni
  missionVision?: boolean; // Misyon / Vizyon / Üretim / Sertifikasyon sütunları
  contact?: boolean;       // İletişim bölümü
}

export interface CustomPage {
  id: string;
  slug: string;
  navLabel: string;
  trTitle: string;
  enTitle: string;
  trBody?: string;
  enBody?: string;
  trBlocks?: ContentBlock[];
  enBlocks?: ContentBlock[];
  heroImage?: string;
  active: boolean;
  showInNav: boolean;
}

export type FontFamily = "system" | "inter" | "playfair" | "space-grotesk" | "dm-sans" | "roboto-slab";
export type NavStyle = "hamburger" | "topbar" | "sidebar";
export type ButtonRadius = "none" | "sm" | "lg" | "full";
export type CardRadius = "none" | "sm" | "md" | "lg" | "xl";

export interface ThemeConfig {
  // Renkler
  colorBg?: string;       // Sayfa arka planı          default: #ece9e3
  colorInk?: string;      // Ana metin rengi            default: #0d0c0a
  colorAccent?: string;   // Vurgu / buton rengi        default: #4A7FD7
  colorDark?: string;     // Koyu panel / header bg     default: #3a3730
  colorSurface?: string;  // Kart cam efekti bg         default: rgba(255,255,255,0.55)
  // Tipografi
  fontFamily?: FontFamily;
  headingWeight?: "600" | "700" | "800" | "900";
  // Navigasyon
  navStyle?: NavStyle;
  // Şekil
  buttonRadius?: ButtonRadius;
  cardRadius?: CardRadius;
  // Menü
  navBg?: string;            // Menü/dropdown arka plan rengi (default: rgba(236,233,227,0.92))
  // Efektler
  glassBlur?: boolean;       // Header/kart blur efekti
  animationsEnabled?: boolean; // Geçiş animasyonları
}

export interface SiteOverrides {
  gallery: GalleryItem[];
  tr: Record<string, string>;
  en: Record<string, string>;
  trStats?: StatItem[];
  enStats?: StatItem[];
  adminUsers?: AdminUser[];
  emailConfig?: EmailConfig;
  verificationTokens?: VerificationToken[];
  heroMediaType?: "3d" | "video"; // Homepage hero: "3d" (scroll-driven model) or "video" (background video)
  heroVideoPath?: string; // Background video path (e.g., "/videos/intro.mp4")
  modelPath?: string; // 3D model path (e.g., "/models/camera.glb")
  modelScale?: number; // 3D model scale (e.g., 1.0, 1.5, 2.0)
  lightIntensity?: number; // Directional light intensity (0.1 - 2.0)
  lightPositionX?: number; // Light X coordinate
  lightPositionY?: number; // Light Y coordinate
  lightPositionZ?: number; // Light Z coordinate
  trSEO?: SEOConfig; // Turkish SEO configuration
  enSEO?: SEOConfig; // English SEO configuration

  // About section fields
  trAbout?: string; // Turkish: Hakkımızda (description)
  enAbout?: string; // English: About Us (description)
  trMission?: string; // Turkish: Misyon
  enMission?: string; // English: Mission
  trVision?: string; // Turkish: Vizyon
  enVision?: string; // English: Vision
  // Quality Values - 3 cards (value, label, description)
  trQualityValue1?: { value: string; label: string; desc: string }; // Turkish: Kalite Değeri 1
  enQualityValue1?: { value: string; label: string; desc: string }; // English: Quality Value 1
  trQualityValue2?: { value: string; label: string; desc: string }; // Turkish: Kalite Değeri 2
  enQualityValue2?: { value: string; label: string; desc: string }; // English: Quality Value 2
  trQualityValue3?: { value: string; label: string; desc: string }; // Turkish: Kalite Değeri 3
  enQualityValue3?: { value: string; label: string; desc: string }; // English: Quality Value 3
  // Old format (kept for backward compatibility, will be phased out)
  trQualityValues?: string; // Turkish: Kalite Değerlerimiz (old text format)
  enQualityValues?: string; // English: Our Quality Values (old text format)
  trProductionQuality?: string; // Turkish: Üretim Kalitesi
  enProductionQuality?: string; // English: Production Quality
  trCertification?: string; // Turkish: Sertifikasyon
  enCertification?: string; // English: Certification
  darkBgColor?: string; // Dark background color (hex, e.g., "#2d2d2d")
  accentColor?: string; // Accent/heading color (hex, e.g., "#4a9eff")
  whatsappNumber?: string; // WhatsApp number with country code (e.g., "+905551234567")
  galleryLayout?: "collage" | "masonry" | "strip" | "catalog"; // Product gallery layout style
  hiddenMediaFiles?: string[]; // Files hidden from media manager (soft-delete for Vercel read-only FS)
  activePages?: ActivePages;
  activeSections?: ActiveSections;
  trFaqs?: { q: string; a: string }[];
  enFaqs?: { q: string; a: string }[];
  trContactBlocks?: { label: string; lines: string[] }[];
  enContactBlocks?: { label: string; lines: string[] }[];
  trCompanyInfo?: string;
  enCompanyInfo?: string;
  certImages?: (string | null)[]; // 3 circular certificate images for footer
  certLinks?: (string | null)[];  // optional link URLs for each certificate
  theme?: ThemeConfig;            // Tam tema ayarları
  customPages?: CustomPage[];
  pages?: {
    urunler?: PageContent;
    kurumsal?: PageContent;
    kalitePolitikamiz?: PageContent;
    kaliteBelgeleri?: PageContent;
    referanslarimiz?: PageContent;
    kvkk?: PageContent;
    hero?: PageContent;
    hakkimizda?: PageContent;
    sss?: PageContent;
    iletisim?: PageContent;
  };
}

const KEY = "axeron_site_overrides";
const QUOTA_LIMIT = 4 * 1024 * 1024; // 4MB (localStorage güvenli limiti)

// Shared defaults logic — used by both loadOverrides and server fetch
export function applyDefaults(data: SiteOverrides): SiteOverrides {
  if (!data.adminUsers) data.adminUsers = [];
  if (!data.verificationTokens) data.verificationTokens = [];
  if (!data.trSEO) data.trSEO = { metaTitle: "", metaDescription: "", keywords: "", ogTitle: "", ogDescription: "", ogImage: "" };
  if (!data.enSEO) data.enSEO = { metaTitle: "", metaDescription: "", keywords: "", ogTitle: "", ogDescription: "", ogImage: "" };
  if (!data.trAbout) data.trAbout = "";
  if (!data.enAbout) data.enAbout = "";
  if (!data.trMission) data.trMission = "";
  if (!data.enMission) data.enMission = "";
  if (!data.trVision) data.trVision = "";
  if (!data.enVision) data.enVision = "";
  if (!data.trQualityValue1) data.trQualityValue1 = { value: "", label: "", desc: "" };
  if (!data.enQualityValue1) data.enQualityValue1 = { value: "", label: "", desc: "" };
  if (!data.trQualityValue2) data.trQualityValue2 = { value: "", label: "", desc: "" };
  if (!data.enQualityValue2) data.enQualityValue2 = { value: "", label: "", desc: "" };
  if (!data.trQualityValue3) data.trQualityValue3 = { value: "", label: "", desc: "" };
  if (!data.enQualityValue3) data.enQualityValue3 = { value: "", label: "", desc: "" };
  if (!data.trQualityValues) data.trQualityValues = "";
  if (!data.enQualityValues) data.enQualityValues = "";
  if (!data.trProductionQuality) data.trProductionQuality = "";
  if (!data.enProductionQuality) data.enProductionQuality = "";
  if (!data.trCertification) data.trCertification = "";
  if (!data.enCertification) data.enCertification = "";
  if (!data.darkBgColor) data.darkBgColor = "#3a3a3a";
  if (!data.accentColor) data.accentColor = "#4a9eff";
  if (!data.whatsappNumber) data.whatsappNumber = "";
  if (!data.heroMediaType) data.heroMediaType = "3d";
  if (!data.heroVideoPath) data.heroVideoPath = "";
  if (!data.galleryLayout) data.galleryLayout = "catalog";
  if (!data.theme) data.theme = {};
  if (!data.theme.fontFamily) data.theme.fontFamily = "system";
  if (!data.theme.headingWeight) data.theme.headingWeight = "700";
  if (!data.theme.navStyle) data.theme.navStyle = "hamburger";
  if (!data.theme.buttonRadius) data.theme.buttonRadius = "full";
  if (!data.theme.cardRadius) data.theme.cardRadius = "lg";
  if (data.theme.glassBlur === undefined) data.theme.glassBlur = true;
  if (data.theme.animationsEnabled === undefined) data.theme.animationsEnabled = true;
  if (!data.hiddenMediaFiles) data.hiddenMediaFiles = [];
  if (!data.activePages) data.activePages = {};
  if (!data.activeSections) data.activeSections = {};
  if (!data.pages) data.pages = {};
  // trFaqs/enFaqs/contactBlocks intentionally not defaulted here — undefined = use i18n fallback
  if (!data.customPages) data.customPages = [];

  if (data.gallery && data.gallery.length > 0) {
    data.gallery = data.gallery.map((img, i) => {
      if (img.src.startsWith('session:')) return { ...img, src: `/hero-${(i % 11) + 1}.jpg` };
      if (!img.src || img.src === '') return { ...img, src: `/hero-${(i % 11) + 1}.jpg` };
      return img;
    });
  }

  return data;
}

// Fetch site overrides from server (Vercel Blob). Returns null if unavailable.
export async function loadOverridesFromServer(): Promise<SiteOverrides | null> {
  try {
    const res = await fetch("/api/site-data", { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json() as SiteOverrides | null;
    if (!data) return null;
    return applyDefaults(data);
  } catch {
    return null;
  }
}

export function loadOverrides(): SiteOverrides {
  if (typeof window === "undefined") return { gallery: [], tr: {}, en: {}, adminUsers: [], verificationTokens: [] };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { gallery: [], tr: {}, en: {}, adminUsers: [], verificationTokens: [] };
    const data = JSON.parse(raw) as SiteOverrides;
    return applyDefaults(data);
  } catch {
    return { gallery: [], tr: {}, en: {}, adminUsers: [], verificationTokens: [] };
  }
}

export function saveOverrides(data: SiteOverrides) {
  // Server copy: keep real /public paths, strip only session: (base64) items
  if (typeof window !== "undefined") {
    const serverData: SiteOverrides = {
      ...data,
      gallery: data.gallery.map(img => ({
        ...img,
        src: img.src.startsWith('session:') ? '' : img.src,
      })),
      adminUsers: [], // never send password hashes to blob
      verificationTokens: [],
    };
    fetch("/api/site-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(serverData),
    }).catch(() => {});
  }

  // localStorage copy: strip all real src too (size optimization, session: kept)
  const optimized: SiteOverrides = {
    gallery: data.gallery.map(img => ({
      ...img,
      // session: ile başlayan src'ler sessionStorage'da, localStorage'da boş sakla
      src: img.src.startsWith('session:') ? img.src : '',
    })),
    tr: data.tr,
    en: data.en,
    trStats: data.trStats,
    enStats: data.enStats,
    adminUsers: data.adminUsers,
    emailConfig: data.emailConfig,
    verificationTokens: data.verificationTokens,
    heroMediaType: data.heroMediaType,
    heroVideoPath: data.heroVideoPath,
    galleryLayout: data.galleryLayout,
    modelPath: data.modelPath,
    modelScale: data.modelScale,
    lightIntensity: data.lightIntensity,
    lightPositionX: data.lightPositionX,
    lightPositionY: data.lightPositionY,
    lightPositionZ: data.lightPositionZ,
    trSEO: data.trSEO,
    enSEO: data.enSEO,
    trAbout: data.trAbout,
    enAbout: data.enAbout,
    trMission: data.trMission,
    enMission: data.enMission,
    trVision: data.trVision,
    enVision: data.enVision,
    trQualityValue1: data.trQualityValue1,
    enQualityValue1: data.enQualityValue1,
    trQualityValue2: data.trQualityValue2,
    enQualityValue2: data.enQualityValue2,
    trQualityValue3: data.trQualityValue3,
    enQualityValue3: data.enQualityValue3,
    trQualityValues: data.trQualityValues,
    enQualityValues: data.enQualityValues,
    trProductionQuality: data.trProductionQuality,
    enProductionQuality: data.enProductionQuality,
    trCertification: data.trCertification,
    enCertification: data.enCertification,
    darkBgColor: data.darkBgColor,
    accentColor: data.accentColor,
    whatsappNumber: data.whatsappNumber,
    hiddenMediaFiles: data.hiddenMediaFiles,
    theme: data.theme,
    activePages: data.activePages,
    activeSections: data.activeSections,
    trFaqs: data.trFaqs,
    enFaqs: data.enFaqs,
    trContactBlocks: data.trContactBlocks,
    enContactBlocks: data.enContactBlocks,
    trCompanyInfo: data.trCompanyInfo,
    enCompanyInfo: data.enCompanyInfo,
    customPages: data.customPages,
    pages: data.pages,
  };

  const json = JSON.stringify(optimized);
  const sizeInMB = new Blob([json]).size / (1024 * 1024);

  if (sizeInMB > QUOTA_LIMIT / (1024 * 1024)) {
    console.warn(`localStorage veri boyutu ${sizeInMB.toFixed(2)}MB. Kota aşabilir.`);
  }

  localStorage.setItem(KEY, json);
}

export function clearOverrides() {
  localStorage.removeItem(KEY);
}
