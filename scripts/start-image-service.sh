echo "Starting Image Service..."

# Check if Python is available
if ! command -v python &> /dev/null; then
    echo "Python is not installed or not in PATH"
    exit 1
fi

# Check if the image service file exists
if [ ! -f "component/image_app.py" ]; then
    echo "Image service file not found: component/image_app.py"
    exit 1
fi

# Start the image service
echo "Starting image service on port 5001..."
python component/image_app.py
