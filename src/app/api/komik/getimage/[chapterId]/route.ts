import { safeJson, encryptedResponse } from "@/lib/api-utils";
import { NextRequest, NextResponse } from "next/server";

const UPSTREAM_API = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.sansekai.my.id/api") + "/komik";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  const { chapterId } = await params;

  try {
    const response = await fetch(`${UPSTREAM_API}/getimage?chapter_id=${chapterId}&type=project`, {
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
    // Extract data from nested response: { retcode, message, data: { chapter: { data: [...] } } }
    const chapterData = json?.data?.chapter?.data || [];

    // Map to our format
    const images = chapterData.map((url: string, index: number) => ({
      url,
      index,
    }));

    return encryptedResponse({
      chapterId,
      images,
    });
  } catch (error) {
    console.error("Komik GetImage API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
