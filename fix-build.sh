#!/bin/bash

echo "🔧 Fixing Vercel build issue..."

# Install dependencies with the new package.json
echo "📦 Installing dependencies..."
npm install

# Add all changes to git
echo "📝 Adding changes to git..."
git add .

# Commit the changes
echo "💾 Committing changes..."
git commit -m "Fix Vercel build: downgrade to Tailwind CSS v3

- Remove @tailwindcss/postcss v4 dependency that was causing lightningcss issues
- Downgrade to stable Tailwind CSS v3.4.17
- Update PostCSS config to use standard Tailwind + Autoprefixer
- Update globals.css to use standard Tailwind imports
- Update tailwind.config.js with proper theme configuration
- Remove package-lock.json and yarn.lock for clean dependency resolution"

# Push to main branch
echo "🚀 Pushing to main branch..."
git push origin main

echo "✅ Done! Your Vercel build should now work."
echo "🔗 Check your Vercel dashboard for the new deployment."