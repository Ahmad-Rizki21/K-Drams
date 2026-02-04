"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronRight, Play, Pause, Volume2, VolumeX, Eye, Star, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Hls from "hls.js";
import { decryptData } from "@/lib/crypto";

export interface VideoItem {
  id: string;
  title: string;
  cover: string;
  videoUrl?: string;
  platform: string;
  description?: string;
  views?: string;
  rating?: string;
  isLoading?: boolean;
}

interface VerticalVideoFeedProps {
  items: VideoItem[];
  platform?: string;
  autoPlay?: boolean;
}

export function VerticalVideoFeed({
  items,
  platform = "dramabox",
  autoPlay = true,
}: VerticalVideoFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playingStates, setPlayingStates] = useState<Record<number, boolean>>({});
  const [mutedStates, setMutedStates] = useState<Record<number, boolean>>({});
  const [videoUrls, setVideoUrls] = useState<Record<number, string>>({});
  const hlsRefs = useRef<Record<number, Hls>>({});
  const videoRefs = useRef<Record<number, HTMLVideoElement>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);
  const fetchedIndices = useRef<Set<number>>(new Set());

  // Fetch video URL for current item
  const fetchVideoUrl = useCallback(async (item: VideoItem, index: number) => {
    if (fetchedIndices.current.has(index) || videoUrls[index]) {
      return;
    }

    fetchedIndices.current.add(index);

    try {
      let firstVideoUrl = '';

      switch (platform) {
        case 'dramabox': {
          // DramaBox: Use /allepisode endpoint to get episode list with video URLs
          const apiUrl = `/api/dramabox/allepisode/${item.id}`;
          console.log('Fetching DramaBox episodes:', apiUrl);
          const response = await fetch(apiUrl);
          if (!response.ok) throw new Error('Failed to fetch episodes');

          const json = await response.json();
          console.log('DramaBox episodes response (raw):', json);

          // Decrypt if needed
          let episodes = json;
          if (json.data && typeof json.data === 'string') {
            try {
              episodes = decryptData<any>(json.data);
              console.log('DramaBox episodes (decrypted):', episodes);
            } catch (error) {
              console.error('Decryption failed:', error);
            }
          }

          // Extract video URL from first episode: episodes[0].cdnList[0].videoPathList[0].videoPath
          if (Array.isArray(episodes) && episodes.length > 0) {
            const firstEpisode = episodes[0];
            if (firstEpisode.cdnList && firstEpisode.cdnList.length > 0) {
              const defaultCdn = firstEpisode.cdnList.find((cdn: any) => cdn.isDefault === 1) || firstEpisode.cdnList[0];
              if (defaultCdn.videoPathList && defaultCdn.videoPathList.length > 0) {
                firstVideoUrl = defaultCdn.videoPathList[0].videoPath;
              }
            }
          }
          break;
        }

        case 'reelshort': {
          // ReelShort: Use /watch endpoint with episodeNumber=1
          const apiUrl = `/api/reelshort/watch?bookId=${item.id}&episodeNumber=1`;
          console.log('Fetching ReelShort watch:', apiUrl);
          const response = await fetch(apiUrl);
          if (!response.ok) throw new Error('Failed to fetch watch');

          const json = await response.json();
          console.log('ReelShort watch response (raw):', json);

          // Decrypt if needed
          let watchData = json;
          if (json.data && typeof json.data === 'string') {
            try {
              watchData = decryptData<any>(json.data);
              console.log('ReelShort watch (decrypted):', watchData);
            } catch (error) {
              console.error('Decryption failed:', error);
            }
          }

          // Extract video URL from videoList
          if (watchData.videoList && watchData.videoList.length > 0) {
            // Prefer H264 for compatibility
            const h264Video = watchData.videoList.find((v: any) => v.encode === 'H264');
            firstVideoUrl = (h264Video || watchData.videoList[0]).url;
          }
          break;
        }

        case 'netshort': {
          // NetShort: Detail endpoint returns episodes[] with videoUrl
          const apiUrl = `/api/netshort/detail?shortPlayId=${item.id}`;
          console.log('Fetching NetShort detail:', apiUrl);
          const response = await fetch(apiUrl);
          if (!response.ok) throw new Error('Failed to fetch detail');

          const json = await response.json();
          console.log('NetShort detail response (raw):', json);

          // Decrypt if needed (NetShort uses fetchJson which auto-decrypts)
          let detailData = json;
          if (json.data && typeof json.data === 'string') {
            try {
              detailData = decryptData<any>(json.data);
              console.log('NetShort detail (decrypted):', detailData);
            } catch (error) {
              console.error('Decryption failed:', error);
            }
          }

          // Extract video URL from episodes array
          if (detailData.episodes && detailData.episodes.length > 0) {
            firstVideoUrl = detailData.episodes[0].videoUrl;
          }
          break;
        }

        case 'anime': {
          // Anime: Need to fetch detail first to get chapter list, then fetch video
          const detailUrl = `/api/anime/detail/${item.id}`;
          console.log('Fetching Anime detail:', detailUrl);
          const detailResponse = await fetch(detailUrl);
          if (!detailResponse.ok) throw new Error('Failed to fetch anime detail');

          const detailJson = await detailResponse.json();
          console.log('Anime detail response (raw):', detailJson);

          // Decrypt if needed
          let animeDetail = detailJson;
          if (detailJson.data && typeof detailJson.data === 'string') {
            try {
              animeDetail = decryptData<any>(detailJson.data);
              console.log('Anime detail (decrypted):', animeDetail);
            } catch (error) {
              console.error('Decryption failed:', error);
            }
          }

          // Handle array structure
          let anime = animeDetail;
          if (typeof animeDetail === 'object') {
            if ('data' in animeDetail && Array.isArray(animeDetail.data)) {
              anime = animeDetail.data[0];
            } else if (Array.isArray(animeDetail)) {
              anime = animeDetail.length > 0 ? animeDetail[0] : null;
            }
          }

          const chapters = anime?.chapter || [];
          if (chapters.length > 0) {
            const firstChapterUrl = chapters[0].url;
            console.log('Fetching anime video for chapter:', firstChapterUrl);

            const videoUrl = `/api/anime/getvideo/${firstChapterUrl}`;
            const videoResponse = await fetch(videoUrl);
            if (!videoResponse.ok) throw new Error('Failed to fetch anime video');

            const videoJson = await videoResponse.json();
            console.log('Anime video response (raw):', videoJson);

            // Decrypt if needed
            let videoData = videoJson;
            if (videoJson.data && typeof videoJson.data === 'string') {
              try {
                videoData = decryptData<any>(videoJson.data);
                console.log('Anime video (decrypted):', videoData);
              } catch (error) {
                console.error('Decryption failed:', error);
              }
            }

            // Extract video URL from stream data
            if (videoData.data && videoData.data.length > 0) {
              const streams = videoData.data[0].stream || [];
              if (streams.length > 0) {
                // Prefer 720p, fallback to first available
                const stream = streams.find((s: any) => s.reso === '720p') || streams[0];
                firstVideoUrl = stream.link;
              }
            }
          }
          break;
        }

        default:
          console.warn('Unsupported platform:', platform);
      }

      console.log('Extracted video URL:', firstVideoUrl);

      if (firstVideoUrl) {
        setVideoUrls(prev => ({ ...prev, [index]: firstVideoUrl }));
      } else {
        console.warn('No video URL found in response');
      }
    } catch (error) {
      console.error('Failed to fetch video URL:', error);
    }
  }, [platform, videoUrls]);

  // Setup Intersection Observer for auto-play detection
  useEffect(() => {
    if (!containerRef.current) return;

    const options = {
      root: null,
      rootMargin: "0px",
      threshold: [0, 0.5, 1],
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const index = Number(entry.target.getAttribute("data-index"));
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          setCurrentIndex(index);

          // Fetch video URL for this item
          const item = items[index];
          if (item && !videoUrls[index]) {
            fetchVideoUrl(item, index);
          }

          // Auto-play if video URL is available
          if (autoPlay && videoUrls[index]) {
            playVideo(index);
          }
        } else if (entry.intersectionRatio < 0.3) {
          pauseVideo(index);
        }
      });
    }, options);

    const videoElements = containerRef.current.querySelectorAll("[data-video-container]");
    videoElements.forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [items, autoPlay, videoUrls, fetchVideoUrl]);

  // Initialize HLS for videos when URLs are available
  useEffect(() => {
    items.forEach((item, index) => {
      const url = videoUrls[index];
      if (url && videoRefs.current[index]) {
        const video = videoRefs.current[index];
        if (Hls.isSupported() && url.includes(".m3u8")) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
          });
          hls.loadSource(url);
          hls.attachMedia(video);
          if (hlsRefs.current[index]) {
            hlsRefs.current[index].destroy();
          }
          hlsRefs.current[index] = hls;

          // Auto-play when manifest is parsed and video is the current one
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            if (index === currentIndex && autoPlay) {
              video.play().catch(() => {
                video.muted = true;
                setMutedStates((prev) => ({ ...prev, [index]: true }));
                video.play().catch(console.error);
              });
              setPlayingStates((prev) => ({ ...prev, [index]: true }));
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
          // For native HLS (Safari), auto-play when video is the current one
          if (index === currentIndex && autoPlay) {
            video.play().catch(() => {
              video.muted = true;
              setMutedStates((prev) => ({ ...prev, [index]: true }));
              video.play().catch(console.error);
            });
            setPlayingStates((prev) => ({ ...prev, [index]: true }));
          }
        } else {
          // Direct MP4, auto-play when video is the current one
          if (index === currentIndex && autoPlay) {
            video.play().catch(() => {
              video.muted = true;
              setMutedStates((prev) => ({ ...prev, [index]: true }));
              video.play().catch(console.error);
            });
            setPlayingStates((prev) => ({ ...prev, [index]: true }));
          }
        }
      }
    });

    return () => {
      Object.values(hlsRefs.current).forEach((hls) => hls?.destroy());
    };
  }, [videoUrls, items, currentIndex, autoPlay]);

  const playVideo = useCallback((index: number) => {
    const video = videoRefs.current[index];
    if (video && videoUrls[index]) {
      video.play().catch(() => {
        video.muted = true;
        setMutedStates((prev) => ({ ...prev, [index]: true }));
        video.play().catch(console.error);
      });
      setPlayingStates((prev) => ({ ...prev, [index]: true }));
    }
  }, [videoUrls]);

  const pauseVideo = useCallback((index: number) => {
    const video = videoRefs.current[index];
    if (video) {
      video.pause();
      setPlayingStates((prev) => ({ ...prev, [index]: false }));
    }
  }, []);

  const togglePlay = useCallback((index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (playingStates[index]) {
      pauseVideo(index);
    } else {
      if (videoUrls[index]) {
        playVideo(index);
      }
    }
  }, [playingStates, playVideo, pauseVideo, videoUrls]);

  const toggleMute = useCallback((index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRefs.current[index];
    if (video) {
      video.muted = !video.muted;
      setMutedStates((prev) => ({ ...prev, [index]: video.muted }));
    }
  }, []);

  const getDetailLink = (item: VideoItem) => {
    switch (platform) {
      case "dramabox":
        return `/detail/dramabox/${item.id}`;
      case "reelshort":
        return `/detail/reelshort/${item.id}`;
      case "netshort":
        return `/detail/netshort/${item.id}`;
      case "anime":
        return `/detail/anime/${item.id}`;
      default:
        return `/detail/${platform}/${item.id}`;
    }
  };

  return (
    <div ref={containerRef} className="h-screen overflow-y-auto snap-y snap-mandatory scrollbar-hide bg-black">
      {items.map((item, index) => {
        const hasVideo = !!videoUrls[index];
        const isLoading = !hasVideo && !videoUrls[index] && index === currentIndex;

        return (
          <div
            key={`${item.id}-${index}`}
            data-video-container
            data-index={index}
            className="relative h-screen w-full snap-start flex items-center justify-center bg-black"
          >
            {/* Video/Image Background */}
            <div className="absolute inset-0 w-full h-full">
              {hasVideo ? (
                <video
                  ref={(el) => {
                    if (el) videoRefs.current[index] = el;
                  }}
                  className="w-full h-full object-cover"
                  loop
                  playsInline
                  muted={mutedStates[index] !== false}
                  onClick={(e) => togglePlay(index, e)}
                  poster={item.cover}
                />
              ) : (
                <>
                  {item.cover && (
                    <Image
                      src={item.cover}
                      alt={item.title || "Video cover"}
                      fill
                      className="object-cover"
                      sizes="100vw"
                      priority={index === 0}
                    />
                  )}
                  {/* Darker overlay when no video */}
                  <div className="absolute inset-0 bg-black/40" />
                </>
              )}
            </div>

            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/60 backdrop-blur-sm">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-rose-600 animate-spin mx-auto mb-3" />
                  <p className="text-white font-medium">Loading video...</p>
                </div>
              </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/90 pointer-events-none" />

            {/* Play Button Overlay - Hide when video is playing */}
            {!playingStates[index] && (
              <div
                className="absolute inset-0 flex items-center justify-center z-10"
                onClick={(e) => hasVideo ? togglePlay(index, e) : undefined}
              >
                <div className={cn(
                  "w-24 h-24 rounded-full backdrop-blur-sm flex items-center justify-center shadow-2xl transition-all",
                  hasVideo ? "bg-rose-600/90 hover:bg-rose-600 cursor-pointer" : "bg-white/20"
                )}>
                  <Play className="w-12 h-12 text-white ml-2" fill="white" />
                </div>
              </div>
            )}

            {/* Top Info Bar */}
            <div className="absolute top-4 left-4 right-4 z-30">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 bg-rose-600/90 backdrop-blur-sm rounded-full text-white text-xs font-semibold uppercase tracking-wide">
                  {platform}
                </span>
                {item.rating && (
                  <span className="px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs font-semibold flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    {item.rating}
                  </span>
                )}
                {item.views && (
                  <span className="px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs font-semibold flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {item.views}
                  </span>
                )}
                {hasVideo && (
                  <span className="px-3 py-1 bg-green-600/90 backdrop-blur-sm rounded-full text-white text-xs font-semibold flex items-center gap-1">
                    HD
                  </span>
                )}
              </div>
            </div>

            {/* Video Info */}
            <div className="absolute bottom-0 left-0 right-0 p-6 z-30">
              <div className="mb-4">
                <h2 className="text-white text-2xl font-bold mb-2 line-clamp-2 drop-shadow-lg">
                  {item.title}
                </h2>
                {item.description && (
                  <p className="text-white/90 text-sm line-clamp-2 mb-3 drop-shadow-md">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Video Controls - Only show when video is available */}
              {hasVideo && (
                <div className="flex items-center justify-center gap-4 mb-4">
                  <button
                    onClick={(e) => togglePlay(index, e)}
                    className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                  >
                    {playingStates[index] ? (
                      <Pause className="w-7 h-7" />
                    ) : (
                      <Play className="w-7 h-7 ml-1" />
                    )}
                  </button>
                  <button
                    onClick={(e) => toggleMute(index, e)}
                    className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                  >
                    {mutedStates[index] === false ? (
                      <Volume2 className="w-6 h-6" />
                    ) : (
                      <VolumeX className="w-6 h-6" />
                    )}
                  </button>
                </div>
              )}

              {/* Watch Now / Detail Button */}
              <Link
                href={getDetailLink(item)}
                className="inline-flex items-center justify-center gap-3 w-full px-8 py-4 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-2xl font-bold text-lg transition-all duration-200 shadow-xl shadow-rose-600/30 transform hover:scale-105 active:scale-95"
              >
                {hasVideo ? (
                  <>
                    <ChevronRight className="w-5 h-5" />
                    Full Episodes
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6" fill="white" />
                    Watch Now
                  </>
                )}
              </Link>

              {/* Swipe Indicator */}
              <p className="text-center text-white/60 text-xs mt-4 animate-bounce">
                Swipe up for more ↓
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="absolute bottom-32 left-4 right-4 h-1 bg-white/20 z-30">
              <div
                className="h-full bg-rose-600 transition-all duration-300"
                style={{
                  width: `${((index + 1) / items.length) * 100}%`,
                }}
              />
            </div>

            {/* Page Indicator */}
            <div className="absolute right-4 bottom-36 flex flex-col gap-2 z-30">
              {items.slice(0, 6).map((_, i) => (
                <div
                  key={`page-indicator-${i}`}
                  className={cn(
                    "rounded-full transition-all duration-300",
                    i === index ? "w-2 h-8 bg-rose-600" : "w-1.5 h-1.5 bg-white/40"
                  )}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
