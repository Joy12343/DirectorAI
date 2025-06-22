// src/components/InputForm.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateScenes } from "../utils/api";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function InputForm() {
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit() {
    if (!story.trim()) {
      toast.warning("请输入或粘贴一段故事文本");
      return;
    }

    setLoading(true);
    try {
      const scenes = await generateScenes(story);
      localStorage.setItem("scenes", JSON.stringify(scenes));
      toast.success("场景生成成功，准备预览…");
      navigate("/preview");
    } catch (err) {
      console.error(err);
      toast.error("生成失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-start py-12 bg-gray-50 min-h-screen">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="pb-0">
          <CardTitle className="text-2xl font-bold tracking-tight text-center">
            Dream<span className="text-indigo-600">2</span>Movie
          </CardTitle>
          <p className="text-sm text-muted-foreground text-center mt-1">
            输入故事文本，AI 会为你分镜并生成视频
          </p>
        </CardHeader>

        <CardContent className="space-y-6 pt-4">
          {/* 输入框 */}
          <Textarea
            rows={8}
            value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder="Write or paste your story here..."
            className="resize-none"
          />

          {/* 提交按钮 */}
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 text-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin w-5 h-5"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                  />
                </svg>
                Generating…
              </span>
            ) : (
              "Generate Video"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


