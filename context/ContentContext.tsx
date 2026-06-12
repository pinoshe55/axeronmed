"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { loadOverrides, loadOverridesFromServer, saveOverrides, type SiteOverrides, type GalleryItem, type StatItem } from "@/lib/siteOverrides";

interface ContentContextType {
  overrides: SiteOverrides;
  serverLoaded: boolean; // true once Blob fetch completes (or fails)
  getText: (lang: "tr" | "en", key: string, fallback: string) => string;
  getGallery: (defaults: GalleryItem[]) => GalleryItem[];
  getStats: (lang: "tr" | "en", defaults: StatItem[]) => StatItem[];
  updateText: (lang: "tr" | "en", key: string, value: string) => void;
  updateGallery: (items: GalleryItem[]) => void;
  updateStats: (lang: "tr" | "en", items: StatItem[]) => void;
  updateEmailConfig: (config: import("@/lib/siteOverrides").EmailConfig | null) => void;
  resetAll: () => void;
}

const ContentContext = createContext<ContentContextType>({
  overrides: { gallery: [], tr: {}, en: {} },
  serverLoaded: false,
  getText: (_, __, fallback) => fallback,
  getGallery: (d) => d,
  getStats: (_, d) => d,
  updateText: () => {},
  updateGallery: () => {},
  updateStats: () => {},
  updateEmailConfig: () => {},
  resetAll: () => {},
});

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [overrides, setOverrides] = useState<SiteOverrides>({ gallery: [], tr: {}, en: {} });
  const [serverLoaded, setServerLoaded] = useState(false);

  useEffect(() => {
    // Load local cache immediately for text/colors, then Blob as source of truth for media
    setOverrides(loadOverrides());
    loadOverridesFromServer()
      .then((serverData) => {
        if (serverData) {
          setOverrides(serverData);
          saveOverrides(serverData);
        }
      })
      .finally(() => setServerLoaded(true)); // mark done whether server had data or not
  }, []);

  const getText = useCallback(
    (lang: "tr" | "en", key: string, fallback: string) => {
      return overrides[lang]?.[key] ?? fallback;
    },
    [overrides]
  );

  const getGallery = useCallback(
    (defaults: GalleryItem[]) => {
      if (!overrides.gallery || overrides.gallery.length === 0) return defaults;
      return overrides.gallery.map(img => {
        if (img.src.startsWith('session:')) {
          const key = img.src.replace('session:', '');
          const base64 = typeof window !== "undefined" ? sessionStorage.getItem(key) : null;
          return { ...img, src: base64 || img.src };
        }
        return img;
      });
    },
    [overrides]
  );

  const updateText = useCallback((lang: "tr" | "en", key: string, value: string) => {
    setOverrides((prev) => {
      const next = {
        ...prev,
        [lang]: { ...prev[lang], [key]: value },
      };
      saveOverrides(next);
      return next;
    });
  }, []);

  const getStats = useCallback(
    (lang: "tr" | "en", defaults: StatItem[]) => {
      const key = lang === "tr" ? "trStats" : "enStats";
      const saved = overrides[key];
      if (!saved || saved.length === 0) return defaults;
      return saved;
    },
    [overrides]
  );

  const updateGallery = useCallback((items: GalleryItem[]) => {
    setOverrides((prev) => {
      const next = { ...prev, gallery: items };
      saveOverrides(next);
      return next;
    });
  }, []);

  const updateStats = useCallback((lang: "tr" | "en", items: StatItem[]) => {
    setOverrides((prev) => {
      const key = lang === "tr" ? "trStats" : "enStats";
      const next = { ...prev, [key]: items };
      saveOverrides(next);
      return next;
    });
  }, []);

  const updateEmailConfig = useCallback((config: import("@/lib/siteOverrides").EmailConfig | null) => {
    setOverrides((prev) => {
      const next = { ...prev, emailConfig: config || undefined };
      saveOverrides(next);
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    const empty: SiteOverrides = { gallery: [], tr: {}, en: {} };
    saveOverrides(empty);
    setOverrides(empty);
  }, []);

  return (
    <ContentContext.Provider value={{ overrides, serverLoaded, getText, getGallery, getStats, updateText, updateGallery, updateStats, updateEmailConfig, resetAll }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  return useContext(ContentContext);
}
