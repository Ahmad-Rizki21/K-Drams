
import { type NextRequest } from "next/server";
import { encryptedResponse } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");

  if (!query) {
    return encryptedResponse({ error: "Query parameter is required" }, 400);
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.sansekai.my.id/api";
    const response = await fetch(`${baseUrl}/melolo/search?query=${encodeURIComponent(query)}`, {
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
    const data = await response.json();
    return encryptedResponse(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return encryptedResponse({ error: message }, 500);
  }
}

