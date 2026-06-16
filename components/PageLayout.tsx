"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 px-[6vw] md:px-[8vw] pb-20">
        {children}
      </main>
      <Footer />
    </div>
  );
}
