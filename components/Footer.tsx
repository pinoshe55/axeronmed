"use client";

import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="relative z-10 py-10 px-[8vw] flex items-center justify-between border-t border-ink/10">
      <Image
        src="/logo.png" unoptimized
        alt="Axeron Medical"
        width={100}
        height={28}
        className="h-6 w-auto object-contain opacity-40"
      />
      <span className="text-xs text-ink/40">{t.static.footerLinks}</span>
    </footer>
  );
}
