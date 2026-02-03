import { safeJson, encryptedResponse } from "@/lib/api-utils";
import { NextRequest, NextResponse } from "next/server";

const UPSTREAM_API = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.sansekai.my.id/api") + "/netshort";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const shortPlayId = searchParams.get("shortPlayId");

    if (!shortPlayId) {
      return encryptedResponse(
        { success: false, error: "shortPlayId is required" },
        400
      );
    }

    const response = await fetch(`${UPSTREAM_API}/allepisode?shortPlayId=${shortPlayId}`, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://api.sansekai.my.id/',
        'Origin': 'https://api.sansekai.my.id',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1'
      },
    });

    if (!response.ok) {
      return encryptedResponse(
        { success: false, error: "Failed to fetch detail" }
      );
    }

    const data = await safeJson<any>(response);

    // Normalize episode data
    const episodes = (data.shortPlayEpisodeInfos || []).map((ep: any) => ({
      episodeId: ep.episodeId,
      episodeNo: ep.episodeNo,
      cover: ep.episodeCover,
      videoUrl: ep.playVoucher,
      quality: ep.playClarity || "720p",
      isLock: ep.isLock,
      likeNums: ep.likeNums,
      subtitleUrl: ep.subtitleList?.[0]?.url || "",
    }));

    return encryptedResponse({
      success: true,
      shortPlayId: data.shortPlayId,
      shortPlayLibraryId: data.shortPlayLibraryId,
      title: data.shortPlayName,
      cover: data.shortPlayCover,
      description: data.shotIntroduce,
      labels: data.shortPlayLabels || [],
      totalEpisodes: data.totalEpisode,
      isFinish: data.isFinish === 1,
      payPoint: data.payPoint,
      episodes,
    });
  } catch (error) {
    console.error("NetShort Detail Error:", error);
    return encryptedResponse(
      { success: false, error: "Internal server error" }
    );
  }
}



