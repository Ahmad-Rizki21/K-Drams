import { safeJson, encryptedResponse } from "@/lib/api-utils";
import { NextResponse } from "next/server";

const UPSTREAM_API = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.sansekai.my.id/api") + "/netshort";

export async function GET() {
  try {
    const response = await fetch(`${UPSTREAM_API}/theaters`, {
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
      return encryptedResponse({ success: false, data: [] });
    }

    const data = await safeJson<any>(response);
    
    // Normalize the response to match our format
    // Each group has contentName (section title) and contentInfos (dramas)
    const normalizedGroups = (data || []).map((group: any) => ({
      groupId: group.groupId,
      groupName: group.contentName,
      contentRemark: group.contentRemark,
      dramas: (group.contentInfos || []).map((item: any) => ({
        shortPlayId: item.shortPlayId,
        shortPlayLibraryId: item.shortPlayLibraryId,
        title: item.shortPlayName,
        cover: item.shortPlayCover || item.groupShortPlayCover,
        labels: item.labelArray || [],
        heatScore: item.heatScoreShow || "",
        scriptName: item.scriptName,
        totalEpisodes: item.totalEpisode || 0,
      })),
    }));

    return encryptedResponse({
      success: true,
      data: normalizedGroups,
    });
  } catch (error) {
    console.error("NetShort Theaters Error:", error);
    return encryptedResponse({ success: false, data: [] });
  }
}

