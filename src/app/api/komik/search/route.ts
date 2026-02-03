import { safeJson, encryptedResponse } from "@/lib/api-utils";
import { NextRequest, NextResponse } from "next/server";

const UPSTREAM_API = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.sansekai.my.id/api") + "/komik";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter 'q' is required" },
      { status: 400 }
    );
  }

  try {
    const url = `${UPSTREAM_API}/search?q=${encodeURIComponent(query)}&type=project`;
    console.log("Fetching komik search from:", url);

    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      console.error("Upstream API error:", response.status, response.statusText);
      // Return empty data on error to prevent app from breaking
      return encryptedResponse([]);
    }

    const json = await safeJson<any>(response);
    // Extract data from nested response: { retcode, message, data: [...] }
    const data = json?.data || [];

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
    console.error("Komik Search API Error:", error);
    return encryptedResponse([]);
  }
}
