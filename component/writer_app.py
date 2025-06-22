from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
from dotenv import load_dotenv

load_dotenv()
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'api'))
from writer import SceneGenerator
import os

writer_app = Flask(__name__)
CORS(writer_app)

CLAUDE_API_KEY = os.getenv("ANTHROPIC_API_KEY")

@writer_app.route("/api/claude", methods=["POST"])
def generate_claude_response():
    data = request.get_json()
    story = data.get("story")

    if not story:
        return jsonify({"error": "Missing story input"}), 400

    generator = SceneGenerator(api_key=CLAUDE_API_KEY)

    result = generator.generate_story_elements(story)

    return jsonify(result)

if __name__ == "__main__":
    writer_app.run(debug=True, port=5000)
