echo "🔍 Checking all services..."

# Function to check if a service is running
check_service() {
    local port=$1
    local name=$2
    
    if curl -s "http://localhost:$port/" > /dev/null 2>&1; then
        echo "✅ $name is running on port $port"
        return 0
    else
        echo "❌ $name is NOT running on port $port"
        return 1
    fi
}

# Check all services
check_service 5000 "Writer Service"
check_service 5001 "Image Service"
check_service 5002 "Video Service"
check_service 3000 "Frontend"

echo ""
echo "📋 Service Status Summary:"
echo "Writer Service (5000): $(check_service 5000 "Writer" && echo "Running" || echo "Stopped")"
echo "Image Service (5001): $(check_service 5001 "Image" && echo "Running" || echo "Stopped")"
echo "Video Service (5002): $(check_service 5002 "Video" && echo "Running" || echo "Stopped")"
echo "Frontend (3000): $(check_service 3000 "Frontend" && echo "Running" || echo "Stopped")"
