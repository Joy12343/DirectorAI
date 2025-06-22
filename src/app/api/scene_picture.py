import json
import os
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY)

def load_story_elements(json_file="/Users/chengyibo/hackathon/src/app/api/story_elements.json"):
    """
    Load story elements from JSON file.
    
    :param json_file: Path to the story elements JSON file
    :return: Dictionary containing story elements
    """
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            story_data = json.load(f)
        return story_data
    except FileNotFoundError:
        print(f"❌ Error: Could not find {json_file}")
        return None
    except json.JSONDecodeError:
        print(f"❌ Error: Invalid JSON in {json_file}")
        return None
    except Exception as e:
        print(f"❌ Error reading story elements: {e}")
        return None

def load_character_images(characters, character_images_dir="character_images"):
    """
    Load character images based on character names.
    
    :param characters: List of character dictionaries
    :param character_images_dir: Directory containing character images
    :return: Dictionary mapping character names to PIL Image objects
    """
    character_images = {}
    
    for character in characters:
        name = character["Name"]
        # Try different possible filename formats
        possible_filenames = [
            f"{character_images_dir}/{name.replace(' ', '_')}.png",
            f"{character_images_dir}/{name.lower().replace(' ', '_')}.png",
            f"{character_images_dir}/{name}.png"
        ]
        
        image_loaded = False
        for filename in possible_filenames:
            try:
                if os.path.exists(filename):
                    character_images[name] = Image.open(filename)
                    print(f"✅ Loaded image for {name}: {filename}")
                    image_loaded = True
                    break
            except Exception as e:
                print(f"⚠️ Could not load {filename}: {e}")
                continue
        
        if not image_loaded:
            print(f"❌ Could not find image for character: {name}")
            print(f"   Tried: {possible_filenames}")
    
    return character_images

def generate_scene_image(scene_data, character_images, background_info, story_data, output_dir="scene_images"):
    """
    Generate an image for the beginning of a scene based on its description and character images.
    
    :param scene_data: Dictionary containing scene information
    :param character_images: Dictionary mapping character names to PIL Image objects
    :param background_info: Background information from story elements
    :param story_data: Complete story data containing character information
    :param output_dir: Directory to save generated scene images
    :return: Path to the generated image or None if failed
    """
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    scene_number = scene_data["Scene"]
    description = scene_data["Description"]
    dialogue = scene_data.get("Dialogue", "")
    
    # Construct a detailed prompt for scene generation
    character_outfit_info = ""
    if character_images:
        character_outfit_info = "\nCHARACTER OUTFIT DETAILS:\n"
        for char_name in character_images.keys():
            # Find character data to get outfit description
            for char_data in story_data.get("Characters", []):
                if char_data["Name"] == char_name:
                    character_outfit_info += f"- {char_name}: {char_data['Description']}\n"
                    break
    
    prompt = f"""Generate a cinematic scene image based on the following specifications:

Scene {scene_number} Description: {description}
Dialogue: {dialogue}
Background Context: {background_info}{character_outfit_info}

CHARACTER CONSISTENCY REQUIREMENTS:
- Each character must maintain EXACTLY the same clothing, hairstyle, and physical appearance as shown in their reference images
- Pay close attention to clothing colors, patterns, and styles from the character reference images
- Do not change or modify any character's outfit, accessories, or physical features
- Ensure character proportions and body types match their reference images exactly

Create a cinematic scene that matches the description exactly. The image should capture:
- The specific camera shot mentioned (wide shot, close-up, etc.)
- The lighting style described
- The mood and atmosphere
- The visual composition and framing
- Character consistency with their reference images

Style: Cinematic, professional film still, high quality
Aspect Ratio: 16:9 (widescreen cinematic format)
Quality: High resolution, detailed, professional cinematography

The scene should look like a professional movie still or storyboard frame. The image should capture the beginning of the scene. Don't put any text on the image. The outfit of the characters should be consistent throughout the scene, especially the clothes color.

IMPORTANT: Reference the character images provided to maintain exact clothing consistency. Do not deviate from the character appearances shown in the reference images. Generate all pictures in the AspectRatio of 16:9
"""

    try:
        print(f"🎬 Generating image for Scene {scene_number}...")
        print(f"📝 Description: {description}")
        
        # Prepare content for the API call
        content_parts = [prompt]
        
        # Add character images if available with explicit labeling
        for char_name, char_image in character_images.items():
            content_parts.append(f"REFERENCE IMAGE - Character {char_name} (use this exact appearance):")
            content_parts.append(char_image)
            content_parts.append(f"Maintain {char_name}'s exact clothing, hairstyle, and physical features from this reference image.")
        
        response = client.models.generate_content(
            model="gemini-2.0-flash-preview-image-generation",
            contents=content_parts,
            config=types.GenerateContentConfig(
                response_modalities=['TEXT', 'IMAGE'],
            ),
        )

        # Process the response
        if not response.candidates:
            print(f"❌ No response generated for Scene {scene_number}")
            return None

        candidate = response.candidates[0]
        
        if candidate.content is None or not candidate.content.parts:
            print(f"❌ Content blocked or empty for Scene {scene_number}")
            if candidate.finish_reason:
                print(f"   ➡️ Finish Reason: {candidate.finish_reason.name}")
            return None

        # Save the generated image
        for part in candidate.content.parts:
            if hasattr(part, 'inline_data') and part.inline_data:
                image_data = part.inline_data.data
                image = Image.open(BytesIO(image_data))
                filename = f"{output_dir}/scene_{scene_number:02d}.png"
                image.save(filename)
                print(f"✅ Saved Scene {scene_number} image: {filename}")
                return filename
            elif hasattr(part, 'text') and part.text:
                print(f"📄 Text response for Scene {scene_number}: {part.text}")
        
        print(f"❌ Failed to generate image for Scene {scene_number}")
        return None
        
    except Exception as e:
        print(f"❌ Error generating image for Scene {scene_number}: {e}")
        return None

def generate_all_scene_images(json_file="/Users/chengyibo/hackathon/src/app/api/story_elements.json", 
                            character_images_dir="character_images",
                            output_dir="scene_images"):
    """
    Generate images for all scenes in the story.
    
    :param json_file: Path to the story elements JSON file
    :param character_images_dir: Directory containing character images
    :param output_dir: Directory to save generated scene images
    """
    # Load story elements
    story_data = load_story_elements(json_file)
    if not story_data:
        return
    
    # Extract components
    background = story_data.get("Background", "")
    characters = story_data.get("Characters", [])
    scenes = story_data.get("Scenes", [])
    
    if not scenes:
        print("❌ No scenes found in the story elements file.")
        return
    
    print(f"📖 Story Background: {background[:100]}...")
    print(f"👥 Found {len(characters)} characters")
    print(f"🎬 Found {len(scenes)} scenes")
    
    # Load character images
    character_images = load_character_images(characters, character_images_dir)
    
    if not character_images:
        print("⚠️ No character images loaded. Scenes will be generated without character references.")
    
    # Generate images for each scene
    generated_scenes = []
    
    for scene in scenes:
        image_path = generate_scene_image(scene, character_images, background, story_data, output_dir)
        if image_path:
            generated_scenes.append({
                "scene_number": scene["Scene"],
                "description": scene["Description"],
                "image_path": image_path
            })
    
    # Summary
    print(f"\n🎉 Successfully generated {len(generated_scenes)} scene images:")
    for scene_info in generated_scenes:
        print(f"   Scene {scene_info['scene_number']}: {scene_info['image_path']}")
        print(f"      Description: {scene_info['description']}")
    
    return generated_scenes

if __name__ == "__main__":
    # Generate images for all scenes
    generate_all_scene_images()