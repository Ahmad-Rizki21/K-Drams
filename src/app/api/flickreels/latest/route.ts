import { encryptedResponse, safeJson } from "@/lib/api-utils";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.sansekai.my.id/api"}/flickreels/latest`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("[FlickReels Latest] Upstream error:", res.status, res.statusText);
      return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }

    const data = await safeJson(res);
    return encryptedResponse(data);
  } catch (error) {
    console.error("[FlickReels Latest] Error:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
