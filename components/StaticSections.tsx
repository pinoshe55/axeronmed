"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useContent } from "@/context/ContentContext";
import type { GalleryItem } from "@/lib/siteOverrides";

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
    if (!formData.company || !formData.person || !formData.email || !formData.phone || !formData.subject || !formData.message) {
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

  return (
    <div className="relative z-10" style={{ backgroundColor: "var(--bg)" }}>

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

      {/* ── Ürün Galerisi — Bento Grid ── */}
      <div className="px-[8vw] py-16 gallery-section">

        {/* Başlık */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="accent-rule" />
            <p className="eyebrow">Ürün Galerisi</p>
          </div>
          <p className="text-xs text-ink/35 hidden md:block">Görmek için tıklayın</p>
        </div>

        {/* Grid — her resim eklediğinizde IMGS dizisine src eklemek yeterli */}
        <div ref={galleryRef} className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[200px] gallery-grid">
          {IMGS.map((img, i) => {
            // Döngüsel span paterni: 0→geniş(2col), 5→geniş(2col), diğerleri normal
            const pos = i % 6;
            const span = pos === 0
              ? "col-span-2 row-span-2"
              : pos === 3
              ? "col-span-2"
              : "col-span-1";
            return (
              <div
                key={i}
                className={`${span} relative overflow-hidden rounded-2xl cursor-zoom-in group`}
                style={{ backgroundColor: "rgba(255,255,255,0.7)" }}
                onClick={() => setLightboxIdx(i)}
              >
                <Image
                  src={img.src}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width:768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300 flex items-end justify-center">
                  {img.caption && (
                    <span className="w-full px-3 py-2 text-[11px] text-white font-medium bg-black/50 backdrop-blur-sm leading-snug text-center">
                      {img.caption}
                    </span>
                  )}
                  {!img.caption && (
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 mb-3 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center text-ink text-lg">⤢</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          HAKKIMIZDA / ABOUT
      ══════════════════════════════════════════════ */}
      <section id="hakkimizda" className="px-[8vw] py-24">

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-12">
          <div>
            <p className="eyebrow mb-3">{g("aboutEyebrow", s.aboutEyebrow)}</p>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight" style={{ color: "var(--dark)" }}>
              {g("aboutTitle", s.aboutTitle)} <span className="text-accent">{g("aboutTitleAccent", s.aboutTitleAccent)}</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm text-ink/55 leading-relaxed lg:text-right whitespace-pre-line">
            {g("aboutSubtitle", s.aboutSubtitle)}
          </p>
        </div>

        {/* İstatistikler */}
        <div className="rounded-2xl overflow-hidden grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-white/8" style={{ backgroundColor: "var(--dark)" }}>
          {getStats(lang, s.stats).map((st) => (
            <div key={st.label} className="p-7 lg:p-10">
              <AnimatedStat value={st.value} label={st.label} desc={st.desc} />
            </div>
          ))}
        </div>

        {/* About description - Larger text with HTML support */}
        {(overrides?.trAbout || overrides?.enAbout) && (
          <div className="mt-12 pt-12 border-t border-ink/10">
            <div className="text-base text-ink/60 leading-relaxed prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: (lang === "tr" ? overrides.trAbout : overrides.enAbout) || "" }} />
          </div>
        )}

        {/* 4 sütun metin — Misyon, Vizyon, Üretim Kalitesi, Sertifikasyon (Dinamik layout) */}
        {(overrides?.trMission || overrides?.enMission || overrides?.trVision || overrides?.enVision || overrides?.trProductionQuality || overrides?.enProductionQuality || overrides?.trCertification || overrides?.enCertification) ? (
          <>
            {/* Count active fields to determine grid layout */}
            {(() => {
              const activeFields = [
                overrides?.trMission || overrides?.enMission,
                overrides?.trVision || overrides?.enVision,
                overrides?.trProductionQuality || overrides?.enProductionQuality,
                overrides?.trCertification || overrides?.enCertification,
              ].filter(Boolean).length;

              const gridClass = activeFields === 2 ? "lg:grid-cols-2" : activeFields === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4";

              return (
                <div className={`mt-14 grid grid-cols-1 md:grid-cols-2 ${gridClass} gap-10 pt-14 border-t border-ink/10`}>
                  {/* Misyon */}
                  {(overrides?.trMission || overrides?.enMission) && (
                    <div>
                      <p className="eyebrow mb-3">{lang === "tr" ? "Misyon" : "Mission"}</p>
                      <div className="text-sm text-ink/60 leading-relaxed prose prose-invert prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: (lang === "tr" ? overrides.trMission : overrides.enMission) || "" }} />
                    </div>
                  )}

                  {/* Vizyon */}
                  {(overrides?.trVision || overrides?.enVision) && (
                    <div>
                      <p className="eyebrow mb-3">{lang === "tr" ? "Vizyon" : "Vision"}</p>
                      <div className="text-sm text-ink/60 leading-relaxed prose prose-invert prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: (lang === "tr" ? overrides.trVision : overrides.enVision) || "" }} />
                    </div>
                  )}

                  {/* Üretim Kalitesi */}
                  {(overrides?.trProductionQuality || overrides?.enProductionQuality) && (
                    <div>
                      <p className="eyebrow mb-3">{lang === "tr" ? "Üretim Kalitesi" : "Production Quality"}</p>
                      <div className="text-sm text-ink/60 leading-relaxed prose prose-invert prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: (lang === "tr" ? overrides.trProductionQuality : overrides.enProductionQuality) || "" }} />
                    </div>
                  )}

                  {/* Sertifikasyon */}
                  {(overrides?.trCertification || overrides?.enCertification) && (
                    <div>
                      <p className="eyebrow mb-3">{lang === "tr" ? "Sertifikasyon" : "Certification"}</p>
                      <div className="text-sm text-ink/60 leading-relaxed prose prose-invert prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: (lang === "tr" ? overrides.trCertification : overrides.enCertification) || "" }} />
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Kalite Değerlerimiz — Separate section below */}
            {(overrides?.trQualityValues || overrides?.enQualityValues) && (
              <div className="mt-14 pt-14 border-t border-ink/10">
                <p className="eyebrow mb-3">{lang === "tr" ? "Kalite Değerlerimiz" : "Our Quality Values"}</p>
                <div className="text-sm text-ink/60 leading-relaxed prose prose-invert prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: (lang === "tr" ? overrides.trQualityValues : overrides.enQualityValues) || "" }} />
              </div>
            )}
          </>
        ) : (
          // Fallback: original columns eğer About verileri yoksa
          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-10 pt-14 border-t border-ink/10">
            {s.columns.map((b) => (
              <div key={b.title}>
                <p className="eyebrow mb-3">{b.title}</p>
                <p className="text-sm text-ink/60 leading-relaxed">{b.body}</p>
              </div>
            ))}
          </div>
        )}

      </section>

      <Divider />

      {/* ══════════════════════════════════════════════
          İLETİŞİM / CONTACT
      ══════════════════════════════════════════════ */}
      <section id="iletisim" className="px-[8vw] py-24">

        {/* Başlık */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-14">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="accent-rule" />
              <p className="eyebrow">{g("contactEyebrow", s.contactEyebrow)}</p>
            </div>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight" style={{ color: "var(--dark)" }}>
              {g("contactTitle", s.contactTitle)} <span className="text-accent">{g("contactTitleAccent", s.contactTitleAccent)}</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm text-ink/50 leading-relaxed lg:text-right whitespace-pre-line">
            {g("contactSubtitle", s.contactSubtitle)}
          </p>
        </div>

        {/* 2 sütun — sol koyu kart + sağ form */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-6">

          {/* ── Sol: koyu iletişim kartı ── */}
          <div className="rounded-2xl p-8 flex flex-col justify-between gap-10" style={{ backgroundColor: "var(--dark)" }}>

            <div className="flex flex-col gap-8">
              {s.contactBlocks.map((b) => (
                <div key={b.label}>
                  <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/30 mb-2">{b.label}</p>
                  <div className="flex flex-col gap-1">
                    {b.lines.map((l) => (
                      <span key={l} className="text-sm text-white/70 leading-relaxed">{l}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Alt: aksiyon linkleri */}
            <div className="flex flex-col gap-3 pt-8 border-t border-white/10">
              <a
                href="mailto:satis@axeronmed.com"
                className="flex items-center justify-between group text-sm text-white/60 hover:text-white transition-colors py-2.5 border-b border-white/8"
              >
                <span>satis@axeronmed.com</span>
                <span className="opacity-40 group-hover:opacity-100 transition-opacity">↗</span>
              </a>
              <a
                href="tel:+902125550872"
                className="flex items-center justify-between group text-sm text-white/60 hover:text-white transition-colors py-2.5"
              >
                <span>+90 212 555 08 72</span>
                <span className="opacity-40 group-hover:opacity-100 transition-opacity">↗</span>
              </a>
              <p className="text-[11px] text-white/20 mt-2 leading-relaxed whitespace-pre-line">{s.companyInfo}</p>
            </div>
          </div>

          {/* ── Sağ: form kartı ── */}
          <div className="bg-white/60 border border-ink/8 rounded-2xl overflow-hidden">

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
            <div className="px-8 py-6 border-b border-ink/8 flex items-center justify-between">
              <div>
                <p className="eyebrow mb-0.5">{g("formEyebrow", s.formEyebrow)}</p>
                <p className="text-xs text-ink/40">{g("formSubtitle", s.formSubtitle)}</p>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-accent" />
            </div>

            <form className="px-8 py-7 flex flex-col gap-5" onSubmit={handleContactSubmit}>

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

              {/* Konu */}
              <Field label={s.formSubject} required>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  disabled={formLoading}
                  className={inputCls}
                >
                  <option value="">{s.formSubjectPlaceholder}</option>
                  {s.formSubjectOptions.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </Field>

              {/* Mesaj */}
              <Field label={s.formMessage} required>
                <textarea
                  rows={4}
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
        <div className="mt-16 pt-14 border-t border-ink/8">
          <div className="flex items-center gap-3 mb-8">
            <span className="accent-rule" />
            <p className="eyebrow">{g("faqEyebrow", s.faqEyebrow)}</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16">
            {s.faqs.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </div>

      </section>

      {/* Footer CTA bandı */}
      <div className="px-[8vw] py-20 flex flex-col sm:flex-row items-center justify-between gap-8" style={{ backgroundColor: "var(--dark)" }}>
        <div className="flex items-center gap-6">
          <Image
            src="/logo-badge.png" unoptimized
            alt="Axeron"
            width={64}
            height={64}
            className="opacity-20 flex-shrink-0"
          />
          <div>
            <p className="eyebrow text-white/35 mb-2">{g("ctaEyebrow", s.ctaEyebrow)}</p>
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
      </div>

    </div>
  );
}
