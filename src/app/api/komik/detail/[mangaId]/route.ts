import { safeJson, encryptedResponse, getUpstreamHeaders } from "@/lib/api-utils";
import { NextRequest, NextResponse } from "next/server";

const UPSTREAM_API = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.sansekai.my.id/api") + "/komik";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mangaId: string }> }
) {
  const { mangaId } = await params;

  try {
    const response = await fetch(`${UPSTREAM_API}/detail?manga_id=${mangaId}&type=project`, {
      cache: 'no-store',
      headers: getUpstreamHeaders(),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch data" },
        { status: response.status }
      );
    }

    const json = await safeJson<any>(response);
    // Extract data from nested response: { retcode, message, data: {...} }
    const data = json?.data || null;

    if (!data) {
      return NextResponse.json(
        { error: "Komik not found" },
        { status: 404 }
      );
    }

    // Fetch chapter list
    const chapterResponse = await fetch(`${UPSTREAM_API}/chapterlist?manga_id=${mangaId}&type=project`, {
      cache: 'no-store',
      headers: getUpstreamHeaders(),
    });

    let chapters: any[] = [];
    if (chapterResponse.ok) {
      const chapterJson = await safeJson<any>(chapterResponse);
      console.log("Komik ChapterList response:", JSON.stringify(chapterJson).substring(0, 200));
      // Handle different response structures
      if (Array.isArray(chapterJson?.data)) {
        chapters = chapterJson.data;
      } else if (Array.isArray(chapterJson)) {
        chapters = chapterJson;
      } else if (chapterJson?.chapterList && Array.isArray(chapterJson.chapterList)) {
        chapters = chapterJson.chapterList;
      }
      console.log("Parsed chapters count:", chapters.length);
    } else {
      console.error("ChapterList API error:", chapterResponse.status);
    }

    // Add chapters to the data
    const detailWithChapters = {
      ...data,
      chapters,
    };

    return encryptedResponse(detailWithChapters);
  } catch (error) {
    console.error("Komik Detail API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
