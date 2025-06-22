import { type NextRequest, NextResponse } from "next/server"

const VIDEO_SERVICE_URL = process.env.VIDEO_SERVICE_URL || "http://localhost:5002"

export async function POST(request: NextRequest) {
  try {
    const { video_urls } = await request.json()

    if (!video_urls || !Array.isArray(video_urls) || video_urls.length === 0) {
      return NextResponse.json({ error: "An array of video URLs is required" }, { status: 400 })
    }

    console.log("🎬 Calling video compile service at:", `${VIDEO_SERVICE_URL}/api/compile-videos`)

    const response = await fetch(`${VIDEO_SERVICE_URL}/api/compile-videos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        video_urls: video_urls,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Video compilation error:", errorText)
      throw new Error(`Video compile service responded with ${response.status}: ${errorText}`)
    }

    const compiledData = await response.json()
    console.log("✅ Video compilation successful")

    return NextResponse.json({
      compiled_video_url: compiledData.compiled_video_url,
      success: true,
    })
  } catch (error) {
    console.error("Error compiling video:", error)
    if (error instanceof Error && error.message.includes("ECONNREFUSED")) {
      return NextResponse.json(
        {
          error: "Video service is not running. Please start the video service on port 5002.",
          details: "Run: python component/video_app.py",
        },
        { status: 503 },
      )
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to compile video" },
      { status: 500 },
    )
  }
} 