import { encryptedResponse, safeJson, getUpstreamHeaders } from "@/lib/api-utils";
import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.sansekai.my.id";
const API_URL = BASE_URL.endsWith("/api") ? BASE_URL : `${BASE_URL}/api`;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");

  if (!query) {
    return encryptedResponse({ status_code: 0, msg: "Query param required" }, 400);
  }

  try {
    const res = await fetch(`${API_URL}/flickreels/search?query=${encodeURIComponent(query)}`, {
      headers: getUpstreamHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Upstream API failed with status: ${res.status}`);
    }

    const data = await safeJson(res);
    return encryptedResponse(data);
  } catch (error) {
    console.error("Error fetching FlickReels search:", error);
    return encryptedResponse(
      { status_code: 0, msg: "Internal Server Error" },
      500
    );
  }
}

