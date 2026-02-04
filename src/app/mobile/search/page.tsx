"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { MobileNav } from "@/components/MobileNav";
import { UnifiedMediaCard } from "@/components/UnifiedMediaCard";
import { useSearchDramas } from "@/hooks/useDramas";
import { useReelShortSearch } from "@/hooks/useReelShort";
import { useNetShortSearch } from "@/hooks/useNetShort";
import { useSearchAnime } from "@/hooks/useAnime";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function MobileSearchPage() {
  const [query, setQuery] = useState("");
  const [currentPlatform, setCurrentPlatform] = useState<string>("dramabox");
  const debouncedQuery = useDebounce(query, 300);

  const { data: dramaResults, isLoading: dramaLoading } = useSearchDramas(
    currentPlatform === "dramabox" ? debouncedQuery : ""
  );
  const { data: reelShortResults } = useReelShortSearch(
    currentPlatform === "reelshort" ? debouncedQuery : ""
  );
  const { data: netShortResults } = useNetShortSearch(
    currentPlatform === "netshort" ? debouncedQuery : ""
  );
  const { data: animeResults } = useSearchAnime(
    currentPlatform === "anime" ? debouncedQuery : ""
  );

  // Transform results to UnifiedMediaCard props
  const getCardProps = (item: any, platform: string) => {
    switch (platform) {
      case "dramabox":
        return {
          title: item.book_name || item.title,
          cover: item.cover_url || item.cover,
          link: `/detail/dramabox/${item.book_id}`,
          episodes: item.chapter_count || 0,
        };
      case "reelshort":
        return {
          title: item.book_title,
          cover: item.book_pic,
          link: `/detail/reelshort/${item.book_id}`,
          episodes: item.chapter_count || 0,
        };
      case "netshort":
        return {
          title: item.title,
          cover: item.cover,
          link: `/detail/netshort/${item.shortPlayId}`,
          episodes: item.totalEpisodes || 0,
        };
      case "anime":
        return {
          title: item.title,
          cover: item.poster || item.image,
          link: `/detail/anime/${item.id}`,
          episodes: item.episodes || 0,
        };
      default:
        return {
          title: item.title || item.name,
          cover: item.cover || item.image,
          link: "/",
          episodes: 0,
        };
    }
  };

  let results: any[] = [];
  let isLoading = dramaLoading;

  switch (currentPlatform) {
    case "dramabox":
      results = dramaResults || [];
      break;
    case "reelshort":
      results = reelShortResults?.data || [];
      break;
    case "netshort":
      results = netShortResults?.data || [];
      break;
    case "anime":
      results = animeResults || [];
      break;
    default:
      results = dramaResults || [];
  }

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Search Header */}
      <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl border-b border-white/10 safe-area-inset-top">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search dramas, anime..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-white/10 border-white/20 rounded-full pl-10 pr-10 py-3 text-white placeholder:text-gray-400 focus:border-rose-500/50"
                autoFocus
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Platform Tabs */}
          <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
            {[
              { id: "dramabox", label: "Drama" },
              { id: "reelshort", label: "ReelShort" },
              { id: "netshort", label: "NetShort" },
              { id: "anime", label: "Anime" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentPlatform(tab.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                  currentPlatform === tab.id
                    ? "bg-rose-600 text-white"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="p-4">
        {isLoading && debouncedQuery && (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Searching...</p>
          </div>
        )}

        {!debouncedQuery && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Search for your favorite dramas</p>
          </div>
        )}

        {debouncedQuery && !isLoading && results.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No results found for "{debouncedQuery}"</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {results.map((item, index) => {
              const props = getCardProps(item, currentPlatform);
              return (
                <UnifiedMediaCard
                  key={item.book_id || item.id || item.shortPlayId || index}
                  {...props}
                  index={index}
                />
              );
            })}
          </div>
        )}
      </div>

      <MobileNav />
    </div>
  );
}
