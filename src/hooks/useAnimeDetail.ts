import { useQuery } from "@tanstack/react-query";
import type { AnimeDetail, AnimeVideoResponse } from "@/types/anime";
import { decryptData } from "@/lib/crypto";

const API_BASE = "/api/anime";

async function fetchAnimeDetail(animeId: string): Promise<AnimeDetail> {
  const response = await fetch(`${API_BASE}/detail/${animeId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch anime detail");
  }
  const json = await response.json();
  if (json.data && typeof json.data === "string") {
    return decryptData(json.data);
  }
  return json;
}

async function fetchAnimeVideo(episodeId: string): Promise<AnimeVideoResponse> {
  const response = await fetch(`${API_BASE}/getvideo/${episodeId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch anime video");
  }
  const json = await response.json();
  if (json.data && typeof json.data === "string") {
    return decryptData(json.data);
  }
  return json;
}

export function useAnimeDetail(animeId: string) {
  return useQuery({
    queryKey: ["anime", "detail", animeId],
    queryFn: () => fetchAnimeDetail(animeId),
    enabled: !!animeId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAnimeVideo(episodeId: string) {
  return useQuery({
    queryKey: ["anime", "video", episodeId],
    queryFn: () => fetchAnimeVideo(episodeId),
    enabled: !!episodeId,
    staleTime: 1000 * 60 * 10,
  });
}
