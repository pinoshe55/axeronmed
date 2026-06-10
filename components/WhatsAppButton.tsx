"use client";

import { useContent } from "@/context/ContentContext";

export default function WhatsAppButton() {
  const { overrides } = useContent();

  if (!overrides?.whatsappNumber) return null;

  const whatsappLink = `https://wa.me/${overrides.whatsappNumber.replace(/[^\d+]/g, '')}`;

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
      title="WhatsApp ile iletişime geç"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    </a>
  );
}
