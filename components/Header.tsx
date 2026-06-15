"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function Header() {
  const { lang, setLang, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on route change / link click
  const close = () => setOpen(false);

  return (
    <>
      <header
        style={{ backgroundColor: scrolled ? "rgba(236, 233, 227, 0.82)" : "transparent" }}
        className={`fixed top-0 left-0 right-0 z-50 px-[6vw] md:px-[8vw] py-4 flex items-center justify-between transition-all duration-500 ease-out ${
          scrolled
            ? "translate-y-0 opacity-100 pointer-events-auto backdrop-blur-md border-b border-ink/10 shadow-sm"
            : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <a href="#hero" className="pointer-events-auto" onClick={close}>
          <Image
            src="/logo.png" unoptimized
            alt="Axeron Medical"
            width={140}
            height={38}
            className="h-8 w-auto object-contain"
            priority
          />
        </a>

        {/* Hamburger button — 3 lines */}
        <button
          type="button"
          aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
          onClick={() => setOpen((v) => !v)}
          className="pointer-events-auto flex flex-col justify-center gap-[5px] w-9 h-9 p-1.5 rounded-md hover:bg-ink/5 transition-colors"
        >
          <span
            className={`block h-[2px] bg-ink rounded-full transition-all duration-300 origin-center ${
              open ? "rotate-45 translate-y-[7px]" : ""
            }`}
          />
          <span
            className={`block h-[2px] bg-ink rounded-full transition-all duration-300 ${
              open ? "opacity-0 scale-x-0" : ""
            }`}
          />
          <span
            className={`block h-[2px] bg-ink rounded-full transition-all duration-300 origin-center ${
              open ? "-rotate-45 -translate-y-[7px]" : ""
            }`}
          />
        </button>
      </header>

      {/* Dropdown menu */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-out ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ backgroundColor: "rgba(236, 233, 227, 0.97)", backdropFilter: "blur(16px)" }}
      >
        <div className="px-[6vw] md:px-[8vw] pt-24 pb-10 flex flex-col gap-2">
          <a
            href="#hero"
            onClick={close}
            className="text-2xl md:text-3xl font-semibold text-ink/80 hover:text-ink py-3 border-b border-ink/10 transition-colors"
          >
            {t.nav.home}
          </a>
          <a
            href="#hakkimizda"
            onClick={close}
            className="text-2xl md:text-3xl font-semibold text-ink/80 hover:text-ink py-3 border-b border-ink/10 transition-colors"
          >
            {t.nav.about}
          </a>
          <a
            href="#iletisim"
            onClick={close}
            className="text-2xl md:text-3xl font-semibold text-ink/80 hover:text-ink py-3 border-b border-ink/10 transition-colors"
          >
            {t.nav.contact}
          </a>

          <button
            type="button"
            onClick={() => { setLang(lang === "tr" ? "en" : "tr"); close(); }}
            className="mt-4 w-fit flex items-center gap-2 text-sm font-semibold tracking-widest text-ink/40 hover:text-ink transition-colors"
            aria-label="Switch language"
          >
            <span className={lang === "tr" ? "text-ink" : ""}>TR</span>
            <span className="text-ink/20">/</span>
            <span className={lang === "en" ? "text-ink" : ""}>EN</span>
          </button>
        </div>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30"
          onClick={close}
        />
      )}
    </>
  );
}
