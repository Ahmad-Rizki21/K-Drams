import { PLATFORMS } from "@/hooks/platform-types";
import PlatformClientWrapper from "./page-client";

export default async function PlatformPage({ params }: { params: Promise<{ platform: string }> }) {
  const { platform } = await params;
  const urlPlatform = platform as any;

  // Check if the URL platform is valid
  const validPlatform = PLATFORMS.find((p) => p.id === urlPlatform);

  return <PlatformClientWrapper urlPlatform={urlPlatform} />;
}
