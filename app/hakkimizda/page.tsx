"use client";

import { useLanguage } from "@/context/LanguageContext";
import { loadOverrides } from "@/lib/siteOverrides";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AboutPage() {
  const { lang } = useLanguage();
  const [data, setData] = useState({
    mission: "",
    productionQuality: "",
    certification: "",
    about: "",
    qualityValues: "",
  });

  useEffect(() => {
    const overrides = loadOverrides();
    if (lang === "tr") {
      setData({
        mission: overrides.trMission || "",
        productionQuality: overrides.trProductionQuality || "",
        certification: overrides.trCertification || "",
        about: overrides.trAbout || "",
        qualityValues: overrides.trQualityValues || "",
      });
    } else {
      setData({
        mission: overrides.enMission || "",
        productionQuality: overrides.enProductionQuality || "",
        certification: overrides.enCertification || "",
        about: overrides.enAbout || "",
        qualityValues: overrides.enQualityValues || "",
      });
    }
  }, [lang]);

  const t = {
    tr: {
      title: "Hakkımızda",
      breadcrumb: "Hakkımızda",
      mission: "Misyon",
      productionQuality: "Üretim Kalitesi",
      certification: "Sertifikasyon",
      about: "Hakkımızda",
      qualityValues: "Kalite Değerlerimiz",
    },
    en: {
      title: "About Us",
      breadcrumb: "About Us",
      mission: "Mission",
      productionQuality: "Production Quality",
      certification: "Certification",
      about: "About Us",
      qualityValues: "Our Quality Values",
    },
  };

  const text = t[lang];

  return (
    <div className="min-h-screen bg-dark text-white">
      {/* Header */}
      <div className="border-b border-slate-800 sticky top-0 bg-dark/95 backdrop-blur z-20">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">{text.title}</h1>
            <p className="text-sm text-slate-400 mt-1">{text.breadcrumb}</p>
          </div>
          <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors border border-slate-700 hover:border-slate-500 rounded-lg px-4 py-2">
            ← {lang === "tr" ? "Geri Dön" : "Back"}
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Mission */}
        {data.mission && (
          <section className="mb-12">
            <div className="info-card px-8 py-9 rounded-2xl">
              <div className="flex items-center gap-3 mb-5">
                <span className="accent-rule" />
                <p className="eyebrow uppercase tracking-widest text-xs font-semibold">
                  {text.mission}
                </p>
              </div>
              <h2 className="text-2xl font-semibold leading-snug tracking-tight mb-5">
                {text.mission}
              </h2>
              <div className="w-full h-px bg-ink/8 mb-5" />
              <p className="text-sm text-ink/55 leading-relaxed whitespace-pre-line">
                {data.mission}
              </p>
            </div>
          </section>
        )}

        {/* Production Quality */}
        {data.productionQuality && (
          <section className="mb-12">
            <div className="info-card px-8 py-9 rounded-2xl">
              <div className="flex items-center gap-3 mb-5">
                <span className="accent-rule" />
                <p className="eyebrow uppercase tracking-widest text-xs font-semibold">
                  {text.productionQuality}
                </p>
              </div>
              <h2 className="text-2xl font-semibold leading-snug tracking-tight mb-5">
                {text.productionQuality}
              </h2>
              <div className="w-full h-px bg-ink/8 mb-5" />
              <p className="text-sm text-ink/55 leading-relaxed whitespace-pre-line">
                {data.productionQuality}
              </p>
            </div>
          </section>
        )}

        {/* Certification */}
        {data.certification && (
          <section className="mb-12">
            <div className="info-card px-8 py-9 rounded-2xl">
              <div className="flex items-center gap-3 mb-5">
                <span className="accent-rule" />
                <p className="eyebrow uppercase tracking-widest text-xs font-semibold">
                  {text.certification}
                </p>
              </div>
              <h2 className="text-2xl font-semibold leading-snug tracking-tight mb-5">
                {text.certification}
              </h2>
              <div className="w-full h-px bg-ink/8 mb-5" />
              <p className="text-sm text-ink/55 leading-relaxed whitespace-pre-line">
                {data.certification}
              </p>
            </div>
          </section>
        )}

        {/* About */}
        {data.about && (
          <section className="mb-12">
            <div className="info-card px-8 py-9 rounded-2xl">
              <div className="flex items-center gap-3 mb-5">
                <span className="accent-rule" />
                <p className="eyebrow uppercase tracking-widest text-xs font-semibold">
                  {text.about}
                </p>
              </div>
              <h2 className="text-2xl font-semibold leading-snug tracking-tight mb-5">
                {text.about}
              </h2>
              <div className="w-full h-px bg-ink/8 mb-5" />
              <p className="text-sm text-ink/55 leading-relaxed whitespace-pre-line">
                {data.about}
              </p>
            </div>
          </section>
        )}

        {/* Quality Values */}
        {data.qualityValues && (
          <section className="mb-12">
            <div className="info-card px-8 py-9 rounded-2xl">
              <div className="flex items-center gap-3 mb-5">
                <span className="accent-rule" />
                <p className="eyebrow uppercase tracking-widest text-xs font-semibold">
                  {text.qualityValues}
                </p>
              </div>
              <h2 className="text-2xl font-semibold leading-snug tracking-tight mb-5">
                {text.qualityValues}
              </h2>
              <div className="w-full h-px bg-ink/8 mb-5" />
              <p className="text-sm text-ink/55 leading-relaxed whitespace-pre-line">
                {data.qualityValues}
              </p>
            </div>
          </section>
        )}

        {/* Empty State */}
        {!data.mission &&
          !data.productionQuality &&
          !data.certification &&
          !data.about &&
          !data.qualityValues && (
            <div className="text-center py-16">
              <p className="text-slate-400 mb-4">
                {lang === "tr"
                  ? "Hakkımızda içeriği henüz doldurulmamış."
                  : "About content has not been filled yet."}
              </p>
              <p className="text-xs text-slate-500">
                {lang === "tr"
                  ? "Admin panelinde 'Hakkımızda' sekmesinden içerik ekleyebilirsiniz."
                  : "You can add content from the 'About' tab in the admin panel."}
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
