"use client";

import { MobileNav } from "@/components/MobileNav";
import { TrendingUp, Clock, Star, Flame } from "lucide-react";
import Link from "next/link";
import { UnifiedMediaCard } from "@/components/UnifiedMediaCard";
import { useTrendingDramas, useLatestDramas } from "@/hooks/useDramas";
import { useReelShortHomepage } from "@/hooks/useReelShort";
import { useNetShortTheaters } from "@/hooks/useNetShort";
import { useLatestAnime } from "@/hooks/useAnime";
import { PLATFORMS } from "@/hooks/platform-types";

// Helper function to transform data to UnifiedMediaCard props
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

export default function MobileExplorePage() {
  const { data: trendingDramas } = useTrendingDramas();
  const { data: latestDramas } = useLatestDramas();
  const { data: reelShortData } = useReelShortHomepage();
  const { data: netShortData } = useNetShortTheaters();
  const { data: animeData } = useLatestAnime();

  const categories = [
    {
      id: "trending",
      title: "Trending Now",
      icon: Flame,
      color: "text-rose-500",
      data: trendingDramas?.slice(0, 6) || [],
      platform: "dramabox" as const,
    },
    {
      id: "latest",
      title: "Latest Releases",
      icon: Clock,
      color: "text-blue-500",
      data: latestDramas?.slice(0, 6) || [],
      platform: "dramabox" as const,
    },
    {
      id: "top-rated",
      title: "Top Rated",
      icon: Star,
      color: "text-yellow-500",
      data: animeData?.slice(0, 6) || [],
      platform: "anime" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl border-b border-white/10 safe-area-inset-top">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-white">Explore</h1>
          <p className="text-gray-400 text-sm mt-1">Discover new content</p>
        </div>
      </div>

      {/* Quick Access Platforms */}
      <div className="p-4">
        <h2 className="text-white font-semibold mb-3">Platforms</h2>
        <div className="grid grid-cols-2 gap-3">
          {PLATFORMS.map((platform) => (
            <Link
              key={platform.id}
              href={`/${platform.id}`}
              className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
            >
              <img
                src={platform.logo}
                alt={platform.name}
                className="w-10 h-10 rounded-lg object-cover"
              />
              <span className="text-white font-medium">{platform.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Categories */}
      {categories.map((category) => {
        const Icon = category.icon;
        return (
          <div key={category.id} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon className={`w-5 h-5 ${category.color}`} />
                <h2 className="text-white font-semibold">{category.title}</h2>
              </div>
              <Link
                href={`/${category.platform}`}
                className="text-rose-500 text-sm font-medium"
              >
                See All
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {category.data.map((item: any, index: number) => {
                const props = getCardProps(item, category.platform);
                return (
                  <UnifiedMediaCard
                    key={item.book_id || item.id || index}
                    {...props}
                    index={index}
                  />
                );
              })}
            </div>
          </div>
        );
      })}

      {/* ReelShort Section */}
      {reelShortData?.data?.lists && (
        <div className="p-4">
          <h2 className="text-white font-semibold mb-3">ReelShort Picks</h2>
          <div className="grid grid-cols-3 gap-3">
            {reelShortData.data.lists.slice(0, 2).flatMap((list: any, listIndex: number) =>
              list.books?.slice(0, 3).map((item: any, itemIndex: number) => {
                const props = getCardProps(item, "reelshort");
                const globalIndex = listIndex * 3 + itemIndex;
                return (
                  <UnifiedMediaCard
                    key={item.book_id || `reelshort-${globalIndex}`}
                    {...props}
                    index={globalIndex}
                  />
                );
              })
            )}
          </div>
        </div>
      )}

      <MobileNav />
    </div>
  );
}
