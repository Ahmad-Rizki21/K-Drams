"use client";

import { VerticalVideoFeed, VideoItem } from "@/components/VerticalVideoFeed";
import { useForYouDramas } from "@/hooks/useDramas";
import { useReelShortHomepage } from "@/hooks/useReelShort";
import { useNetShortForYou } from "@/hooks/useNetShort";
import { useLatestAnime } from "@/hooks/useAnime";
import { MobileNav } from "@/components/MobileNav";

function MobileFeed() {
  // Fetch data from multiple platforms
  const { data: dramaBoxData } = useForYouDramas();
  const { data: reelShortData } = useReelShortHomepage();
  const { data: netShortData } = useNetShortForYou();
  const { data: animeData } = useLatestAnime();

  // Combine data from all platforms
  const allVideos: VideoItem[] = [];

  // Add DramaBox videos - using correct field names
  if (dramaBoxData && Array.isArray(dramaBoxData)) {
    dramaBoxData.slice(0, 5).forEach((drama: any) => {
      if (drama?.bookId) {
        allVideos.push({
          id: drama.bookId,
          title: drama.bookName || drama.title,
          cover: drama.coverWap || drama.cover,
          platform: "dramabox",
          description: drama.introduction,
          views: drama.playCount,
        });
      }
    });
  }

  // Add ReelShort videos
  if (reelShortData?.data?.lists) {
    reelShortData.data.lists.forEach((list: any) => {
      if (list.books) {
        list.books.slice(0, 3).forEach((item: any) => {
          if (item?.book_id) {
            allVideos.push({
              id: item.book_id,
              title: item.book_title || item.title,
              cover: item.book_pic,
              platform: "reelshort",
              description: item.special_desc,
              views: item.read_count,
              rating: item.score,
            });
          }
        });
      }
    });
  }

  // Add NetShort videos
  if (netShortData?.data) {
    netShortData.data.slice(0, 5).forEach((item: any) => {
      if (item?.shortPlayId) {
        allVideos.push({
          id: item.shortPlayId,
          title: item.title,
          cover: item.cover,
          platform: "netshort",
          description: item.introduction,
          views: item.heatScore,
          rating: item.score,
        });
      }
    });
  }

  // Add Anime videos
  if (animeData && Array.isArray(animeData)) {
    animeData.slice(0, 5).forEach((item: any) => {
      if (item?.id || item?.anime_id) {
        allVideos.push({
          id: item.id || item.anime_id,
          title: item.title,
          cover: item.poster || item.cover,
          platform: "anime",
          description: item.synopsis,
          views: item.members,
          rating: item.score,
        });
      }
    });
  }

  // Filter out items with no valid id or cover
  const validVideos = allVideos.filter(v => v.id && v.cover);

  if (validVideos.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen">
      <VerticalVideoFeed items={validVideos} autoPlay={true} />
    </div>
  );
}

export default function MobilePage() {
  return (
    <>
      <MobileFeed />
      <MobileNav />
    </>
  );
}
