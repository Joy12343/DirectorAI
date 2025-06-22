"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Download, Share2, RotateCcw, Play } from "lucide-react"

export default function VideoPage() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const url = localStorage.getItem("videoUrl")
    if (url) {
      setVideoUrl(url)
    } else {
      router.push("/frames")
    }
  }, [router])

  const handlePlayPause = () => {
    const video = document.getElementById("main-video") as HTMLVideoElement
    if (video) {
      if (isPlaying) {
        video.pause()
      } else {
        video.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const downloadVideo = () => {
    if (videoUrl) {
      const a = document.createElement("a")
      a.href = videoUrl
      a.download = "story-video.mp4"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  const shareVideo = async () => {
    if (navigator.share && videoUrl) {
      try {
        await navigator.share({
          title: "My Story Video",
          text: "Check out this video I created with AI!",
          url: videoUrl,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("Video link copied to clipboard!")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link href="/frames">
            <button className="text-white hover:bg-white/10 px-3 py-2 rounded-lg flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Frames
            </button>
          </Link>
          <Link href="/">
            <button className="border border-white/20 text-white hover:bg-white/10 px-4 py-2 rounded-lg flex items-center">
              <RotateCcw className="w-4 h-4 mr-2" />
              Create New Story
            </button>
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Your Story Video</h1>
            <p className="text-gray-300 text-lg">
              Your cinematic masterpiece is ready! Watch, download, or share your creation.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-0 mb-8">
            <div className="relative">
              {videoUrl ? (
                <video id="main-video" className="w-full aspect-video rounded-t-lg" controls>
                  <source src={videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="w-full aspect-video bg-gray-800 rounded-t-lg flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <Play className="w-16 h-16 mx-auto mb-4" />
                    <p>Video not available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={downloadVideo}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-6 rounded-lg flex items-center justify-center"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Video
            </button>
            <button
              onClick={shareVideo}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-3 px-6 rounded-lg flex items-center justify-center"
            >
              <Share2 className="w-5 h-5 mr-2" />
              Share Video
            </button>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <h2 className="text-white text-xl font-semibold mb-4">Video Details</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Resolution:</span>
                  <span className="text-white">1920x1080 (Full HD)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Aspect Ratio:</span>
                  <span className="text-white">16:9</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Frame Rate:</span>
                  <span className="text-white">24 FPS</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Format:</span>
                  <span className="text-white">MP4</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Quality:</span>
                  <span className="text-white">Cinematic</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Status:</span>
                  <span className="text-green-400">Complete</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
