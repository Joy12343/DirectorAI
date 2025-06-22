import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json()

    if (!description) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 })
    }

    // Use port 5001 for image service (not 5000)
    const imageServiceUrl = process.env.IMAGE_SERVICE_URL || "http://localhost:5001"

    console.log(`Calling image service at: ${imageServiceUrl}/api/image`)

    // Create timeout controller manually for compatibility
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    try {
      // Call your Flask image service
      const response = await fetch(`${imageServiceUrl}/api/image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId) // Clear timeout if request completes

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Image generation error:", errorText)
        throw new Error(`Image service responded with ${response.status}: ${errorText}`)
      }

      const imageData = await response.json()
      console.log("Image generated successfully")

      return NextResponse.json(imageData)
    } catch (fetchError) {
      clearTimeout(timeoutId)
      throw fetchError
    }
  } catch (error) {
    console.error("Error generating image:", error)

    // Check if it's a timeout or connection error
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json({ error: "Image generation timed out. Please try again." }, { status: 408 })
    }

    if (error instanceof Error && error.message.includes("ECONNREFUSED")) {
      return NextResponse.json(
        { error: "Image service is not running. Please start the backend services." },
        { status: 503 },
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate image" },
      { status: 500 },
    )
  }
}
