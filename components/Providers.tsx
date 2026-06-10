"use client";

import { useEffect } from "react";
import { LanguageProvider } from "@/context/LanguageContext";
import { ContentProvider } from "@/context/ContentContext";
import { loadOverrides } from "@/lib/siteOverrides";

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Load custom dark background color from localStorage and apply to CSS variable
    const overrides = loadOverrides();
    if (overrides.darkBgColor) {
      document.documentElement.style.setProperty('--dark', overrides.darkBgColor);
    }
  }, []);

  return (
    <LanguageProvider>
      <ContentProvider>{children}</ContentProvider>
    </LanguageProvider>
  );
}
