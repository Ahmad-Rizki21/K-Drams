"use client";

import { create } from "zustand";
import type { Platform, PlatformInfo } from "./platform-types";
import { PLATFORMS } from "./platform-types";

interface PlatformState {
  currentPlatform: Platform;
  setPlatform: (platform: Platform) => void;
}

export const usePlatformStore = create<PlatformState>((set) => ({
  currentPlatform: "dramabox",
  setPlatform: (platform) => set({ currentPlatform: platform }),
}));

export function usePlatform() {
  const { currentPlatform, setPlatform } = usePlatformStore();
  const platformInfo = (PLATFORMS as PlatformInfo[]).find((p) => p.id === currentPlatform)!;

  const getPlatformInfo = (platformId: Platform) => {
    return (PLATFORMS as PlatformInfo[]).find((p) => p.id === platformId) || (PLATFORMS as PlatformInfo[])[0];
  };

  return {
    currentPlatform,
    platformInfo,
    setPlatform,
    platforms: PLATFORMS,
    getPlatformInfo,
    isDramaBox: currentPlatform === "dramabox",
    isReelShort: currentPlatform === "reelshort",
    isNetShort: currentPlatform === "netshort",
    isMelolo: currentPlatform === "melolo",
    isFlickReels: currentPlatform === "flickreels",
    isFreeReels: currentPlatform === "freereels",
    isAnime: currentPlatform === "anime",
    isKomik: currentPlatform === "komik",
  };
}
