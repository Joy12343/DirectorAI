import time
import requests
import os

LUMA_API_URL = 'https://api.lumalabs.ai/dream-machine/v1/generations'
LUMA_API_KEY = os.getenv("LUMA_API_KEY", "")  # Get from environment

def generate_luma_video(prompt: str, image_url: str, aspect_ratio: str = '16:9') -> str:
    enhanced_prompt = f"Scene Description: {prompt}, filmed in cinematic style with dramatic lighting, realistic motion, shallow depth of field, and professional film quality. Emphasize dynamic camera angles and atmosphere."

    if not prompt or not image_url:
        raise ValueError("Missing prompt or image URL")

    if not LUMA_API_KEY:
        raise EnvironmentError("Missing LUMA_API_KEY environment variable")

    print(f"✅ Prompt: {enhanced_prompt}")
    print(f"✅ Image URL: {image_url}")
    print(f"✅ Aspect Ratio: {aspect_ratio}")

    # Step 1: Initiate generation
    init_payload = {
        "prompt": enhanced_prompt,
        "model": "ray-2",
        "aspect_ratio": aspect_ratio,
        "resolution": "720p",
        "duration": "5s",
        "loop": False,
        "keyframes": {
            "frame0": {
                "type": "image",
                "url": image_url
            }
        }
    }

    try:
        init_res = requests.post(
            LUMA_API_URL,
            headers={
                "Authorization": f"Bearer {LUMA_API_KEY}",
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            json=init_payload
        )

        init_data = init_res.json()
        print("📨 Initial Response:", init_data)

        if 'id' not in init_data:
            raise RuntimeError(f"Luma generation failed: {init_data.get('error') or 'Unknown error'}")

        generation_id = init_data['id']
        print(f"⏳ Generation ID: {generation_id}")

        # Step 2: Poll status
        status = "pending"
        attempts = 0
        video_url = None

        while status != "completed" and attempts < 60:
            time.sleep(5)
            attempts += 1

            status_res = requests.get(
                f"{LUMA_API_URL}/{generation_id}",
                headers={"Authorization": f"Bearer {LUMA_API_KEY}"}
            )
            status_data = status_res.json()
            status = status_data.get("state")

            print(f"🔁 [{attempts}] Status: {status}")

            if status == "failed":
                reason = status_data.get("failure_reason", "Unknown reason")
                raise RuntimeError(f"Video generation failed: {reason}")

            if status == "completed":
                video_url = status_data.get("assets", {}).get("video")
                if not video_url:
                    raise RuntimeError("Video completed but no video URL found")
                break

        if not video_url:
            raise TimeoutError("Video generation timed out or returned no result")

        print(f"✅ Video URL: {video_url}")
        return video_url

    except Exception as e:
        print(f"💥 Unexpected error: {e}")
        raise

if __name__ == "__main__":
    prompt = "Dynamic medium shot of Edward attempting a crossover dribble, motion blur effect, dramatic side lighting capturing the competitive energy and movement."
    image_url = "https://res.cloudinary.com/dxrr6xfnr/image/upload/v1750563689/scene_04_vfl0ev.png"
    aspect_ratio = "16:9"

    try:
        result = generate_luma_video(prompt, image_url, aspect_ratio)
        print("🎥 Final Video:", result)
    except Exception as err:
        print("❌ Error:", err)
