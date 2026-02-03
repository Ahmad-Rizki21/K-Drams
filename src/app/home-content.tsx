"use client";

import { PlatformSelector } from "@/components/PlatformSelector";
import { DramaSection } from "@/components/DramaSection";
import { AnimeSection } from "@/components/AnimeSection";
import { KomikSection } from "@/components/KomikSection";
import { ReelShortSection } from "@/components/ReelShortSection";
import { NetShortHome } from "@/components/NetShortHome";
import { NetShortSection } from "@/components/NetShortSection";
import { MeloloHome } from "@/components/MeloloHome";
import { MeloloSection } from "@/components/MeloloSection";
import { FlickReelsHome } from "@/components/FlickReelsHome";
import { FlickReelsSection } from "@/components/FlickReelsSection";
import { FreeReelsHome } from "@/components/FreeReelsHome";
import { FreeReelsSection } from "@/components/FreeReelsSection";
import { useState } from "react";
import { ContentToolbar } from "@/components/ContentToolbar";
import { useForYouDramas, useLatestDramas, useTrendingDramas, useDubindoDramas, useSearchDramas } from "@/hooks/useDramas";
import { useLatestAnime, useRecommendedAnime, useAnimeMovies, useSearchAnime } from "@/hooks/useAnime";
import { useLatestKomik, useRecommendedKomik, usePopularKomik, useSearchKomik } from "@/hooks/useKomik";
import { useReelShortSearch } from "@/hooks/useReelShort";
import { useNetShortSearch } from "@/hooks/useNetShort";
import { useMeloloSearch } from "@/hooks/useMelolo";
import { useFlickReelsSearch } from "@/hooks/useFlickReels";
import { useFreeReelsSearch } from "@/hooks/useFreeReels";
import { usePlatform } from "@/hooks/usePlatformStore";

export default function HomeContent() {
  const { isDramaBox, isAnime, isKomik, isReelShort, isNetShort, isMelolo, isFlickReels, isFreeReels } = usePlatform();

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string | string[]>>({});
  const [sortBy, setSortBy] = useState("latest");

  // --- DRAMABOX ---
  const { data: popularDramas, isLoading: loadingPopular, error: errorPopular, refetch: refetchPopular } = useForYouDramas();
  const { data: latestDramas, isLoading: loadingLatest, error: errorLatest, refetch: refetchLatest } = useLatestDramas();
  const { data: trendingDramas, isLoading: loadingTrending, error: errorTrending, refetch: refetchTrending } = useTrendingDramas();
  const { data: dubindoDramas, isLoading: loadingDubindo, error: errorDubindo, refetch: refetchDubindo } = useDubindoDramas();
  const { data: searchDramas, isLoading: loadingSearchDramas } = useSearchDramas(isDramaBox ? searchQuery : "");

  // --- ANIME ---
  const { data: latestAnime, isLoading: loadingLatestAnime, error: errorLatestAnime, refetch: refetchLatestAnime } = useLatestAnime();
  const { data: recommendedAnime, isLoading: loadingRecommendedAnime, error: errorRecommendedAnime, refetch: refetchRecommendedAnime } = useRecommendedAnime();
  const { data: animeMovies, isLoading: loadingAnimeMovies, error: errorAnimeMovies, refetch: refetchAnimeMovies } = useAnimeMovies();
  const { data: searchAnime, isLoading: loadingSearchAnime } = useSearchAnime(isAnime ? searchQuery : "");

  // --- KOMIK ---
  const { data: latestKomik, isLoading: loadingLatestKomik, error: errorLatestKomik, refetch: refetchLatestKomik } = useLatestKomik();
  const { data: recommendedKomik, isLoading: loadingRecommendedKomik, error: errorRecommendedKomik, refetch: refetchRecommendedKomik } = useRecommendedKomik();
  const { data: popularKomik, isLoading: loadingPopularKomik, error: errorPopularKomik, refetch: refetchPopularKomik } = usePopularKomik();
  const { data: searchKomik, isLoading: loadingSearchKomik } = useSearchKomik(isKomik ? searchQuery : "");

  // --- REELSHORT ---
  const { data: searchReelShort, isLoading: loadingSearchReelShort } = useReelShortSearch(isReelShort ? searchQuery : "");

  // --- NETSHORT ---
  const { data: searchNetShort, isLoading: loadingSearchNetShort } = useNetShortSearch(isNetShort ? searchQuery : "");

  // --- MELOLO ---
  const { data: searchMelolo, isLoading: loadingSearchMelolo } = useMeloloSearch(isMelolo ? searchQuery : "");

  // --- FLICKREELS ---
  const { data: searchFlickReels, isLoading: loadingSearchFlickReels } = useFlickReelsSearch(isFlickReels ? searchQuery : "");

  // --- FREEREELS ---
  const { data: searchFreeReels, isLoading: loadingSearchFreeReels } = useFreeReelsSearch(isFreeReels ? searchQuery : "");

  // Handle Search Output
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const hasSearch = searchQuery.length > 0;

  // Sorting Logic
  const getSortedData = (data: any[]) => {
    if (!data || !Array.isArray(data)) return [];
    try {
      const sorted = [...data];
      switch (sortBy) {
        case "asc":
          // A-Z sorting by title/judul
          return sorted.sort((a, b) => (a.title || a.judul || "").localeCompare(b.title || b.judul || ""));
        case "popular":
          // Sort by score (highest first)
          return sorted.sort((a, b) => {
            const scoreA = parseFloat(a.score) || 0;
            const scoreB = parseFloat(b.score) || 0;
            return scoreB - scoreA;
          });
        case "latest":
        default:
          // Sort by id (highest/newest first) or rilis date
          return sorted.sort((a, b) => {
            const idA = parseInt(a.id) || 0;
            const idB = parseInt(b.id) || 0;
            return idB - idA;
          });
      }
    } catch (e) {
      console.error("Sorting error:", e);
      return [];
    }
  };

  const sortedSearchDramas = hasSearch ? getSortedData(searchDramas as any[]) : [];
  const sortedSearchAnime = hasSearch ? getSortedData(searchAnime as any[]) : [];
  const sortedSearchKomik = hasSearch ? getSortedData(searchKomik as any[]) : [];

  // Apply sorting to other platforms' search results
  const sortedSearchReelShort = hasSearch ? getSortedData(searchReelShort?.data || []) : [];
  const sortedSearchNetShort = hasSearch ? getSortedData(searchNetShort?.data || []) : [];
  const sortedSearchMelolo = hasSearch ? getSortedData(searchMelolo?.data?.search_data?.[0]?.books || []) : [];
  const sortedSearchFlickReels = hasSearch ? getSortedData(searchFlickReels?.data || []) : [];
  const sortedSearchFreeReels = hasSearch ? getSortedData(searchFreeReels || []) : [];

  // Apply sorting to normal anime data as well
  const sortedLatestAnime = getSortedData(latestAnime as any[]);
  const sortedRecommendedAnime = getSortedData(recommendedAnime as any[]);
  const sortedAnimeMovies = getSortedData(animeMovies as any[]);

  // Apply sorting to normal komik data as well
  const sortedLatestKomik = getSortedData(latestKomik as any[]);
  const sortedRecommendedKomik = getSortedData(recommendedKomik as any[]);
  const sortedPopularKomik = getSortedData(popularKomik as any[]);

  // Apply sorting to normal drama data as well
  const sortedPopularDramas = getSortedData(popularDramas as any[]);
  const sortedLatestDramas = getSortedData(latestDramas as any[]);
  const sortedTrendingDramas = getSortedData(trendingDramas as any[]);
  const sortedDubindoDramas = getSortedData(dubindoDramas as any[]);

  return (
    <main className="min-h-screen pt-16">
      {/* Platform Selector */}
      <div className="glass-strong sticky top-16 z-40 flex flex-col">
        <div className="container mx-auto">
          <PlatformSelector />
        </div>
        
        {/* Universal Content Toolbar */}
        <div className="container mx-auto px-4 py-2 border-t border-white/5">
          <ContentToolbar
            searchPlaceholder={isAnime ? "Cari Anime..." : isKomik ? "Cari Komik..." : isDramaBox ? "Cari Drama..." : "Cari Judul..."}
            onSearch={handleSearch}
            sortOptions={[
              { label: "Terbaru", value: "latest" },
              { label: "Terpopuler", value: "popular" },
              { label: "A-Z", value: "asc" },
            ]}
            onSortChange={setSortBy}
            defaultSort="latest"
          />
        </div>
      </div>

      {/* DramaBox Content */}
      {isDramaBox && (
        <div className="container mx-auto px-4 py-6 space-y-8">
          {hasSearch ? (
            <DramaSection
              title={`Hasil Pencarian: "${searchQuery}"`}
              dramas={sortedSearchDramas}
              isLoading={loadingSearchDramas}
              error={false}
            />
          ) : (
            <>
              <DramaSection
                title="Populer"
                dramas={sortedPopularDramas}
                isLoading={loadingPopular}
                error={!!errorPopular}
                onRetry={() => refetchPopular()}
              />
              <DramaSection
                title="Terbaru"
                dramas={sortedLatestDramas}
                isLoading={loadingLatest}
                error={!!errorLatest}
                onRetry={() => refetchLatest()}
              />
              <DramaSection
                title="Terpopuler"
                dramas={sortedTrendingDramas}
                isLoading={loadingTrending}
                error={!!errorTrending}
                onRetry={() => refetchTrending()}
              />
              <DramaSection
                title="Dubindo"
                dramas={sortedDubindoDramas}
                isLoading={loadingDubindo}
                error={!!errorDubindo}
                onRetry={() => refetchDubindo()}
              />
            </>
          )}
        </div>
      )}

      {/* Anime Content */}
      {isAnime && (
        <div className="container mx-auto px-4 py-6 space-y-8">
          {hasSearch ? (
            <AnimeSection
              title={`Hasil Pencarian: "${searchQuery}"`}
              animes={sortedSearchAnime}
              isLoading={loadingSearchAnime}
              error={false}
            />
          ) : (
            <>
              <AnimeSection
                title="Anime Terbaru"
                animes={sortedLatestAnime}
                isLoading={loadingLatestAnime}
                error={!!errorLatestAnime}
                onRetry={() => refetchLatestAnime()}
              />
              <AnimeSection
                title="Anime Rekomendasi"
                animes={sortedRecommendedAnime}
                isLoading={loadingRecommendedAnime}
                error={!!errorRecommendedAnime}
                onRetry={() => refetchRecommendedAnime()}
              />
              <AnimeSection
                title="Movie Anime"
                animes={sortedAnimeMovies}
                isLoading={loadingAnimeMovies}
                error={!!errorAnimeMovies}
                onRetry={() => refetchAnimeMovies()}
              />
            </>
          )}
        </div>
      )}

      {/* Komik Content */}
      {isKomik && (
        <div className="container mx-auto px-4 py-6 space-y-8">
          {hasSearch ? (
            <KomikSection
              title={`Hasil Pencarian: "${searchQuery}"`}
              komiks={sortedSearchKomik}
              isLoading={loadingSearchKomik}
              error={false}
            />
          ) : (
            <>
              <KomikSection
                title="Komik Terbaru"
                komiks={sortedLatestKomik}
                isLoading={loadingLatestKomik}
                error={!!errorLatestKomik}
                onRetry={() => refetchLatestKomik()}
              />
              <KomikSection
                title="Komik Rekomendasi"
                komiks={sortedRecommendedKomik}
                isLoading={loadingRecommendedKomik}
                error={!!errorRecommendedKomik}
                onRetry={() => refetchRecommendedKomik()}
              />
              <KomikSection
                title="Komik Populer"
                komiks={sortedPopularKomik}
                isLoading={loadingPopularKomik}
                error={!!errorPopularKomik}
                onRetry={() => refetchPopularKomik()}
              />
            </>
          )}
        </div>
      )}

      {/* Other Platforms - Need to adapt their sections to support search results injection or create generic result view */}
      {isReelShort && (
        <div className="container mx-auto px-4 py-6 space-y-8">
          {hasSearch ? (
            <ReelShortSection
              title={`Hasil Pencarian: "${searchQuery}"`}
              books={sortedSearchReelShort}
              isLoading={loadingSearchReelShort}
              error={false}
            />
          ) : (
            <ReelShortSection />
          )}
        </div>
      )}

      {isNetShort && (
        <div className="container mx-auto px-4 py-6 space-y-8">
          {hasSearch ? (
            <NetShortSection
              title={`Hasil Pencarian: "${searchQuery}"`}
              dramas={sortedSearchNetShort}
              isLoading={loadingSearchNetShort}
              error={false}
            />
          ) : (
            <NetShortHome />
          )}
        </div>
      )}

      {isMelolo && (
        <div className="container mx-auto px-4 py-6 space-y-8">
          {hasSearch ? (
            <MeloloSection
              title={`Hasil Pencarian: "${searchQuery}"`}
              books={sortedSearchMelolo}
              isLoading={loadingSearchMelolo}
              error={false}
            />
          ) : (
            <MeloloHome />
          )}
        </div>
      )}

      {isFlickReels && (
        <div className="container mx-auto px-4 py-6 space-y-8">
          {hasSearch ? (
            <FlickReelsSection
              title={`Hasil Pencarian: "${searchQuery}"`}
              playlets={sortedSearchFlickReels}
              isLoading={loadingSearchFlickReels}
              error={false}
            />
          ) : (
            <FlickReelsHome />
          )}
        </div>
      )}

      {isFreeReels && (
        <div className="container mx-auto px-4 py-6 space-y-8">
          {hasSearch ? (
            <FreeReelsSection
              title={`Hasil Pencarian: "${searchQuery}"`}
              items={sortedSearchFreeReels}
              isLoading={loadingSearchFreeReels}
              error={false}
            />
          ) : (
            <FreeReelsHome />
          )}
        </div>
      )}
    </main>
  );
}

