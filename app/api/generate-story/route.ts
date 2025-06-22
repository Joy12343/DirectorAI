import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { story } = await request.json()

    if (!story) {
      return NextResponse.json({ error: "Story is required" }, { status: 400 })
    }

    // Use environment variable for backend URL, fallback to localhost
    const backendUrl = process.env.BACKEND_URL || "http://localhost:5000"

    console.log(`Calling backend at: ${backendUrl}/api/claude`)

    // Call your Flask writer service
    const response = await fetch(`${backendUrl}/api/claude`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ story }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Backend error:", errorText)
      throw new Error(`Backend responded with ${response.status}: ${errorText}`)
    }

    const storyData = await response.json()
    console.log("Story generated successfully:", storyData)

    return NextResponse.json(storyData)
  } catch (error) {
    console.error("Error generating story:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate story" },
      { status: 500 },
    )
  }
}
