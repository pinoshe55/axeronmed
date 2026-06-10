"use client";

import FeatureStat from "./FeatureStat";
import { useLanguage } from "@/context/LanguageContext";
import { useContent } from "@/context/ContentContext";

/* Tüm kartlarda ortak tipografi sabitleri */
const H = 'text-2xl font-semibold leading-snug tracking-tight';
const P = 'mt-5 text-sm text-ink/55 leading-relaxed';
const CARD = 'info-card px-8 py-9';

export default function ScrollSections() {
  const { t, lang } = useLanguage();
  const { getText } = useContent();
  const g = (key: string, fallback: string) => getText(lang, `scroll.${key}`, fallback);
  const s = t.scroll;

  return (
    <>
      {/* ── 1. HERO ───────────────────────────────────── */}
      <section id="hero" data-section="hero" className="section relative">

        <div className={`${CARD} max-w-[520px] md:max-w-[46%] text-center lg:text-left mx-auto lg:mx-0`}>
          <div className="flex items-center gap-3 mb-5 justify-center lg:justify-start" data-hero-text>
            <span className="accent-rule" />
            <p className="eyebrow">{g("heroEyebrow", s.heroEyebrow)}</p>
          </div>
          <h1 className={H} style={{ color: "var(--accent)" }} data-hero-text>
            {g("heroTitle", s.heroTitle)}
          </h1>
          <div className="mt-5 w-full h-px bg-ink/8" />
          <p className={P} data-hero-text>{g("heroParagraph", s.heroParagraph)}</p>
        </div>

        <div className="hidden lg:flex absolute bottom-10 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-ink/40 text-xs tracking-widest uppercase">
          <span>{g("scrollHint", s.scrollHint)}</span>
          <span className="block w-px h-8 bg-ink/20" />
        </div>
      </section>

      {/* ── 2. LENS CLOSE-UP ──────────────────────────── */}
      <section id="features" data-section="closeup" className="section relative justify-end">

        <div className={`${CARD} max-w-[420px] md:max-w-[38%] lg:mt-[6vh]`}>
          <div className="flex items-center gap-3 mb-5">
            <span className="accent-rule" />
            <p className="eyebrow">{g("closeupEyebrow", s.closeupEyebrow)}</p>
          </div>
          <h2 className={H} style={{ color: "var(--accent)" }}>{g("closeupH2", s.closeupH2)}</h2>
          <div className="mt-5 w-full h-px bg-ink/8" />
          <p className={P}>{g("closeupP", s.closeupP)}</p>
        </div>
      </section>

      {/* ── 3. FRONT FACING + STATS ───────────────────── */}
      <section id="performance" data-section="front" className="section relative">

        <div className={`${CARD} lg:absolute lg:bottom-[14vh] lg:left-[8vw] max-w-[420px]`}>
          <div className="flex items-center gap-3 mb-5">
            <span className="accent-rule" />
            <p className="eyebrow">{g("frontEyebrow", s.frontEyebrow)}</p>
          </div>
          <h2 className={`${H} whitespace-pre-line`} style={{ color: "var(--accent)" }}>{g("frontH2", s.frontH2)}</h2>
          <div className="mt-5 w-full h-px bg-ink/8" />
          <p className={P}>{g("frontP", s.frontP)}</p>
        </div>

        <div className="mt-6 lg:mt-0 lg:absolute lg:top-[18vh] lg:right-[8vw] flex flex-row lg:flex-col gap-4 lg:gap-5 items-start lg:items-end">
          {[
            g("frontStat1", s.frontStat1),
            g("frontStat2", s.frontStat2),
            g("frontStat3", s.frontStat3),
            g("frontStat4", s.frontStat4),
          ].map((label, i) => (
            <div key={i} className="info-card px-6 py-5 w-[320px] lg:text-right">
              <p className="text-sm text-ink/55 leading-relaxed">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. TOP / HORIZONTAL ───────────────────────── */}
      <section id="design" data-section="top" className="section relative">

        <div className={`${CARD} max-w-[460px] md:max-w-[40%]`}>
          <div className="flex items-center gap-3 mb-5">
            <span className="accent-rule" />
            <p className="eyebrow">{g("topEyebrow", s.topEyebrow)}</p>
          </div>
          <h2 className={`${H} whitespace-pre-line`} style={{ color: "var(--accent)" }}>{g("topHeading", s.topHeading)}</h2>
          <div className="mt-5 w-full h-px bg-ink/8" />
          <p className={P}>{g("topP", s.topP)}</p>
        </div>
      </section>

      {/* ── 5. BACK / DIAGONAL ────────────────────────── */}
      <section id="display" data-section="back" className="section relative">

        <div className={`${CARD} max-w-[440px] md:max-w-[40%]`}>
          <div className="flex items-center gap-3 mb-5">
            <span className="accent-rule" />
            <p className="eyebrow">{g("backEyebrow", s.backEyebrow)}</p>
          </div>
          <h2 className={`${H} whitespace-pre-line`} style={{ color: "var(--accent)" }}>{g("backHeading", s.backHeading)}</h2>
          <div className="mt-5 w-full h-px bg-ink/8" />
          <p className={`${P} whitespace-pre-line`}>{g("backP", s.backP)}</p>
        </div>
      </section>

      {/* ── 6. FINAL ──────────────────────────────────── */}
      <section id="experience" data-section="final" className="section relative">

        <div className={`${CARD} max-w-[480px] md:max-w-[42%] lg:ml-auto`}>
          <div className="flex items-center gap-3 mb-5">
            <span className="accent-rule" />
            <p className="eyebrow">{g("finalEyebrow", s.finalEyebrow)}</p>
          </div>
          <h2 className={`${H} whitespace-pre-line`} style={{ color: "var(--accent)" }}>{g("finalHeading", s.finalHeading)}</h2>
          <div className="mt-5 w-full h-px bg-ink/8" />
          <p className={P}>{g("finalP", s.finalP)}</p>
          <a
            href="#iletisim"
            className="cta mt-6 inline-flex"
          >
            {g("finalCta", s.finalCta)}
          </a>
        </div>
      </section>
    </>
  );
}
