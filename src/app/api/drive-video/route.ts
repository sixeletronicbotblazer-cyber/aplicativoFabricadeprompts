import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy API for Google Drive videos.
 * Usage: /api/drive-video?id=FILE_ID
 * Fetches the video from Google Drive and streams it to the browser.
 */
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
  }

  try {
    // Use Google Drive's download endpoint with proper headers
    const driveUrl = `https://drive.usercontent.google.com/download?id=${id}&export=download`;

    const response = await fetch(driveUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; PromptVault/1.0)",
        Accept: "*/*",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Drive returned ${response.status}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type") || "video/mp4";
    const body = response.body;

    if (!body) {
      return NextResponse.json({ error: "No body" }, { status: 502 });
    }

    // Stream the response back
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("Drive video proxy error:", err);
    return NextResponse.json({ error: "Proxy error" }, { status: 502 });
  }
}
