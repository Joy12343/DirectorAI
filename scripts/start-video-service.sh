echo "🎬 Starting Video Generation Service..."

# Check if LUMA_API_KEY is set
if [ -z "$LUMA_API_KEY" ]; then
    echo "⚠️  Warning: LUMA_API_KEY environment variable is not set"
    echo "💡 Please set it with: export LUMA_API_KEY=your_api_key_here"
fi

# Check if Python is available
if ! command -v python &> /dev/null; then
    echo "❌ Python is not installed or not in PATH"
    exit 1
fi

# Check if the video service file exists
if [ ! -f "component/video_app.py" ]; then
    echo "❌ Video service file not found: component/video_app.py"
    exit 1
fi

# Start the video service
echo "🚀 Starting video service on port 5002..."
cd "$(dirname "$0")/.."
python component/video_app.py
