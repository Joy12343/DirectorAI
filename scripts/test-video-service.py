"""
Test script to verify video service is working
"""

import requests
import json
import time

def test_video_service():
    base_url = "http://localhost:5002"
    
    print("🧪 Testing Video Service...")
    
    # Test 1: Health check
    try:
        response = requests.get(f"{base_url}/")
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False
    
    # Test 2: Video generation
    try:
        test_data = {
            "prompt": "A basketball player dribbling on a court",
            "imageUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
            "aspectRatio": "16:9",
            "sceneNumber": 1
        }
        
        print("🎬 Testing video generation...")
        response = requests.post(
            f"{base_url}/api/video",
            headers={"Content-Type": "application/json"},
            json=test_data,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Video generation test passed")
            print(f"   Video URL: {result.get('videoUrl', 'None')}")
            print(f"   Type: {result.get('type', 'Unknown')}")
            return True
        else:
            print(f"❌ Video generation failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Video generation error: {e}")
        return False

if __name__ == "__main__":
    success = test_video_service()
    if success:
        print("\n🎉 All tests passed!")
    else:
        print("\n❌ Some tests failed!")
