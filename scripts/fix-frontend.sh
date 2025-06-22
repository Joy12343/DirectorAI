echo "🔧 Fixing Next.js frontend setup..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Make sure you're in the project root directory."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Clear Next.js cache
echo "🧹 Clearing Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache

# Rebuild the project
echo "🔨 Building the project..."
npm run build

echo "✅ Frontend setup complete!"
echo "🚀 Run 'npm run dev' to start the development server"
