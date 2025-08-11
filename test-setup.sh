#!/bin/bash

echo "🧪 Testing your EventBridge + Lambda setup..."

# Test 1: Check if Lambda function exists
echo "1️⃣ Checking Lambda function..."
aws lambda get-function --function-name loopletter-queue-processor > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Lambda function exists"
else
    echo "❌ Lambda function not found"
    exit 1
fi

# Test 2: Check EventBridge rule
echo "2️⃣ Checking EventBridge rule..."
aws events describe-rule --name loopletter-queue-trigger > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ EventBridge rule exists"
else
    echo "❌ EventBridge rule not found"
    exit 1
fi

# Test 3: Invoke Lambda function
echo "3️⃣ Testing Lambda function..."
aws lambda invoke --function-name loopletter-queue-processor response.json > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Lambda function invoked successfully"
    echo "📄 Response:"
    cat response.json
    echo ""
else
    echo "❌ Failed to invoke Lambda function"
fi

# Test 4: Check EventBridge targets
echo "4️⃣ Checking EventBridge targets..."
TARGETS=$(aws events list-targets-by-rule --rule loopletter-queue-trigger --query 'Targets[0].Id' --output text)
if [ "$TARGETS" = "1" ]; then
    echo "✅ EventBridge target configured"
else
    echo "❌ EventBridge target not configured properly"
fi

echo ""
echo "🎯 Next steps:"
echo "1. Update Lambda function with your actual Vercel URL and CRON_SECRET"
echo "2. Add CRON_SECRET to your Vercel environment variables"
echo "3. Deploy your app to Vercel"
echo "4. Wait a minute and check your queue processing logs"

# Clean up
rm -f response.json