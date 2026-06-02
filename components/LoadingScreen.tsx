"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { lockScroll, onTexturesReady, markIntroStart } from "@/lib/sceneReady";
import { useLanguage } from "@/context/LanguageContext";

export default function LoadingScreen() {
  const [texturesReady, setTexturesReady] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { t } = useLanguage();

  useEffect(() => { lockScroll(); }, []);
  useEffect(() => onTexturesReady(() => setTexturesReady(true)), []);

  useEffect(() => {
    if (!texturesReady || hidden) return;
    const hold = window.setTimeout(() => {
      setHidden(true);
      window.setTimeout(() => markIntroStart(), 520);
    }, 280);
    return () => window.clearTimeout(hold);
  }, [texturesReady, hidden]);

  return (
    <div
      className={`loading-screen${hidden ? " loading-screen--hidden" : ""}`}
      aria-hidden={hidden}
      role="status"
      aria-live="polite"
    >
      <div className="loading-screen__inner">
        <Image
          src="/logo-badge.png" unoptimized
          alt="Axeron"
          width={140}
          height={140}
          className="mb-6 opacity-80"
          priority
        />
        <div className="loading-screen__caption">{t.loading}</div>
        <div className="loading-screen__bar" aria-hidden>
          <div className="loading-screen__bar-fill" />
        </div>
        <span className="sr-only">Loading 3D experience</span>
      </div>
    </div>
  );
}
