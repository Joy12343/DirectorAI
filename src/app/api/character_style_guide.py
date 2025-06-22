import json
import os
from PIL import Image

def create_character_style_guide(json_file="/Users/chengyibo/hackathon/src/app/api/story_elements.json", 
                                character_images_dir="character_images",
                                output_file="character_style_guide.txt"):
    """
    Create a detailed character style guide to help maintain consistency.
    
    :param json_file: Path to the story elements JSON file
    :param character_images_dir: Directory containing character images
    :param output_file: Output file for the style guide
    """
    try:
        # Load story data
        with open(json_file, 'r', encoding='utf-8') as f:
            story_data = json.load(f)
        
        characters = story_data.get("Characters", [])
        
        if not characters:
            print("❌ No characters found in the story elements file.")
            return
        
        # Create style guide
        style_guide = "CHARACTER STYLE GUIDE\n"
        style_guide += "=" * 50 + "\n\n"
        style_guide += "This guide ensures character consistency across all scenes.\n\n"
        
        for character in characters:
            name = character["Name"]
            description = character["Description"]
            personality = character["Personality"]
            role = character["Role"]
            
            style_guide += f"CHARACTER: {name}\n"
            style_guide += "-" * 30 + "\n"
            style_guide += f"Role: {role}\n"
            style_guide += f"Personality: {personality}\n"
            style_guide += f"Physical Description: {description}\n"
            
            # Check if character image exists
            image_path = f"{character_images_dir}/{name.replace(' ', '_')}.png"
            if os.path.exists(image_path):
                style_guide += f"Reference Image: {image_path}\n"
                
                # Get image dimensions
                try:
                    with Image.open(image_path) as img:
                        width, height = img.size
                        style_guide += f"Image Dimensions: {width}x{height}\n"
                except Exception as e:
                    style_guide += f"Image Error: {e}\n"
            else:
                style_guide += "Reference Image: NOT FOUND\n"
            
            style_guide += "\nCONSISTENCY REQUIREMENTS:\n"
            style_guide += "- Maintain exact clothing colors and styles\n"
            style_guide += "- Keep hairstyle and facial features consistent\n"
            style_guide += "- Preserve body proportions and build\n"
            style_guide += "- Maintain personality expressions and mannerisms\n"
            style_guide += "\n" + "=" * 50 + "\n\n"
        
        # Save style guide
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(style_guide)
        
        print(f"✅ Character style guide created: {output_file}")
        return output_file
        
    except Exception as e:
        print(f"❌ Error creating style guide: {e}")
        return None

def generate_consistency_prompt(character_name, character_data):
    """
    Generate a specific consistency prompt for a character.
    
    :param character_name: Name of the character
    :param character_data: Character data dictionary
    :return: Formatted consistency prompt
    """
    prompt = f"""CHARACTER CONSISTENCY FOR {character_name.upper()}:
- Physical Appearance: {character_data['Description']}
- Personality: {character_data['Personality']}
- Role: {character_data['Role']}

CRITICAL CONSISTENCY RULES:
1. Clothing: Maintain EXACTLY the same outfit, colors, and style
2. Hair: Keep the same hairstyle, color, and length
3. Face: Preserve facial features, expressions, and age appearance
4. Body: Maintain the same build, height, and proportions
5. Accessories: Keep all jewelry, glasses, or other items consistent

DO NOT DEVIATE from the reference image appearance in any way."""
    
    return prompt

if __name__ == "__main__":
    create_character_style_guide() 