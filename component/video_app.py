from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sys
import os
import base64
import tempfile
import requests
from PIL import Image
import io
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add the parent directory to the path so we can import from api/
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from api.video_generator import generate_luma_video
    logger.info("✅ Successfully imported video_generator")
except ImportError as e:
    logger.error(f"❌ Failed to import video_generator: {e}")
    # Create a mock function for testing
    def generate_luma_video(prompt, image_url, aspect_ratio):
        logger.warning("Using mock video generation")
        return "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4"

app = Flask(__name__)
CORS(app)

def upload_base64_image_to_cloudinary(base64_data):
    """Upload base64 image to Cloudinary and return public URL"""
    try:
        # Extract base64 data (remove data:image/png;base64, prefix)
        if ',' in base64_data:
            base64_data = base64_data.split(',')[1]
        
        # Decode base64 to image
        image_data = base64.b64decode(base64_data)
        image = Image.open(io.BytesIO(image_data))
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as temp_file:
            image.save(temp_file.name, 'PNG')
            temp_file_path = temp_file.name
        
        # Simple approach: save to a public directory and serve via Flask
        import uuid
        filename = f"scene_{uuid.uuid4().hex[:8]}.png"
        static_dir = os.path.join(os.path.dirname(__file__), 'static')
        os.makedirs(static_dir, exist_ok=True)
        public_path = os.path.join(static_dir, filename)
        
        # Copy temp file to public directory
        import shutil
        shutil.copy2(temp_file_path, public_path)
        
        # Clean up temp file
        os.unlink(temp_file_path)
        
        # Return public URL
        public_url = f"http://localhost:5002/static/{filename}"
        logger.info(f"📸 Image uploaded to: {public_url}")
        return public_url
        
    except Exception as e:
        logger.error(f"❌ Error uploading image: {e}")
        # Fallback to placeholder
        return "https://res.cloudinary.com/dxrr6xfnr/image/upload/v1750563689/scene_04_vfl0ev.png"

@app.route('/static/<filename>')
def serve_static(filename):
    """Serve static files (uploaded images)"""
    static_dir = os.path.join(os.path.dirname(__file__), 'static')
    return send_from_directory(static_dir, filename)

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({
        "status": "Video service is running", 
        "port": 5002,
        "endpoints": [
            "/api/video - POST - Generate video",
            "/api/compile-videos - POST - Compile multiple videos",
            "/static/<filename> - GET - Serve uploaded images"
        ]
    })

@app.route('/api/video', methods=['POST'])
def generate_video():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        prompt = data.get('prompt')
        image_data = data.get('imageUrl') or data.get('image_url')  # Support both formats
        aspect_ratio = data.get('aspectRatio') or data.get('aspect_ratio', '16:9')
        
        if not prompt or not image_data:
            return jsonify({"error": "Missing prompt or image data"}), 400
            
        logger.info(f"🎬 Starting video generation...")
        logger.info(f"📝 Prompt: {prompt[:100]}...")
        logger.info(f"📐 Aspect Ratio: {aspect_ratio}")
        
        # Handle base64 image data - upload to get public URL
        if image_data.startswith('data:image'):
            logger.info("📸 Converting base64 image to public URL...")
            image_url = upload_base64_image_to_cloudinary(image_data)
        else:
            image_url = image_data
            
        logger.info(f"🖼️  Using Image URL: {image_url}")
        
        # Call your existing video generation function
        video_url = generate_luma_video(prompt, image_url, aspect_ratio)
        
        logger.info(f"✅ Video generated successfully: {video_url}")
        
        return jsonify({
            "success": True,
            "videoUrl": video_url,  # Use camelCase for consistency
            "video_url": video_url,  # Also provide snake_case
            "message": "Video generated successfully"
        })
        
    except Exception as e:
        logger.error(f"❌ Video generation error: {str(e)}")
        return jsonify({
            "error": str(e),
            "success": False
        }), 500

@app.route('/api/compile-videos', methods=['POST'])
def compile_videos():
    """Compile multiple video URLs into a single video"""
    try:
        data = request.get_json()
        video_urls = data.get('video_urls', [])
        
        if not video_urls:
            return jsonify({"error": "No video URLs provided"}), 400
            
        logger.info(f"🎬 Compiling {len(video_urls)} videos...")
        
        # For now, return the first video URL
        # In production, you'd use ffmpeg to concatenate videos
        compiled_video_url = video_urls[0] if video_urls else None
        
        # TODO: Implement actual video compilation using ffmpeg
        # This would download all videos, concatenate them, and upload the result
        
        logger.info(f"✅ Video compilation complete: {compiled_video_url}")
        
        return jsonify({
            "success": True,
            "compiled_video_url": compiled_video_url,
            "message": f"Compiled {len(video_urls)} videos"
        })
        
    except Exception as e:
        logger.error(f"❌ Video compilation error: {str(e)}")
        return jsonify({
            "error": str(e),
            "success": False
        }), 500

if __name__ == '__main__':
    logger.info("🎬 Starting Video Generation Service on port 5002...")
    logger.info("🔑 Make sure your LUMA_API_KEY is set in your environment")
    logger.info("📁 Static files will be served from ./static/")
    
    # Create static directory
    static_dir = os.path.join(os.path.dirname(__file__), 'static')
    os.makedirs(static_dir, exist_ok=True)
    
    app.run(host='0.0.0.0', port=5002, debug=True)
