import { safeJson, encryptedResponse, getUpstreamHeaders } from "@/lib/api-utils";
import { NextResponse } from "next/server";

const UPSTREAM_API = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.sansekai.my.id/api") + "/komik";

export async function GET() {
  try {
    const url = `${UPSTREAM_API}/recommended?type=project`;
    console.log("Fetching komik recommended from:", url);

    const response = await fetch(url, {
      cache: 'no-store',
      headers: getUpstreamHeaders(),
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
      headers: getUpstreamHeaders(),
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

