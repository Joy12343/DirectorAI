// app/api/veo/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { frames } = await req.json()

  try {
    const res = await fetch('http://localhost:5001/generate_video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ frames }),
    })

    if (!res.ok) {
      const error = await res.json()
      return NextResponse.json({ error }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('Failed to reach Python video service:', err)
    return NextResponse.json({ error: 'Failed to connect to video generator' }, { status: 500 })
  }
}
