import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy for Google Drive file thumbnails.
 * Usage: /api/drive-thumb?id=FILE_ID
 *
 * Returns a thumbnail image for any Drive file.
 * Uses the Google Drive thumbnail endpoint.
 */

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
  }

  try {
    // Google Drive thumbnail URL - generates a small preview image
    const thumbUrl = `https://drive.google.com/thumbnail?id=${id}&sz=w400`;

    const response = await fetch(thumbUrl, {
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Thumbnail failed: ${response.status}` }, { status: response.status });
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const body = response.body;

    if (!body) {
      return NextResponse.json({ error: "No body" }, { status: 502 });
    }

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=604800, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("Drive thumb error:", err);
    return NextResponse.json({ error: "Proxy error" }, { status: 502 });
  }
}
