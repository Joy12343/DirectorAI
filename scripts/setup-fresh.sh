echo "🚀 Setting up fresh Next.js application..."

# Remove old files
rm -rf node_modules .next .swc package-lock.json yarn.lock

# Install dependencies
npm install

# Build to check for errors
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Setup complete! Starting development server..."
    npm run dev
else
    echo "❌ Build failed. Please check the errors above."
fi
