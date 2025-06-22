import { NextRequest, NextResponse } from 'next/server'

const LUMA_API_URL = 'https://api.lumalabs.ai/dream-machine/v1/generations'

export async function POST(req: NextRequest) {
  const { prompt, imageUrl, aspectRatio } = await req.json()
  const LUMA_API_KEY = process.env.LUMA_API_KEY

  // Validate inputs
  if (!prompt || !imageUrl) {
    console.error('❌ Missing prompt or imageUrl')
    return NextResponse.json({ error: 'Missing prompt or image URL' }, { status: 400 })
  }

  if (!LUMA_API_KEY) {
    console.error('❌ Missing LUMA_API_KEY')
    return NextResponse.json({ error: 'Missing LUMA_API_KEY environment variable' }, { status: 500 })
  }

  console.log('✅ Prompt:', prompt)
  console.log('✅ Image URL:', imageUrl)
  console.log('✅ Aspect Ratio:', aspectRatio)

  try {
    // 1. Request generation
    const initRes = await fetch(LUMA_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LUMA_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        model: 'ray-2',
        aspect_ratio: aspectRatio || '16:9',
        resolution: '720p',
        duration: '5s',
        loop: false,
        keyframes: {
          frame1: {
            type: 'image',
            url: imageUrl,
          },
        },
      }),
    })

    const initData = await initRes.json()
    console.log('📨 Initial Response:', initData)

    if (!initRes.ok || !initData.id) {
      console.error('❌ Failed to queue video generation:', initData)
      return NextResponse.json({ error: initData.error || 'Luma generation failed' }, { status: 500 })
    }

    const generationId = initData.id
    console.log('⏳ Generation ID:', generationId)

    // 2. Polling loop
    let status = 'pending'
    let videoUrl = null
    let attempts = 0

    while (status !== 'completed' && attempts < 30) {
      await new Promise((res) => setTimeout(res, 5000)) // wait 5 sec
      attempts += 1

      const statusRes = await fetch(`${LUMA_API_URL}/${generationId}`, {
        headers: {
          'Authorization': `Bearer ${LUMA_API_KEY}`,
          'Accept': 'application/json',
        },
      })

      const statusData = await statusRes.json()
      status = statusData.state

      console.log(`🔁 [${attempts}] Status:`, status)

      if (status === 'failed') {
        console.error('❌ Generation failed:', statusData.failure_reason || 'Unknown reason')
        return NextResponse.json({ error: 'Video generation failed', debug: statusData }, { status: 500 })
      }

      if (status === 'completed') {
        videoUrl = statusData.assets?.video
        if (!videoUrl) {
          console.error('⚠️ Completed but no video URL:', statusData)
          return NextResponse.json({ error: 'Video completed but no video URL found' }, { status: 500 })
        }
        break
      }
    }

    if (!videoUrl) {
      console.error('⏰ Timeout or no result after polling')
      return NextResponse.json({ error: 'Generation timeout or no result' }, { status: 504 })
    }

    console.log('✅ Video URL:', videoUrl)
    return NextResponse.json({ videoUrl })
  } catch (err: any) {
    console.error('💥 Unexpected error:', err)
    return NextResponse.json({ error: err.message || 'Unexpected error' }, { status: 500 })
  }
}
