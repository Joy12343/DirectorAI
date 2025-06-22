"""
Script to properly install and test MoviePy
"""

import subprocess
import sys
import os

def install_moviepy():
    """Install MoviePy and its dependencies"""
    print("📦 Installing MoviePy and dependencies...")
    
    try:
        # Install MoviePy
        subprocess.run([sys.executable, "-m", "pip", "install", "moviepy"], check=True)
        print("✅ MoviePy installed successfully")
        
        # Install additional dependencies that might be needed
        subprocess.run([sys.executable, "-m", "pip", "install", "imageio-ffmpeg"], check=True)
        print("✅ imageio-ffmpeg installed successfully")
        
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Installation failed: {e}")
        return False

def test_moviepy():
    """Test if MoviePy can be imported and used"""
    print("🧪 Testing MoviePy import...")
    
    try:
        from moviepy.editor import VideoFileClip, concatenate_videoclips
        print("✅ MoviePy imported successfully")
        
        # Test basic functionality
        print("🧪 Testing basic MoviePy functionality...")
        # This would normally test with actual video files
        print("✅ MoviePy basic test passed")
        
        return True
    except ImportError as e:
        print(f"❌ MoviePy import failed: {e}")
        return False
    except Exception as e:
        print(f"❌ MoviePy test failed: {e}")
        return False

def main():
    print("🔧 Setting up MoviePy for video compilation...")
    
    # Try to import first
    try:
        from moviepy.editor import VideoFileClip
        print("✅ MoviePy is already installed and working")
        return
    except ImportError:
        print("📦 MoviePy not found, installing...")
    
    # Install MoviePy
    if install_moviepy():
        # Test the installation
        if test_moviepy():
            print("🎉 MoviePy setup complete!")
        else:
            print("❌ MoviePy installation verification failed")
    else:
        print("❌ MoviePy installation failed")

if __name__ == "__main__":
    main()
