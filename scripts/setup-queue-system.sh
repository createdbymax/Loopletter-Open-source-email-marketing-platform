#!/bin/bash

echo "🚀 Setting up Loopletter Queue System..."
echo ""

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install bullmq ioredis
npm install --save-dev @types/ioredis

echo ""
echo "✅ Dependencies installed successfully!"
echo ""

# Test the system
echo "🧪 Testing the system..."
npm run test-system

echo ""
echo "📋 Setup Complete! Next steps:"
echo ""
echo "1. 🗄️  Run database migrations in Supabase:"
echo "   - Copy and run: database-schema-ses-quota.sql"
echo "   - Copy and run: database-schema-campaign-job-id.sql"
echo ""
echo "2. 🧪 Test campaign sending:"
echo "   - Start the app: npm run dev"
echo "   - Visit: http://localhost:3000/dashboard/campaigns"
echo "   - Create and send a test campaign"
echo ""
echo "3. 📊 Monitor the queue:"
echo "   - Visit: http://localhost:3000/dashboard/queue"
echo "   - Run worker: npm run queue-worker (for development)"
echo ""
echo "4. 🚀 Deploy to production:"
echo "   - Push to your repository"
echo "   - Vercel will automatically process the queue via cron"
echo ""