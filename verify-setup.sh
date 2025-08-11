#!/bin/bash

CRON_SECRET="JZt2EW0lpuC84PDJppr1pCN3pq3W3aPR4ty25qCLmmY="
VERCEL_URL="https://loopletter.co"

echo "🔍 Verifying your setup..."

# Test 1: Check if endpoint responds to direct curl
echo "1️⃣ Testing direct API call..."
RESPONSE=$(curl -s -w "%{http_code}" -H "Authorization: Bearer $CRON_SECRET" "$VERCEL_URL/api/queue/process-all")
HTTP_CODE="${RESPONSE: -3}"
BODY="${RESPONSE%???}"

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Direct API call successful"
    echo "📄 Response: $BODY"
else
    echo "❌ Direct API call failed with status: $HTTP_CODE"
    echo "📄 Response: $BODY"
    
    if [ "$HTTP_CODE" = "401" ]; then
        echo "🔑 Authentication issue - check if CRON_SECRET is set in Vercel"
    fi
fi

echo ""
echo "2️⃣ Testing Lambda function..."
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

echo ""
echo "📋 Next steps if authentication is still failing:"
echo "1. Verify CRON_SECRET is added to Vercel environment variables"
echo "2. Redeploy to Vercel: vercel --prod"
echo "3. Wait a few minutes for deployment to complete"
echo "4. Run this script again"