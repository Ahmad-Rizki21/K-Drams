"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useKomikDetail, useKomikImages } from "@/hooks/useKomikDetail";
import { ChevronLeft, ChevronRight, Loader2, Settings, List, AlertCircle, ZoomIn, ZoomOut } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { KomikDetail } from "@/types/komik";

export default function KomikReadPage() {
  const params = useParams<{ mangaId: string }>();
  const mangaId = params.mangaId;
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [currentChapterId, setCurrentChapterId] = useState<string | null>(null);
  const [showChapterList, setShowChapterList] = useState(false);
  const [imageScale, setImageScale] = useState(100);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: detailData, isLoading: detailLoading } = useKomikDetail(mangaId || "");
  const { data: imagesData, isLoading: imagesLoading } = useKomikImages(currentChapterId || "");

  const komik = detailData as KomikDetail | null;
  // Sort chapters by chapter_number so chapter 1 is at index 0
  const chapters = [...(komik?.chapters || [])].sort((a, b) => {
    const numA = parseInt(String(a.chapter_number)) || 0;
    const numB = parseInt(String(b.chapter_number)) || 0;
    return numA - numB;
  });

  // Initialize from URL params
  useEffect(() => {
    const chapterParam = searchParams.get("chapter");
    if (chapterParam) {
      setCurrentChapterId(chapterParam);
      // Find the index of this chapter
      const index = chapters.findIndex((ch) => ch.chapter_id === chapterParam);
      if (index !== -1) {
        setCurrentChapterIndex(index);
      }
    }
  }, [searchParams, chapters]);

  // Set first chapter when detail loads
  useEffect(() => {
    if (chapters.length > 0 && !currentChapterId) {
      setCurrentChapterId(chapters[0].chapter_id);
      setCurrentChapterIndex(0);
    }
  }, [chapters, currentChapterId]);

  // Update URL when chapter changes
  const handleChapterChange = (chapterId: string, index: number) => {
    setCurrentChapterId(chapterId);
    setCurrentChapterIndex(index);
    setShowChapterList(false);
    router.push(`/read/komik/${mangaId}?chapter=${chapterId}`);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentChapter = chapters[currentChapterIndex];
  const totalChapters = chapters.length;
  const images = imagesData?.images || [];

  // Loading state
  if (detailLoading) {
    return (
      <main className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <div className="text-center space-y-2">
          <h3 className="text-white font-medium text-lg">Memuat komik...</h3>
          <p className="text-white/60 text-sm">Mohon tunggu sebentar, data sedang diambil.</p>
        </div>
      </main>
    );
  }

  // Error state
  if (!komik || chapters.length === 0) {
    return (
      <main className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold text-white mb-4">Komik tidak ditemukan</h2>
        <Link href="/" className="text-primary hover:underline">
          Kembali ke beranda
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="sticky top-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3 max-w-4xl mx-auto">
          <Link
            href={`/detail/komik/${mangaId}`}
            className="flex items-center gap-2 text-white/90 hover:text-white transition-colors p-2 -ml-2 rounded-full hover:bg-white/10"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Kembali</span>
          </Link>

          <div className="text-center flex-1 px-4 min-w-0">
            <h1 className="text-white font-medium truncate text-sm drop-shadow-md">
              {komik.title}
            </h1>
            <p className="text-white/80 text-xs drop-shadow-md">
              Chapter {currentChapter?.chapter_number || currentChapterIndex + 1}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 text-white/90 hover:text-white transition-colors rounded-full hover:bg-white/10">
                  <ZoomIn className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-[100]">
                <DropdownMenuItem onClick={() => setImageScale(75)}>75%</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setImageScale(100)}>100%</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setImageScale(125)}>125%</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setImageScale(150)}>150%</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              onClick={() => setShowChapterList(!showChapterList)}
              className="p-2 text-white/90 hover:text-white transition-colors rounded-full hover:bg-white/10"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Images Area */}
      <div
        ref={containerRef}
        className="flex-1 w-full bg-black flex flex-col items-center"
        style={{ maxWidth: imageScale > 100 ? `${imageScale}%` : "100%", margin: "0 auto" }}
      >
        {imagesLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : images.length > 0 ? (
          <div className="w-full">
            {images.map((image) => (
              <div key={image.index} className="w-full flex justify-center bg-black">
                <img
                  src={image.url}
                  alt={`Page ${image.index + 1}`}
                  className="w-full max-w-4xl h-auto"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-20">
            <p className="text-white/60">Tidak ada gambar yang tersedia</p>
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="sticky bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-md border-t border-white/10">
        <div className="flex items-center justify-center gap-4 py-4 max-w-4xl mx-auto">
          <button
            onClick={() => currentChapterIndex > 0 && handleChapterChange(chapters[currentChapterIndex - 1].chapter_id, currentChapterIndex - 1)}
            disabled={currentChapterIndex <= 0}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white disabled:opacity-30 hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Prev</span>
          </button>

          <span className="text-white font-medium text-sm tabular-nums px-4">
            Ch {currentChapter?.chapter_number || currentChapterIndex + 1} / {totalChapters}
          </span>

          <button
            onClick={() => currentChapterIndex < totalChapters - 1 && handleChapterChange(chapters[currentChapterIndex + 1].chapter_id, currentChapterIndex + 1)}
            disabled={currentChapterIndex >= totalChapters - 1}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white disabled:opacity-30 hover:bg-white/20 transition-colors"
          >
            <span className="text-sm font-medium">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chapter List Sidebar */}
      {showChapterList && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={() => setShowChapterList(false)}
          />
          <div className="fixed inset-y-0 right-0 w-80 bg-zinc-900 z-[70] overflow-y-auto border-l border-white/10 shadow-2xl animate-in slide-in-from-right">
            <div className="p-4 border-b border-white/10 sticky top-0 bg-zinc-900 z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-white">Daftar Chapter</h2>
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
              {chapters.map((chapter, index) => {
                return (
                  <button
                    key={chapter.chapter_id}
                    onClick={() => handleChapterChange(chapter.chapter_id, index)}
                    className={`
                      w-full text-left p-3 rounded-lg text-sm transition-all
                      ${index === currentChapterIndex
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                      }
                    `}
                  >
                    <div className="font-medium">Chapter {chapter.chapter_number}</div>
                    <div className="text-xs opacity-70 mt-0.5">
                      {new Date(chapter.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </main>
  );
}
