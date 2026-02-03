"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();

  // Hide footer on watch pages for immersive video experience
  if (pathname?.startsWith("/watch")) {
    return null;
  }

  return (
    <footer className="border-t border-border bg-card/50 backdrop-blur-sm mt-12">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center gap-2">
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} Jelantik Entertainment
          </p>
        </div>
      </div>
    </footer>
  );
}
