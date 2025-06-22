"""
Script to help set up and test your Flask backend services
"""

import subprocess
import sys
import os
import time
import requests

def install_requirements():
    """Install Python requirements"""
    print("📦 Installing Python requirements...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)
        print("✅ Requirements installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install requirements: {e}")
        return False
    return True

def check_env_variables():
    """Check if required environment variables are set"""
    print("🔍 Checking environment variables...")
    
    required_vars = [
        "ANTHROPIC_API_KEY",
        "GEMINI_API_KEY",
        "ELEVENLABS_API_KEY",
        "LUMA_API_KEY"
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print("❌ Missing environment variables:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\n💡 Create a .env file with these variables:")
        for var in missing_vars:
            print(f"   {var}=your_api_key_here")
        return False
    
    print("✅ All environment variables are set")
    return True

def start_flask_services():
    """Start the Flask services"""
    print("🚀 Starting Flask services...")
    
    # Start writer service
    print("Starting writer service on port 5000...")
    writer_process = subprocess.Popen([
        sys.executable, "-c", 
        "from component.writer_app import writer_app; writer_app.run(debug=True, port=5000)"
    ])
    
    # Wait a bit for the service to start
    time.sleep(2)
    
    # Start image service
    print("Starting image service on port 5001...")
    image_process = subprocess.Popen([
        sys.executable, "-c",
        "from component.image_app import image_app; image_app.run(debug=True, port=5001)"
    ])
    
    return writer_process, image_process

def test_services():
    """Test if the services are running"""
    print("🧪 Testing services...")
    
    # Test writer service
    try:
        response = requests.get("http://localhost:5000/", timeout=5)
        print("✅ Writer service is running on port 5000")
    except requests.exceptions.RequestException:
        print("❌ Writer service is not responding on port 5000")
    
    # Test image service
    try:
        response = requests.get("http://localhost:5001/", timeout=5)
        print("✅ Image service is running on port 5001")
    except requests.exceptions.RequestException:
        print("❌ Image service is not responding on port 5001")

def main():
    print("🔧 Setting up Flask backend services...\n")
    
    # Step 1: Install requirements
    if not install_requirements():
        return
    
    print()
    
    # Step 2: Check environment variables
    if not check_env_variables():
        return
    
    print()
    
    # Step 3: Test services
    print("To start your services manually, run these commands in separate terminals:")
    print("Terminal 1: python component/writer_app.py")
    print("Terminal 2: python component/image_app.py")
    print()
    print("Or run this script with --start to start them automatically")
    
    if len(sys.argv) > 1 and sys.argv[1] == "--start":
        writer_proc, image_proc = start_flask_services()
        
        print("\n⏳ Waiting for services to start...")
        time.sleep(5)
        
        test_services()
        
        print("\n🎉 Services are running! Press Ctrl+C to stop.")
        try:
            writer_proc.wait()
        except KeyboardInterrupt:
            print("\n🛑 Stopping services...")
            writer_proc.terminate()
            image_proc.terminate()

if __name__ == "__main__":
    main()
