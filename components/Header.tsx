"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useContent } from "@/context/ContentContext";

export default function Header() {
  const { lang, setLang, t } = useLanguage();
  const { overrides } = useContent();
  const customNavPages = (overrides.customPages || []).filter((p) => p.active && p.showInNav);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [kurumsalOpen, setKurumsalOpen] = useState(false);

  const isHome = pathname === "/";
  const ap = overrides.activePages ?? {};
  const navStyle = overrides.theme?.navStyle || "hamburger";
  const navBg = overrides.theme?.navBg || "rgba(236, 233, 227, 0.92)";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = () => { setOpen(false); setKurumsalOpen(false); };

  const linkCls = "text-[11px] tracking-[0.2em] uppercase text-ink/30 hover:text-ink/60 py-2.5 transition-colors block";
  const subLinkCls = "text-[10px] tracking-[0.18em] uppercase text-ink/25 hover:text-ink/55 py-2 transition-colors block pl-4";
  const topbarLinkCls = "text-[11px] tracking-[0.18em] uppercase text-ink/40 hover:text-ink/70 transition-colors whitespace-nowrap";

  // ── Nav items list (reused across styles) ────────────────────────────────
  const navItems = (
    <>
      <Link href="/" onClick={close} className={linkCls}>{t.nav.home}</Link>
      <div className="h-px w-full bg-ink/8" />
      <Link href={isHome ? "#hakkimizda" : "/#hakkimizda"} onClick={close} className={linkCls}>{t.nav.about}</Link>
      <div className="h-px w-full bg-ink/8" />
      {ap.kurumsal && (
        <>
          <button type="button" onClick={() => setKurumsalOpen((v) => !v)}
            className={`${linkCls} flex items-center gap-2`}>
            Kurumsal
            <span className={`text-ink/20 text-[9px] transition-transform duration-200 ${kurumsalOpen ? "rotate-90" : ""}`}>▶</span>
          </button>
          {kurumsalOpen && (
            <div className="pb-1">
              <Link href="/kurumsal/kalite-politikamiz" onClick={close} className={subLinkCls}>— Kalite Politikamız</Link>
              <Link href="/kurumsal/kalite-belgeleri" onClick={close} className={subLinkCls}>— Kalite Belgeleri</Link>
            </div>
          )}
          <div className="h-px w-full bg-ink/8" />
        </>
      )}
      {ap.urunler && (<><Link href="/urunler" onClick={close} className={linkCls}>Ürünler</Link><div className="h-px w-full bg-ink/8" /></>)}
      {ap.referanslarimiz && (<><Link href="/referanslarimiz" onClick={close} className={linkCls}>Referanslarımız</Link><div className="h-px w-full bg-ink/8" /></>)}
      {ap.kvkk && (<><Link href="/kvkk" onClick={close} className={linkCls}>KVKK</Link><div className="h-px w-full bg-ink/8" /></>)}
      {customNavPages.map((cp) => (
        <div key={cp.id}>
          <Link href={"/p/" + cp.slug} onClick={close} className={linkCls}>
            {lang === "tr" ? (cp.trTitle || cp.navLabel) : (cp.enTitle || cp.navLabel)}
          </Link>
          <div className="h-px w-full bg-ink/8" />
        </div>
      ))}
      <Link href={isHome ? "#iletisim" : "/#iletisim"} onClick={close} className={linkCls}>{t.nav.contact}</Link>
      <div className="h-px w-full bg-ink/8" />
    </>
  );

  const langToggle = (
    <div className="flex items-center gap-1 text-xs tracking-widest">
      {(["TR", "EN", "DE"] as const).map((code, i) => {
        const l = code.toLowerCase() as "tr" | "en" | "de";
        return (
          <span key={code} className="flex items-center gap-1">
            {i > 0 && <span className="text-ink/15">/</span>}
            <button type="button" onClick={() => setLang(l)}
              className={`transition-colors ${lang === l ? "text-ink/80 font-semibold" : "text-ink/30 hover:text-ink/60"}`}>
              {code}
            </button>
          </span>
        );
      })}
    </div>
  );

  // Scroll olunca tüm nav stillerinde arka plan gelir
  const headerBg = scrolled ? navBg : "transparent";
  const headerCls = `fixed top-0 left-0 right-0 z-50 px-[6vw] md:px-[8vw] py-4 flex items-center transition-all duration-300 ${scrolled ? "backdrop-blur-md border-b border-black/8 shadow-sm" : ""}`;

  // ══════════════════════════════════════════════════════════════
  // STYLE 1: HAMBURGER (default)
  // ══════════════════════════════════════════════════════════════
  if (navStyle === "hamburger") return (
    <>
      <header className={`${headerCls} justify-between`} style={{ backgroundColor: headerBg }}>
        <div className="flex items-center gap-4">
          <button type="button" aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
            onClick={() => setOpen((v) => !v)}
            className="flex flex-col justify-center gap-[4px] w-6 h-6 flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity">
            <span className={`block h-px bg-ink transition-all duration-300 origin-center ${open ? "rotate-45 translate-y-[5px] w-4" : "w-4"}`} />
            <span className={`block h-px bg-ink transition-all duration-300 ${open ? "opacity-0 scale-x-0" : ""} w-3`} />
            <span className={`block h-px bg-ink transition-all duration-300 origin-center ${open ? "-rotate-45 -translate-y-[5px] w-4" : "w-4"}`} />
          </button>
          <Link href="/" onClick={close}>
            <Image src="/logo.png" unoptimized alt="Axeron Medical" width={140} height={38} className="h-7 w-auto object-contain" priority />
          </Link>
        </div>
      </header>

      {/* Dropdown */}
      <div className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-out ${open ? "opacity-100 pointer-events-auto translate-y-0" : "opacity-0 pointer-events-none -translate-y-2"}`}
        style={{ backgroundColor: navBg, backdropFilter: "blur(24px)" }}>
        <div className="px-[6vw] md:px-[8vw] pt-20 pb-8">
          <div className="flex flex-col gap-0 w-fit">{navItems}</div>
          <div className="flex justify-end mt-6">{langToggle}</div>
        </div>
      </div>
      {open && <div className="fixed inset-0 z-30" onClick={close} />}
    </>
  );

  // ══════════════════════════════════════════════════════════════
  // STYLE 2: TOPBAR — linkler header'da görünür (masaüstü)
  // ══════════════════════════════════════════════════════════════
  if (navStyle === "topbar") return (
    <>
      <header className={`${headerCls} justify-between`} style={{ backgroundColor: headerBg }}>
        {/* Logo */}
        <Link href="/" onClick={close}>
          <Image src="/logo.png" unoptimized alt="Axeron Medical" width={140} height={38} className="h-7 w-auto object-contain" priority />
        </Link>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-7">
          <Link href="/" className={topbarLinkCls}>{t.nav.home}</Link>
          <Link href={isHome ? "#hakkimizda" : "/#hakkimizda"} className={topbarLinkCls}>{t.nav.about}</Link>
          {ap.urunler && <Link href="/urunler" className={topbarLinkCls}>Ürünler</Link>}
          {ap.kurumsal && <Link href="/kurumsal" className={topbarLinkCls}>Kurumsal</Link>}
          {ap.referanslarimiz && <Link href="/referanslarimiz" className={topbarLinkCls}>Referanslarımız</Link>}
          {customNavPages.map((cp) => (
            <Link key={cp.id} href={"/p/" + cp.slug} className={topbarLinkCls}>
              {lang === "tr" ? (cp.trTitle || cp.navLabel) : (cp.enTitle || cp.navLabel)}
            </Link>
          ))}
          <Link href={isHome ? "#iletisim" : "/#iletisim"} className={topbarLinkCls}>{t.nav.contact}</Link>
        </nav>

        {/* Right: lang + mobile burger */}
        <div className="flex items-center gap-4">
          {langToggle}
          <button type="button" aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
            onClick={() => setOpen((v) => !v)}
            className="flex md:hidden flex-col justify-center gap-[4px] w-6 h-6 opacity-50 hover:opacity-100 transition-opacity">
            <span className={`block h-px bg-ink transition-all duration-300 origin-center ${open ? "rotate-45 translate-y-[5px] w-4" : "w-4"}`} />
            <span className={`block h-px bg-ink transition-all duration-300 ${open ? "opacity-0 scale-x-0" : ""} w-3`} />
            <span className={`block h-px bg-ink transition-all duration-300 origin-center ${open ? "-rotate-45 -translate-y-[5px] w-4" : "w-4"}`} />
          </button>
        </div>
      </header>

      {/* Mobile dropdown */}
      <div className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-out md:hidden ${open ? "opacity-100 pointer-events-auto translate-y-0" : "opacity-0 pointer-events-none -translate-y-2"}`}
        style={{ backgroundColor: navBg, backdropFilter: "blur(24px)" }}>
        <div className="px-[6vw] pt-20 pb-8">
          <div className="flex flex-col gap-0 w-fit">{navItems}</div>
        </div>
      </div>
      {open && <div className="fixed inset-0 z-30 md:hidden" onClick={close} />}
    </>
  );

  // ══════════════════════════════════════════════════════════════
  // STYLE 3: SIDEBAR — soldan kayan panel
  // ══════════════════════════════════════════════════════════════
  return (
    <>
      <header className={`${headerCls} justify-between`} style={{ backgroundColor: headerBg }}>
        <div className="flex items-center gap-4">
          <button type="button" aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
            onClick={() => setOpen((v) => !v)}
            className="flex flex-col justify-center gap-[5px] w-7 h-7 flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity">
            <span className={`block h-[1.5px] bg-ink transition-all duration-300 origin-left ${open ? "rotate-45 w-5" : "w-5"}`} />
            <span className={`block h-[1.5px] bg-ink transition-all duration-300 ${open ? "opacity-0 w-0" : "w-4"}`} />
            <span className={`block h-[1.5px] bg-ink transition-all duration-300 origin-left ${open ? "-rotate-45 w-5" : "w-5"}`} />
          </button>
          <Link href="/" onClick={close}>
            <Image src="/logo.png" unoptimized alt="Axeron Medical" width={140} height={38} className="h-7 w-auto object-contain" priority />
          </Link>
        </div>
      </header>

      {/* Sidebar overlay */}
      <div className={`fixed inset-0 z-40 transition-all duration-300 ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
        {/* Backdrop */}
        <div className={`absolute inset-0 bg-ink/20 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} onClick={close} />
        {/* Panel */}
        <div className={`absolute top-0 left-0 h-full w-72 transition-transform duration-300 ease-out flex flex-col ${open ? "translate-x-0" : "-translate-x-full"}`}
          style={{ backgroundColor: navBg, backdropFilter: "blur(20px)" }}>
          <div className="pt-20 px-8 pb-8 flex flex-col h-full">
            <div className="flex flex-col gap-0 flex-1">{navItems}</div>
            <div className="mt-6">{langToggle}</div>
          </div>
        </div>
      </div>
    </>
  );
}
