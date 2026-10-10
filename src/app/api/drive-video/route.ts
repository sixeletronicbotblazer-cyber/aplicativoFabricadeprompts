import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy API for Google Drive videos with Range request support.
 * Usage: /api/drive-video?id=FILE_ID
 *
 * Handles Google's virus-scan confirmation page for large files,
 * supports HTTP 206 Partial Content for mobile playback.
 */

/** Follow redirects and extract confirm token from HTML if needed */
async function resolveDriveUrl(id: string): Promise<string> {
  // Method 1: Try usercontent endpoint (works for small/medium files)
  const url1 = `https://drive.usercontent.google.com/download?id=${id}&export=download`;

  const res = await fetch(url1, {
    redirect: "follow",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "*/*",
    },
  });

  // If we got actual video content, this URL works
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("video/") || ct.includes("application/octet-stream") || ct.includes("binary/octet-stream")) {
    return url1;
  }

  // If we got HTML, try to extract confirm token (Google's virus scan page)
  if (ct.includes("text/html")) {
    try {
      const html = await res.text();
      // Look for confirm token in the HTML form
      const match = html.match(/confirm=([a-zA-Z0-9_-]+)/);
      if (match?.[1]) {
        return `https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=${match[1]}`;
      }
    } catch {
      // Ignore parse errors
    }
  }

  // Method 2: Try the uc endpoint as fallback
  return `https://drive.google.com/uc?id=${id}&export=download`;
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
  }

  try {
    const driveUrl = await resolveDriveUrl(id);

    // Forward the Range header from the client (essential for mobile playback)
    const headers: Record<string, string> = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
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
      "Content-Type": contentType.startsWith("text/") ? "video/mp4" : contentType,
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
