echo "🧪 Testing image generation..."

# Test if image service is running
echo "1️⃣ Checking image service..."
if curl -s http://localhost:5001/ > /dev/null; then
    echo "✅ Image service is running"
    curl -s http://localhost:5001/ | python -m json.tool
else
    echo "❌ Image service is not running"
    echo "💡 Start it with: python component/image_app.py"
    exit 1
fi

echo ""
echo "2️⃣ Testing scene image generation..."
curl -X POST http://localhost:5001/api/image \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Wide shot of empty basketball court, golden hour lighting, dramatic shadows across weathered concrete"
  }' \
  -w "\nHTTP Status: %{http_code}\n"

echo ""
echo "3️⃣ Testing character image generation..."
curl -X POST http://localhost:5001/api/character-image \
  -H "Content-Type: application/json" \
  -d '{
    "character": {
      "Name": "Edward",
      "Description": "17-year-old athletic teenager, 5'\''10\" with short dark hair, wearing a faded red tank top",
      "Personality": "Competitive, focused, slightly cocky but good-natured",
      "Role": "Protagonist"
    }
  }' \
  -w "\nHTTP Status: %{http_code}\n"
