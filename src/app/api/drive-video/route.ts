import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy API for Google Drive videos with Range request support.
 * Usage: /api/drive-video?id=FILE_ID
 *
 * Mobile browsers require HTTP 206 Partial Content (Range requests)
 * to play videos. This proxy forwards Range headers from the client
 * to Google Drive and streams the response back.
 */

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
  }

  try {
    const driveUrl = `https://drive.usercontent.google.com/download?id=${id}&export=download`;

    // Forward the Range header from the client (essential for mobile playback)
    const headers: Record<string, string> = {
      "User-Agent": "Mozilla/5.0 (compatible; PromptVault/1.0)",
      Accept: "*/*",
    };

    const rangeHeader = req.headers.get("Range");
    if (rangeHeader) {
      headers["Range"] = rangeHeader;
    }

    const response = await fetch(driveUrl, {
      headers,
      redirect: "follow",
    });

    if (!response.ok && response.status !== 206) {
      return NextResponse.json(
        { error: `Drive returned ${response.status}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type") || "video/mp4";
    const contentLength = response.headers.get("content-length");
    const contentRange = response.headers.get("content-range");
    const acceptRanges = response.headers.get("accept-ranges");
    const body = response.body;

    if (!body) {
      return NextResponse.json({ error: "No body" }, { status: 502 });
    }

    // Build response headers — support Range for mobile video playback
    const resHeaders: Record<string, string> = {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, immutable",
      "Access-Control-Allow-Origin": "*",
      "Accept-Ranges": acceptRanges ?? "bytes",
    };

    if (contentLength) resHeaders["Content-Length"] = contentLength;
    if (contentRange) resHeaders["Content-Range"] = contentRange;

    // Return 206 Partial Content if Drive returned a range response
    const status = response.status === 206 ? 206 : 200;

    return new NextResponse(body, { status, headers: resHeaders });
  } catch (err) {
    console.error("Drive video proxy error:", err);
    return NextResponse.json({ error: "Proxy error" }, { status: 502 });
  }
}
