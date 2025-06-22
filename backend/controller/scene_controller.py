# backend/controller/scene_controller.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from api.scene_generator import generate_scenes  # 假设你主逻辑写在这里

router = APIRouter()

class StoryInput(BaseModel):
    story: str

class Scene(BaseModel):
    scene: int
    description: str
    dialogue: str
    mood: str

@router.post("/api/generate_scenes", response_model=List[Scene])
def post_generate_scenes(input: StoryInput):
    try:
        scenes = generate_scenes(input.story)
        return scenes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
