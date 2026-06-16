"use client";

import { LanguageProvider } from "@/context/LanguageContext";
import { ContentProvider } from "@/context/ContentContext";
import WhatsAppButton from "./WhatsAppButton";
import ThemeInjector from "./ThemeInjector";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <ContentProvider>
        <ThemeInjector />
        {children}
        <WhatsAppButton />
      </ContentProvider>
    </LanguageProvider>
  );
}
