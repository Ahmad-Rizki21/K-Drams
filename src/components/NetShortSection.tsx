"use client";

import { UnifiedMediaCard } from "./UnifiedMediaCard";
import { UnifiedMediaCardSkeleton } from "./UnifiedMediaCardSkeleton";
import type { NetShortDrama } from "@/hooks/useNetShort";

interface NetShortSectionProps {
  title: string;
  dramas?: NetShortDrama[];
  isLoading?: boolean;
  error?: boolean;
}

export function NetShortSection({ title, dramas, isLoading, error }: NetShortSectionProps) {
  if (error) {
    return (
      <section>
        <h2 className="font-display font-bold text-xl md:text-2xl text-foreground mb-4">
          {title}
        </h2>
        <div className="text-center py-12 text-destructive">
          <p>Gagal memuat data</p>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section>
        <h2 className="font-display font-bold text-xl md:text-2xl text-foreground mb-4">
          {title}
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <UnifiedMediaCardSkeleton key={i} index={i} />
          ))}
        </div>
      </section>
    );
  }

  if (!dramas || dramas.length === 0) {
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
        {dramas.slice(0, 16).map((drama, index) => (
          <UnifiedMediaCard
            key={drama.shortPlayId}
            index={index}
            title={drama.title}
            cover={drama.cover}
            link={`/detail/netshort/${drama.shortPlayId}`}
            episodes={drama.totalEpisodes || 0}
            topLeftBadge={drama.scriptName ? {
              text: drama.scriptName,
              color: "#E52E2E"
            } : null}
            topRightBadge={drama.heatScore ? {
              text: drama.heatScore,
              isTransparent: true
            } : null}
          />
        ))}
      </div>
    </section>
  );
}
