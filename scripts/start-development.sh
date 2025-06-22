# Development startup script
echo "🚀 Starting Story-to-Video Development Environment"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Create a .env file with your API keys:"
    echo "ANTHROPIC_API_KEY=your_key_here"
    echo "GEMINI_API_KEY=your_key_here"
    echo "ELEVENLABS_API_KEY=your_key_here"
    echo "LUMA_API_KEY=your_key_here"
    exit 1
fi

# Start backend services in background
echo "📡 Starting Flask backend services..."

# Start writer service
python component/writer_app.py &
WRITER_PID=$!

# Start image service  
python component/image_app.py &
IMAGE_PID=$!

# Wait for services to start
sleep 3

# Start Next.js frontend
echo "🌐 Starting Next.js frontend..."
npm run dev &
FRONTEND_PID=$!

echo "✅ All services started!"
echo "Frontend: http://localhost:3000"
echo "Writer API: http://localhost:5000"
echo "Image API: http://localhost:5001"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo "🛑 Stopping all services..."
    kill $WRITER_PID $IMAGE_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup INT TERM

# Wait for any process to exit
wait
