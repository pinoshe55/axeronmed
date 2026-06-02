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
