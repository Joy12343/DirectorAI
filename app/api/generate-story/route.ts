import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { story } = await request.json()

    if (!story) {
      return NextResponse.json({ error: "Story is required" }, { status: 400 })
    }

    const backendUrl = process.env.BACKEND_URL || "http://localhost:5000"

    const response = await fetch(`${backendUrl}/api/claude`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ story }),
    })

    if (!response.ok) {
      // Return mock data if backend is not available
      const mockData = {
        Background:
          "A modern urban basketball court in a residential neighborhood during late afternoon. The court has weathered concrete with faded paint lines, chain-link fencing around the perimeter, and a single hoop with a slightly bent rim.",
        Characters: [
          {
            Name: "Edward",
            Description:
              "17-year-old athletic teenager, 5'10\" with short dark hair, wearing a faded red tank top, black basketball shorts, and worn high-top sneakers.",
            Personality:
              "Competitive, focused, slightly cocky but good-natured. Quick to trash talk but respects good plays.",
            Role: "Protagonist",
          },
          {
            Name: "Michael",
            Description:
              "16-year-old lean teenager, 5'8\" with curly brown hair, wearing a white t-shirt, blue shorts, and clean basketball shoes.",
            Personality: "Methodical, hardworking, less experienced but eager to prove himself. Quiet but determined.",
            Role: "Supporting character",
          },
        ],
        Scenes: [
          {
            Scene: 1,
            Description:
              "Wide shot of empty basketball court, golden hour lighting, dramatic shadows across weathered concrete.",
            Dialogue: "",
          },
          {
            Scene: 2,
            Description:
              "Medium shot of Edward dribbling confidently toward camera, determined expression, warm afternoon lighting.",
            Dialogue: "Come on Mike, let's see what you got!",
          },
          {
            Scene: 3,
            Description:
              "Close-up of Michael's focused face, sweat glistening, intense concentration as he prepares to defend.",
            Dialogue: "I'm ready for you, Ed.",
          },
        ],
      }

      return NextResponse.json(mockData)
    }

    const storyData = await response.json()
    return NextResponse.json(storyData)
  } catch (error) {
    console.error("Error generating story:", error)

    // Return mock data on error
    const mockData = {
      Background: "A modern setting with dramatic lighting and cinematic atmosphere.",
      Characters: [
        {
          Name: "Main Character",
          Description: "A determined individual facing challenges.",
          Personality: "Brave, thoughtful, and resilient.",
          Role: "Protagonist",
        },
      ],
      Scenes: [
        {
          Scene: 1,
          Description: "Opening scene with dramatic lighting and establishing shot.",
          Dialogue: "This is where our story begins.",
        },
      ],
    }

    return NextResponse.json(mockData)
  }
}
