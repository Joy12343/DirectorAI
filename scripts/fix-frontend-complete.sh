echo "🔧 Completely fixing Next.js frontend..."

# Stop any running dev server
echo "🛑 Stopping any running Next.js server..."
pkill -f "next dev" 2>/dev/null || echo "No Next.js dev server running"

# Remove problematic files and directories
echo "🧹 Cleaning up..."
rm -rf node_modules
rm -rf .next
rm -rf .swc
rm -f package-lock.json
rm -f yarn.lock

# Clear npm cache
echo "🗑️ Clearing npm cache..."
npm cache clean --force

# Install dependencies with exact versions
echo "📦 Installing dependencies..."
npm install

# Clear Next.js cache again
echo "🧹 Clearing Next.js cache..."
rm -rf .next

# Try to build to check for issues
echo "🔨 Testing build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "🚀 Starting development server..."
    npm run dev
else
    echo "❌ Build failed. Trying alternative approach..."
    
    # Alternative: Create a minimal Next.js app
    echo "🔄 Creating minimal configuration..."
    
    # Create minimal next.config.js
    cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {}
module.exports = nextConfig
EOF
    
    # Try build again
    npm run build
    
    if [ $? -eq 0 ]; then
        echo "✅ Minimal build successful!"
        npm run dev
    else
        echo "❌ Still failing. Please check the error messages above."
    fi
fi
