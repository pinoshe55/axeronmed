"use client";

import { useContent } from "@/context/ContentContext";
import { useLanguage } from "@/context/LanguageContext";
import PageLayout from "@/components/PageLayout";
import BlockRenderer from "@/components/BlockRenderer";
import Link from "next/link";

export default function Page() {
  const { overrides, serverLoaded } = useContent();
  const { lang } = useLanguage();

  if (!serverLoaded) return null;

  if (overrides.activePages?.urunler === false) return null;

  const pageContent = overrides.pages?.["urunler"];
  const title = lang === "tr" ? pageContent?.trTitle : pageContent?.enTitle;
  const blocks = lang === "tr" ? pageContent?.trBlocks : pageContent?.enBlocks;
  const body = lang === "tr" ? pageContent?.trBody : pageContent?.enBody;
  const heroImage = pageContent?.heroImage;

  return (
    <PageLayout>
      {/* Hero image — tam genişlik, konteynerin dışında */}
      {heroImage && (
        <div className="relative w-full mb-8" style={{ maxHeight: "45vh", overflow: "hidden" }}>
          <img src={heroImage} alt={title || ""} className="w-full h-full object-cover" style={{ maxHeight: "45vh" }} />
          {title && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
              <div className="px-[8vw] pb-8">
                <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">{title}</h1>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-[11px] tracking-widest uppercase text-ink/30 hover:text-ink/60 transition-colors mb-8 inline-block">
          ← Ana Sayfa
        </Link>

        {title && <h1 className="text-3xl md:text-4xl font-light tracking-tight text-ink/80 mb-8">{title}</h1>}

        {blocks && blocks.length > 0 ? (
          <BlockRenderer blocks={blocks} />
        ) : body ? (
          <div
            className="prose prose-sm max-w-none text-ink/60 leading-relaxed [&_h1]:text-ink/80 [&_h2]:text-ink/70 [&_h3]:text-ink/70 [&_strong]:text-ink/80 [&_a]:text-blue-600"
            dangerouslySetInnerHTML={{ __html: body }}
          />
        ) : (
          <p className="text-ink/30 text-sm">İçerik henüz eklenmedi.</p>
        )}
      </div>
    </PageLayout>
  );
}
