import { useQuery } from "@tanstack/react-query";
import type { Anime, AnimeSearchResult } from "@/types/anime";
import { fetchJson } from "@/lib/fetcher";

const API_BASE = "/api/anime";

export function useLatestAnime() {
  return useQuery({
    queryKey: ["anime", "latest"],
    queryFn: () => fetchJson<Anime[]>(`${API_BASE}/latest`),
    staleTime: 1000 * 60 * 5,
  });
}

export function useRecommendedAnime() {
  return useQuery({
    queryKey: ["anime", "recommended"],
    queryFn: () => fetchJson<Anime[]>(`${API_BASE}/recommended`),
    staleTime: 1000 * 60 * 5,
  });
}

export function useSearchAnime(query: string) {
  const normalizedQuery = query.trim();

  return useQuery({
    queryKey: ["anime", "search", normalizedQuery],
    queryFn: async () => {
      if (!normalizedQuery) return [];
      return fetchJson<Anime[]>(`${API_BASE}/search?q=${encodeURIComponent(normalizedQuery)}`);
    },
    enabled: normalizedQuery.length > 0,
    staleTime: 1000 * 60 * 2,
  });
}

export function useAnimeMovies() {
  return useQuery({
    queryKey: ["anime", "movie"],
    queryFn: () => fetchJson<Anime[]>(`${API_BASE}/movie`),
    staleTime: 1000 * 60 * 5,
  });
}
