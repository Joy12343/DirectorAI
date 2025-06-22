echo "🔧 Fixing Next.js and Tailwind CSS setup..."

# Remove problematic files and directories
echo "Cleaning up..."
rm -rf node_modules
rm -rf .next
rm -f package-lock.json

# Install dependencies
echo "Installing dependencies..."
npm install

# Initialize Tailwind CSS properly
echo "Setting up Tailwind CSS..."
npx tailwindcss init -p

echo "✅ Setup complete! Try running 'npm run dev' now."
