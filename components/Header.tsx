"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function Header() {
  const { lang, setLang, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = () => setOpen(false);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 px-[6vw] md:px-[8vw] py-4 flex items-center justify-between transition-all duration-300 ${
          scrolled ? "backdrop-blur-md border-b border-black/8 shadow-sm" : ""
        }`}
        style={{ backgroundColor: scrolled ? "rgba(236, 233, 227, 0.88)" : "transparent" }}
      >
        {/* Logo + hamburger side by side */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
            onClick={() => setOpen((v) => !v)}
            className="flex flex-col justify-center gap-[5px] w-8 h-8 flex-shrink-0"
          >
            <span className={`block h-[2px] bg-ink rounded-full transition-all duration-300 origin-center ${open ? "rotate-45 translate-y-[7px]" : ""}`} />
            <span className={`block h-[2px] bg-ink rounded-full transition-all duration-300 ${open ? "opacity-0 scale-x-0" : ""}`} />
            <span className={`block h-[2px] bg-ink rounded-full transition-all duration-300 origin-center ${open ? "-rotate-45 -translate-y-[7px]" : ""}`} />
          </button>

          <a href="#hero" onClick={close}>
            <Image
              src="/logo.png" unoptimized
              alt="Axeron Medical"
              width={140}
              height={38}
              className="h-7 w-auto object-contain"
              priority
            />
          </a>
        </div>

        {/* Language switcher */}
        <button
          type="button"
          onClick={() => setLang(lang === "tr" ? "en" : "tr")}
          className="text-xs font-semibold tracking-widest text-ink/40 hover:text-ink transition-colors"
          aria-label="Switch language"
        >
          <span className={lang === "tr" ? "text-ink" : ""}>TR</span>
          <span className="text-ink/20 mx-1">/</span>
          <span className={lang === "en" ? "text-ink" : ""}>EN</span>
        </button>
      </header>

      {/* Dropdown menu */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-out ${
          open ? "opacity-100 pointer-events-auto translate-y-0" : "opacity-0 pointer-events-none -translate-y-2"
        }`}
        style={{ backgroundColor: "rgba(236, 233, 227, 0.97)", backdropFilter: "blur(20px)" }}
      >
        <div className="px-[6vw] md:px-[8vw] pt-20 pb-8 flex flex-col gap-0">
          <a href="#hero" onClick={close}
            className="font-semibold text-base tracking-wide text-ink/70 hover:text-ink py-3.5 border-b border-ink/8 transition-colors">
            {t.nav.home}
          </a>
          <a href="#hakkimizda" onClick={close}
            className="font-semibold text-base tracking-wide text-ink/70 hover:text-ink py-3.5 border-b border-ink/8 transition-colors">
            {t.nav.about}
          </a>
          <a href="#iletisim" onClick={close}
            className="font-semibold text-base tracking-wide text-ink/70 hover:text-ink py-3.5 border-b border-ink/8 transition-colors">
            {t.nav.contact}
          </a>
        </div>
      </div>

      {open && <div className="fixed inset-0 z-30" onClick={close} />}
    </>
  );
}
