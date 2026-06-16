"use client";

import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { useContent } from "@/context/ContentContext";

export default function Footer() {
  const { t } = useLanguage();
  const { overrides } = useContent();

  const certImages = (overrides?.certImages || []) as (string | null)[];
  const certLinks = (overrides?.certLinks || []) as (string | null)[];

  const activeCerts = [0, 1, 2].filter(i => certImages[i]);

  return (
    <footer className="relative z-10 py-8 px-[8vw] flex items-center justify-between border-t border-ink/10">
      <div className="flex items-center gap-6">
        <Image
          src="/logo.png" unoptimized
          alt="Axeron Medical"
          width={100}
          height={28}
          className="h-6 w-auto object-contain opacity-40"
        />
        {activeCerts.length > 0 && (
          <div className="flex items-center gap-3 pl-6 border-l border-ink/10">
            {activeCerts.map((i) => {
              const src = certImages[i]!;
              const href = certLinks[i] || undefined;
              const circle = (
                <div className="w-10 h-10 rounded-full overflow-hidden border border-ink/15 bg-ink/5 flex-shrink-0">
                  <img src={src} alt={`Sertifika ${i + 1}`} className="w-full h-full object-contain" />
                </div>
              );
              return href ? (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-opacity">
                  {circle}
                </a>
              ) : (
                <div key={i} className="opacity-60">{circle}</div>
              );
            })}
          </div>
        )}
      </div>
      <span className="text-xs text-ink/40">{t.static.footerLinks}</span>
    </footer>
  );
}
