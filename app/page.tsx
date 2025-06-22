import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Play, Sparkles, Film, Wand2 } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
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
            <Button
              size="lg"
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Creating
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-pink-500/20 rounded-full w-fit mx-auto mb-4">
                <Wand2 className="w-8 h-8 text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AI Screenplay</h3>
              <p className="text-gray-300">
                Transform your story ideas into professional screenplays with detailed scenes and character development.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-blue-500/20 rounded-full w-fit mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Character & Scene Generation</h3>
              <p className="text-gray-300">
                Generate consistent character designs and cinematic scene images that bring your story to life.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-purple-500/20 rounded-full w-fit mx-auto mb-4">
                <Film className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Video Production</h3>
              <p className="text-gray-300">
                Automatically generate professional video sequences from your scenes with cinematic quality.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Process Steps */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-12">How It Works</h2>
          <div className="flex flex-col md:flex-row justify-center items-center space-y-8 md:space-y-0 md:space-x-8">
            {[
              { step: "1", title: "Write Your Story", desc: "Input your story idea or prompt" },
              { step: "2", title: "AI Generation", desc: "AI creates screenplay and visuals" },
              { step: "3", title: "Edit & Refine", desc: "Customize scenes and characters" },
              { step: "4", title: "Video Creation", desc: "Generate your final video" },
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-300 text-sm max-w-32 text-center">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
