#!/bin/bash

# AWS EventBridge Setup Script for Loopletter Queue Processing
# Replace these variables with your actual values

VERCEL_URL="https://your-app.vercel.app"  # Replace with your actual Vercel URL
CRON_SECRET="your-cron-secret-here"       # Replace with your generated CRON_SECRET
AWS_REGION="us-east-1"                    # Your preferred AWS region
RULE_NAME="loopletter-queue-processor"

echo "🚀 Setting up AWS EventBridge for Loopletter queue processing..."

# Step 1: Create EventBridge rule
echo "📅 Creating EventBridge rule..."
aws events put-rule \
  --region $AWS_REGION \
  --name $RULE_NAME \
  --schedule-expression "rate(1 minute)" \
  --description "Process Loopletter email queue every minute" \
  --state ENABLED

if [ $? -eq 0 ]; then
    echo "✅ EventBridge rule created successfully"
else
    echo "❌ Failed to create EventBridge rule"
    exit 1
fi

# Step 2: Create connection for authentication
echo "🔐 Creating EventBridge connection for authentication..."
aws events create-connection \
  --region $AWS_REGION \
  --name "loopletter-auth-connection" \
  --description "Authentication connection for Loopletter API" \
  --authorization-type "API_KEY" \
  --auth-parameters "ApiKeyAuthParameters={ApiKeyName=Authorization,ApiKeyValue=Bearer $CRON_SECRET}"

# Step 3: Create destination
echo "🎯 Creating HTTP destination..."
DESTINATION_ARN=$(aws events create-destination \
  --region $AWS_REGION \
  --name "loopletter-queue-destination" \
  --description "HTTP destination for Loopletter queue processing" \
  --connection-arn "arn:aws:events:$AWS_REGION:$(aws sts get-caller-identity --query Account --output text):connection/loopletter-auth-connection" \
  --http-parameters "PathParameterValues={},HeaderParameters={},QueryStringParameters={}" \
  --query 'DestinationArn' \
  --output text)

echo "📡 Destination ARN: $DESTINATION_ARN"

# Step 4: Add target to rule
echo "🎯 Adding target to EventBridge rule..."
aws events put-targets \
  --region $AWS_REGION \
  --rule $RULE_NAME \
  --targets "[{
    \"Id\": \"1\",
    \"Arn\": \"$DESTINATION_ARN\",
    \"HttpParameters\": {
      \"PathParameterValues\": {},
      \"HeaderParameters\": {},
      \"QueryStringParameters\": {}
    },
    \"RoleArn\": \"arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/service-role/Amazon_EventBridge_Invoke_Http_Destination_Role\"
  }]"

if [ $? -eq 0 ]; then
    echo "✅ Target added successfully"
else
    echo "❌ Failed to add target"
    exit 1
fi

echo ""
echo "🎉 AWS EventBridge setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Add CRON_SECRET to your Vercel environment variables"
echo "2. Remove the 'crons' section from vercel.json"
echo "3. Deploy your changes to Vercel"
echo "4. Monitor the EventBridge rule in AWS Console"
echo ""
echo "🔍 To test manually:"
echo "curl -X GET -H 'Authorization: Bearer $CRON_SECRET' $VERCEL_URL/api/queue/process-all"