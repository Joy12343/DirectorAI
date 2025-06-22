import os
import base64
from datetime import datetime
import anthropic
from dotenv import load_dotenv
import json
import time
import requests

# Load environment variables
load_dotenv()
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
LUMA_API_KEY = os.getenv("LUMA_API_KEY")
LUMA_API_URL = 'https://api.lumalabs.ai/dream-machine/v1/generations'

def get_image_media_type(image_path: str) -> str:
    """Determine the media type of an image based on its extension."""
    if image_path.lower().endswith(".png"):
        return "image/png"
    elif image_path.lower().endswith((".jpg", ".jpeg")):
        return "image/jpeg"
    elif image_path.lower().endswith(".gif"):
        return "image/gif"
    elif image_path.lower().endswith(".webp"):
        return "image/webp"
    else:
        # Default to octet-stream if unknown, though Anthropic might not support it
        return "application/octet-stream"

def interpolate_script_with_anthropic(
    scene1_desc: str,
    scene2_desc: str,
    image1_path: str,
    image2_path: str,
    scene1_number: int,
    scene2_number: int
) -> dict:
    """
    Use Anthropic's Claude 3 to interpolate a script between two scenes using their descriptions and images.
    """
    if not ANTHROPIC_API_KEY:
        raise EnvironmentError("Missing ANTHROPIC_API_KEY environment variable")

    print(f"🤖 Interpolating script between Scene {scene1_number} and Scene {scene2_number} using Anthropic API...")

    try:
        client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

        # Read and encode images
        with open(image1_path, "rb") as image_file:
            image1_data = base64.b64encode(image_file.read()).decode("utf-8")
        
        with open(image2_path, "rb") as image_file:
            image2_data = base64.b64encode(image_file.read()).decode("utf-8")

        image1_media_type = get_image_media_type(image1_path)
        image2_media_type = get_image_media_type(image2_path)

        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            system="You are a creative storyteller and screenwriter. Your task is to write a short, cinematic scene description that bridges the narrative and visual gap between two provided scenes. The new scene should create a smooth, logical, and visually compelling transition. Focus on character actions, setting, and mood.",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": f"Here is the information for the first scene (Scene {scene1_number}):"
                        },
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": image1_media_type,
                                "data": image1_data,
                            },
                        },
                        {
                            "type": "text",
                            "text": f"**Scene {scene1_number} Description:** {scene1_desc}"
                        },
                        {
                            "type": "text",
                            "text": f"\n\nHere is the information for the second scene (Scene {scene2_number}):"
                        },
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": image2_media_type,
                                "data": image2_data,
                            },
                        },
                        {
                            "type": "text",
                            "text": f"**Scene {scene2_number} Description:** {scene2_desc}"
                        },
                        {
                            "type": "text",
                            "text": "\n\nPlease write the script for the intermediate scene that connects these two moments seamlessly. The script should be a single paragraph describing the action and setting."
                        }
                    ],
                }
            ],
        )

        interpolated_script = message.content[0].text
        print(f"✅ Anthropic interpolation successful for Scene {scene1_number}-{scene2_number}")

        return {
            "type": "script_interpolation",
            "from_scene": scene1_number,
            "to_scene": scene2_number,
            "interpolated_script": interpolated_script,
            "model": "claude-sonnet-4-20250514",
            "processed_at": datetime.now().isoformat(),
        }

    except Exception as e:
        print(f"💥 Anthropic script interpolation failed for Scene {scene1_number}-{scene2_number}: {e}")
        raise

def generate_interpolated_video(
    prompt: str,
    generation_id_1: str,
    generation_id_2: str,
    scene1_number: int,
    scene2_number: int,
    aspect_ratio: str = '16:9'
) -> dict:
    """
    Generate a Luma video for an interpolated scene using two existing generation IDs.
    
    :param prompt: The interpolated scene description
    :param generation_id_1: Generation ID of the first scene video
    :param generation_id_2: Generation ID of the second scene video
    :param scene1_number: Scene number of the first scene
    :param scene2_number: Scene number of the second scene
    :param aspect_ratio: Video aspect ratio
    :return: Dictionary with video URL and metadata
    """
    
    if not LUMA_API_KEY:
        raise EnvironmentError("Missing LUMA_API_KEY environment variable")

    print(f"🎬 Generating interpolated video between Scene {scene1_number} and Scene {scene2_number}")
    print(f"📝 Prompt: {prompt[:200]}...")

    # Create the payload for interpolation
    init_payload = {
        "prompt": prompt,
        "model": "ray-2",
        "aspect_ratio": aspect_ratio,
        "duration": "5s",
        "keyframes": {
            "frame0": {
                "type": "generation",
                "id": generation_id_1
            },
            "frame120": {
                "type": "generation",
                "id": generation_id_2
            }
        }
    }

    # Add detailed logging for debugging
    print("📦 Full payload being sent to Luma API:")
    print(json.dumps(init_payload, indent=2))

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

        if 'id' not in init_data:
            print("❌ Luma API Error Response:")
            print(json.dumps(init_data, indent=2))
            raise RuntimeError(f"Luma interpolation failed: {init_data.get('error', 'Unknown error')}")

        print(f"📨 Interpolation Video ({scene1_number}-{scene2_number}) - Initial Response: {init_data.get('id')}")
        generation_id = init_data['id']
        print(f"⏳ Interpolation Video ({scene1_number}-{scene2_number}) - Generation ID: {generation_id}")

        # Poll status
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

            print(f"🔁 Interpolation Video ({scene1_number}-{scene2_number}) - [{attempts}] Status: {status}")

            if status == "failed":
                reason = status_data.get("failure_reason", "Unknown reason")
                raise RuntimeError(f"Interpolation video generation failed: {reason}")

            if status == "completed":
                video_url = status_data.get("assets", {}).get("video")
                if not video_url:
                    raise RuntimeError("Interpolation video completed but no video URL found")
                break

        if not video_url:
            raise TimeoutError("Interpolation video generation timed out or returned no result")

        print(f"✅ Interpolation Video ({scene1_number}-{scene2_number}) - Video URL: {video_url}")
        
        return {
            "type": "interpolated_video",
            "from_scene": scene1_number,
            "to_scene": scene2_number,
            "prompt": prompt,
            "video_url": video_url,
            "generation_id": generation_id,
            "aspect_ratio": aspect_ratio,
            "duration": "5s",
            "processed_at": datetime.now().isoformat(),
        }

    except Exception as e:
        print(f"💥 Interpolation video generation failed for Scene {scene1_number}-{scene2_number}: {e}")
        raise

def save_interpolation_results(interpolation_results: list, output_file: str = "interpolated_scenes.json") -> None:
    """
    Save interpolation results to a JSON file with a structure similar to story_elements.json.
    
    :param interpolation_results: List of interpolation result dictionaries
    :param output_file: Output JSON file path
    """
    try:
        # Format the results for JSON output
        formatted_results = []
        for result in interpolation_results:
            formatted_result = {
                "FromScene": result["from_scene"],
                "ToScene": result["to_scene"],
                "InterpolatedDescription": result["interpolated_script"],
                "Model": result["model"],
                "ProcessedAt": result["processed_at"]
            }
            
            # Add video information if available
            if "video_url" in result:
                formatted_result["VideoURL"] = result["video_url"]
                formatted_result["VideoGenerationID"] = result.get("video_generation_id", result.get("generation_id"))
            
            formatted_results.append(formatted_result)
        
        # Create the output structure
        output_data = {
            "metadata": {
                "total_interpolations": len(formatted_results),
                "processed_at": datetime.now().isoformat(),
                "model": "claude-sonnet-4-20250514",
                "description": "AI-generated interpolated scenes between consecutive story scenes"
            },
            "InterpolatedScenes": formatted_results
        }
        
        # Save to file
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Successfully saved {len(formatted_results)} interpolation results to {output_file}")
        
    except Exception as e:
        print(f"💥 Error saving interpolation results: {e}")
        raise

def load_scene_videos(scene_videos_file: str = "scene_videos.json") -> list:
    """
    Load scene videos data from the JSON file.
    
    :param scene_videos_file: Path to the scene_videos.json file
    :return: List of video data dictionaries
    """
    try:
        with open(scene_videos_file, 'r') as f:
            data = json.load(f)
        
        videos = data.get("videos", [])
        if not videos:
            raise ValueError(f"No videos found in {scene_videos_file}")
        
        print(f"📁 Loaded {len(videos)} videos from {scene_videos_file}")
        return videos
        
    except FileNotFoundError:
        raise FileNotFoundError(f"Scene videos file not found: {scene_videos_file}")
    except json.JSONDecodeError:
        raise ValueError(f"Invalid JSON in file: {scene_videos_file}")

def get_scene_description(scene_number: int, story_elements_file: str = "story_elements.json") -> str:
    """
    Get the original scene description from story_elements.json.
    
    :param scene_number: Scene number
    :param story_elements_file: Path to the story_elements.json file
    :return: Scene description
    """
    try:
        with open(story_elements_file, 'r') as f:
            story_data = json.load(f)
        
        scenes = story_data.get("Scenes", [])
        for scene in scenes:
            if scene["Scene"] == scene_number:
                return scene["Description"]
        
        return f"Scene {scene_number} description not found"
    
    except Exception as e:
        print(f"⚠️ Could not load scene description from {story_elements_file}: {e}")
        return f"Scene {scene_number}"

def interpolate_specific_videos(
    scene_number_1: int,
    scene_number_2: int,
    scene_videos_file: str = "scene_videos.json",
    output_file: str = "interpolated_scene.json"
) -> dict:
    """
    Interpolate a video between two specific scenes using data from scene_videos.json.
    
    :param scene_number_1: Scene number of the first video
    :param scene_number_2: Scene number of the second video
    :param scene_videos_file: Path to the scene_videos.json file
    :param output_file: Output JSON file for the interpolated result
    :return: Dictionary with the single interpolation result, or None if failed
    """
    try:
        videos = load_scene_videos(scene_videos_file)
        
        video1 = next((v for v in videos if v['scene_number'] == scene_number_1), None)
        video2 = next((v for v in videos if v['scene_number'] == scene_number_2), None)
        
        if not video1 or not video2:
            raise ValueError(f"Could not find both scenes {scene_number_1} and {scene_number_2} in {scene_videos_file}")
            
        print(f"\n🔄 Processing interpolation between Scene {scene_number_1} and Scene {scene_number_2}")
        
        # Get scene descriptions and generation IDs
        generation_id_1 = video1["generation_id"]
        generation_id_2 = video2["generation_id"]
        scene1_desc = get_scene_description(scene_number_1)
        scene2_desc = get_scene_description(scene_number_2)
        
        # Construct image paths
        image1_path = f"scene_images/scene_{str(scene_number_1).zfill(2)}.png"
        image2_path = f"scene_images/scene_{str(scene_number_2).zfill(2)}.png"
        
        if not os.path.exists(image1_path) or not os.path.exists(image2_path):
            raise FileNotFoundError(f"Image not found for Scene {scene_number_1} or {scene_number_2}")
            
        # First, interpolate the script
        script_result = interpolate_script_with_anthropic(
            scene1_desc=scene1_desc,
            scene2_desc=scene2_desc,
            image1_path=image1_path,
            image2_path=image2_path,
            scene1_number=scene_number_1,
            scene2_number=scene_number_2
        )
        
        # Then, generate the video for the interpolated script
        video_result = generate_interpolated_video(
            prompt=script_result["interpolated_script"],
            generation_id_1=generation_id_1,
            generation_id_2=generation_id_2,
            scene1_number=scene_number_1,
            scene2_number=scene_number_2
        )
        
        # Combine the results
        combined_result = {
            **script_result,
            "video_url": video_result["video_url"],
            "video_generation_id": video_result["generation_id"]
        }
        
        # Save the single result to a file
        save_interpolation_results([combined_result], output_file)
        print(f"✅ Successfully created and saved interpolation for Scene {scene_number_1}-{scene_number_2}")
        
        return combined_result
        
    except Exception as e:
        print(f"💥 Error in specific interpolation process: {e}")
        raise

def interpolate_videos_from_scene_videos(
    scene_videos_file: str = "scene_videos.json",
    output_file: str = "interpolated_scenes.json"
) -> list:
    """
    Interpolate videos between all consecutive scenes using data from scene_videos.json.
    """
    try:
        videos = load_scene_videos(scene_videos_file)
        
        if len(videos) < 2:
            print("❌ Need at least 2 videos for interpolation")
            return []
        
        print(f"🎬 Starting batch interpolation between {len(videos)} videos...")
        
        interpolation_results = []
        
        for i in range(len(videos) - 1):
            video1 = videos[i]
            video2 = videos[i + 1]
            
            try:
                result = interpolate_specific_videos(
                    scene_number_1=video1["scene_number"],
                    scene_number_2=video2["scene_number"],
                    scene_videos_file=scene_videos_file,
                    output_file=None # Handled by final save
                )
                interpolation_results.append(result)
            except Exception as e:
                print(f"❌ Failed to process interpolation between Scene {video1['scene_number']} and Scene {video2['scene_number']}: {e}")
                continue
        
        if interpolation_results:
            save_interpolation_results(interpolation_results, output_file)
            print(f"\n🎉 Successfully generated {len(interpolation_results)} interpolated scenes with videos!")
        else:
            print("❌ No interpolations were successfully generated")
        
        return interpolation_results
        
    except Exception as e:
        print(f"💥 Error in batch interpolation process: {e}")
        raise

# Usage examples
if __name__ == "__main__":
    
    # --- Example 1: Interpolate ALL consecutive videos ---
    # print("=== Example 1: Interpolating ALL Videos from scene_videos.json ===")
    # try:
    #     results = interpolate_videos_from_scene_videos(
    #         scene_videos_file="scene_videos.json",
    #         output_file="all_interpolated_scenes.json"
    #     )
    #     if results:
    #         print(f"\n✅ Batch interpolation complete. Generated {len(results)} videos.")
    # except Exception as e:
    #     print(f"❌ Main batch interpolation process failed: {e}")

    # --- Example 2: Interpolate a SPECIFIC pair of videos ---
    print("\n=== Example 2: Interpolating a SPECIFIC Pair of Videos ===")
    try:
        # Define which two scenes to interpolate
        SCENE_1 = 1
        SCENE_2 = 3
        
        result = interpolate_specific_videos(
            scene_number_1=SCENE_1,
            scene_number_2=SCENE_2,
            scene_videos_file="scene_videos.json",
            output_file=f"interpolated_scene_{SCENE_1}_to_{SCENE_2}.json"
        )
        if result:
            print(f"\n✅ Specific interpolation complete.")
            print(f"  - From Scene: {result['from_scene']}")
            print(f"  - To Scene: {result['to_scene']}")
            print(f"  - Video URL: {result['video_url']}")

    except Exception as e:
        print(f"❌ Specific interpolation process failed: {e}")

