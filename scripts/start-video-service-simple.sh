echo "🎬 Starting Simple Video Service (Mock)..."

# Check if Python is available
if ! command -v python &> /dev/null; then
    echo "❌ Python is not installed or not in PATH"
    exit 1
fi

# Check if the simple video service file exists
if [ ! -f "component/simple_video_service.py" ]; then
    echo "❌ Simple video service file not found: component/simple_video_service.py"
    exit 1
fi

echo "🚀 Starting simple video service on port 5002..."
echo "📍 This service returns mock video URLs for testing"
echo "🔗 Service will be available at: http://localhost:5002"
echo ""

cd "$(dirname "$0")/.."
python component/simple_video_service.py
