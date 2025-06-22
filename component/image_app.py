from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import base64
import sys
import logging
import io
from PIL import Image, ImageDraw, ImageFont

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'api'))
from scene_picture import (
    generate_scene_image,
    load_story_elements,
    load_character_images,
)

app = Flask(__name__)
CORS(app)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration - Update these paths to match your setup
JSON_FILE_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'story_elements.json')
CHARACTER_IMAGES_DIR = os.path.join(os.path.dirname(__file__), '..', 'character_images')
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'scene_images')

# Create directories if they don't exist
os.makedirs(CHARACTER_IMAGES_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

def create_placeholder_image(text, width=400, height=300):
    """Create a placeholder image with text"""
    img = Image.new('RGB', (width, height), color='#4F46E5')
    draw = ImageDraw.Draw(img)
    
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 24)
    except:
        font = ImageFont.load_default()
    
    text_lines = text[:50] + "..." if len(text) > 50 else text
    text_bbox = draw.textbbox((0, 0), text_lines, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    
    x = (width - text_width) // 2
    y = (height - text_height) // 2
    
    draw.text((x, y), text_lines, fill='white', font=font)
    
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    img_str = base64.b64encode(buffer.getvalue()).decode()
    
    return img_str

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({"status": "Image service is running", "port": 5001})

@app.route('/api/image', methods=['POST'])
def generate_image():
    try:
        data = request.get_json()
        if not data or 'description' not in data:
            return jsonify({"error": "Description is required"}), 400
        
        description = data['description']
        logger.info(f"Generating image for: {description}")
        
        # Try to use real AI image generation first
        try:
            # Load or create story data for this request
            story_data = {
                "Background": "Modern setting",
                "Characters": [],
                "Scenes": [{"Scene": 1, "Description": description, "Dialogue": ""}]
            }
            
            # Save temporary story data
            temp_story_path = os.path.join(os.path.dirname(__file__), 'temp_story.json')
            import json
            with open(temp_story_path, 'w') as f:
                json.dump(story_data, f)
            
            # Try to generate real image using your existing code
            scene_data = {"Scene": 1, "Description": description, "Dialogue": ""}
            character_images = {}  # Empty for scene-only generation
            background = "Modern setting"
            
            image_path = generate_scene_image(
                scene_data, character_images, background, story_data, OUTPUT_DIR
            )
            
            if image_path and os.path.exists(image_path):
                # Read the generated image and encode as base64
                with open(image_path, "rb") as image_file:
                    encoded_image = base64.b64encode(image_file.read()).decode("utf-8")
                
                logger.info("Successfully generated AI image")
                return jsonify({
                    "base64_image": encoded_image,
                    "description": description,
                    "success": True,
                    "type": "ai_generated"
                })
            else:
                raise Exception("AI image generation failed")
                
        except Exception as ai_error:
            logger.warning(f"AI image generation failed: {ai_error}")
            logger.info("Falling back to placeholder image")
            
            # Fallback to placeholder
            base64_image = create_placeholder_image(description)
            
            return jsonify({
                "base64_image": base64_image,
                "description": description,
                "success": True,
                "type": "placeholder",
                "note": "AI generation failed, using placeholder"
            })
        
    except Exception as e:
        logger.error(f"Error generating image: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/character-image', methods=['POST'])
def generate_character_image():
    """Generate character images using your existing character generation code"""
    try:
        data = request.get_json()
        if not data or 'character' not in data:
            return jsonify({"error": "Character data is required"}), 400
        
        character = data['character']
        logger.info(f"Generating character image for: {character.get('Name', 'Unknown')}")
        
        # Try to use your existing character image generation
        try:
            from character import generate_character_image
            
            image_path = generate_character_image(character, CHARACTER_IMAGES_DIR)
            
            if image_path and os.path.exists(image_path):
                with open(image_path, "rb") as image_file:
                    encoded_image = base64.b64encode(image_file.read()).decode("utf-8")
                
                return jsonify({
                    "base64_image": encoded_image,
                    "character": character,
                    "success": True,
                    "type": "ai_generated"
                })
            else:
                raise Exception("Character image generation failed")
                
        except Exception as ai_error:
            logger.warning(f"AI character generation failed: {ai_error}")
            
            # Fallback to placeholder
            char_description = f"{character.get('Name', 'Character')}: {character.get('Description', '')}"
            base64_image = create_placeholder_image(char_description, 300, 400)
            
            return jsonify({
                "base64_image": base64_image,
                "character": character,
                "success": True,
                "type": "placeholder"
            })
        
    except Exception as e:
        logger.error(f"Error generating character image: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Starting Image Service on port 5001...")
    print(f"JSON file path: {JSON_FILE_PATH}")
    print(f"Character images dir: {CHARACTER_IMAGES_DIR}")
    print(f"Output dir: {OUTPUT_DIR}")
    app.run(host='0.0.0.0', port=5001, debug=True)
