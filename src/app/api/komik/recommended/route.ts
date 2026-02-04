import { safeJson, encryptedResponse } from "@/lib/api-utils";
import { NextResponse } from "next/server";

const UPSTREAM_API = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.sansekai.my.id/api") + "/komik";

export async function GET() {
  try {
    const url = `${UPSTREAM_API}/recommended?type=project`;
    console.log("Fetching komik recommended from:", url);

    const response = await fetch(url, {
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
      console.error("Upstream API error:", response.status, response.statusText);
      // Fallback to popular if recommended fails
      return fetchPopularFallback();
    }

    const json = await safeJson<any>(response);
    // Extract data from nested response: { retcode, message, data: [...] }
    const data = json?.data || [];

    // If recommended is empty, fallback to popular
    if (!data || data.length === 0) {
      console.log("Recommended is empty, falling back to popular");
      return fetchPopularFallback();
    }

    // Map API response to our format
    const mappedData = data.map((item: any) => ({
      id: item.manga_id,
      url: item.manga_id,
      judul: item.title || item.alternative_title,
      cover: item.cover_portrait_url || item.cover_image_url,
      lastch: item.latest_chapter_number ? `Ch. ${item.latest_chapter_number}` : undefined,
      lastup: item.latest_chapter_time || item.updated_at || item.created_at,
      type: item.type,
      status: item.status,
      description: item.description,
    }));

    return encryptedResponse(mappedData);
  } catch (error) {
    console.error("Komik Recommended API Error:", error);
    return fetchPopularFallback();
  }
}

// Fallback to popular endpoint
async function fetchPopularFallback() {
  try {
    const url = `${UPSTREAM_API}/popular?type=project`;
    console.log("Fetching komik popular as fallback from:", url);

    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://api.sansekai.my.id/',
        'Origin': 'https://api.sansekai.my.id',
      },
    });

    if (!response.ok) {
      return encryptedResponse([]);
    }

    const json = await safeJson<any>(response);
    const data = json?.data || [];

    const mappedData = data.map((item: any) => ({
      id: item.manga_id,
      url: item.manga_id,
      judul: item.title || item.alternative_title,
      cover: item.cover_portrait_url || item.cover_image_url,
      lastch: item.latest_chapter_number ? `Ch. ${item.latest_chapter_number}` : undefined,
      lastup: item.latest_chapter_time || item.updated_at || item.created_at,
      type: item.type,
      status: item.status,
      description: item.description,
    }));

    return encryptedResponse(mappedData);
  } catch (error) {
    console.error("Komik Popular Fallback Error:", error);
    return encryptedResponse([]);
  }
}

