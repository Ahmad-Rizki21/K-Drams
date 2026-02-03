import { useQuery } from "@tanstack/react-query";
import type { KomikDetail, KomikImageResponse } from "@/types/komik";
import { decryptData } from "@/lib/crypto";

const API_BASE = "/api/komik";

async function fetchKomikDetail(mangaId: string): Promise<KomikDetail> {
  const response = await fetch(`${API_BASE}/detail/${mangaId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch komik detail");
  }
  const json = await response.json();
  if (json.data && typeof json.data === "string") {
    return decryptData(json.data);
  }
  return json;
}

async function fetchKomikImages(chapterId: string): Promise<KomikImageResponse> {
  const response = await fetch(`${API_BASE}/getimage/${chapterId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch komik images");
  }
  const json = await response.json();
  if (json.data && typeof json.data === "string") {
    return decryptData(json.data);
  }
  return json;
}

export function useKomikDetail(mangaId: string) {
  return useQuery({
    queryKey: ["komik", "detail", mangaId],
    queryFn: () => fetchKomikDetail(mangaId),
    enabled: !!mangaId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useKomikImages(chapterId: string) {
  return useQuery({
    queryKey: ["komik", "images", chapterId],
    queryFn: () => fetchKomikImages(chapterId),
    enabled: !!chapterId,
    staleTime: 1000 * 60 * 10,
  });
}
