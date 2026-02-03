"use client";

import { UnifiedMediaCard } from "./UnifiedMediaCard";
import { UnifiedMediaCardSkeleton } from "./UnifiedMediaCardSkeleton";
import type { FreeReelsItem } from "@/hooks/useFreeReels";

interface FreeReelsSectionProps {
  title: string;
  items?: FreeReelsItem[];
  isLoading?: boolean;
  error?: boolean;
}

export function FreeReelsSection({ title, items, isLoading, error }: FreeReelsSectionProps) {
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

  if (!items || items.length === 0) {
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
        {items.slice(0, 16).map((item, index) => (
          <UnifiedMediaCard
            key={item.key}
            index={index}
            title={item.title}
            cover={item.cover}
            link={`/detail/freereels/${item.key}`}
            episodes={item.episode_count || 0}
          />
        ))}
      </div>
    </section>
  );
}
