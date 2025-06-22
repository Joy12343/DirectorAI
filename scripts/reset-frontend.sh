echo "🔄 Resetting frontend to working state..."

# Stop any running processes
pkill -f "next dev" 2>/dev/null

# Complete cleanup
rm -rf node_modules .next .swc package-lock.json yarn.lock

# Reinstall with specific working versions
echo "📦 Installing working versions..."

npm install next@14.2.0 react@18.2.0 react-dom@18.2.0
npm install lucide-react@0.294.0
npm install class-variance-authority@0.7.0 clsx@2.0.0 tailwind-merge@2.0.0
npm install @radix-ui/react-slot@1.0.2

# Dev dependencies
npm install -D typescript@5.3.0 @types/node@20.10.0 @types/react@18.2.0 @types/react-dom@18.2.0
npm install -D tailwindcss@3.3.5 autoprefixer@10.4.16 postcss@8.4.31
npm install -D tailwindcss-animate@1.0.7
npm install -D eslint@8.55.0 eslint-config-next@14.2.0

echo "✅ Dependencies installed"
echo "🚀 Starting development server..."

npm run dev
