from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
import json
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'api'))
from character import generate_character_image

character_app = Flask(__name__)
CORS(character_app)

@character_app.route("/", methods=["GET"])
def health_check():
    return jsonify({"status": "Character service is running", "port": 5002})

@character_app.route("/api/character", methods=["POST"])
def generate_character_api():
    try:
        data = request.get_json()
        character_data = data.get("character")

        if not character_data:
            return jsonify({"error": "Missing character data"}), 400

        print(f"Generating character image for: {character_data.get('Name', 'Unknown')}")

        # Generate character image
        image_path = generate_character_image(character_data, "character_images")
        
        if image_path and os.path.exists(image_path):
            # Read and encode the image
            import base64
            with open(image_path, "rb") as image_file:
                encoded_image = base64.b64encode(image_file.read()).decode("utf-8")
            
            return jsonify({
                "base64_image": encoded_image,
                "image_path": image_path
            })
        else:
            return jsonify({"error": "Failed to generate character image"}), 500

    except Exception as e:
        print(f"Error in generate_character_api: {e}")
        return jsonify({"error": "An internal server error occurred."}), 500

if __name__ == "__main__":
    print("Starting Character Service on port 5002...")
    character_app.run(debug=True, port=5002)
