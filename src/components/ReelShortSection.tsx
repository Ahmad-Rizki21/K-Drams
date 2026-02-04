"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Play, Flame } from "lucide-react";
import { useReelShortHomepage } from "@/hooks/useReelShort";
import { BannerCarousel } from "./BannerCarousel";
import { UnifiedMediaCard } from "./UnifiedMediaCard";
import { UnifiedErrorDisplay } from "./UnifiedErrorDisplay";
import { UnifiedMediaCardSkeleton } from "./UnifiedMediaCardSkeleton";
import type { ReelShortBook, ReelShortBanner, ReelShortSearchResult } from "@/types/reelshort";

interface ReelShortSectionProps {
  // For search results
  title?: string;
  books?: ReelShortSearchResult[];
  isLoading?: boolean;
  error?: boolean;
}

export function ReelShortSection({ title, books, isLoading, error }: ReelShortSectionProps = {}) {
  const { data, isLoading: loadingHomepage, error: errorHomepage, refetch } = useReelShortHomepage();

  // Use props if provided (search mode), otherwise use homepage data
  const isSearchMode = title !== undefined;
  const displayLoading = isSearchMode ? isLoading : loadingHomepage;
  const displayError = isSearchMode ? error : errorHomepage;
  const displayBooks = isSearchMode ? (books || []) : [];

  // Group content by sections (only for homepage mode)
  const sections = useMemo(() => {
    if (isSearchMode) return { banners: [], bookGroups: [] };
    if (!data?.data?.lists) return { banners: [], bookGroups: [] };

    const tabs = data.data.tab_list || [];
    const popularTab = tabs.find((t) => t.tab_name === "POPULER") || tabs[0];

    if (!popularTab) return { banners: [], bookGroups: [] };

    const tabLists = data.data.lists.filter((list) => list.tab_id === popularTab.tab_id);

    const banners: ReelShortBanner[] = [];
    const bookGroups: { title: string; books: ReelShortBook[] }[] = [];

    tabLists.forEach((list, index) => {
      if (list.banners && list.banners.length > 0) {
        banners.push(...list.banners);
      }
      if (list.books && list.books.length > 0) {
        const sectionNames = ["Populer", "Terbaru", "Trending", "Untuk Kamu"];
        const sectionTitle = sectionNames[index] || `Section ${index + 1}`;
        bookGroups.push({ title: sectionTitle, books: list.books });
      }
    });

    return { banners, bookGroups };
  }, [data, isSearchMode]);

  if (displayError) {
    return (
      <UnifiedErrorDisplay
        title="Gagal Memuat ReelShort"
        message="Terjadi kesalahan saat mengambil data dari server."
        onRetry={() => refetch()}
      />
    );
  }

  if (displayLoading) {
    return (
      <div className="space-y-8">
        {!isSearchMode && <div className="aspect-[21/9] rounded-2xl bg-muted/50 animate-pulse" />}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <UnifiedMediaCardSkeleton key={i} index={i} />
          ))}
        </div>
      </div>
    );
  }

  // Search mode - display single section with results
  if (isSearchMode) {
    return (
      <section>
        <h2 className="font-display font-bold text-xl md:text-2xl text-foreground mb-4">
          {title}
        </h2>

        {displayBooks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Tidak ada data ditemukan</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
            {displayBooks
              .filter((book) => book.book_id && book.book_pic)
              .slice(0, 16)
              .map((book, index) => (
                <UnifiedMediaCard
                  key={book.book_id}
                  index={index}
                  title={book.book_title}
                  cover={book.book_pic}
                  link={`/detail/reelshort/${book.book_id}`}
                  episodes={book.chapter_count}
                  topLeftBadge={book.book_mark?.text ? {
                    text: book.book_mark.text,
                    color: book.book_mark.color || "#E52E2E",
                    textColor: book.book_mark.text_color
                  } : null}
                />
              ))}
          </div>
        )}
      </section>
    );
  }

  // Homepage mode - display banners and multiple sections
  const { banners, bookGroups } = sections;

  return (
    <div className="space-y-8">
      {/* Banner Carousel */}
      {banners.length > 0 && <BannerCarousel banners={banners} />}

      {/* Book Sections - Grid Layout */}
      {bookGroups.map((group, index) => (
        <section key={index}>
          <h2 className="font-display font-bold text-xl md:text-2xl text-foreground mb-4">
            {group.title}
          </h2>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
            {group.books
              .filter((book) => book.book_id && book.book_pic)
              .slice(0, 16)
              .map((book, index) => (
                <UnifiedMediaCard
                  key={book.book_id}
                  index={index}
                  title={book.book_title}
                  cover={book.book_pic}
                  link={`/detail/reelshort/${book.book_id}`}
                  episodes={book.chapter_count}
                  topLeftBadge={book.book_mark?.text ? {
                    text: book.book_mark.text,
                    color: book.book_mark.color || "#E52E2E",
                    textColor: book.book_mark.text_color
                  } : null}
                />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
