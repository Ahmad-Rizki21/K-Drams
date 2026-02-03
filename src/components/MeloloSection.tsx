"use client";

import { UnifiedMediaCard } from "./UnifiedMediaCard";
import { UnifiedMediaCardSkeleton } from "./UnifiedMediaCardSkeleton";
import type { MeloloBook } from "@/hooks/useMelolo";

interface MeloloSectionProps {
  title: string;
  books?: MeloloBook[];
  isLoading?: boolean;
  error?: boolean;
}

export function MeloloSection({ title, books, isLoading, error }: MeloloSectionProps) {
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

  if (!books || books.length === 0) {
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
        {books.slice(0, 16).map((book, index) => (
          <UnifiedMediaCard
            key={book.book_id}
            index={index}
            title={book.book_name}
            cover={book.thumb_url}
            link={`/detail/melolo/${book.book_id}`}
            episodes={book.serial_count || 0}
          />
        ))}
      </div>
    </section>
  );
}
