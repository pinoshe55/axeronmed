"use client";

// Five-phase coordination contract:
// Phase 1  page mount        LoadingScreen.lockScroll()
// Phase 2  GLB loaded        <CameraModel> mounts (Suspense resolves)
// Phase 3  textures wired    CameraModel.markTexturesReady()
//                            → LoadingScreen sees this, fades out
// Phase 4  fade complete     LoadingScreen.markIntroStart()
//                            → CameraModel sees this, plays intro
// Phase 5  intro complete    CameraModel.unlockScroll()

let originalHtml = "";
let originalBody = "";
let scrollLocked = false;

export const lockScroll = () => {
  if (typeof document === "undefined" || scrollLocked) return;
  scrollLocked = true;
  originalHtml = document.documentElement.style.overflow;
  originalBody = document.body.style.overflow;
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
  window.scrollTo(0, 0);
};

export const unlockScroll = () => {
  if (typeof document === "undefined" || !scrollLocked) return;
  scrollLocked = false;
  document.documentElement.style.overflow = originalHtml;
  document.body.style.overflow = originalBody;
};

const TEXTURES_READY = "lumen:texturesReady";
let texturesReady = false;

export const markTexturesReady = () => {
  if (typeof window === "undefined" || texturesReady) return;
  texturesReady = true;
  window.dispatchEvent(new Event(TEXTURES_READY));
};

export const onTexturesReady = (cb: () => void): (() => void) => {
  if (typeof window === "undefined") return () => {};
  if (texturesReady) {
    queueMicrotask(cb);
    return () => {};
  }
  window.addEventListener(TEXTURES_READY, cb, { once: true });
  return () => window.removeEventListener(TEXTURES_READY, cb);
};

const INTRO_START = "lumen:introStart";
let introStarted = false;

export const markIntroStart = () => {
  if (typeof window === "undefined" || introStarted) return;
  introStarted = true;
  window.dispatchEvent(new Event(INTRO_START));
};

export const onIntroStart = (cb: () => void): (() => void) => {
  if (typeof window === "undefined") return () => {};
  if (introStarted) {
    queueMicrotask(cb);
    return () => {};
  }
  window.addEventListener(INTRO_START, cb, { once: true });
  return () => window.removeEventListener(INTRO_START, cb);
};
