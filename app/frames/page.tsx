"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Play, Loader2, Film } from "lucide-react"
import Image from "next/image"

interface Scene {
  Scene: number
  Description: string
  Dialogue: string
}

export default function FramesPage() {
  const [scenes, setScenes] = useState<Scene[]>([])
  const [sceneImages, setSceneImages] = useState<Record<number, string>>({})
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false)
  const [currentFrame, setCurrentFrame] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const storyData = localStorage.getItem("storyData")
    const storedSceneImages = localStorage.getItem("sceneImages")

    if (storyData) {
      const data = JSON.parse(storyData)
      setScenes(data.Scenes || [])
    } else {
      router.push("/input")
    }

    if (storedSceneImages) {
      setSceneImages(JSON.parse(storedSceneImages))
    }
  }, [router])

  const generateVideo = async () => {
    setIsGeneratingVideo(true)

    try {
      // Simulate video generation for each scene
      for (let i = 0; i < scenes.length; i++) {
        setCurrentFrame(i)
        const scene = scenes[i]
        const imageUrl = sceneImages[scene.Scene]

        console.log(`🎬 Processing Scene ${scene.Scene}`)
        console.log(`📝 Description: ${scene.Description}`)
        console.log(`📸 Has Image: ${!!imageUrl}`)

        // Simulate processing time
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }

      // For demo purposes, use a sample video URL
      const videoUrl = "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4"
      localStorage.setItem("videoUrl", videoUrl)

      console.log("✅ Video generation complete!")
      router.push("/video")
    } catch (error) {
      console.error("Error generating video:", error)
    } finally {
      setIsGeneratingVideo(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link href="/edit">
            <button className="text-white hover:bg-white/10 px-3 py-2 rounded-lg flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Edit
            </button>
          </Link>
          <button
            onClick={generateVideo}
            disabled={isGeneratingVideo}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg flex items-center disabled:opacity-50"
          >
            {isGeneratingVideo ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Video...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Generate Video
              </>
            )}
          </button>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Video Frames</h1>
            <p className="text-gray-300 text-lg">Preview your story frames before generating the final video</p>
          </div>

          {isGeneratingVideo && (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <Film className="w-8 h-8 text-purple-400 mr-3" />
                  <span className="text-white text-lg font-semibold">
                    Processing Frame {currentFrame + 1} of {scenes.length}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                  <div
                    className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${((currentFrame + 1) / scenes.length) * 100}%` }}
                  ></div>
                </div>
                <p className="text-gray-300">Generating video for Scene {currentFrame + 1}...</p>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scenes.map((scene, index) => (
              <div
                key={scene.Scene}
                className={`bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/15 transition-all duration-300 ${
                  isGeneratingVideo && index === currentFrame ? "ring-2 ring-purple-400" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white text-lg font-semibold">Scene {scene.Scene}</h3>
                  {isGeneratingVideo && index === currentFrame && (
                    <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                  )}
                </div>

                <div className="aspect-video bg-gray-700 rounded-lg mb-4 overflow-hidden flex items-center justify-center">
                  {sceneImages[scene.Scene] ? (
                    <Image
                      src={sceneImages[scene.Scene] || "/placeholder.svg"}
                      alt={`Scene ${scene.Scene}`}
                      width={400}
                      height={225}
                      className="w-full h-full object-cover"
                      unoptimized={sceneImages[scene.Scene].startsWith("data:")}
                    />
                  ) : (
                    <div className="text-center text-gray-400">
                      <Film className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm">No image generated</p>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <h4 className="text-white font-medium mb-2">Description</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">{scene.Description}</p>
                </div>

                {scene.Dialogue && (
                  <div className="mb-4">
                    <h4 className="text-white font-medium mb-2">Dialogue</h4>
                    <p className="text-gray-300 text-sm italic">"{scene.Dialogue}"</p>
                  </div>
                )}

                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>Duration: ~5s</span>
                  <span>
                    Frame {index + 1}/{scenes.length}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mt-8">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-white mb-2">{scenes.length}</div>
                <div className="text-gray-300">Total Scenes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white mb-2">~{scenes.length * 5}s</div>
                <div className="text-gray-300">Estimated Duration</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white mb-2">16:9</div>
                <div className="text-gray-300">Aspect Ratio</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
