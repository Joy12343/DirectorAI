import { type NextRequest, NextResponse } from "next/server"

const VIDEO_SERVICE_URL = process.env.VIDEO_SERVICE_URL || "http://localhost:5002"

export async function POST(request: NextRequest) {
  try {
    const { prompt, imageUrl, aspectRatio = "16:9" } = await request.json()

    if (!prompt || !imageUrl) {
      return NextResponse.json({ error: "Prompt and image URL are required" }, { status: 400 })
    }

    console.log("🎬 Calling video service at:", `${VIDEO_SERVICE_URL}/api/video`)
    console.log("📝 Prompt:", prompt.substring(0, 100) + "...")
    console.log("🖼️ Image URL type:", imageUrl.startsWith("data:") ? "base64" : "url")

    // Create timeout controller
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 600000) // 10 minute timeout

    try {
      const response = await fetch(`${VIDEO_SERVICE_URL}/api/video`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          imageUrl: imageUrl,
          aspectRatio: aspectRatio,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Video generation error:", errorText)
        throw new Error(`Video service responded with ${response.status}: ${errorText}`)
      }

      const videoData = await response.json()
      console.log("✅ Video generated successfully")

      return NextResponse.json({
        videoUrl: videoData.videoUrl || videoData.video_url,
        success: true,
      })
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Video generation timed out after 10 minutes")
      }
      throw error
    }
  } catch (error) {
    console.error("Error generating video:", error)

    // Provide more specific error messages
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
      { error: error instanceof Error ? error.message : "Failed to generate video" },
      { status: 500 },
    )
  }
}
