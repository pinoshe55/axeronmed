"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useContent } from "@/context/ContentContext";
import type { GalleryItem } from "@/lib/siteOverrides";
import BlockRenderer from "@/components/BlockRenderer";

/* ─── yardımcı ───────────────────────────────────────────────────── */

const inputCls =
  "w-full bg-white/70 border border-ink/10 rounded-xl px-4 py-3 text-sm text-ink placeholder:text-ink/25 outline-none focus:border-accent/40 focus:bg-white transition-colors";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-ink/50">
        {label}{required && <span className="text-accent ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function Divider() {
  return <div className="w-full h-px bg-ink/10" />;
}

function AnimatedStat({ value, label, desc }: { value: string; label: string; desc: string }) {
  const [display, setDisplay] = useState("0");
  const ref = useState(() => ({ current: null as HTMLDivElement | null }))[0];
  const triggered = useState(false);

  // Sayıyı ve suffix'i ayır: "15+" → num=15, suffix="+"
  const match = value.match(/^(\d+)(.*)$/);
  const targetNum = match ? parseInt(match[1]) : 0;
  const suffix = match ? match[2] : value;

  useEffect(() => {
    if (!match) { setDisplay(value); return; }

    const el = document.getElementById(`stat-${label}`);
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const duration = 1400;
        const steps = 50;
        const increment = targetNum / steps;
        let current = 0;
        let step = 0;

        const timer = setInterval(() => {
          step++;
          current = Math.min(Math.round(increment * step), targetNum);
          setDisplay(String(current) + suffix);
          if (step >= steps) clearInterval(timer);
        }, duration / steps);
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div id={`stat-${label}`} className="flex flex-col gap-2">
      <span className="text-4xl lg:text-5xl font-bold tracking-tight text-white leading-none tabular-nums">
        {display || value}
      </span>
      <span className="text-sm font-semibold text-white/80 mt-1">{label}</span>
      <span className="text-xs text-white/35">{desc}</span>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-ink/10 last:border-0">
      <button
        className="w-full flex items-center justify-between gap-6 py-5 text-left text-sm font-medium text-ink hover:text-accent transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span>{q}</span>
        <span className={`text-lg leading-none transition-transform duration-200 flex-shrink-0 ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      {open && (
        <p className="pb-5 text-sm text-ink/55 leading-relaxed">{a}</p>
      )}
    </div>
  );
}

/* ─── bileşen ────────────────────────────────────────────────────── */

export default function StaticSections() {
  const { t, lang } = useLanguage();
  const s = t.static;
  const { getGallery, getText, getStats, overrides } = useContent();
  const g = (key: string, fallback: string) => getText(lang, `static.${key}`, fallback);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  // Şerit galeriyi oklarla kaydır (native smooth bazı tarayıcılarda
  // güvenilmez olduğu için rAF ile manuel animasyon)
  const scrollStrip = (dir: -1 | 1) => {
    const el = stripRef.current;
    if (!el) return;
    const amount = dir * Math.min(el.clientWidth * 0.8, 640);
    const start = el.scrollLeft;
    const target = Math.max(0, Math.min(start + amount, el.scrollWidth - el.clientWidth));
    const startTime = performance.now();
    const duration = 420;
    const ease = (t: number) => 1 - Math.pow(1 - t, 3); // easeOutCubic
    const step = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      el.scrollLeft = start + (target - start) * ease(t);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // Form state'leri
  const [formData, setFormData] = useState({
    company: "",
    person: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    kvkk: false,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Toast otomatik kapanması
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const el = galleryRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add("in-view"); },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Form submit handler
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.company || !formData.person || !formData.email || !formData.phone || !formData.message) {
      setToast({ type: "error", message: lang === "tr" ? "Lütfen tüm alanları doldurun" : "Please fill all fields" });
      return;
    }

    if (!formData.kvkk) {
      setToast({ type: "error", message: lang === "tr" ? "Lütfen KVKK'yı onaylayın" : "Please accept KVKK" });
      return;
    }

    setFormLoading(true);
    try {
      const response = await fetch("/api/contact/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          emailConfig: overrides?.emailConfig,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Form gönderilemedi");
      }

      setToast({ type: "success", message: lang === "tr" ? "Mesajınız başarıyla gönderildi!" : "Message sent successfully!" });
      setFormData({ company: "", person: "", email: "", phone: "", subject: "", message: "", kvkk: false });
    } catch (error: any) {
      setToast({ type: "error", message: error.message || (lang === "tr" ? "Hata oluştu" : "Error occurred") });
    } finally {
      setFormLoading(false);
    }
  };

  const prev = () => setLightboxIdx(i => i !== null ? (i - 1 + IMGS.length) % IMGS.length : null);
  const next = () => setLightboxIdx(i => i !== null ? (i + 1) % IMGS.length : null);

  // ESC / ← → tuşları
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIdx(null);
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const DEFAULT_IMGS: GalleryItem[] = [
    { src: "/hero-1.jpg",  caption: "", active: true, w: 310, h: 228, top: "6%",  left: "24%", rotate: "-4deg", z: 2 },
    { src: "/hero-2.jpg",  caption: "", active: true, w: 270, h: 198, top: "4%",  left: "50%", rotate:  "3deg", z: 3 },
    { src: "/hero-3.jpg",  caption: "", active: true, w: 240, h: 176, top: "3%",  left: "72%", rotate: "-2deg", z: 2 },
    { src: "/hero-4.jpg",  caption: "", active: true, w: 290, h: 212, top: "44%", left: "34%", rotate: "-3deg", z: 2 },
    { src: "/hero-5.jpg",  caption: "", active: true, w: 275, h: 186, top: "40%", left: "58%", rotate:  "4deg", z: 3 },
    { src: "/hero-6.jpg",  caption: "", active: true, w: 230, h: 168, top: "50%", left: "76%", rotate: "-1deg", z: 1 },
    { src: "/hero-7.jpg",  caption: "", active: true, w: 210, h: 154, top: "20%", left: "14%", rotate:  "3deg", z: 1 },
    { src: "/hero-8.jpg",  caption: "", active: true, w: 200, h: 148, top: "58%", left: "18%", rotate: "-5deg", z: 2 },
    { src: "/hero-9.jpg",  caption: "", active: true, w: 185, h: 136, top: "14%", left: "84%", rotate:  "2deg", z: 1 },
    { src: "/hero-10.jpg", caption: "", active: true, w: 310, h: 228, top: "9%",  left: "34%", rotate: "-7deg", z: 6 },
    { src: "/hero-11.jpg", caption: "", active: true, w: 310, h: 228, top: "9%",  left: "34%", rotate: "-8deg", z: 6 },
  ];

  // Overrides'den al (loadOverrides'da src'ler zaten garantileniyor)
  const overrideGallery = getGallery(DEFAULT_IMGS);
  const IMGS = overrideGallery.filter((img) => img.active !== false);

  // Galeri tasarım stili: collage (dağınık kolaj), masonry (ızgara), strip (şerit)
  const galleryLayout = overrides?.galleryLayout || "collage";

  // Bölüm görünürlüğü (undefined veya true = göster, false = gizle)
  const sec = overrides?.activeSections || {};
  const showGallery = sec.gallery !== false;
  const showStats = sec.stats !== false;
  const showAboutText = sec.aboutText !== false;
  const showMissionVision = sec.missionVision !== false;
  const showContact = sec.contact !== false;
  const showCtaBand = sec.ctaBand !== false;

  // Sayfa görünürlüğü
  const ap = overrides?.activePages || {};
  const showHakkimizda = ap.hakkimizda !== false;
  const showSss = ap.sss !== false;
  const showIletisim = ap.iletisim !== false;

  // Misyon/Vizyon sütunlarının üzerinde içerik var mı? (border ve margin için)
  const hasAboveColumns = showStats || (showAboutText && (overrides?.trAbout || overrides?.enAbout));

  // Hakkımızda section'ında gösterilecek içerik var mı? Yoksa section hiç render edilmez (boş alan önlenir)
  const hasHakkimizdaContent = showStats
    || (showAboutText && (overrides?.trAbout || overrides?.enAbout || overrides?.deAbout))
    || overrides?.trMission || overrides?.enMission || overrides?.deMission
    || overrides?.trProductionQuality || overrides?.enProductionQuality
    || overrides?.trCertification || overrides?.enCertification
    || overrides?.pages?.hakkimizda?.trBlocks?.length
    || overrides?.pages?.hakkimizda?.enBlocks?.length;

  // Ortak beyaz çerçeve kartı (üç stil de bunu kullanır)
  const galleryCard = (img: GalleryItem, imgWrapClass: string, cardExtra = "") => (
    <div className={`bg-white p-2 rounded-[3px] shadow-[0_12px_28px_-10px_rgba(0,0,0,0.4)] group-hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)] transition-shadow duration-300 ${cardExtra}`}>
      <div className={`relative overflow-hidden rounded-[2px] bg-ink/5 ${imgWrapClass}`}>
        <Image
          src={img.src}
          alt={img.caption || ""}
          fill
          className="object-cover"
          sizes="(max-width:768px) 50vw, 25vw"
        />
        <span className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-ink text-sm shadow">⤢</span>
      </div>
      {img.caption && (
        <figcaption className="px-1 pt-2 pb-0.5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink leading-tight">{img.caption}</p>
        </figcaption>
      )}
    </div>
  );

  return (
    <div className="relative z-10">

      {/* ── Lightbox ── */}
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/75 backdrop-blur-sm"
          onClick={() => setLightboxIdx(null)}
        >
          {/* Kapat */}
          <button
            onClick={() => setLightboxIdx(null)}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white text-xl"
            aria-label="Kapat"
          >×</button>

          {/* Geri */}
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 md:left-8 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 transition-colors flex items-center justify-center text-white text-2xl"
            aria-label="Önceki"
          >‹</button>

          {/* Resim kartı */}
          <div
            className="relative rounded-2xl overflow-hidden shadow-2xl"
            style={{ width: "min(820px, 88vw)", height: "min(580px, 78vh)", backgroundColor: "rgba(255,255,255,0.92)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              key={lightboxIdx}
              src={IMGS[lightboxIdx].src}
              alt=""
              fill
              className="object-contain"
              sizes="820px"
            />
          </div>

          {/* İleri */}
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 md:right-8 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 transition-colors flex items-center justify-center text-white text-2xl"
            aria-label="Sonraki"
          >›</button>

          {/* Caption + Sayaç */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
            {IMGS[lightboxIdx].caption && (
              <p className="text-white text-sm font-medium bg-black/40 backdrop-blur-sm px-4 py-1.5 rounded-full">
                {IMGS[lightboxIdx].caption}
              </p>
            )}
            <p className="text-white/50 text-xs tracking-widest">
              {lightboxIdx + 1} / {IMGS.length}
            </p>
          </div>
        </div>
      )}

      {/* ── Ürün Galerisi ── */}
      {showGallery && (
      <div className="px-[8vw] py-10 gallery-section" style={{ backgroundColor: "rgba(236, 233, 227, 0.85)" }}>

        {/* Başlık */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="accent-rule" />
            <p className="eyebrow">Ürün Galerisi</p>
          </div>
          <p className="text-xs text-ink/30 hidden md:block">Büyütmek için tıklayın</p>
        </div>

        {/* ─── Kolaj ─── */}
        {galleryLayout === "collage" && (
          <div ref={galleryRef} className="gallery-grid grid grid-cols-6 lg:grid-cols-12 auto-rows-[42px] grid-flow-dense gap-2">
            {IMGS.map((img, i) => {
              const spans = [
                "col-span-4 row-span-5", "col-span-3 row-span-4", "col-span-5 row-span-4",
                "col-span-3 row-span-4", "col-span-4 row-span-4", "col-span-3 row-span-4",
                "col-span-5 row-span-4", "col-span-4 row-span-4",
              ];
              return (
                <figure
                  key={i}
                  onClick={() => setLightboxIdx(i)}
                  className={`group relative cursor-zoom-in ${spans[i % spans.length]} transition-transform duration-300 ease-out hover:scale-[1.03] hover:z-20`}
                >
                  {galleryCard(img, "flex-1 min-h-0", "h-full flex flex-col")}
                </figure>
              );
            })}
          </div>
        )}

        {/* ─── Izgara (Masonry) ─── */}
        {galleryLayout === "masonry" && (
          <div ref={galleryRef} className="gallery-grid columns-2 md:columns-3 lg:columns-4 gap-2 [column-gap:0.625rem]">
            {IMGS.map((img, i) => {
              const aspects = ["aspect-[4/5]", "aspect-[1/1]", "aspect-[4/3]", "aspect-[3/4]", "aspect-[5/4]", "aspect-[1/1]"];
              return (
                <figure
                  key={i}
                  onClick={() => setLightboxIdx(i)}
                  className="group relative mb-2.5 break-inside-avoid cursor-zoom-in transition-transform duration-300 ease-out hover:scale-[1.02] hover:z-20"
                >
                  {galleryCard(img, `w-full ${aspects[i % aspects.length]}`)}
                </figure>
              );
            })}
          </div>
        )}

        {/* ─── Şerit ─── */}
        {galleryLayout === "strip" && (
          <div className="relative">
            <div
              ref={stripRef}
              className="flex gap-3 overflow-x-auto pb-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {IMGS.map((img, i) => (
                <figure
                  key={i}
                  onClick={() => setLightboxIdx(i)}
                  className="group relative shrink-0 w-[200px] md:w-[240px] cursor-zoom-in transition-transform duration-300 ease-out hover:scale-[1.02] hover:z-20"
                >
                  {galleryCard(img, "w-full aspect-[4/5]")}
                </figure>
              ))}
            </div>
            <button type="button" onClick={() => scrollStrip(-1)} aria-label="Önceki"
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/90 backdrop-blur shadow items-center justify-center text-ink hover:bg-white transition-all">‹</button>
            <button type="button" onClick={() => scrollStrip(1)} aria-label="Sonraki"
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/90 backdrop-blur shadow items-center justify-center text-ink hover:bg-white transition-all">›</button>
          </div>
        )}

        {/* ─── Katalog ─── */}
        {(galleryLayout === "catalog" || !galleryLayout) && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-1.5">
            {IMGS.map((img, i) => (
              <figure
                key={i}
                onClick={() => setLightboxIdx(i)}
                className="group relative cursor-zoom-in overflow-hidden rounded-md bg-ink/5"
              >
                <div className="aspect-square w-full relative overflow-hidden">
                  <Image
                    src={img.src}
                    alt={img.caption || ""}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width:768px) 33vw, (max-width:1024px) 25vw, 17vw"
                  />
                  <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/20 transition-colors duration-300 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-xl">⤢</span>
                  </div>
                </div>
                {img.caption && (
                  <div className="px-2.5 py-2 bg-white/80 backdrop-blur-sm">
                    <p className="text-[11px] font-medium text-ink/70 truncate">{img.caption}</p>
                  </div>
                )}
              </figure>
            ))}
          </div>
        )}
      </div>
      )}

      {/* ══════════════════════════════════════════════
          HAKKIMIZDA / ABOUT
      ══════════════════════════════════════════════ */}
      {showHakkimizda && hasHakkimizdaContent && <section id="hakkimizda" className={`px-[8vw] ${showGallery ? "py-24" : "pt-16 pb-24"}`} style={{ backgroundColor: "var(--bg)" }}>

        {showStats && (
        <div className={`flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 ${hasAboveColumns ? "mb-12" : "mb-6"}`}>
          <div>
            <p className="eyebrow mb-3">{g("aboutEyebrow", s.aboutEyebrow)}</p>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight" style={{ color: "var(--accent)" }}>
              {g("aboutTitle", s.aboutTitle)} <span className="text-accent">{g("aboutTitleAccent", s.aboutTitleAccent)}</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm text-ink/55 leading-relaxed lg:text-right whitespace-pre-line">
            {g("aboutSubtitle", s.aboutSubtitle)}
          </p>
        </div>
        )}

        {/* İstatistikler */}
        {showStats && (
        <div className="rounded-2xl overflow-hidden grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-white/8" style={{ backgroundColor: "var(--dark)" }}>
          {getStats(lang === "de" ? "en" : lang, s.stats).map((st) => (
            <div key={st.label} className="p-7 lg:p-10">
              <AnimatedStat value={st.value} label={st.label} desc={st.desc} />
            </div>
          ))}
        </div>
        )}

        {/* About description - Larger text with HTML support */}
        {showAboutText && (overrides?.trAbout || overrides?.enAbout || overrides?.deAbout) && (
          <div className="mt-12 pt-12 border-t border-ink/10">
            <div className="text-base text-ink/60 leading-relaxed prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: (lang === "tr" ? overrides.trAbout : lang === "de" ? (overrides.deAbout || overrides.enAbout) : overrides.enAbout) || "" }} />
          </div>
        )}


        {/* Alt sütunlar: Misyon · Üretim Kalitesi · Sertifikasyon */}
        {(overrides?.trMission || overrides?.enMission || overrides?.trProductionQuality || overrides?.enProductionQuality || overrides?.trCertification || overrides?.enCertification) && (() => {
          const cols = [
            { labelTr: "Misyon", labelEn: "Mission", labelDe: "Mission", tr: overrides?.trMission, en: overrides?.enMission, de: overrides?.deMission },
            { labelTr: "Üretim Kalitesi", labelEn: "Production Quality", labelDe: "Produktionsqualität", tr: overrides?.trProductionQuality, en: overrides?.enProductionQuality, de: undefined },
            { labelTr: "Sertifikasyon", labelEn: "Certification", labelDe: "Zertifizierung", tr: overrides?.trCertification, en: overrides?.enCertification, de: undefined },
          ].filter(c => c.tr || c.en || c.de);
          const gridClass = cols.length === 1 ? "lg:grid-cols-1" : cols.length === 2 ? "lg:grid-cols-2" : "lg:grid-cols-3";
          const colLabel = (c: typeof cols[0]) => lang === "tr" ? c.labelTr : lang === "de" ? c.labelDe : c.labelEn;
          const colText = (c: typeof cols[0]) => lang === "tr" ? c.tr : lang === "de" ? (c.de || c.en) : c.en;
          return (
            <div className={`grid grid-cols-1 md:grid-cols-2 ${gridClass} gap-10 mt-14`}>
              {cols.map((c) => (
                <div key={c.labelTr} className="text-center">
                  <p className="eyebrow mb-3">{colLabel(c)}</p>
                  <p className="text-sm text-ink/60 leading-relaxed">{colText(c)}</p>
                </div>
              ))}
            </div>
          );
        })()}

        {/* Hakkımızda ek blok içeriği */}
        {(() => {
          const hpc = overrides?.pages?.hakkimizda as any;
          const blocks = lang === "tr" ? hpc?.trBlocks : lang === "de" ? (hpc?.deBlocks || hpc?.enBlocks) : hpc?.enBlocks;
          const title = lang === "tr" ? hpc?.trTitle : lang === "de" ? (hpc?.deTitle || hpc?.enTitle) : hpc?.enTitle;
          if (!blocks || blocks.length === 0) return null;
          return (
            <div className="mt-14 pt-14 border-t border-ink/10">
              {title && <h3 className="text-2xl md:text-3xl font-semibold tracking-tight mb-8" style={{ color: "var(--accent)" }}>{title}</h3>}
              <BlockRenderer blocks={blocks} />
            </div>
          );
        })()}

      </section>}

      {showHakkimizda && hasHakkimizdaContent && showIletisim && <Divider />}

      {/* ══════════════════════════════════════════════
          İLETİŞİM / CONTACT
      ══════════════════════════════════════════════ */}
      {showIletisim && (
      <section id="iletisim" className="px-[8vw] py-16" style={{ backgroundColor: "var(--bg)" }}>

        {/* Başlık */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3 mb-10">
          <div>
            {g("contactEyebrow", s.contactEyebrow) && (
              <div className="flex items-center gap-3 mb-2">
                <span className="accent-rule" />
                <p className="eyebrow">{g("contactEyebrow", s.contactEyebrow)}</p>
              </div>
            )}
            {(g("contactTitle", s.contactTitle) || g("contactTitleAccent", s.contactTitleAccent)) && (
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight" style={{ color: "var(--accent)" }}>
                {g("contactTitle", s.contactTitle)} <span className="text-accent">{g("contactTitleAccent", s.contactTitleAccent)}</span>
              </h2>
            )}
          </div>
          {g("contactSubtitle", s.contactSubtitle) && (
            <p className="max-w-sm text-sm text-ink/50 leading-relaxed lg:text-right whitespace-pre-line">
              {g("contactSubtitle", s.contactSubtitle)}
            </p>
          )}
        </div>

        {/* 2 sütun — sol koyu kart + sağ form */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-5">

          {/* ── Sol: koyu iletişim kartı ── */}
          <div className="p-6 flex flex-col justify-between gap-8" style={{ backgroundColor: "var(--dark)" }}>

            <div className="flex flex-col gap-6">
              {(() => {
                const blocks = lang === "tr"
                  ? (overrides?.trContactBlocks?.length ? overrides.trContactBlocks : s.contactBlocks)
                  : lang === "de"
                  ? (overrides?.deContactBlocks?.length ? overrides.deContactBlocks : s.contactBlocks)
                  : (overrides?.enContactBlocks?.length ? overrides.enContactBlocks : s.contactBlocks);
                return blocks.map((b) => (
                  <div key={b.label}>
                    <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/30 mb-1.5">{b.label}</p>
                    <div className="flex flex-col gap-0.5">
                      {b.lines.map((l) => (
                        <span key={l} className="text-sm text-white/70 leading-relaxed">{l}</span>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>

            {/* Alt: şirket bilgisi */}
            <div className="pt-5 border-t border-white/10">
              <p className="text-[11px] text-white/25 leading-relaxed whitespace-pre-line">{lang === "tr" ? (overrides?.trCompanyInfo || s.companyInfo) : lang === "de" ? (overrides?.deCompanyInfo || s.companyInfo) : (overrides?.enCompanyInfo || s.companyInfo)}</p>
            </div>
          </div>

          {/* ── Sağ: form kartı ── */}
          <div className="bg-white/60 border border-ink/8 overflow-hidden">

            {/* Toast Notification */}
            {toast && (
              <div
                className={`px-8 py-3 flex items-center gap-3 text-sm font-medium ${
                  toast.type === "success"
                    ? "bg-green-50 text-green-800 border-b border-green-200"
                    : "bg-red-50 text-red-800 border-b border-red-200"
                }`}
              >
                <span className="text-lg">{toast.type === "success" ? "✓" : "✕"}</span>
                {toast.message}
              </div>
            )}

            {/* Form başlık bandı */}
            <div className="px-6 py-4 border-b border-ink/8 flex items-center justify-between">
              <div>
                <p className="eyebrow mb-0.5">{g("formEyebrow", s.formEyebrow)}</p>
                <p className="text-xs text-ink/40">{g("formSubtitle", s.formSubtitle)}</p>
              </div>
              <span className="w-2 h-2 rounded-full bg-accent" />
            </div>

            <form className="px-6 py-5 flex flex-col gap-4" onSubmit={handleContactSubmit}>

              {/* Firma + Kişi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label={s.formCompany} required>
                  <input
                    type="text"
                    placeholder={s.formCompanyPlaceholder}
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    disabled={formLoading}
                    className={inputCls}
                  />
                </Field>
                <Field label={s.formPerson} required>
                  <input
                    type="text"
                    placeholder={s.formPersonPlaceholder}
                    value={formData.person}
                    onChange={(e) => setFormData({...formData, person: e.target.value})}
                    disabled={formLoading}
                    className={inputCls}
                  />
                </Field>
              </div>

              {/* E-posta + Telefon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label={s.formEmail} required>
                  <input
                    type="email"
                    placeholder={s.formEmailPlaceholder}
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    disabled={formLoading}
                    className={inputCls}
                  />
                </Field>
                <Field label={s.formPhone} required>
                  <input
                    type="tel"
                    placeholder={s.formPhonePlaceholder}
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    disabled={formLoading}
                    className={inputCls}
                  />
                </Field>
              </div>

              {/* Mesaj */}
              <Field label={s.formMessage} required>
                <textarea
                  rows={3}
                  placeholder={s.formMessagePlaceholder}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  disabled={formLoading}
                  className={`${inputCls} resize-none`}
                />
              </Field>

              {/* KVKK + Gönder */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="kvkk"
                    checked={formData.kvkk}
                    onChange={(e) => setFormData({...formData, kvkk: e.target.checked})}
                    disabled={formLoading}
                    className="mt-0.5 w-3.5 h-3.5 flex-shrink-0 accent-[var(--accent)]"
                  />
                  <label htmlFor="kvkk" className="text-xs text-ink/40 leading-relaxed cursor-pointer">
                    <Link href="/kvkk" target="_blank"
                      className="text-accent underline hover:text-accent/70 transition-colors">
                      {s.formKvkkLink}
                    </Link>
                    {s.formKvkkSuffix}
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="cta flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formLoading ? (lang === "tr" ? "Gönderiliyor..." : "Sending...") : s.formSubmit}
                </button>
              </div>

              <p className="text-[11px] text-ink/25">{s.formPrivacy}</p>
            </form>
          </div>

        </div>

        {/* ── SSS — full width ── */}
        {showSss && (
        <div className="mt-16 pt-14 border-t border-ink/8">
          <div className="flex items-center gap-3 mb-8">
            <span className="accent-rule" />
            <p className="eyebrow">{g("faqEyebrow", s.faqEyebrow)}</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16">
            {(lang === "tr" ? (overrides?.trFaqs || s.faqs) : lang === "de" ? (overrides?.deFaqs || s.faqs) : (overrides?.enFaqs || s.faqs)).map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
        )}

        {/* SSS & İletişim ek blok içerikleri */}
        {(() => {
          const sssBlocks = lang === "tr" ? overrides?.pages?.sss?.trBlocks : overrides?.pages?.sss?.enBlocks;
          const iletisimBlocks = lang === "tr" ? overrides?.pages?.iletisim?.trBlocks : overrides?.pages?.iletisim?.enBlocks;
          const allBlocks = [...(sssBlocks || []), ...(iletisimBlocks || [])];
          return allBlocks.length > 0 ? <div className="mt-14 pt-14 border-t border-ink/8"><BlockRenderer blocks={allBlocks} /></div> : null;
        })()}

      </section>
      )}

      {/* Footer CTA bandı */}
      {showCtaBand && <div className="px-[8vw] py-20 flex flex-col sm:flex-row items-center justify-between gap-8" style={{ backgroundColor: "var(--dark)" }}>
        <div className="flex items-center gap-6">
          <Image
            src="/logo-badge.png" unoptimized
            alt="Axeron"
            width={64}
            height={64}
            className="opacity-40 flex-shrink-0"
            style={{ filter: "brightness(0) invert(1)" }}
          />
          <div>
            {g("ctaEyebrow", "") && <p className="eyebrow text-white/35 mb-2">{g("ctaEyebrow", "")}</p>}
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white/90 leading-tight">
              {g("ctaTitle", s.ctaTitle)}
            </h2>
          </div>
        </div>
        <a
          href="mailto:satis@axeronmed.com"
          className="text-white/65 hover:text-white transition-colors text-base font-medium tracking-tight border-b border-white/20 hover:border-white pb-1 whitespace-nowrap"
        >
          satis@axeronmed.com ↗
        </a>
      </div>}

    </div>
  );
}
