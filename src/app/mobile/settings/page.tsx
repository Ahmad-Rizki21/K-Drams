"use client";

import { MobileNav } from "@/components/MobileNav";
import {
  Settings as SettingsIcon,
  Bell,
  Moon,
  Palette,
  Info,
  Github,
  Heart,
  Zap,
  Shield,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SettingSection {
  title: string;
  items: SettingItem[];
}

interface SettingItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  type: "switch" | "select" | "button" | "info";
  value?: string;
  options?: { label: string; value: string }[];
  action?: () => void;
}

export default function MobileSettingsPage() {
  const { theme, setTheme } = useTheme();
  const [autoplay, setAutoplay] = useState(true);
  const [notifications, setNotifications] = useState(false);
  const [quality, setQuality] = useState("auto");
  const [storage, setStorage] = useState("0 MB");

  useEffect(() => {
    // Load settings from localStorage
    const savedAutoplay = localStorage.getItem("autoplay");
    const savedNotifications = localStorage.getItem("notifications");
    const savedQuality = localStorage.getItem("quality");

    if (savedAutoplay) setAutoplay(JSON.parse(savedAutoplay));
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
    if (savedQuality) setQuality(savedQuality);

    // Calculate storage
    if (typeof window !== "undefined" && "storage" in navigator && "estimate" in navigator.storage) {
      navigator.storage.estimate().then((estimate) => {
        const used = Math.round((estimate.usage || 0) / (1024 * 1024));
        setStorage(`${used} MB`);
      });
    }
  }, []);

  const handleAutoplayChange = (checked: boolean) => {
    setAutoplay(checked);
    localStorage.setItem("autoplay", JSON.stringify(checked));
  };

  const handleNotificationsChange = (checked: boolean) => {
    setNotifications(checked);
    localStorage.setItem("notifications", JSON.stringify(checked));
  };

  const handleQualityChange = (value: string) => {
    setQuality(value);
    localStorage.setItem("quality", value);
  };

  const sections: SettingSection[] = [
    {
      title: "Playback",
      items: [
        {
          id: "autoplay",
          label: "Auto-play Videos",
          description: "Automatically play videos when scrolling",
          icon: Zap,
          type: "switch",
          value: String(autoplay),
          action: () => setAutoplay(!autoplay),
        },
        {
          id: "quality",
          label: "Video Quality",
          description: "Preferred streaming quality",
          icon: SettingsIcon,
          type: "select",
          value: quality,
          options: [
            { label: "Auto", value: "auto" },
            { label: "1080p", value: "1080p" },
            { label: "720p", value: "720p" },
            { label: "480p", value: "480p" },
          ],
        },
      ],
    },
    {
      title: "Appearance",
      items: [
        {
          id: "theme",
          label: "Theme",
          description: "Choose your preferred theme",
          icon: Moon,
          type: "select",
          value: theme || "dark",
          options: [
            { label: "Dark", value: "dark" },
            { label: "Light", value: "light" },
            { label: "System", value: "system" },
          ],
        },
      ],
    },
    {
      title: "Notifications",
      items: [
        {
          id: "notifications",
          label: "Push Notifications",
          description: "Get notified about new releases",
          icon: Bell,
          type: "switch",
          value: String(notifications),
          action: () => setNotifications(!notifications),
        },
      ],
    },
    {
      title: "Storage & Data",
      items: [
        {
          id: "storage",
          label: "Cache Size",
          description: `Currently using ${storage}`,
          icon: Palette,
          type: "button",
          action: () => {
            if ("caches" in window) {
              caches.keys().then((names) => {
                names.forEach((name) => caches.delete(name));
              });
            }
            setStorage("0 MB");
          },
        },
      ],
    },
    {
      title: "About",
      items: [
        {
          id: "version",
          label: "Version",
          description: "Jelantik v0.2.1",
          icon: Info,
          type: "info",
        },
        {
          id: "privacy",
          label: "Privacy Policy",
          description: "How we handle your data",
          icon: Shield,
          type: "button",
          action: () => window.open("/privacy", "_blank"),
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl border-b border-white/10 safe-area-inset-top">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-gray-400 text-sm mt-1">Customize your experience</p>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="p-4 space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3 px-1">
              {section.title}
            </h2>
            <div className="bg-white/5 rounded-xl overflow-hidden">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border-b border-white/5 last:border-b-0"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-gray-300" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{item.label}</p>
                        {item.description && (
                          <p className="text-gray-400 text-xs">{item.description}</p>
                        )}
                      </div>
                    </div>

                    {item.type === "switch" && (
                      <Switch
                        checked={item.value === "true"}
                        onCheckedChange={(checked) => {
                          if (item.id === "autoplay") {
                            handleAutoplayChange(checked);
                          } else if (item.id === "notifications") {
                            handleNotificationsChange(checked);
                          }
                        }}
                      />
                    )}

                    {item.type === "select" && (
                      <Select
                        value={item.value}
                        onValueChange={(value) => {
                          if (item.id === "theme") {
                            setTheme(value);
                          } else if (item.id === "quality") {
                            handleQualityChange(value);
                          }
                        }}
                      >
                        <SelectTrigger className="w-28 bg-white/10 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-white/20">
                          {item.options?.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value}
                              className="text-white focus:bg-white/10"
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {item.type === "button" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={item.action}
                        className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10"
                      >
                        {item.id === "storage" ? "Clear" : "Open"}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className="text-center py-6">
          <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
            Made with <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> by Jelantik
            Team
          </p>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
