"use client";

import { useEffect } from "react";
import { LanguageProvider } from "@/context/LanguageContext";
import { ContentProvider } from "@/context/ContentContext";
import { loadOverrides } from "@/lib/siteOverrides";
import WhatsAppButton from "./WhatsAppButton";

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Load custom colors from localStorage and apply to CSS variables
    try {
      const overrides = loadOverrides();
      if (overrides?.darkBgColor) {
        document.documentElement.style.setProperty('--dark', overrides.darkBgColor);
      }
      if (overrides?.accentColor) {
        document.documentElement.style.setProperty('--accent', overrides.accentColor);
      }
    } catch (err) {
      console.warn('Failed to load overrides:', err);
    }
  }, []);

  return (
    <LanguageProvider>
      <ContentProvider>
        {children}
        <WhatsAppButton />
      </ContentProvider>
    </LanguageProvider>
  );
}
