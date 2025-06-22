"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function InputPage() {
  const [story, setStory] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()

  const handleGenerate = async () => {
    if (!story.trim()) return

    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate-story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ story }),
      })

      if (response.ok) {
        const data = await response.json()
        // Store the generated data in localStorage for now
        localStorage.setItem("storyData", JSON.stringify(data))
        router.push("/edit")
      } else {
        console.error("Failed to generate story")
      }
    } catch (error) {
      console.error("Error generating story:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Tell Your Story</h1>
            <p className="text-gray-300 text-lg">
              Describe your story idea and let AI transform it into a cinematic experience
            </p>
          </div>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
                Story Input
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Your Story</label>
                <Textarea
                  placeholder="Enter your story here... For example: 'Two teenagers play basketball on a neighborhood court. Edward is confident and skilled, while Michael is determined to prove himself. The game becomes intense as they compete against each other.'"
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  className="min-h-[200px] bg-white/5 border-white/20 text-white placeholder:text-gray-400 resize-none"
                />
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h3 className="text-blue-300 font-medium mb-2">Tips for better results:</h3>
                <ul className="text-blue-200 text-sm space-y-1">
                  <li>• Include character descriptions and personalities</li>
                  <li>• Describe the setting and atmosphere</li>
                  <li>• Mention key actions or conflicts</li>
                  <li>• Keep it concise but detailed (2-3 paragraphs work well)</li>
                </ul>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!story.trim() || isGenerating}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-3 text-lg font-semibold rounded-lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating Story...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Story
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
