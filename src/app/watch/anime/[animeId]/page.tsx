"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useAnimeDetail, useAnimeVideo } from "@/hooks/useAnimeDetail";
import { ChevronLeft, ChevronRight, Loader2, Settings, List, AlertCircle } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AnimeDetail, AnimeVideoResponse } from "@/types/anime";

export default function AnimeWatchPage() {
  const params = useParams<{ animeId: string }>();
  const animeId = params.animeId;
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [currentChapterUrl, setCurrentChapterUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState("720p");
  const [showChapterList, setShowChapterList] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const { data: detailData, isLoading: detailLoading } = useAnimeDetail(animeId || "");
  const { data: videoData, isLoading: videoLoading } = useAnimeVideo(currentChapterUrl || "");

  // Handle data array structure from API
  let anime = detailData;
  if (detailData && typeof detailData === 'object') {
     if ('data' in detailData && Array.isArray((detailData as any).data)) {
         anime = (detailData as any).data[0];
     } else if (Array.isArray(detailData)) {
         anime = detailData.length > 0 ? detailData[0] : null;
     }
  }
  // Reverse chapters so episode 1 is at index 0 (API returns in descending order)
  const chapters = [...(anime?.chapter || [])].reverse();

  // Initialize from URL params
  useEffect(() => {
    const chapterParam = searchParams.get("episode");
    if (chapterParam) {
      setCurrentChapterUrl(chapterParam);
      // Find the index of this chapter
      const index = chapters.findIndex((ch) => ch.url === chapterParam);
      if (index !== -1) {
        setCurrentChapterIndex(index);
      }
    }
  }, [searchParams, chapters]);

  // Set first chapter when detail loads
  useEffect(() => {
    if (chapters.length > 0 && !currentChapterUrl) {
      setCurrentChapterUrl(chapters[0].url);
      setCurrentChapterIndex(0);
    }
  }, [chapters, currentChapterUrl]);

  // Update URL when chapter changes
  const handleChapterChange = (chapterUrl: string, index: number, preserveFullscreen = false) => {
    setCurrentChapterUrl(chapterUrl);
    setCurrentChapterIndex(index);
    setShowChapterList(false);
    if (preserveFullscreen) {
      window.history.replaceState(null, '', `/watch/anime/${animeId}?episode=${chapterUrl}`);
    } else {
      router.push(`/watch/anime/${animeId}?episode=${chapterUrl}`);
    }
  };

  // Get stream data from video response
  const videoStreams = videoData?.data?.[0]?.stream || [];
  const availableQualities = [...new Set(videoStreams.map((s) => s.reso))].sort((a, b) => {
    const aNum = parseInt(a.replace('p', ''));
    const bNum = parseInt(b.replace('p', ''));
    return bNum - aNum;
  });

  // Keep selected quality valid
  useEffect(() => {
    if (!availableQualities.length) return;
    if (!availableQualities.includes(quality)) {
      setQuality(availableQualities[0]);
    }
  }, [availableQualities.join(",")]);

  // Get video URL with selected quality
  const getVideoUrl = () => {
    if (!videoStreams.length) return "";
    const stream = videoStreams.find((s) => s.reso === quality) || videoStreams[0];
    return stream?.link || "";
  };

  const handleVideoEnded = () => {
    const next = currentChapterIndex + 1;
    if (next < chapters.length) {
      handleChapterChange(chapters[next].url, next, true);
    }
  };

  const currentChapter = chapters[currentChapterIndex];
  const totalChapters = chapters.length;

  // Loading state
  if (detailLoading || (videoLoading && currentChapterUrl)) {
    return (
      <main className="fixed inset-0 bg-black flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <div className="text-center space-y-2">
          <h3 className="text-white font-medium text-lg">Memuat video...</h3>
          <p className="text-white/60 text-sm">Mohon tunggu sebentar, data sedang diambil.</p>
        </div>
      </main>
    );
  }

  // Error state
  if (!anime || chapters.length === 0) {
    return (
      <main className="fixed inset-0 bg-black flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold text-white mb-4">Anime tidak ditemukan</h2>
        <Link href="/" className="text-primary hover:underline">
          Kembali ke beranda
        </Link>
      </main>
    );
  }

  return (
    <main className="fixed inset-0 bg-black flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-40 h-16 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/50 to-transparent" />

        <div className="relative z-10 flex items-center justify-between h-full px-4 max-w-7xl mx-auto pointer-events-auto">
          <Link
            href={`/detail/anime/${animeId}`}
            className="flex items-center gap-2 text-white/90 hover:text-white transition-colors p-2 -ml-2 rounded-full hover:bg-white/10"
          >
            <ChevronLeft className="w-6 h-6" />
            <span className="text-primary font-bold hidden sm:inline shadow-black drop-shadow-md">Jelantik Entertainment</span>
          </Link>

          <div className="text-center flex-1 px-4 min-w-0">
            <h1 className="text-white font-medium truncate text-sm sm:text-base drop-shadow-md">
              {anime.judul}
            </h1>
            <p className="text-white/80 text-xs drop-shadow-md">
              Episode {currentChapter?.ch || currentChapterIndex + 1}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {availableQualities.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 text-white/90 hover:text-white transition-colors rounded-full hover:bg-white/10">
                    <Settings className="w-6 h-6 drop-shadow-md" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="z-[100]">
                  {availableQualities.map((q) => (
                    <DropdownMenuItem
                      key={q}
                      onClick={() => setQuality(q)}
                      className={quality === q ? "text-primary font-semibold" : ""}
                    >
                      {q}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <button
              onClick={() => setShowChapterList(!showChapterList)}
              className="p-2 text-white/90 hover:text-white transition-colors rounded-full hover:bg-white/10"
            >
              <List className="w-6 h-6 drop-shadow-md" />
            </button>
          </div>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 w-full h-full relative bg-black flex flex-col items-center justify-center">
        <div className="relative w-full h-full flex items-center justify-center">
          {getVideoUrl() ? (
            <video
              ref={videoRef}
              src={getVideoUrl()}
              controls
              autoPlay
              onEnded={handleVideoEnded}
              className="w-full h-full object-contain max-h-[100dvh]"
              poster={anime.cover}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          )}
        </div>

        {/* Navigation Controls */}
        <div className="absolute bottom-20 md:bottom-12 left-0 right-0 z-40 pointer-events-none flex justify-center pb-safe-area-bottom">
          <div className="flex items-center gap-2 md:gap-6 pointer-events-auto bg-black/60 backdrop-blur-md px-3 py-1.5 md:px-6 md:py-3 rounded-full border border-white/10 shadow-lg transition-all scale-90 md:scale-100 origin-bottom">
            <button
              onClick={() => currentChapterIndex > 0 && handleChapterChange(chapters[currentChapterIndex - 1].url, currentChapterIndex - 1)}
              disabled={currentChapterIndex <= 0}
              className="p-1.5 md:p-2 rounded-full text-white disabled:opacity-30 hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 md:w-6 md:h-6" />
            </button>

            <span className="text-white font-medium text-xs md:text-sm tabular-nums min-w-[60px] md:min-w-[80px] text-center">
              Ep {currentChapter?.ch || currentChapterIndex + 1} / {totalChapters}
            </span>

            <button
              onClick={() => currentChapterIndex < totalChapters - 1 && handleChapterChange(chapters[currentChapterIndex + 1].url, currentChapterIndex + 1)}
              disabled={currentChapterIndex >= totalChapters - 1}
              className="p-1.5 md:p-2 rounded-full text-white disabled:opacity-30 hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="w-4 h-4 md:w-6 md:h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Chapter List Sidebar */}
      {showChapterList && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={() => setShowChapterList(false)}
          />
          <div className="fixed inset-y-0 right-0 w-72 bg-zinc-900 z-[70] overflow-y-auto border-l border-white/10 shadow-2xl animate-in slide-in-from-right">
            <div className="p-4 border-b border-white/10 sticky top-0 bg-zinc-900 z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-white">Daftar Episode</h2>
                <span className="text-xs text-white/60 bg-white/10 px-2 py-0.5 rounded-full">
                  Total {totalChapters}
                </span>
              </div>
              <button
                onClick={() => setShowChapterList(false)}
                className="p-1 text-white/70 hover:text-white"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
            <div className="p-3 space-y-1">
              {chapters.map((chapter, idx) => (
                <button
                  key={chapter.id}
                  onClick={() => handleChapterChange(chapter.url, idx)}
                  className={`
                    w-full text-left p-3 rounded-lg text-sm transition-all
                    ${idx === currentChapterIndex
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                    }
                  `}
                >
                  <div className="font-medium">Episode {chapter.ch}</div>
                  <div className="text-xs opacity-70 truncate mt-0.5">{chapter.date}</div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </main>
  );
}
