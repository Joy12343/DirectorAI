import { NextRequest, NextResponse } from "next/server";

const VIDEO_SERVICE_URL =
  process.env.VIDEO_SERVICE_URL || "http://localhost:5002";

/**
 * POST /api/video
 * Proxies the request to the Flask service at 5002.
 * Body: { prompt: string, imageUrl: string, aspectRatio?: string }
 */
export async function POST(request: NextRequest) {
  console.log("🛎️  [Next] /api/video hit");

  // 1) read and sanity-check body
  const { prompt, imageUrl, aspectRatio = "16:9" } = await request.json();
  if (!prompt || !imageUrl) {
    return NextResponse.json(
      { error: "Prompt and image URL are required" },
      { status: 400 },
    );
  }

  // 2) forward to Flask
  const upstream = await fetch(`${VIDEO_SERVICE_URL}/api/video`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, imageUrl, aspectRatio }),
  });

  // 3) propagate upstream failures verbatim
  if (!upstream.ok) {
    const text = await upstream.text();
    console.error("⚠️  Upstream error:", upstream.status, text);
    return NextResponse.json(
      { error: text || "Video service error" },
      { status: upstream.status },
    );
  }

  // 4) return the JSON { success, videoUrl } from Flask
  const data = await upstream.json();
  return NextResponse.json({
    success: true,
    videoUrl: data.videoUrl ?? data.video_url,
  });
}
