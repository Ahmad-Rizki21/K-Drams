"use client";

import { UnifiedMediaCard } from "./UnifiedMediaCard";
import { UnifiedMediaCardSkeleton } from "./UnifiedMediaCardSkeleton";
import { UnifiedErrorDisplay } from "./UnifiedErrorDisplay";
import type { Komik } from "@/types/komik";

interface KomikSectionProps {
  title: string;
  komiks?: Komik[];
  isLoading?: boolean;
  error?: boolean;
  onRetry?: () => void;
}

export function KomikSection({ title, komiks, isLoading, error, onRetry }: KomikSectionProps) {
  if (error) {
    return (
      <section>
        <h2 className="font-display font-bold text-xl md:text-2xl text-foreground mb-4">
          {title}
        </h2>
        <UnifiedErrorDisplay
          title={`Gagal Memuat ${title}`}
          message="Tidak dapat mengambil data komik."
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
  if (!komiks || komiks.length === 0) {
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
        {komiks?.slice(0, 16).map((komik, index) => (
          <UnifiedMediaCard
            key={komik.id || `komik-${index}`}
            index={index}
            title={komik.judul || "Untitled"}
            cover={komik.cover || ""}
            link={`/detail/komik/${komik.url || komik.id}`}
            episodes={0}
            topLeftBadge={komik.lastup ? {
              text: komik.lastup,
              color: komik.lastup === "Baru di Upload" ? "#10b981" : "#6b7280"
            } : null}
            topRightBadge={komik.lastch ? {
              text: komik.lastch,
              isTransparent: true
            } : null}
          />
        ))}
      </div>
    </section>
  );
}
