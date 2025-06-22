"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Users, Film, Play, Loader2, RefreshCw } from "lucide-react"
import Image from "next/image"

interface Character {
  Name: string
  Description: string
  Personality: string
  Role: string
}

interface Scene {
  Scene: number
  Description: string
  Dialogue: string
}

interface StoryData {
  Background: string
  Characters: Character[]
  Scenes: Scene[]
}

export default function EditPage() {
  const [storyData, setStoryData] = useState<StoryData | null>(null)
  const [isGeneratingImages, setIsGeneratingImages] = useState(false)
  const [characterImages, setCharacterImages] = useState<Record<string, string>>({})
  const [sceneImages, setSceneImages] = useState<Record<number, string>>({})
  const [generationProgress, setGenerationProgress] = useState("")
  const [generationLog, setGenerationLog] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    const data = localStorage.getItem("storyData")
    if (data) {
      setStoryData(JSON.parse(data))
    } else {
      router.push("/input")
    }
  }, [router])

  const addToLog = (message: string) => {
    setGenerationLog((prev) => [...prev, message])
    console.log(message)
  }

  const generateCharacterImage = async (character: Character) => {
    try {
      addToLog(`🎨 Generating image for ${character.Name}...`)

      const response = await fetch("/api/generate-character-images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ character }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.base64_image) {
          const imageUrl = `data:image/png;base64,${data.base64_image}`
          setCharacterImages((prev) => ({ ...prev, [character.Name]: imageUrl }))
          addToLog(`✅ Generated ${data.type || "AI"} image for ${character.Name}`)
          return imageUrl
        }
      } else {
        const errorText = await response.text()
        addToLog(`❌ Failed to generate image for ${character.Name}: ${errorText}`)
      }
    } catch (error) {
      addToLog(`❌ Error generating image for ${character.Name}: ${error}`)
    }

    // Fallback placeholder
    const placeholder = `/placeholder.svg?height=300&width=200&text=${encodeURIComponent(character.Name)}`
    setCharacterImages((prev) => ({ ...prev, [character.Name]: placeholder }))
    return placeholder
  }

  const generateSceneImage = async (scene: Scene) => {
    try {
      addToLog(`🎬 Generating image for Scene ${scene.Scene}...`)

      const response = await fetch("/api/generate-images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description: scene.Description }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.base64_image) {
          const imageUrl = `data:image/png;base64,${data.base64_image}`
          setSceneImages((prev) => ({ ...prev, [scene.Scene]: imageUrl }))
          addToLog(`✅ Generated ${data.type || "AI"} image for Scene ${scene.Scene}`)
          return imageUrl
        }
      } else {
        const errorText = await response.text()
        addToLog(`❌ Failed to generate image for Scene ${scene.Scene}: ${errorText}`)
      }
    } catch (error) {
      addToLog(`❌ Error generating image for Scene ${scene.Scene}: ${error}`)
    }

    // Fallback placeholder
    const placeholder = `/placeholder.svg?height=200&width=350&text=Scene ${scene.Scene}`
    setSceneImages((prev) => ({ ...prev, [scene.Scene]: placeholder }))
    return placeholder
  }

  const generateAllImages = async () => {
    if (!storyData) return

    setIsGeneratingImages(true)
    setGenerationProgress("Starting image generation...")
    setGenerationLog([])

    try {
      addToLog("🚀 Starting image generation process...")

      // Generate character images
      if (storyData.Characters.length > 0) {
        setGenerationProgress("Generating character images...")
        addToLog(`👥 Generating images for ${storyData.Characters.length} characters...`)

        for (const character of storyData.Characters) {
          if (!characterImages[character.Name]) {
            await generateCharacterImage(character)
            // Small delay between requests
            await new Promise((resolve) => setTimeout(resolve, 1000))
          } else {
            addToLog(`⏭️ Skipping ${character.Name} (already generated)`)
          }
        }
      }

      // Generate scene images
      if (storyData.Scenes.length > 0) {
        setGenerationProgress("Generating scene images...")
        addToLog(`🎬 Generating images for ${storyData.Scenes.length} scenes...`)

        for (const scene of storyData.Scenes) {
          if (!sceneImages[scene.Scene]) {
            await generateSceneImage(scene)
            // Small delay between requests
            await new Promise((resolve) => setTimeout(resolve, 1000))
          } else {
            addToLog(`⏭️ Skipping Scene ${scene.Scene} (already generated)`)
          }
        }
      }

      setGenerationProgress("Image generation complete!")
      addToLog("🎉 All images generated successfully!")
    } catch (error) {
      addToLog(`❌ Error during image generation: ${error}`)
      setGenerationProgress("Error generating images")
    } finally {
      setIsGeneratingImages(false)
      setTimeout(() => setGenerationProgress(""), 3000)
    }
  }

  const generateSingleCharacterImage = async (character: Character) => {
    setGenerationProgress(`Generating image for ${character.Name}...`)
    await generateCharacterImage(character)
    setGenerationProgress("")
  }

  const generateSingleSceneImage = async (scene: Scene) => {
    setGenerationProgress(`Generating image for Scene ${scene.Scene}...`)
    await generateSceneImage(scene)
    setGenerationProgress("")
  }

  const proceedToFrames = () => {
    // Save images to localStorage for the frames page
    localStorage.setItem("characterImages", JSON.stringify(characterImages))
    localStorage.setItem("sceneImages", JSON.stringify(sceneImages))
    router.push("/frames")
  }

  if (!storyData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading story data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link href="/input">
            <button className="text-white hover:bg-white/10 px-3 py-2 rounded-lg flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
          </Link>
          <button
            onClick={proceedToFrames}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg flex items-center"
          >
            <Play className="w-4 h-4 mr-2" />
            Continue to Frames
          </button>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Edit Your Story</h1>
            <p className="text-gray-300 text-lg">Refine your characters, scenes, and generate visual elements</p>
          </div>

          {/* Progress and Log */}
          {(isGeneratingImages || generationProgress || generationLog.length > 0) && (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
              <div className="text-center mb-4">
                {isGeneratingImages && <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-400" />}
                <p className="text-white font-semibold">{generationProgress}</p>
              </div>

              {generationLog.length > 0 && (
                <div className="bg-black/20 rounded-lg p-4 max-h-40 overflow-y-auto">
                  <h4 className="text-white font-medium mb-2">Generation Log:</h4>
                  {generationLog.map((log, index) => (
                    <p key={index} className="text-gray-300 text-sm font-mono">
                      {log}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Background */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
            <h2 className="text-white text-xl font-semibold mb-4">Background Setting</h2>
            <textarea
              value={storyData.Background}
              onChange={(e) => setStoryData({ ...storyData, Background: e.target.value })}
              className="w-full bg-white/5 border border-white/20 text-white placeholder:text-gray-400 rounded-lg p-4 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Characters */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center text-white">
                <Users className="w-5 h-5 mr-2 text-blue-400" />
                <h2 className="text-xl font-semibold">Characters ({storyData.Characters.length})</h2>
              </div>
              <button
                onClick={generateAllImages}
                disabled={isGeneratingImages}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50"
              >
                {isGeneratingImages ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Generate All Images
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {storyData.Characters.map((character, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-20 h-24 bg-gray-600 rounded-lg overflow-hidden flex items-center justify-center relative">
                      {characterImages[character.Name] ? (
                        <Image
                          src={characterImages[character.Name] || "/placeholder.svg"}
                          alt={character.Name}
                          width={80}
                          height={96}
                          className="w-full h-full object-cover"
                          unoptimized={characterImages[character.Name].startsWith("data:")}
                        />
                      ) : (
                        <div className="text-center">
                          <span className="text-gray-400 text-xs block mb-2">{character.Name}</span>
                          <button
                            onClick={() => generateSingleCharacterImage(character)}
                            disabled={isGeneratingImages || !!generationProgress}
                            className="text-xs px-2 py-1 h-6 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
                          >
                            Generate
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        value={character.Name}
                        className="w-full bg-white/5 border border-white/20 text-white font-semibold mb-2 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Character Name"
                        readOnly
                      />
                      <input
                        value={character.Role}
                        className="w-full bg-white/5 border border-white/20 text-white text-sm px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Role"
                        readOnly
                      />
                    </div>
                  </div>
                  <textarea
                    value={character.Description}
                    className="w-full bg-white/5 border border-white/20 text-white text-sm mb-3 px-3 py-2 rounded h-16 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Physical description..."
                    readOnly
                  />
                  <textarea
                    value={character.Personality}
                    className="w-full bg-white/5 border border-white/20 text-white text-sm px-3 py-2 rounded h-16 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Personality traits..."
                    readOnly
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Scenes */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <div className="flex items-center text-white mb-6">
              <Film className="w-5 h-5 mr-2 text-green-400" />
              <h2 className="text-xl font-semibold">Scenes ({storyData.Scenes.length})</h2>
            </div>
            <div className="space-y-6">
              {storyData.Scenes.map((scene, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-32 h-20 bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {sceneImages[scene.Scene] ? (
                        <Image
                          src={sceneImages[scene.Scene] || "/placeholder.svg"}
                          alt={`Scene ${scene.Scene}`}
                          width={128}
                          height={80}
                          className="w-full h-full object-cover"
                          unoptimized={sceneImages[scene.Scene].startsWith("data:")}
                        />
                      ) : (
                        <div className="text-center">
                          <span className="text-gray-400 text-xs block mb-1">Scene {scene.Scene}</span>
                          <button
                            onClick={() => generateSingleSceneImage(scene)}
                            disabled={isGeneratingImages || !!generationProgress}
                            className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50"
                          >
                            Generate
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center">
                        <span className="text-white font-semibold">Scene {scene.Scene}</span>
                      </div>
                      <textarea
                        value={scene.Description}
                        className="w-full bg-white/5 border border-white/20 text-white text-sm px-3 py-2 rounded h-16 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Scene description..."
                        readOnly
                      />
                      <textarea
                        value={scene.Dialogue}
                        className="w-full bg-white/5 border border-white/20 text-white text-sm px-3 py-2 rounded h-16 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Dialogue..."
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
