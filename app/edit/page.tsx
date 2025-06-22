"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Users, Film, Edit3, Play, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { saveImages, loadImages } from "@/lib/storage"

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
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const data = localStorage.getItem("storyData")
    if (data) {
      setStoryData(JSON.parse(data))
      // Load existing images from IndexedDB
      loadStoredImages()
    } else {
      router.push("/input")
    }
  }, [router])

  const loadStoredImages = async () => {
    try {
      const [storedCharacterImages, storedSceneImages] = await Promise.all([
        loadImages("characterImages"),
        loadImages("sceneImages"),
      ])

      if (storedCharacterImages) {
        setCharacterImages(storedCharacterImages)
      }
      if (storedSceneImages) {
        setSceneImages(storedSceneImages)
      }
    } catch (error) {
      console.error("Failed to load stored images:", error)
    }
  }

  const updateCharacter = (index: number, field: keyof Character, value: string) => {
    if (!storyData) return
    const newData = { ...storyData }
    newData.Characters[index][field] = value
    setStoryData(newData)
    localStorage.setItem("storyData", JSON.stringify(newData))
  }

  const updateScene = (index: number, field: keyof Scene, value: string | number) => {
    if (!storyData) return
    const newData = { ...storyData }
    newData.Scenes[index][field] = value as any
    setStoryData(newData)
    localStorage.setItem("storyData", JSON.stringify(newData))
  }

  const generateImages = async () => {
    if (!storyData) return

    setIsGeneratingImages(true)
    setGenerationProgress("Starting image generation...")

    try {
      // Generate character images first
      setGenerationProgress("Generating character images...")
      const newCharacterImages: Record<string, string> = { ...characterImages }

      for (const character of storyData.Characters) {
        // Skip if image already exists
        if (characterImages[character.Name]) {
          continue
        }

        try {
          setGenerationProgress(`Generating image for ${character.Name}...`)

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
              newCharacterImages[character.Name] = `data:image/png;base64,${data.base64_image}`
              console.log(`Generated ${data.type} image for ${character.Name}`)
            }
          } else {
            const errorText = await response.text()
            console.error(`Failed to generate character image for ${character.Name}:`, errorText)
            newCharacterImages[character.Name] =
              `/placeholder.svg?height=300&width=200&text=${encodeURIComponent(character.Name)}`
          }

          // Update character images immediately so user can see progress
          setCharacterImages((prev) => ({ ...prev, [character.Name]: newCharacterImages[character.Name] }))
          await new Promise((resolve) => setTimeout(resolve, 1000))
        } catch (error) {
          console.error(`Failed to generate image for ${character.Name}:`, error)
          newCharacterImages[character.Name] =
            `/placeholder.svg?height=300&width=200&text=${encodeURIComponent(character.Name)}`
          setCharacterImages((prev) => ({ ...prev, [character.Name]: newCharacterImages[character.Name] }))
        }
      }

      // Generate scene images
      setGenerationProgress("Generating scene images...")
      const newSceneImages: Record<number, string> = { ...sceneImages }

      for (const scene of storyData.Scenes) {
        // Skip if image already exists
        if (sceneImages[scene.Scene]) {
          continue
        }

        try {
          setGenerationProgress(`Generating image for Scene ${scene.Scene}...`)

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
              newSceneImages[scene.Scene] = `data:image/png;base64,${data.base64_image}`
              console.log(`Generated ${data.type} image for Scene ${scene.Scene}`)
            }
          } else {
            const errorText = await response.text()
            console.error(`Failed to generate scene ${scene.Scene}:`, errorText)
            newSceneImages[scene.Scene] = `/placeholder.svg?height=200&width=350&text=Scene ${scene.Scene}`
          }

          setSceneImages((prev) => ({ ...prev, [scene.Scene]: newSceneImages[scene.Scene] }))
          await new Promise((resolve) => setTimeout(resolve, 1000))
        } catch (error) {
          console.error(`Failed to generate image for scene ${scene.Scene}:`, error)
          newSceneImages[scene.Scene] = `/placeholder.svg?height=200&width=350&text=Scene ${scene.Scene}`
          setSceneImages((prev) => ({ ...prev, [scene.Scene]: newSceneImages[scene.Scene] }))
        }
      }

      setGenerationProgress("Saving images...")
      // Save images to IndexedDB
      await saveImages("characterImages", newCharacterImages)
      await saveImages("sceneImages", newSceneImages)

      setGenerationProgress("Image generation complete!")
    } catch (error) {
      console.error("Error generating images:", error)
      setGenerationProgress("Error generating images")
    } finally {
      setIsGeneratingImages(false)
      setTimeout(() => setGenerationProgress(""), 3000)
    }
  }

  const generateSingleCharacterImage = async (character: Character) => {
    try {
      setGenerationProgress(`Generating image for ${character.Name}...`)

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
          const newImage = `data:image/png;base64,${data.base64_image}`
          setCharacterImages((prev) => ({
            ...prev,
            [character.Name]: newImage,
          }))

          // Save to IndexedDB
          const updatedImages = { ...characterImages, [character.Name]: newImage }
          await saveImages("characterImages", updatedImages)

          console.log(`Generated ${data.type} image for ${character.Name}`)
        }
      } else {
        const errorText = await response.text()
        console.error(`Failed to generate character image for ${character.Name}:`, errorText)
      }
    } catch (error) {
      console.error(`Failed to generate image for ${character.Name}:`, error)
    } finally {
      setGenerationProgress("")
    }
  }

  const proceedToFrames = async () => {
    setIsSaving(true)
    try {
      // Save images to IndexedDB before proceeding
      await saveImages("characterImages", characterImages)
      await saveImages("sceneImages", sceneImages)

      // Store a flag to indicate images are saved
      localStorage.setItem("imagesReady", "true")

      router.push("/frames")
    } catch (error) {
      console.error("Failed to save images:", error)
      alert("Failed to save images. Please try again.")
    } finally {
      setIsSaving(false)
    }
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/input">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <Button
            onClick={proceedToFrames}
            disabled={isSaving}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Continue to Frames
              </>
            )}
          </Button>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Edit Your Story</h1>
            <p className="text-gray-300 text-lg">Refine your characters, scenes, and generate visual elements</p>
          </div>

          {/* Progress indicator */}
          {(isGeneratingImages || generationProgress) && (
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-8">
              <CardContent className="p-6">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-400" />
                  <p className="text-white">{generationProgress}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Background */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Edit3 className="w-5 h-5 mr-2 text-purple-400" />
                Background Setting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={storyData.Background}
                onChange={(e) => setStoryData({ ...storyData, Background: e.target.value })}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Characters */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-400" />
                  Characters ({storyData.Characters.length})
                </div>
                <Button
                  onClick={generateImages}
                  disabled={isGeneratingImages}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isGeneratingImages ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate All Images"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {storyData.Characters.map((character, index) => (
                  <div key={index} className="space-y-4 p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-4">
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
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => generateSingleCharacterImage(character)}
                              disabled={isGeneratingImages || !!generationProgress}
                              className="text-xs px-2 py-1 h-6"
                            >
                              Generate
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <Input
                          value={character.Name}
                          onChange={(e) => updateCharacter(index, "Name", e.target.value)}
                          className="bg-white/5 border-white/20 text-white font-semibold mb-2"
                          placeholder="Character Name"
                        />
                        <Input
                          value={character.Role}
                          onChange={(e) => updateCharacter(index, "Role", e.target.value)}
                          className="bg-white/5 border-white/20 text-white text-sm"
                          placeholder="Role"
                        />
                      </div>
                    </div>
                    <Textarea
                      value={character.Description}
                      onChange={(e) => updateCharacter(index, "Description", e.target.value)}
                      className="bg-white/5 border-white/20 text-white text-sm"
                      placeholder="Physical description..."
                      rows={2}
                    />
                    <Textarea
                      value={character.Personality}
                      onChange={(e) => updateCharacter(index, "Personality", e.target.value)}
                      className="bg-white/5 border-white/20 text-white text-sm"
                      placeholder="Personality traits..."
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Scenes */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Film className="w-5 h-5 mr-2 text-green-400" />
                Scenes ({storyData.Scenes.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {storyData.Scenes.map((scene, index) => (
                  <div key={index} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-start space-x-4">
                      <div className="w-32 h-20 bg-gray-600 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
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
                          <span className="text-gray-400 text-xs text-center">Scene {scene.Scene}</span>
                        )}
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-semibold">Scene {scene.Scene}</span>
                        </div>
                        <Textarea
                          value={scene.Description}
                          onChange={(e) => updateScene(index, "Description", e.target.value)}
                          className="bg-white/5 border-white/20 text-white text-sm"
                          placeholder="Scene description..."
                          rows={2}
                        />
                        <Textarea
                          value={scene.Dialogue}
                          onChange={(e) => updateScene(index, "Dialogue", e.target.value)}
                          className="bg-white/5 border-white/20 text-white text-sm"
                          placeholder="Dialogue..."
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
