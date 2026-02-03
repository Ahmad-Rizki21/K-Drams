import { safeJson, encryptedResponse } from "@/lib/api-utils";
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
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
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
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    let chapters: any[] = [];
    if (chapterResponse.ok) {
      const chapterJson = await safeJson<any>(chapterResponse);
      chapters = chapterJson?.data || [];
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
