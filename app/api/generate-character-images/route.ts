import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { character } = await request.json()

    if (!character) {
      return NextResponse.json({ error: "Character data is required" }, { status: 400 })
    }

    const imageServiceUrl = process.env.IMAGE_SERVICE_URL || "http://localhost:5001"

    console.log(`👤 Calling character image service at: ${imageServiceUrl}/api/character-image`)
    console.log(`📝 Character: ${character.Name}`)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 90000) // 90 second timeout for character generation

    try {
      const response = await fetch(`${imageServiceUrl}/api/character-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ character }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Character image generation error:", errorText)
        throw new Error(`Character service responded with ${response.status}: ${errorText}`)
      }

      const imageData = await response.json()
      console.log("✅ Character image generated successfully")

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
    console.error("Error generating character image:", error)

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
      return NextResponse.json({ error: "Character image generation timed out. Please try again." }, { status: 408 })
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate character image" },
      { status: 500 },
    )
  }
}
