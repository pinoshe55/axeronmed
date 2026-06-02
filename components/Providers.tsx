"use client";

import { LanguageProvider } from "@/context/LanguageContext";
import { ContentProvider } from "@/context/ContentContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <ContentProvider>{children}</ContentProvider>
    </LanguageProvider>
  );
}
