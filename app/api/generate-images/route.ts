import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json()

    if (!description) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 })
    }

    // Try to connect to your image service
    const imageServiceUrl = process.env.IMAGE_SERVICE_URL || "http://localhost:5001"

    console.log(`🖼️ Calling image service at: ${imageServiceUrl}/api/image`)
    console.log(`📝 Description: ${description.substring(0, 100)}...`)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout

    try {
      const response = await fetch(`${imageServiceUrl}/api/image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Image generation error:", errorText)
        throw new Error(`Image service responded with ${response.status}: ${errorText}`)
      }

      const imageData = await response.json()
      console.log("✅ Image generated successfully")

      return NextResponse.json({
        base64_image: imageData.base64_image,
        success: true,
        type: imageData.type || "ai_generated",
      })
    } catch (fetchError) {
      clearTimeout(timeoutId)
      throw fetchError
    }
  } catch (error) {
    console.error("Error generating image:", error)

    // Check if it's a connection error
    if (error instanceof Error && error.message.includes("ECONNREFUSED")) {
      return NextResponse.json(
        {
          error: "Image service is not running. Please start the backend services.",
          details: "Run: python component/image_app.py",
        },
        { status: 503 },
      )
    }

    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json({ error: "Image generation timed out. Please try again." }, { status: 408 })
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate image" },
      { status: 500 },
    )
  }
}
