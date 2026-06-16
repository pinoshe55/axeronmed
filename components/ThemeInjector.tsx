"use client";

import { useEffect } from "react";
import { useContent } from "@/context/ContentContext";
import type { ThemeConfig } from "@/lib/siteOverrides";

const FONT_URLS: Record<string, string> = {
  inter: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap",
  "playfair": "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800;900&display=swap",
  "space-grotesk": "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap",
  "dm-sans": "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap",
  "roboto-slab": "https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@400;500;600;700;800&display=swap",
};

const FONT_STACK: Record<string, string> = {
  system: "system-ui, -apple-system, 'Segoe UI', sans-serif",
  inter: "'Inter', system-ui, sans-serif",
  playfair: "'Playfair Display', Georgia, serif",
  "space-grotesk": "'Space Grotesk', system-ui, sans-serif",
  "dm-sans": "'DM Sans', system-ui, sans-serif",
  "roboto-slab": "'Roboto Slab', Georgia, serif",
};

const BUTTON_RADIUS: Record<string, string> = {
  none: "0px",
  sm: "6px",
  lg: "14px",
  full: "999px",
};

const CARD_RADIUS: Record<string, string> = {
  none: "0px",
  sm: "6px",
  md: "12px",
  lg: "16px",
  xl: "24px",
};

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

export function applyTheme(theme: ThemeConfig) {
  const root = document.documentElement;

  if (theme.colorBg)   root.style.setProperty("--bg", theme.colorBg);
  if (theme.colorInk)  root.style.setProperty("--ink", theme.colorInk);
  if (theme.colorAccent) {
    root.style.setProperty("--accent", theme.colorAccent);
    root.style.setProperty("--accent-soft", `rgba(${hexToRgb(theme.colorAccent)}, 0.08)`);
  }
  if (theme.colorDark) root.style.setProperty("--dark", theme.colorDark);
  if (theme.colorSurface) root.style.setProperty("--surface", theme.colorSurface);

  // Font
  const font = theme.fontFamily || "system";
  root.style.setProperty("--font-family", FONT_STACK[font] || FONT_STACK.system);
  document.body.style.fontFamily = FONT_STACK[font] || FONT_STACK.system;

  // Heading weight
  if (theme.headingWeight) {
    root.style.setProperty("--heading-weight", theme.headingWeight);
    // Override .headline class weight
    const hw = theme.headingWeight;
    let style = document.getElementById("axeron-heading-weight") as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement("style");
      style.id = "axeron-heading-weight";
      document.head.appendChild(style);
    }
    style.textContent = `.headline,.headline-md,.final-title{font-weight:${hw}!important;}`;
  }

  // Button radius
  if (theme.buttonRadius) {
    root.style.setProperty("--btn-radius", BUTTON_RADIUS[theme.buttonRadius] || "999px");
    let style = document.getElementById("axeron-btn-radius") as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement("style");
      style.id = "axeron-btn-radius";
      document.head.appendChild(style);
    }
    style.textContent = `.cta{border-radius:${BUTTON_RADIUS[theme.buttonRadius]}!important;}`;
  }

  // Card radius
  if (theme.cardRadius) {
    root.style.setProperty("--card-radius", CARD_RADIUS[theme.cardRadius] || "16px");
    let style = document.getElementById("axeron-card-radius") as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement("style");
      style.id = "axeron-card-radius";
      document.head.appendChild(style);
    }
    style.textContent = `.info-card{border-radius:${CARD_RADIUS[theme.cardRadius]}!important;}`;
  }

  // Glass blur
  if (theme.glassBlur === false) {
    let style = document.getElementById("axeron-no-blur") as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement("style");
      style.id = "axeron-no-blur";
      document.head.appendChild(style);
    }
    style.textContent = `.info-card{backdrop-filter:none!important;-webkit-backdrop-filter:none!important;}`;
  } else {
    const el = document.getElementById("axeron-no-blur");
    if (el) el.remove();
  }

  // Animations
  if (theme.animationsEnabled === false) {
    let style = document.getElementById("axeron-no-anim") as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement("style");
      style.id = "axeron-no-anim";
      document.head.appendChild(style);
    }
    style.textContent = `*{transition:none!important;animation:none!important;}`;
  } else {
    const el = document.getElementById("axeron-no-anim");
    if (el) el.remove();
  }
}

function injectFont(family: FontFamily | undefined) {
  if (!family || family === "system") return;
  const url = FONT_URLS[family];
  if (!url) return;
  const id = `axeron-font-${family}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);
}

import type { FontFamily } from "@/lib/siteOverrides";

export default function ThemeInjector() {
  const { overrides } = useContent();

  useEffect(() => {
    const theme = overrides?.theme || {};
    injectFont(theme.fontFamily);
    applyTheme(theme);
  }, [overrides?.theme]);

  return null;
}
