echo "🖼️ Starting Image Service only..."

# Check if Python is available
if ! command -v python &> /dev/null; then
    echo "❌ Python is not installed or not in PATH"
    exit 1
fi

# Check if the image service file exists
if [ ! -f "component/image_app.py" ]; then
    echo "❌ Image service file not found: component/image_app.py"
    echo "💡 Make sure you're in the project root directory"
    exit 1
fi

# Check if port 5001 is available
if lsof -Pi :5001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️ Port 5001 is already in use"
    echo "🔍 Process using port 5001:"
    lsof -Pi :5001 -sTCP:LISTEN
    echo ""
    echo "💡 Kill it with: lsof -ti:5001 | xargs kill -9"
    exit 1
fi

echo "🚀 Starting image service on port 5001..."
echo "📁 Make sure your .env file has the required API keys:"
echo "   - GEMINI_API_KEY"
echo "   - ANTHROPIC_API_KEY"
echo ""

python component/image_app.py
