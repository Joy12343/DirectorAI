echo "🧪 Testing video service connection..."

# Check if port 5002 is in use
echo "1️⃣ Checking if port 5002 is in use..."
if lsof -Pi :5002 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "✅ Port 5002 is in use"
    
    # Get process info
    echo "📋 Process using port 5002:"
    lsof -Pi :5002 -sTCP:LISTEN
else
    echo "❌ Port 5002 is not in use"
    echo "💡 You need to start the video service first"
    exit 1
fi

echo ""
echo "2️⃣ Testing health check..."
if curl -s http://localhost:5002/ > /dev/null; then
    echo "✅ Health check successful"
    curl -s http://localhost:5002/ | python -m json.tool 2>/dev/null || curl -s http://localhost:5002/
else
    echo "❌ Health check failed"
    echo "🔍 Checking what's actually running on port 5002..."
    curl -v http://localhost:5002/ 2>&1 | head -20
fi

echo ""
echo "3️⃣ Testing video generation endpoint..."
curl -X POST http://localhost:5002/api/video \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Test video generation",
    "imageUrl": "https://example.com/test.jpg",
    "aspectRatio": "16:9"
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  2>/dev/null | python -m json.tool 2>/dev/null || echo "Failed to parse JSON response"
