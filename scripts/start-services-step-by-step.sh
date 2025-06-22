echo "🚀 Starting services step by step..."

# Function to check if a port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "❌ Port $port is already in use"
        return 1
    else
        echo "✅ Port $port is available"
        return 0
    fi
}

# Function to wait for service to start
wait_for_service() {
    local port=$1
    local name=$2
    local max_attempts=30
    local attempt=1
    
    echo "⏳ Waiting for $name to start on port $port..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "http://localhost:$port/" > /dev/null 2>&1; then
            echo "✅ $name is running on port $port"
            return 0
        fi
        echo "   Attempt $attempt/$max_attempts..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "❌ $name failed to start on port $port"
    return 1
}

# Check all ports first
echo "🔍 Checking port availability..."
check_port 5000
check_port 5001
check_port 5002

echo ""
echo "📝 Starting Writer Service (port 5000)..."
python component/writer_app.py &
WRITER_PID=$!
wait_for_service 5000 "Writer Service"

echo ""
echo "🖼️  Starting Image Service (port 5001)..."
python component/image_app.py &
IMAGE_PID=$!
wait_for_service 5001 "Image Service"

echo ""
echo "🎬 Starting Video Service (port 5002)..."
python component/video_app.py &
VIDEO_PID=$!
wait_for_service 5002 "Video Service"

echo ""
echo "🎉 All services started successfully!"
echo "Writer Service: http://localhost:5000"
echo "Image Service: http://localhost:5001"
echo "Video Service: http://localhost:5002"
echo ""
echo "Process IDs:"
echo "Writer: $WRITER_PID"
echo "Image: $IMAGE_PID"
echo "Video: $VIDEO_PID"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill $WRITER_PID $IMAGE_PID $VIDEO_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup INT TERM

# Wait for any process to exit
wait
