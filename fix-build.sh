#!/bin/bash

echo "🔧 Fixing Vercel build issues..."

# Stop the dev server if running
echo "🛑 Stopping any running dev servers..."
pkill -f "next dev" || true

# Clean up node_modules and lock files
echo "🧹 Cleaning up dependencies..."
rm -rf node_modules
rm -f package-lock.json yarn.lock

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Try to build locally first to test
echo "🔨 Testing local build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Local build successful!"
    
    # Add all changes to git
    echo "📝 Adding changes to git..."
    git add .

    # Commit the changes
    echo "💾 Committing changes..."
    git commit -m "Fix Vercel build issues

- Add lightningcss ^1.28.2 to fix Tailwind v4 native binary dependency
- Add @types/uuid ^10.0.0 to fix TypeScript declaration error
- Remove Turbopack custom CSS rules (handled automatically in v4)
- Switch dev script back to regular Next.js (Turbopack optional)
- Clean node_modules and lock files for fresh install"

    # Push to main branch
    echo "🚀 Pushing to main branch..."
    git push origin main

    echo "✅ Done! Your Vercel build should now work."
    echo "🔗 Check your Vercel dashboard for the new deployment."
    echo "💡 You can now run 'npm run dev' to test locally."
else
    echo "❌ Local build failed. Please check the errors above."
    echo "You may need to run 'npm run dev' to see more details."
fi