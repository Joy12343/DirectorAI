echo "🧪 Testing Video Generation Service..."

# Test health check
echo "1️⃣ Testing health check..."
curl -s http://localhost:5002/ | python -m json.tool

echo -e "\n2️⃣ Testing video generation..."
curl -X POST http://localhost:5002/api/video \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A beautiful sunset over mountains",
    "image_url": "https://res.cloudinary.com/dxrr6xfnr/image/upload/v1750563689/scene_04_vfl0ev.png",
    "aspect_ratio": "16:9"
  }' | python -m json.tool

echo -e "\n✅ Test complete!"
