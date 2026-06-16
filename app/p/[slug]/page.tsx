"use client";

import { useParams } from "next/navigation";
import { useContent } from "@/context/ContentContext";
import { useLanguage } from "@/context/LanguageContext";
import PageLayout from "@/components/PageLayout";
import BlockRenderer from "@/components/BlockRenderer";
import Link from "next/link";

export default function DynamicPage() {
  const { slug } = useParams<{ slug: string }>();
  const { overrides, serverLoaded } = useContent();
  const { lang } = useLanguage();

  if (!serverLoaded) return null;

  const page = overrides.customPages?.find((p) => p.slug === slug);

  if (!page || !page.active) {
    return (
      <PageLayout>
        <div className="max-w-2xl">
          <Link href="/" className="text-[11px] tracking-widest uppercase text-ink/30 hover:text-ink/60 transition-colors mb-8 inline-block">
            ← Ana Sayfa
          </Link>
          <h1 className="text-2xl font-light text-ink/40">Sayfa bulunamadı</h1>
        </div>
      </PageLayout>
    );
  }

  const title = lang === "tr" ? (page.trTitle || page.navLabel) : (page.enTitle || page.navLabel);
  const blocks = lang === "tr" ? page.trBlocks : page.enBlocks;
  const body = lang === "tr" ? page.trBody : page.enBody;

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-[11px] tracking-widest uppercase text-ink/30 hover:text-ink/60 transition-colors mb-8 inline-block">
          ← Ana Sayfa
        </Link>

        {page.heroImage && (
          <div className="w-full aspect-[3/1] rounded-2xl overflow-hidden mb-8 bg-ink/5">
            <img src={page.heroImage} alt={title} className="w-full h-full object-cover" />
          </div>
        )}

        {title && <h1 className="text-3xl md:text-4xl font-light tracking-tight text-ink/80 mb-8">{title}</h1>}

        {blocks && blocks.length > 0 ? (
          <BlockRenderer blocks={blocks} />
        ) : body ? (
          <div
            className="prose prose-sm max-w-none text-ink/60 leading-relaxed [&_h1]:text-ink/80 [&_h2]:text-ink/70 [&_strong]:text-ink/80 [&_a]:text-blue-600"
            dangerouslySetInnerHTML={{ __html: body }}
          />
        ) : (
          <p className="text-ink/30 text-sm">İçerik henüz eklenmedi.</p>
        )}
      </div>
    </PageLayout>
  );
}
