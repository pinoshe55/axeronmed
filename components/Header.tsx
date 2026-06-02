"use client";

import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

export default function Header() {
  const { lang, setLang, t } = useLanguage();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-[6vw] md:px-[8vw] py-5 flex items-center justify-between pointer-events-none">
      <a href="#hero" className="pointer-events-auto">
        <Image
          src="/logo.png" unoptimized
          alt="Axeron Medical"
          width={140}
          height={38}
          className="h-8 w-auto object-contain"
          priority
        />
      </a>

      <nav className="pointer-events-auto hidden md:flex items-center gap-10 text-sm text-ink/80">
        <a href="#hero" className="hover:text-ink transition-colors">{t.nav.home}</a>
        <a href="#hakkimizda" className="hover:text-ink transition-colors">{t.nav.about}</a>
        <a href="#iletisim" className="hover:text-ink transition-colors font-medium">{t.nav.contact}</a>
        <button
          type="button"
          onClick={() => setLang(lang === "tr" ? "en" : "tr")}
          className="flex items-center gap-1 text-xs font-semibold tracking-wider text-ink/40 hover:text-ink transition-colors"
          aria-label="Switch language"
        >
          <span className={lang === "tr" ? "text-ink" : ""}>TR</span>
          <span className="text-ink/20">/</span>
          <span className={lang === "en" ? "text-ink" : ""}>EN</span>
        </button>
      </nav>

      <div className="pointer-events-auto md:hidden flex items-center gap-4">
        <button
          type="button"
          onClick={() => setLang(lang === "tr" ? "en" : "tr")}
          className="text-xs font-semibold tracking-wider text-ink/50"
          aria-label="Switch language"
        >
          {lang === "tr" ? "EN" : "TR"}
        </button>
        <button type="button" aria-label="Open menu" className="flex flex-col gap-1.5 p-2">
          <span className="block h-[2px] w-6 bg-ink" />
          <span className="block h-[2px] w-6 bg-ink" />
        </button>
      </div>
    </header>
  );
}
