"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { usePlatformStore } from "@/hooks/usePlatformStore";
import { PLATFORMS } from "@/hooks/platform-types";
import HomeContent from "@/app/home-content";

function PlatformClientWrapper({ urlPlatform }: { urlPlatform: string }) {
  const router = useRouter();
  const { currentPlatform, setPlatform } = usePlatformStore();

  useEffect(() => {
    const validPlatform = PLATFORMS.find((p) => p.id === urlPlatform);

    if (!validPlatform) {
      // Invalid platform, redirect to default
      router.replace("/dramabox");
      return;
    }

    // Update platform store to match URL
    if (currentPlatform !== urlPlatform) {
      setPlatform(urlPlatform as any);
    }
  }, [urlPlatform, currentPlatform, setPlatform, router]);

  return <HomeContent />;
}

export { PlatformClientWrapper as default };
