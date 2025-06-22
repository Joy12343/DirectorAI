"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download, Share2, RotateCcw, Play, Pause, Volume2, VolumeX } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function VideoPage() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
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

  const handleMuteToggle = () => {
    const video = document.getElementById("main-video") as HTMLVideoElement
    if (video) {
      video.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget
    setCurrentTime(video.currentTime)
    setDuration(video.duration)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = document.getElementById("main-video") as HTMLVideoElement
    const time = Number.parseFloat(e.target.value)
    if (video) {
      video.currentTime = time
      setCurrentTime(time)
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
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert("Video link copied to clipboard!")
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/frames">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Frames
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
              <RotateCcw className="w-4 h-4 mr-2" />
              Create New Story
            </Button>
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Your Story Video</h1>
            <p className="text-gray-300 text-lg">
              Your cinematic masterpiece is ready! Watch, download, or share your creation.
            </p>
          </div>

          {/* Video Player */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-8">
            <CardContent className="p-0">
              <div className="relative">
                {videoUrl ? (
                  <video
                    id="main-video"
                    className="w-full aspect-video rounded-t-lg"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleTimeUpdate}
                    poster="/placeholder.svg?height=400&width=700"
                  >
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

                {/* Custom Video Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center space-x-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handlePlayPause}
                      className="text-white hover:bg-white/20"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </Button>

                    <div className="flex-1">
                      <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <span className="text-white text-sm font-mono">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleMuteToggle}
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <Button
              onClick={downloadVideo}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Video
            </Button>
            <Button
              onClick={shareVideo}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-3"
            >
              <Share2 className="w-5 h-5 mr-2" />
              Share Video
            </Button>
          </div>

          {/* Video Details */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Video Details</CardTitle>
            </CardHeader>
            <CardContent>
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
                    <span className="text-gray-300">Duration:</span>
                    <span className="text-white">{formatTime(duration)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Format:</span>
                    <span className="text-white">MP4</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Quality:</span>
                    <span className="text-white">Cinematic</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Success Message */}
          <div className="text-center mt-8 p-6 bg-green-500/10 border border-green-500/20 rounded-lg">
            <h3 className="text-green-300 font-semibold text-lg mb-2">🎉 Video Generated Successfully!</h3>
            <p className="text-green-200">
              Your story has been transformed into a cinematic video. Share it with the world or create another
              masterpiece!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
