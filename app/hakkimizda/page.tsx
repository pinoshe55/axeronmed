"use client";

import { useLanguage } from "@/context/LanguageContext";
import { loadOverrides } from "@/lib/siteOverrides";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AboutPage() {
  const { lang } = useLanguage();
  const [data, setData] = useState({
    about: "",
    mission: "",
    vision: "",
    qualityValues: "",
    productionQuality: "",
    certification: "",
  });

  useEffect(() => {
    const overrides = loadOverrides();
    if (lang === "tr") {
      setData({
        about: overrides.trAbout || "",
        mission: overrides.trMission || "",
        vision: overrides.trVision || "",
        qualityValues: overrides.trQualityValues || "",
        productionQuality: overrides.trProductionQuality || "",
        certification: overrides.trCertification || "",
      });
    } else {
      setData({
        about: overrides.enAbout || "",
        mission: overrides.enMission || "",
        vision: overrides.enVision || "",
        qualityValues: overrides.enQualityValues || "",
        productionQuality: overrides.enProductionQuality || "",
        certification: overrides.enCertification || "",
      });
    }
  }, [lang]);

  const t = {
    tr: {
      title: "Hakkımızda",
      breadcrumb: "Hakkımızda",
      about: "Hakkımızda",
      mission: "Misyon",
      vision: "Vizyon",
      qualityValues: "Kalite Değerlerimiz",
      productionQuality: "Üretim Kalitesi",
      certification: "Sertifikasyon",
    },
    en: {
      title: "About Us",
      breadcrumb: "About Us",
      about: "About Us",
      mission: "Mission",
      vision: "Vision",
      qualityValues: "Our Quality Values",
      productionQuality: "Production Quality",
      certification: "Certification",
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
        {/* About (Main) */}
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

        {/* Mission - Vision - Quality Values (One Group) */}
        {(data.mission || data.vision || data.qualityValues) && (
          <div className="mb-12 space-y-6">
            {data.mission && (
              <section>
                <div className="info-card px-8 py-9 rounded-2xl">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="accent-rule" />
                    <p className="eyebrow uppercase tracking-widest text-xs font-semibold">
                      {text.mission}
                    </p>
                  </div>
                  <h3 className="text-2xl font-semibold leading-snug tracking-tight mb-5">
                    {text.mission}
                  </h3>
                  <div className="w-full h-px bg-ink/8 mb-5" />
                  <p className="text-sm text-ink/55 leading-relaxed whitespace-pre-line">
                    {data.mission}
                  </p>
                </div>
              </section>
            )}

            {data.vision && (
              <section>
                <div className="info-card px-8 py-9 rounded-2xl">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="accent-rule" />
                    <p className="eyebrow uppercase tracking-widest text-xs font-semibold">
                      {text.vision}
                    </p>
                  </div>
                  <h3 className="text-2xl font-semibold leading-snug tracking-tight mb-5">
                    {text.vision}
                  </h3>
                  <div className="w-full h-px bg-ink/8 mb-5" />
                  <p className="text-sm text-ink/55 leading-relaxed whitespace-pre-line">
                    {data.vision}
                  </p>
                </div>
              </section>
            )}

            {data.qualityValues && (
              <section>
                <div className="info-card px-8 py-9 rounded-2xl">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="accent-rule" />
                    <p className="eyebrow uppercase tracking-widest text-xs font-semibold">
                      {text.qualityValues}
                    </p>
                  </div>
                  <h3 className="text-2xl font-semibold leading-snug tracking-tight mb-5">
                    {text.qualityValues}
                  </h3>
                  <div className="w-full h-px bg-ink/8 mb-5" />
                  <p className="text-sm text-ink/55 leading-relaxed whitespace-pre-line">
                    {data.qualityValues}
                  </p>
                </div>
              </section>
            )}
          </div>
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

        {/* Empty State */}
        {!data.about &&
          !data.mission &&
          !data.vision &&
          !data.qualityValues &&
          !data.productionQuality &&
          !data.certification && (
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
