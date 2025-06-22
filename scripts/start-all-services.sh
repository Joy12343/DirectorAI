echo "🚀 Starting all backend services..."

# Function to cleanup on exit
cleanup() {
    echo "🛑 Stopping all services..."
    kill $(jobs -p) 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup INT TERM

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Create a .env file with your API keys"
    exit 1
fi

# Start writer service (port 5000)
echo "📝 Starting Writer Service on port 5000..."
python component/writer_app.py &
WRITER_PID=$!

# Start image service (port 5001)  
echo "🖼️  Starting Image Service on port 5001..."
python component/image_app.py &
IMAGE_PID=$!

# Start character service (port 5002)
echo "👥 Starting Character Service on port 5002..."
python component/character_service.py &
CHARACTER_PID=$!

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 5

# Test services
echo "🧪 Testing services..."

# Test writer service
if curl -s http://localhost:5000/ > /dev/null; then
    echo "✅ Writer service is running on port 5000"
else
    echo "❌ Writer service failed to start"
fi

# Test image service
if curl -s http://localhost:5001/ > /dev/null; then
    echo "✅ Image service is running on port 5001"
else
    echo "❌ Image service failed to start"
fi

# Test character service
if curl -s http://localhost:5002/ > /dev/null; then
    echo "✅ Character service is running on port 5002"
else
    echo "❌ Character service failed to start"
fi

echo ""
echo "🎉 All services are running!"
echo "Writer API: http://localhost:5000"
echo "Image API: http://localhost:5001"  
echo "Character API: http://localhost:5002"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for any process to exit
wait
