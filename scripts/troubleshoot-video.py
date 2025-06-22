"""
Comprehensive troubleshooting script for video generation issues
"""

import requests
import json
import os
import sys
import subprocess

def check_video_service():
    """Check if video service is running"""
    print("🔍 Checking video service...")
    
    try:
        response = requests.get("http://localhost:5002/", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ Video service is running")
            print(f"   Status: {data.get('status')}")
            print(f"   Port: {data.get('port')}")
            return True
        else:
            print(f"❌ Video service returned {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to video service on port 5002")
        print("💡 Try running: python component/simple_video_service.py")
        return False
    except Exception as e:
        print(f"❌ Error checking video service: {e}")
        return False

def check_api_route():
    """Check if the /api/video route works"""
    print("🔍 Checking /api/video route...")
    
    test_data = {
        "prompt": "Test prompt",
        "imageUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
        "aspectRatio": "16:9"
    }
    
    try:
        response = requests.post(
            "http://localhost:5002/api/video",
            headers={"Content-Type": "application/json"},
            json=test_data,
            timeout=10
        )
        
        if response.status_code == 200:
            print("✅ /api/video route is working")
            result = response.json()
            print(f"   Video URL: {result.get('videoUrl', 'None')}")
            return True
        else:
            print(f"❌ /api/video route failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error testing /api/video route: {e}")
        return False

def check_environment():
    """Check environment variables"""
    print("🔍 Checking environment variables...")
    
    luma_key = os.getenv("LUMA_API_KEY")
    if luma_key:
        print("✅ LUMA_API_KEY is set")
    else:
        print("⚠️  LUMA_API_KEY is not set (will use mock generation)")
    
    return True

def check_dependencies():
    """Check if required dependencies are installed"""
    print("🔍 Checking Python dependencies...")
    
    required_packages = ["flask", "flask_cors", "requests", "PIL"]
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
            print(f"✅ {package} is installed")
        except ImportError:
            print(f"❌ {package} is missing")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"💡 Install missing packages: pip install {' '.join(missing_packages)}")
        return False
    
    return True

def check_ports():
    """Check if required ports are available"""
    print("🔍 Checking port availability...")
    
    import socket
    
    def is_port_open(port):
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        result = sock.connect_ex(('localhost', port))
        sock.close()
        return result == 0
    
    if is_port_open(5002):
        print("✅ Port 5002 is in use (video service running)")
        return True
    else:
        print("❌ Port 5002 is not in use (video service not running)")
        return False

def suggest_fixes():
    """Suggest fixes for common issues"""
    print("\n🔧 Suggested fixes:")
    print("1. Start the video service:")
    print("   python component/simple_video_service.py")
    print("")
    print("2. Clear browser cache and localStorage:")
    print("   - Open browser dev tools (F12)")
    print("   - Go to Application/Storage tab")
    print("   - Clear localStorage and IndexedDB")
    print("")
    print("3. Regenerate images:")
    print("   - Go to the edit page")
    print("   - Click 'Clear & Regenerate All' button")
    print("")
    print("4. Check console logs:")
    print("   - Open browser dev tools (F12)")
    print("   - Check Console tab for errors")
    print("")
    print("5. Restart all services:")
    print("   - Stop all running Python processes")
    print("   - Run: bash scripts/start-all-services.sh")

def main():
    print("🔧 Video Generation Troubleshooting")
    print("=" * 50)
    
    all_good = True
    
    # Run all checks
    if not check_dependencies():
        all_good = False
    
    print()
    if not check_environment():
        all_good = False
    
    print()
    if not check_ports():
        all_good = False
    
    print()
    if not check_video_service():
        all_good = False
    
    print()
    if not check_api_route():
        all_good = False
    
    print("\n" + "=" * 50)
    
    if all_good:
        print("🎉 All checks passed! Video generation should work.")
    else:
        print("❌ Some issues found.")
        suggest_fixes()

if __name__ == "__main__":
    main()
