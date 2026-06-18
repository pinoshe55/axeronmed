"use client";

import { useContent } from "@/context/ContentContext";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/i18n";
import PageLayout from "@/components/PageLayout";
import BlockRenderer from "@/components/BlockRenderer";
import Link from "next/link";

export default function Page() {
  const { overrides, serverLoaded } = useContent();
  const { lang } = useLanguage();
  const t = translations[lang]?.static ?? translations.tr.static;

  if (!serverLoaded) return null;

  if (overrides.activePages?.referanslarimiz === false) return null;

  const pageContent = overrides.pages?.["referanslarimiz"];
  const title = lang === "tr" ? pageContent?.trTitle : lang === "de" ? ((pageContent as any)?.deTitle || pageContent?.enTitle) : pageContent?.enTitle;
  const blocks = lang === "tr" ? pageContent?.trBlocks : lang === "de" ? ((pageContent as any)?.deBlocks || pageContent?.enBlocks) : pageContent?.enBlocks;
  const body = lang === "tr" ? pageContent?.trBody : lang === "de" ? ((pageContent as any)?.deBody || pageContent?.enBody) : pageContent?.enBody;
  const heroImage = pageContent?.heroImage;

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-[11px] tracking-widest uppercase text-ink/30 hover:text-ink/60 transition-colors mb-8 inline-block">
          {t.backHome}
        </Link>

        {heroImage && (
          <div className="w-full aspect-[3/1] rounded-2xl overflow-hidden mb-8 bg-ink/5">
            <img src={heroImage} alt={title} className="w-full h-full object-cover" />
          </div>
        )}

        {title && <h1 className="text-3xl md:text-4xl font-light tracking-tight text-ink/80 mb-8">{title}</h1>}

        {blocks && blocks.length > 0 ? (
          <BlockRenderer blocks={blocks} />
        ) : body ? (
          <div
            className="prose prose-sm max-w-none text-ink/60 leading-relaxed [&_h1]:text-ink/80 [&_h2]:text-ink/70 [&_h3]:text-ink/70 [&_strong]:text-ink/80 [&_a]:text-blue-600"
            dangerouslySetInnerHTML={{ __html: body }}
          />
        ) : (
          <p className="text-ink/30 text-sm">{t.noContent}</p>
        )}
      </div>
    </PageLayout>
  );
}
