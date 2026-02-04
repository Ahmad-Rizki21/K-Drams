"use client";

import { MobileNav } from "@/components/MobileNav";
import { History, Bookmark, Heart, Clock } from "lucide-react";
import { useState, useEffect } from "react";

interface WatchHistory {
  id: string;
  title: string;
  cover: string;
  platform: string;
  progress: number;
  lastWatched: Date;
}

interface BookmarkedItem {
  id: string;
  title: string;
  cover: string;
  platform: string;
  addedAt: Date;
}

export default function MobileLibraryPage() {
  const [activeTab, setActiveTab] = useState<"history" | "bookmarks">("history");
  const [watchHistory, setWatchHistory] = useState<WatchHistory[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkedItem[]>([]);

  useEffect(() => {
    // Load from localStorage
    const history = localStorage.getItem("watchHistory");
    const saved = localStorage.getItem("bookmarks");

    if (history) {
      setWatchHistory(JSON.parse(history));
    }
    if (saved) {
      setBookmarks(JSON.parse(saved));
    }
  }, []);

  const tabs = [
    { id: "history" as const, label: "History", icon: History, count: watchHistory.length },
    { id: "bookmarks" as const, label: "Bookmarks", icon: Bookmark, count: bookmarks.length },
  ];

  const displayData = activeTab === "history" ? watchHistory : bookmarks;

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl border-b border-white/10 safe-area-inset-top">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-white">My Library</h1>
          <p className="text-gray-400 text-sm mt-1">Your personal collection</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 transition-colors ${
                  activeTab === tab.id
                    ? "text-rose-500 border-b-2 border-rose-500"
                    : "text-gray-400"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
                {tab.count > 0 && (
                  <span className="px-2 py-0.5 bg-white/10 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {displayData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
              {activeTab === "history" ? (
                <Clock className="w-10 h-10 text-gray-600" />
              ) : (
                <Bookmark className="w-10 h-10 text-gray-600" />
              )}
            </div>
            <p className="text-gray-400 text-center">
              {activeTab === "history"
                ? "No watch history yet"
                : "No bookmarks yet"}
            </p>
            <p className="text-gray-500 text-sm mt-2">
              {activeTab === "history"
                ? "Start watching dramas to see your history here"
                : "Bookmark your favorites to see them here"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {displayData.map((item) => (
              <div
                key={item.id}
                className="relative aspect-[2/3] rounded-lg overflow-hidden bg-white/5"
              >
                <img
                  src={item.cover}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                {activeTab === "history" && (item as WatchHistory).progress > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                    <div
                      className="h-full bg-rose-600"
                      style={{ width: `${(item as WatchHistory).progress}%` }}
                    />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="text-white text-xs line-clamp-2">{item.title}</p>
                  <p className="text-gray-400 text-[10px] mt-1 capitalize">{item.platform}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <MobileNav />
    </div>
  );
}
