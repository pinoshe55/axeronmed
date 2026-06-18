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

  // İlk render: localStorage → yoksa "tr" (sunucudan gelene kadar geçici)
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "tr";
    return (localStorage.getItem(STORAGE_KEY) as Lang) || "tr";
  });
  const [userChose, setUserChose] = useState(false);

  // Sunucu yüklenince: kullanıcı daha önce dil seçmediyse varsayılan dili uygula
  useEffect(() => {
    if (!serverLoaded || userChose) return;
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored) { setUserChose(true); return; } // localStorage'da varsa dokunma
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
