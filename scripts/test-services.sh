echo "🧪 Testing all backend services..."

# Test writer service (port 5000)
echo "Testing Writer Service..."
if curl -s http://localhost:5000/ > /dev/null; then
    echo "✅ Writer service is running on port 5000"
else
    echo "❌ Writer service is NOT running on port 5000"
fi

# Test image service (port 5001)
echo "Testing Image Service..."
if curl -s http://localhost:5001/ > /dev/null; then
    echo "✅ Image service is running on port 5001"
else
    echo "❌ Image service is NOT running on port 5001"
fi

# Test image generation endpoint
echo "Testing Image Generation..."
response=$(curl -s -w "%{http_code}" -X POST http://localhost:5001/api/image \
  -H "Content-Type: application/json" \
  -d '{"description": "test scene"}' \
  -o /dev/null)

if [ "$response" = "200" ]; then
    echo "✅ Image generation endpoint is working"
else
    echo "❌ Image generation endpoint returned: $response"
fi

echo ""
echo "🔧 If services are not running, start them with:"
echo "python component/writer_app.py &"
echo "python component/image_app.py &"
