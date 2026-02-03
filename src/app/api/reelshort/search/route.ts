import { safeJson, encryptedResponse } from "@/lib/api-utils";
import { NextRequest, NextResponse } from "next/server";

const UPSTREAM_API = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.sansekai.my.id/api") + "/reelshort";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query");
    const page = searchParams.get("page") || "1";

    if (!query) {
      return encryptedResponse({ success: true, data: [] });
    }

    const response = await fetch(
      `${UPSTREAM_API}/search?query=${encodeURIComponent(query)}&page=${page}`,
      {
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
      }
    );

    if (!response.ok) {
      return encryptedResponse({ success: false, data: [] });
    }

    const data = await safeJson<any>(response);
    
    // API returns { success, results: [...] } where results have bookId, title, cover, etc
    // We need to normalize to our format: data array with book_id, book_title, book_pic
    const results = data.results || [];
    
    const normalizedResults = results.map((item: any) => ({
      book_id: item.bookId,
      book_title: item.title,
      book_pic: item.cover,
      special_desc: item.description,
      chapter_count: item.chapterCount,
      theme: item.tag,
    }));

    return encryptedResponse({ success: true, data: normalizedResults });
  } catch (error) {
    console.error("ReelShort Search Error:", error);
    return encryptedResponse({ success: false, data: [] });
  }
}


