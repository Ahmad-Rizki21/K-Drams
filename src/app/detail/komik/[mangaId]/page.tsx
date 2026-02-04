"use client";

import { UnifiedErrorDisplay } from "@/components/UnifiedErrorDisplay";
import { useKomikDetail } from "@/hooks/useKomikDetail";
import { Book, Calendar, ChevronLeft, Star, Eye, Bookmark } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import type { KomikDetail } from "@/types/komik";

export default function KomikDetailPage() {
  const params = useParams<{ mangaId: string }>();
  const mangaId = params.mangaId;
  const router = useRouter();
  const { data, isLoading, error } = useKomikDetail(mangaId || "");

  // Handle data structure from API
  let komik = data;

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (error || !komik) {
    return (
      <div className="min-h-screen pt-24 px-4">
        <UnifiedErrorDisplay
          title="Komik tidak ditemukan"
          message="Tidak dapat memuat detail komik. Silakan coba lagi atau kembali ke beranda."
          onRetry={() => router.push("/")}
          retryLabel="Kembali ke Beranda"
        />
      </div>
    );
  }

  const statusText = komik.status === 1 ? "Ongoing" : komik.status === 2 ? "Completed" : "Hiatus";
  const authors = komik.taxonomy?.Author?.map((a) => a.name).join(", ") || "-";
  const artists = komik.taxonomy?.Artist?.map((a) => a.name).join(", ") || "-";
  const genres = komik.taxonomy?.Genre?.map((g) => g.name) || [];
  const format = komik.taxonomy?.Format?.map((f) => f.name).join(", ") || "";

  return (
    <main className="min-h-screen pt-20">
      <div className="relative">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={komik.cover_portrait_url || komik.cover_image_url}
            alt=""
            className="w-full h-full object-cover opacity-20 blur-3xl scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-8">
          <Link
            href="/komik"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Kembali</span>
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
            <div className="relative group">
              <img
                src={komik.cover_portrait_url || komik.cover_image_url}
                alt={komik.title}
                className="w-full max-w-[300px] mx-auto rounded-2xl shadow-2xl"
              />
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">
                  {komik.title}
                </h1>
                {komik.alternative_title && komik.alternative_title !== komik.title && (
                  <p className="text-muted-foreground italic mb-4">{komik.alternative_title}</p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {komik.user_rate && komik.user_rate > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      <span>{komik.user_rate}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Book className="w-4 h-4" />
                    <span>{komik.chapters?.length || 0} Chapter</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    <span>{(komik.view_count / 1000000).toFixed(1)}M views</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Bookmark className="w-4 h-4" />
                    <span>{(komik.bookmark_count / 1000).toFixed(1)}K</span>
                  </div>
                  <span className="px-2 py-1 bg-primary/20 rounded-full text-xs">
                    {format}
                  </span>
                  <span className="px-2 py-1 bg-secondary rounded-full text-xs">
                    {statusText}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>{komik.release_year}</span>
                  </div>
                </div>
              </div>

              {genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre) => (
                    <span key={genre} className="tag-pill">
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {authors && authors !== "-" && (
                <div className="text-sm text-muted-foreground">
                  Author: <span className="text-foreground font-medium">{authors}</span>
                </div>
              )}

              {artists && artists !== "-" && artists !== authors && (
                <div className="text-sm text-muted-foreground">
                  Artist: <span className="text-foreground font-medium">{artists}</span>
                </div>
              )}

              {komik.description && (
                <div className="glass rounded-xl p-4">
                  <h3 className="font-semibold text-foreground mb-2">Sinopsis</h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {komik.description}
                  </p>
                </div>
              )}

              {komik.chapters && komik.chapters.length > 0 && (
                <div className="glass rounded-xl p-4">
                  <h3 className="font-semibold text-foreground mb-4">Chapter List</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-96 overflow-y-auto">
                    {[...komik.chapters].reverse().map((chapter) => (
                      <Link
                        key={chapter.chapter_id}
                        href={`/read/komik/${komik.manga_id}?chapter=${chapter.chapter_id}`}
                        className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-center"
                      >
                        <div className="text-sm font-medium">Ch {chapter.chapter_number}</div>
                        <div className="text-xs text-muted-foreground truncate mt-1">
                          {new Date(chapter.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {komik.chapters && komik.chapters.length > 0 && (
                <Link
                  href={`/read/komik/${komik.manga_id}?chapter=${komik.chapters[0].chapter_id}`}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-primary-foreground bg-primary transition-all hover:scale-105 shadow-lg"
                >
                  <Book className="w-5 h-5 fill-current" />
                  Mulai Baca
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function DetailSkeleton() {
  return (
    <main className="min-h-screen pt-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
          <Skeleton className="aspect-[2/3] w-full max-w-[300px] rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-full" />
            </div>
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-12 w-48 rounded-full" />
          </div>
        </div>
      </div>
    </main>
  );
}
