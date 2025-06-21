'use client'

import { useState } from 'react'

export default function VeoTester() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<string[]>([])

  const handleSubmit = async () => {
    setLoading(true)
    const frameList = input.split('\n').filter((line) => line.trim() !== '')

    const res = await fetch('/api/veo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ frames: frameList }),
    })

    const data = await res.json()
    setImages(data.images)
    setLoading(false)
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-2">Gemini Veo Frame Generator</h2>
      <textarea
        className="w-full h-40 p-2 border rounded mb-4"
        placeholder="Enter each frame description on a new line..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate Frames'}
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {images.map((img, i) => (
          <div key={i} className="border rounded overflow-hidden">
            <img src={img} alt={`Frame ${i + 1}`} className="w-full" />
            <p className="text-center text-sm mt-1">Frame {i + 1}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
