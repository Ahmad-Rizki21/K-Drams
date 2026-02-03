"use client";

import { UnifiedErrorDisplay } from "@/components/UnifiedErrorDisplay";
import { useAnimeDetail } from "@/hooks/useAnimeDetail";
import { Play, Calendar, ChevronLeft, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import type { AnimeDetail } from "@/types/anime";

export default function AnimeDetailPage() {
  const params = useParams<{ animeId: string }>();
  const animeId = params.animeId;
  const router = useRouter();
  const { data, isLoading, error } = useAnimeDetail(animeId || "");

  // Handle data array structure from API
  let anime = data;
  
  if (data && typeof data === 'object') {
    if ('data' in data && Array.isArray((data as any).data)) {
       anime = (data as any).data[0];
    } else if (Array.isArray(data)) {
       anime = data.length > 0 ? data[0] : null;
    }
  }



  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (error || !anime) {
    return (
      <div className="min-h-screen pt-24 px-4">
        <UnifiedErrorDisplay
          title="Anime tidak ditemukan"
          message="Tidak dapat memuat detail anime. Silakan coba lagi atau kembali ke beranda."
          onRetry={() => router.push("/")}
          retryLabel="Kembali ke Beranda"
        />
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-20">
      <div className="relative">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={anime.cover}
            alt=""
            className="w-full h-full object-cover opacity-20 blur-3xl scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Kembali</span>
          </button>

          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
            <div className="relative group">
              <img
                src={anime.cover}
                alt={anime.judul}
                className="w-full max-w-[300px] mx-auto rounded-2xl shadow-2xl"
              />
              {anime.chapter && anime.chapter.length > 0 && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                  <Link
                    href={`/watch/anime/${anime.series_id}?episode=${anime.chapter[0].url}`}
                    className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold flex items-center gap-2 hover:scale-105 transition-transform shadow-lg"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    Tonton Sekarang
                  </Link>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">
                  {anime.judul}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {anime.rating && anime.rating !== "0" && (
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      <span>{anime.rating}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Play className="w-4 h-4" />
                    <span>{anime.chapter?.length || 0} Episode</span>
                  </div>
                  {anime.type && (
                    <span className="px-2 py-1 bg-primary/20 rounded-full text-xs">
                      {anime.type}
                    </span>
                  )}
                  {anime.status && (
                    <span className="px-2 py-1 bg-secondary rounded-full text-xs">
                      {anime.status}
                    </span>
                  )}
                  {anime.published && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>{anime.published}</span>
                    </div>
                  )}
                </div>
              </div>

              {anime.genre && anime.genre.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {anime.genre.map((genre: string) => (
                    <span key={genre} className="tag-pill">
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {anime.author && (
                <div className="text-sm text-muted-foreground">
                  Studio: <span className="text-foreground font-medium">{anime.author}</span>
                </div>
              )}

              {anime.sinopsis && (
                <div className="glass rounded-xl p-4">
                  <h3 className="font-semibold text-foreground mb-2">Sinopsis</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {anime.sinopsis || "Tidak ada sinopsis tersedia."}
                  </p>
                </div>
              )}

              {anime.chapter && anime.chapter.length > 0 && (
                <div className="glass rounded-xl p-4">
                  <h3 className="font-semibold text-foreground mb-4">Episode List</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {[...anime.chapter].reverse().map((chapter) => (
                      <Link
                        key={chapter.id}
                        href={`/watch/anime/${anime.series_id}?episode=${chapter.url}`}
                        className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-center"
                      >
                        <div className="text-sm font-medium">Ep {chapter.ch}</div>
                        <div className="text-xs text-muted-foreground truncate mt-1">{chapter.date}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {anime.chapter && anime.chapter.length > 0 && (
                <Link
                  href={`/watch/anime/${anime.series_id}?episode=${anime.chapter[0].url}`}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-primary-foreground transition-all hover:scale-105 shadow-lg"
                  className="bg-primary"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Mulai Menonton
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
