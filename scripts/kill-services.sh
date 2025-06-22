echo "🛑 Stopping all services..."

# Kill processes on specific ports
echo "Killing processes on port 5000..."
lsof -ti:5000 | xargs kill -9 2>/dev/null || echo "No process on port 5000"

echo "Killing processes on port 5001..."
lsof -ti:5001 | xargs kill -9 2>/dev/null || echo "No process on port 5001"

echo "Killing processes on port 5002..."
lsof -ti:5002 | xargs kill -9 2>/dev/null || echo "No process on port 5002"

echo "Killing processes on port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "No process on port 3000"

# Kill any Python Flask processes
pkill -f "python.*app.py" 2>/dev/null || echo "No Flask processes found"

echo "✅ All services stopped"
