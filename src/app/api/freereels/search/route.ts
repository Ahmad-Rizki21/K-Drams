import { NextRequest, NextResponse } from "next/server";
import { encryptedResponse } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.sansekai.my.id/api"}/freereels/search?query=${encodeURIComponent(query)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 0 } // Don't cache search results
    });

    if (!res.ok) {
      throw new Error(`Upstream API failed with status ${res.status}`);
    }

    const data = await res.json();
    return await encryptedResponse(data);
  } catch (error) {
    console.error("Error fetching FreeReels search:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
