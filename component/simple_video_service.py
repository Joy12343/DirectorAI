"""
Simple video service for testing - starts on port 5002
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import os

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({
        "status": "Simple Video Service is running",
        "port": 5002,
        "message": "Service is healthy and ready to accept requests"
    })

@app.route('/api/video', methods=['POST'])
def generate_video():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        prompt = data.get('prompt')
        image_url = data.get('imageUrl') or data.get('image_url')
        aspect_ratio = data.get('aspectRatio') or data.get('aspect_ratio', '16:9')
        
        logger.info(f"🎬 Received video generation request")
        logger.info(f"📝 Prompt: {prompt[:100] if prompt else 'None'}...")
        logger.info(f"🖼️  Image URL type: {'base64' if image_url and image_url.startswith('data:') else 'url'}")
        logger.info(f"📐 Aspect Ratio: {aspect_ratio}")
        
        if not prompt or not image_url:
            return jsonify({"error": "Missing prompt or image data"}), 400
        
        # For testing, return a mock video URL
        mock_video_url = "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4"
        
        logger.info(f"✅ Returning mock video URL: {mock_video_url}")
        
        return jsonify({
            "success": True,
            "videoUrl": mock_video_url,
            "video_url": mock_video_url,
            "message": "Mock video generated successfully",
            "type": "mock"
        })
        
    except Exception as e:
        logger.error(f"❌ Error in video generation: {str(e)}")
        return jsonify({
            "error": str(e),
            "success": False
        }), 500

if __name__ == '__main__':
    logger.info("🎬 Starting Simple Video Service on port 5002...")
    logger.info("📍 This is a test service that returns mock video URLs")
    
    try:
        app.run(host='0.0.0.0', port=5002, debug=True)
    except Exception as e:
        logger.error(f"❌ Failed to start service: {e}")
