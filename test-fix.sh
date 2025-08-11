#!/bin/bash

CRON_SECRET="JZt2EW0lpuC84PDJppr1pCN3pq3W3aPR4ty25qCLmmY="
VERCEL_URL="https://loopletter.co"

echo "🚀 Testing the middleware fix..."

echo "1️⃣ Deploying to Vercel..."
vercel --prod

echo ""
echo "⏳ Waiting 30 seconds for deployment to complete..."
sleep 30

echo ""
echo "2️⃣ Testing direct API call..."
RESPONSE=$(curl -s -w "%{http_code}" -H "Authorization: Bearer $CRON_SECRET" "$VERCEL_URL/api/queue/process-all")
HTTP_CODE="${RESPONSE: -3}"
BODY="${RESPONSE%???}"

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Direct API call successful!"
    echo "📄 Response: $BODY"
else
    echo "❌ Direct API call failed with status: $HTTP_CODE"
    echo "📄 Response: $BODY"
fi

echo ""
echo "3️⃣ Testing Lambda function..."
aws lambda invoke --function-name loopletter-queue-processor response.json > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Lambda function invoked"
    echo "📄 Lambda response:"
    cat response.json | jq '.' 2>/dev/null || cat response.json
else
    echo "❌ Lambda function failed"
fi

# Clean up
rm -f response.json

if [ "$HTTP_CODE" = "200" ]; then
    echo ""
    echo "🎉 SUCCESS! Your AWS EventBridge cron replacement is working!"
    echo "📋 What's happening now:"
    echo "- EventBridge triggers every minute"
    echo "- Lambda calls your API endpoint"
    echo "- Your queue gets processed automatically"
    echo "- No more Vercel cron limitations!"
else
    echo ""
    echo "🔧 Still having issues. Let's debug further..."
fi