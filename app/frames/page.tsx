"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Play, Loader2, Film, Download } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { loadImages } from "@/lib/storage"

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
  const [isLoading, setIsLoading] = useState(true)
  const [generationProgress, setGenerationProgress] = useState("")
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [router])

  const loadData = async () => {
    try {
      const storyData = localStorage.getItem("storyData")
      const imagesReady = localStorage.getItem("imagesReady")

      if (storyData) {
        const data = JSON.parse(storyData)
        setScenes(data.Scenes || [])
      }

      if (imagesReady) {
        // Load images from IndexedDB
        const storedSceneImages = await loadImages("sceneImages")
        if (storedSceneImages) {
          setSceneImages(storedSceneImages)
        }
      }

      if (!storyData) {
        router.push("/input")
        return
      }
    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateVideo = async () => {
    setIsGeneratingVideo(true)
    setGenerationProgress("Starting video generation...")

    try {
      const videoUrls: string[] = []

      // Generate video for each scene
      for (let i = 0; i < scenes.length; i++) {
        setCurrentFrame(i)
        const scene = scenes[i]
        const imageUrl = sceneImages[scene.Scene]

        if (imageUrl) {
          setGenerationProgress(`Generating video for Scene ${scene.Scene}...`)

          try {
            console.log(`🎬 Generating video for Scene ${scene.Scene}`)
            console.log(`📝 Prompt: ${scene.Description}`)
            console.log(`📸 Image: ${imageUrl.substring(0, 50)}...`)

            const response = await fetch("/api/generate-video", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                prompt: scene.Description,
                imageUrl: imageUrl, // This is the actual AI-generated scene image
                aspectRatio: "16:9",
              }),
            })

            if (response.ok) {
              const data = await response.json()
              videoUrls.push(data.videoUrl)
              console.log(`✅ Scene ${scene.Scene} video generated: ${data.videoUrl}`)
            } else {
              const errorData = await response.json()
              console.error(`❌ Failed to generate video for scene ${scene.Scene}:`, errorData)
            }
          } catch (error) {
            console.error(`❌ Error generating video for scene ${scene.Scene}:`, error)
          }
        } else {
          console.warn(`⚠️  No image found for Scene ${scene.Scene}`)
        }
      }

      if (videoUrls.length > 0) {
        setGenerationProgress("Compiling videos...")

        // Compile all videos into one
        try {
          const compileResponse = await fetch("/api/generate-video", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              action: "compile",
              video_urls: videoUrls,
            }),
          })

          if (compileResponse.ok) {
            const compileData = await compileResponse.json()
            const finalVideoUrl = compileData.compiled_video_url || videoUrls[0]
            localStorage.setItem("videoUrl", finalVideoUrl)
            localStorage.setItem("allVideoUrls", JSON.stringify(videoUrls))

            setGenerationProgress("Video generation complete!")
            setTimeout(() => {
              router.push("/video")
            }, 1000)
          } else {
            // Fallback: use first video if compilation fails
            const finalVideoUrl = videoUrls[0]
            localStorage.setItem("videoUrl", finalVideoUrl)
            localStorage.setItem("allVideoUrls", JSON.stringify(videoUrls))
            router.push("/video")
          }
        } catch (error) {
          console.error("Video compilation error:", error)
          // Fallback: use first video
          const finalVideoUrl = videoUrls[0]
          localStorage.setItem("videoUrl", finalVideoUrl)
          localStorage.setItem("allVideoUrls", JSON.stringify(videoUrls))
          router.push("/video")
        }
      } else {
        setGenerationProgress("No videos were generated")
        setTimeout(() => setGenerationProgress(""), 3000)
      }
    } catch (error) {
      console.error("Error generating video:", error)
      setGenerationProgress("Video generation failed")
      setTimeout(() => setGenerationProgress(""), 3000)
    } finally {
      setIsGeneratingVideo(false)
    }
  }

  const downloadFrames = () => {
    // Implement frame download logic
    console.log("Downloading frames...")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading frames...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/edit">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Edit
            </Button>
          </Link>
          <div className="flex space-x-4">
            <Button onClick={downloadFrames} variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Download className="w-4 h-4 mr-2" />
              Download Frames
            </Button>
            <Button
              onClick={generateVideo}
              disabled={isGeneratingVideo}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
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
            </Button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Video Frames</h1>
            <p className="text-gray-300 text-lg">Preview your story frames before generating the final video</p>
          </div>

          {/* Progress indicator during video generation */}
          {isGeneratingVideo && (
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-8">
              <CardContent className="p-6">
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
                  <p className="text-gray-300">{generationProgress}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Frames Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scenes.map((scene, index) => (
              <Card
                key={scene.Scene}
                className={`bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300 ${
                  isGeneratingVideo && index === currentFrame ? "ring-2 ring-purple-400" : ""
                }`}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg flex items-center justify-between">
                    <span>Scene {scene.Scene}</span>
                    {isGeneratingVideo && index === currentFrame && (
                      <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Scene Image */}
                  <div className="aspect-video bg-gray-700 rounded-lg overflow-hidden">
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
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Film className="w-12 h-12" />
                      </div>
                    )}
                  </div>

                  {/* Scene Description */}
                  <div>
                    <h4 className="text-white font-medium mb-2">Description</h4>
                    <p className="text-gray-300 text-sm leading-relaxed">{scene.Description}</p>
                  </div>

                  {/* Dialogue */}
                  {scene.Dialogue && (
                    <div>
                      <h4 className="text-white font-medium mb-2">Dialogue</h4>
                      <p className="text-gray-300 text-sm italic">"{scene.Dialogue}"</p>
                    </div>
                  )}

                  {/* Frame Duration */}
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>Duration: ~5s</span>
                    <span>
                      Frame {index + 1}/{scenes.length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Summary */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 mt-8">
            <CardContent className="p-6">
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
