"use client";

import { UnifiedMediaCard } from "./UnifiedMediaCard";
import { UnifiedMediaCardSkeleton } from "./UnifiedMediaCardSkeleton";
import { UnifiedErrorDisplay } from "./UnifiedErrorDisplay";
import type { Anime } from "@/types/anime";

interface AnimeSectionProps {
  title: string;
  animes?: Anime[];
  isLoading?: boolean;
  error?: boolean;
  onRetry?: () => void;
}

export function AnimeSection({ title, animes, isLoading, error, onRetry }: AnimeSectionProps) {
  if (error) {
    return (
      <section>
        <h2 className="font-display font-bold text-xl md:text-2xl text-foreground mb-4">
          {title}
        </h2>
        <UnifiedErrorDisplay
          title={`Gagal Memuat ${title}`}
          message="Tidak dapat mengambil data anime."
          onRetry={onRetry}
        />
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="space-y-4">
        <div className="h-7 md:h-8 w-48 bg-white/10 rounded-lg animate-pulse mb-4" />
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <UnifiedMediaCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  // Handle empty data with message
  if (!animes || animes.length === 0) {
    return (
      <section>
        <h2 className="font-display font-bold text-xl md:text-2xl text-foreground mb-4">
          {title}
        </h2>
        <div className="text-center py-12 text-muted-foreground">
          <p>Tidak ada data ditemukan</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="font-display font-bold text-xl md:text-2xl text-foreground mb-4">
        {title}
      </h2>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
        {animes?.slice(0, 16).map((anime, index) => (
          <UnifiedMediaCard
            key={anime.id || `anime-${index}`}
            index={index}
            title={anime.judul || "Untitled"}
            cover={anime.cover || ""}
            link={`/detail/anime/${anime.url || anime.id}`}
            episodes={0}
            topLeftBadge={anime.lastup ? {
              text: anime.lastup,
              color: anime.lastup === "Baru di Upload" ? "#10b981" : "#6b7280"
            } : null}
            topRightBadge={anime.lastch ? {
              text: anime.lastch,
              isTransparent: true
            } : null}
          />
        ))}
      </div>
    </section>
  );
}
