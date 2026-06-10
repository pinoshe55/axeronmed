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

export interface SiteOverrides {
  gallery: GalleryItem[];
  tr: Record<string, string>;
  en: Record<string, string>;
  trStats?: StatItem[];
  enStats?: StatItem[];
  adminUsers?: AdminUser[];
  emailConfig?: EmailConfig;
  verificationTokens?: VerificationToken[];
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
}

const KEY = "axeron_site_overrides";
const QUOTA_LIMIT = 4 * 1024 * 1024; // 4MB (localStorage güvenli limiti)

export function loadOverrides(): SiteOverrides {
  if (typeof window === "undefined") return { gallery: [], tr: {}, en: {}, adminUsers: [], verificationTokens: [] };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { gallery: [], tr: {}, en: {}, adminUsers: [], verificationTokens: [] };

    const data = JSON.parse(raw) as SiteOverrides;

    // Ensure new fields have default values
    if (!data.adminUsers) data.adminUsers = [];
    if (!data.verificationTokens) data.verificationTokens = [];
    if (!data.trSEO) data.trSEO = { metaTitle: "", metaDescription: "", keywords: "", ogTitle: "", ogDescription: "", ogImage: "" };
    if (!data.enSEO) data.enSEO = { metaTitle: "", metaDescription: "", keywords: "", ogTitle: "", ogDescription: "", ogImage: "" };

    // About section defaults
    if (!data.trAbout) data.trAbout = "";
    if (!data.enAbout) data.enAbout = "";
    if (!data.trMission) data.trMission = "";
    if (!data.enMission) data.enMission = "";
    if (!data.trVision) data.trVision = "";
    if (!data.enVision) data.enVision = "";
    // Quality Values - 3 cards
    if (!data.trQualityValue1) data.trQualityValue1 = { value: "", label: "", desc: "" };
    if (!data.enQualityValue1) data.enQualityValue1 = { value: "", label: "", desc: "" };
    if (!data.trQualityValue2) data.trQualityValue2 = { value: "", label: "", desc: "" };
    if (!data.enQualityValue2) data.enQualityValue2 = { value: "", label: "", desc: "" };
    if (!data.trQualityValue3) data.trQualityValue3 = { value: "", label: "", desc: "" };
    if (!data.enQualityValue3) data.enQualityValue3 = { value: "", label: "", desc: "" };
    // Old format (backward compatibility)
    if (!data.trQualityValues) data.trQualityValues = "";
    if (!data.enQualityValues) data.enQualityValues = "";
    if (!data.trProductionQuality) data.trProductionQuality = "";
    if (!data.enProductionQuality) data.enProductionQuality = "";
    if (!data.trCertification) data.trCertification = "";
    if (!data.enCertification) data.enCertification = "";
    if (!data.darkBgColor) data.darkBgColor = "#3a3a3a"; // Default dark color
    if (!data.accentColor) data.accentColor = "#4a9eff"; // Default accent/blue color
    if (!data.whatsappNumber) data.whatsappNumber = ""; // WhatsApp number (optional)

    // session: ile başlayan src'lerin boş olma ihtimaline karşı
    // Eğer sessionStorage'da veri varsa kopyala, yoksa /public varsayılan resimleri kullan
    if (data.gallery && data.gallery.length > 0) {
      data.gallery = data.gallery.map((img, i) => {
        // session: ile başlayan src'leri fallback'le replace et
        if (img.src.startsWith('session:')) {
          return { ...img, src: `/hero-${(i % 11) + 1}.jpg` };
        }
        // Boş src'yi fallback'le replace et
        if (!img.src || img.src === '') {
          return { ...img, src: `/hero-${(i % 11) + 1}.jpg` };
        }
        // /public path'leri olduğu gibi sakla
        return img;
      });
    }

    return data;
  } catch {
    return { gallery: [], tr: {}, en: {}, adminUsers: [], verificationTokens: [] };
  }
}

export function saveOverrides(data: SiteOverrides) {
  // Base64 verileri sessionStorage'a kaydedildiği için, localStorage'da src'yi boş bırak
  // (sessionStorage'dan geri yüklenir admin panelde açılıp kaydedildiğinde)
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
