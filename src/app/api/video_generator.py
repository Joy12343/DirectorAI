import time
import requests
import os
import json
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

LUMA_API_URL = 'https://api.lumalabs.ai/dream-machine/v1/generations'
LUMA_API_KEY = os.getenv("LUMA_API_KEY")

def create_cinematic_prompt(scene_description: str, scene_number: int, previous_scene_info=None) -> str:
    """
    Create an enhanced cinematic prompt for natural motion and scene coherence.
    
    :param scene_description: Original scene description
    :param scene_number: Scene number for context
    :param previous_scene_info: Information about the previous scene for continuity
    :return: Enhanced prompt for Luma
    """
    
    # Base cinematic enhancements
    cinematic_base = "cinematic film style, professional cinematography, natural human motion, fluid camera movement"
    
    # Motion-specific enhancements based on scene content
    motion_keywords = []
    
    # Analyze scene description for motion cues
    description_lower = scene_description.lower()
    
    # Enhanced basketball motion with object persistence
    if any(word in description_lower for word in ['dribble', 'bounce', 'ball']):
        motion_keywords.extend([
            "natural basketball motion",
            "fluid dribbling movement",
            "realistic ball physics",
            "smooth hand-eye coordination",
            "ball remains visible throughout motion",
            "consistent ball position and movement",
            "realistic ball bounce and trajectory",
            "ball follows natural physics laws"
        ])
    
    if any(word in description_lower for word in ['run', 'chase', 'drive']):
        motion_keywords.extend([
            "natural running motion",
            "realistic human movement",
            "fluid athletic motion",
            "dynamic body mechanics",
            "consistent character positioning",
            "smooth transition between movements"
        ])
    
    if any(word in description_lower for word in ['shot', 'throw', 'pass']):
        motion_keywords.extend([
            "natural shooting motion",
            "realistic arm movement",
            "fluid release action",
            "authentic sports motion",
            "ball follows realistic arc",
            "consistent ball trajectory",
            "natural follow-through motion"
        ])
    
    if any(word in description_lower for word in ['defend', 'block', 'steal']):
        motion_keywords.extend([
            "natural defensive motion",
            "realistic reaction time",
            "fluid defensive movement",
            "authentic sports positioning",
            "consistent defensive stance",
            "realistic reach and timing"
        ])
    
    if any(word in description_lower for word in ['close-up', 'face', 'expression']):
        motion_keywords.extend([
            "subtle facial expressions",
            "natural eye movement",
            "realistic breathing motion",
            "authentic human emotion",
            "consistent facial features",
            "natural head movement"
        ])
    
    # Camera and lighting enhancements
    camera_enhancements = []
    if 'wide shot' in description_lower:
        camera_enhancements.append("smooth wide camera movement")
    if 'close-up' in description_lower:
        camera_enhancements.append("gentle close-up camera motion")
    if 'medium shot' in description_lower:
        camera_enhancements.append("natural medium shot camera movement")
    if 'low angle' in description_lower:
        camera_enhancements.append("dynamic low angle camera motion")
    
    # Lighting enhancements
    lighting_enhancements = []
    if 'golden hour' in description_lower:
        lighting_enhancements.append("warm golden hour lighting")
    if 'dramatic' in description_lower:
        lighting_enhancements.append("dramatic cinematic lighting")
    if 'backlighting' in description_lower:
        lighting_enhancements.append("natural backlighting effects")
    
    # Scene coherence enhancements
    coherence_instructions = ""
    if previous_scene_info:
        coherence_instructions = f"""
Scene Continuity Requirements:
- Maintain consistent character appearance from Scene {previous_scene_info['scene_number']}
- Preserve character positioning and orientation
- Continue natural motion flow from previous scene
- Maintain consistent lighting and atmosphere
- Ensure smooth transition between scenes
- Keep objects (basketball) in consistent positions
- Preserve character clothing and physical features
"""
    
    # Combine all enhancements
    motion_enhancements = ", ".join(motion_keywords) if motion_keywords else "natural human motion, realistic movement"
    camera_motion = ", ".join(camera_enhancements) if camera_enhancements else "smooth camera movement"
    lighting_motion = ", ".join(lighting_enhancements) if lighting_enhancements else "cinematic lighting"
    
    # Create final enhanced prompt with object persistence focus
    enhanced_prompt = f"""Scene {scene_number}: {scene_description}

Cinematic Style: {cinematic_base}
Motion: {motion_enhancements}
Camera: {camera_motion}
Lighting: {lighting_motion}

CRITICAL OBJECT PERSISTENCE RULES:
- Basketball must remain visible throughout the entire motion
- Ball cannot disappear, fade out, or teleport
- Maintain consistent ball size and appearance
- Ball must follow realistic physics and trajectory
- All objects must maintain their physical presence
- No objects should suddenly appear or disappear
- Maintain consistent object positioning and movement

Additional Motion Guidelines:
- Natural breathing and subtle body movement
- Realistic physics and gravity
- Fluid transitions between poses
- Authentic sports motion and timing
- Natural facial expressions and eye movement
- Smooth camera motion without jarring movements
- Realistic lighting changes and shadows
- Professional film quality with natural motion
- Consistent character positioning and orientation
- Maintain object continuity throughout the scene{coherence_instructions}"""

    return enhanced_prompt

def generate_luma_video(prompt: str, image_url: str, scene_number: int, aspect_ratio: str = '16:9', previous_scene_info=None) -> dict:

    """
    Generate a Luma video with enhanced prompt engineering for object persistence and scene coherence.
    
    :param prompt: Original scene description
    :param image_url: Cloudinary image URL
    :param scene_number: Scene number for context
    :param aspect_ratio: Video aspect ratio
    :param previous_scene_info: Information about the previous scene for continuity
    :return: Dictionary with video URL and metadata
    """
    
    # Create enhanced prompt
    enhanced_prompt = create_cinematic_prompt(prompt, scene_number)
    
    if not prompt or not image_url:
        raise ValueError("Missing prompt or image URL")

    if not LUMA_API_KEY:
        raise EnvironmentError("Missing LUMA_API_KEY environment variable")

    print(f"🎬 Scene {scene_number} - Enhanced Prompt:")
    print(f"📝 {enhanced_prompt[:200]}...")
    print(f"🖼️ Image URL: {image_url}")
    print(f"📐 Aspect Ratio: {aspect_ratio}")
    
    if previous_scene_info:
        print(f"🔄 Scene Continuity: Maintaining consistency with Scene {previous_scene_info['scene_number']}")

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
        print(f"📨 Scene {scene_number} - Initial Response: {init_data.get('id', 'No ID')}")

        if 'id' not in init_data:
            raise RuntimeError(f"Luma generation failed: {init_data.get('error') or 'Unknown error'}")

        generation_id = init_data['id']
        print(f"⏳ Scene {scene_number} - Generation ID: {generation_id}")

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

            print(f"🔁 Scene {scene_number} - [{attempts}] Status: {status}")

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

        print(f"✅ Scene {scene_number} - Video URL: {video_url}")
        
        return {
            "scene_number": scene_number,
            "original_prompt": prompt,
            "enhanced_prompt": enhanced_prompt,
            "image_url": image_url,
            "video_url": video_url,
            "generation_id": generation_id,
            "aspect_ratio": aspect_ratio,
            "duration": "5s",
            "resolution": "720p",
            "processed_at": datetime.now().isoformat(),
            "previous_scene": previous_scene_info["scene_number"] if previous_scene_info else None,

        }

    except Exception as e:
        print(f"💥 Scene {scene_number} - Unexpected error: {e}")
        raise

def process_all_scenes_from_json(json_file="scene_urls.json", output_json="scene_videos.json"):
    """
    Process all scenes from the JSON file and generate videos with scene coherence.
    
    :param json_file: JSON file containing scene URLs
    :param output_json: Output JSON file for video URLs
    """
    
    try:
        # Load scene data
        with open(json_file, 'r') as f:
            scene_data = json.load(f)
        
        scenes = scene_data.get("scenes", [])
        
        if not scenes:
            print(f"❌ No scenes found in {json_file}")
            return
        
        print(f"🎬 Found {len(scenes)} scenes to process")
        print("🔄 Scene coherence mode: ON - Maintaining continuity between scenes")
        
        # Process each scene with continuity
        video_results = []
        previous_scene_info = None
        
        for i, scene in enumerate(scenes):
            scene_number = scene["scene_number"]
            cloudinary_url = scene["cloudinary_url"]
            
            # Get original scene description from story_elements.json
            original_description = get_scene_description(scene_number)
            
            print(f"\n🎬 Processing Scene {scene_number} ({i+1}/{len(scenes)})")
            print("-" * 50)
            
            try:
                video_info = generate_luma_video(
                    prompt=original_description,
                    image_url=cloudinary_url,
                    scene_number=scene_number,
                    previous_scene_info=previous_scene_info
                )
                
                video_results.append(video_info)
                print(f"✅ Scene {scene_number} video generated successfully")
                
                # Update previous scene info for next iteration
                previous_scene_info = {
                    "scene_number": scene_number,
                    "video_url": video_info["video_url"],
                    "enhanced_prompt": video_info["enhanced_prompt"]
                }
                
            except Exception as e:
                print(f"❌ Scene {scene_number} failed: {e}")
                # Continue with next scene, but reset continuity
                previous_scene_info = None
                continue
        
        # Save results
        if video_results:
            output_data = {
                "metadata": {
                    "total_videos": len(video_results),
                    "processed_at": datetime.now().isoformat(),
                    "source_json": json_file,
                    "model": "ray-2",
                    "aspect_ratio": "16:9",
                    "duration": "5s",
                    "scene_coherence": True,
                    "object_persistence": True
                },
                "videos": video_results
            }
            
            with open(output_json, 'w', encoding='utf-8') as f:
                json.dump(output_data, f, indent=2, ensure_ascii=False)
            
            print(f"\n🎉 Successfully generated {len(video_results)} videos with scene coherence!")
            print(f"📄 Results saved to: {output_json}")
            print(f"🔄 Scene continuity maintained across {len(video_results)} scenes")
            
            # Display summary
            print(f"\n📋 Video Summary:")
            for video in video_results:
                continuity_info = f" (→ Scene {video['previous_scene']})" if video['previous_scene'] else ""
                print(f"  Scene {video['scene_number']}{continuity_info}: {video['video_url']}")
        
        else:
            print("❌ No videos were successfully generated")
    
    except FileNotFoundError:
        print(f"❌ File not found: {json_file}")
    except json.JSONDecodeError:
        print(f"❌ Invalid JSON in file: {json_file}")
    except Exception as e:
        print(f"❌ Error processing scenes: {e}")

def get_scene_description(scene_number: int) -> str:
    """
    Get the original scene description from story_elements.json.
    
    :param scene_number: Scene number
    :return: Scene description
    """
    try:
        with open("/Users/chengyibo/hackathon/src/app/api/story_elements.json", 'r') as f:
            story_data = json.load(f)
        
        scenes = story_data.get("Scenes", [])
        for scene in scenes:
            if scene["Scene"] == scene_number:
                return scene["Description"]
        
        return f"Scene {scene_number} description not found"
    
    except Exception as e:
        print(f"⚠️ Could not load scene description: {e}")
        return f"Scene {scene_number}"

if __name__ == "__main__":
    # Process all scenes from the JSON file
    process_all_scenes_from_json()
