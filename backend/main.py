# backend/main.py
from fastapi import FastAPI
from controller import scene_controller

app = FastAPI()

app.include_router(scene_controller.router)

@app.get("/")
def root():
    return {"message": "FastAPI backend is running."}
