echo "⚡ Quick frontend fix..."

# Kill any running Next.js processes
pkill -f "next dev" 2>/dev/null

# Remove problematic cache
rm -rf .next .swc

# Quick reinstall
npm install --legacy-peer-deps

# Start with clean slate
npm run dev
