import Link from "next/link"
import { Play, Film, Sparkles } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white/10 rounded-full backdrop-blur-sm">
              <Film className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Story to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Video</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Transform your stories into cinematic videos with AI. From text to screenplay, characters to scenes, and
            finally to a complete video production.
          </p>
          <Link href="/input">
            <button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center mx-auto">
              <Play className="w-5 h-5 mr-2" />
              Start Creating
            </button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 text-center hover:bg-white/15 transition-all duration-300">
            <div className="p-3 bg-pink-500/20 rounded-full w-fit mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-pink-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">AI Screenplay</h3>
            <p className="text-gray-300">
              Transform your story ideas into professional screenplays with detailed scenes.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 text-center hover:bg-white/15 transition-all duration-300">
            <div className="p-3 bg-blue-500/20 rounded-full w-fit mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Character Generation</h3>
            <p className="text-gray-300">Generate consistent character designs and cinematic scene images.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 text-center hover:bg-white/15 transition-all duration-300">
            <div className="p-3 bg-purple-500/20 rounded-full w-fit mx-auto mb-4">
              <Film className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Video Production</h3>
            <p className="text-gray-300">Automatically generate professional video sequences from your scenes.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
