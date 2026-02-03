import { useQuery } from "@tanstack/react-query";
import type { Komik } from "@/types/komik";
import { fetchJson } from "@/lib/fetcher";

const API_BASE = "/api/komik";

export function useLatestKomik() {
  return useQuery({
    queryKey: ["komik", "latest"],
    queryFn: () => fetchJson<Komik[]>(`${API_BASE}/latest`),
    staleTime: 1000 * 60 * 5,
  });
}

export function useRecommendedKomik() {
  return useQuery({
    queryKey: ["komik", "recommended"],
    queryFn: () => fetchJson<Komik[]>(`${API_BASE}/recommended`),
    staleTime: 1000 * 60 * 5,
  });
}

export function usePopularKomik() {
  return useQuery({
    queryKey: ["komik", "popular"],
    queryFn: () => fetchJson<Komik[]>(`${API_BASE}/popular`),
    staleTime: 1000 * 60 * 5,
  });
}

export function useSearchKomik(query: string) {
  const normalizedQuery = query.trim();

  return useQuery({
    queryKey: ["komik", "search", normalizedQuery],
    queryFn: async () => {
      if (!normalizedQuery) return [];
      return fetchJson<Komik[]>(`${API_BASE}/search?q=${encodeURIComponent(normalizedQuery)}`);
    },
    enabled: normalizedQuery.length > 0,
    staleTime: 1000 * 60 * 2,
  });
}
