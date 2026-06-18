"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { type Lang, type Translations, translations } from "@/lib/i18n";
import { useContent } from "@/context/ContentContext";

type LanguageContextType = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "tr",
  setLang: () => {},
  t: translations.tr as Translations,
});

const STORAGE_KEY = "axeron-lang";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { overrides, serverLoaded } = useContent();

  // SSR ile eşleşmesi için her zaman "tr" ile başla
  const [lang, setLangState] = useState<Lang>("tr");
  const [userChose, setUserChose] = useState(false);

  // Mount sonrası localStorage'dan dili oku (hydration hatası olmaz)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (stored) {
      setLangState(stored);
      setUserChose(true);
    }
  }, []);

  // Sunucu yüklenince: kullanıcı daha önce dil seçmediyse varsayılan dili uygula
  useEffect(() => {
    if (!serverLoaded || userChose) return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) { setUserChose(true); return; }
    const def = (overrides.theme?.defaultLang as Lang) || "tr";
    setLangState(def);
  }, [serverLoaded]);

  const setLang = (l: Lang) => {
    setLangState(l);
    setUserChose(true);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, l);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] as Translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
