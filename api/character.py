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

def generate_character_image(character_data, output_dir="character_images"):
    """
    Generate an image for a character based on their description, personality, and role.
    
    :param character_data: Dictionary containing character information
    :param output_dir: Directory to save the generated images
    """
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Construct a detailed prompt for image generation
    name = character_data["Name"]
    description = character_data["Description"]
    personality = character_data["Personality"]
    role = character_data["Role"]
    
    prompt = f"""Generate a portrait image of a character named {name} with the following specifications:

Physical Description: {description}
Personality: {personality}
Role in Story: {role}

Create a cinematic, professional, full body character portrait that captures their physical appearance, personality traits, and story role. 
The image should be a medium close-up shot with good lighting, showing the character's face and whole body clearly.
Style: Realistic, cinematic, professional character design.
Background: Simple, neutral background that doesn't distract from the character.
Lighting: Professional studio lighting that highlights the character's features.
"""

    try:
        print(f"Generating image for {name}...")
        print(f"Prompt: {prompt}")
        
        response = client.models.generate_content(
            model="gemini-2.0-flash-preview-image-generation",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_modalities=['TEXT', 'IMAGE']
            )
        )

        # Save the generated image
        for part in response.candidates[0].content.parts:
            if part.inline_data is not None:
                image = Image.open(BytesIO(part.inline_data.data))
                filename = f"{output_dir}/{name.replace(' ', '_')}.png"
                image.save(filename)
                print(f"Saved {name}'s image to {filename}")
                return filename
            elif part.text is not None:
                print(f"Text response: {part.text}")
        
        print(f"Failed to generate image for {name}")
        return None
        
    except Exception as e:
        print(f"Error generating image for {name}: {e}")
        return None

def generate_all_character_images(json_file="/Users/chengyibo/hackathon/src/app/api/story_elements.json"):
    """
    Read the story elements JSON file and generate images for all characters.
    
    :param json_file: Path to the story elements JSON file
    """
    try:
        # Read the story elements JSON file
        with open(json_file, 'r', encoding='utf-8') as f:
            story_data = json.load(f)
        
        characters = story_data.get("Characters", [])
        
        if not characters:
            print("No characters found in the story elements file.")
            return
        
        print(f"Found {len(characters)} characters. Generating images...")
        
        generated_images = []
        
        for character in characters:
            image_path = generate_character_image(character)
            if image_path:
                generated_images.append({
                    "character": character["Name"],
                    "image_path": image_path
                })
        
        print(f"\nSuccessfully generated {len(generated_images)} character images:")
        for item in generated_images:
            print(f"- {item['character']}: {item['image_path']}")
            
        return generated_images
        
    except FileNotFoundError:
        print(f"Error: Could not find {json_file}")
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON in {json_file}")
    except Exception as e:
        print(f"Error reading story elements: {e}")

if __name__ == "__main__":
    # Generate images for all characters in the story
    generate_all_character_images()
