#!/bin/bash

# Simple AWS EventBridge Setup for Loopletter
# This uses a Lambda function to call your HTTP endpoint

VERCEL_URL="https://your-app.vercel.app"  # Replace with your actual Vercel URL
CRON_SECRET="your-cron-secret-here"       # Replace with your generated CRON_SECRET
AWS_REGION="us-east-1"
FUNCTION_NAME="loopletter-queue-processor"

echo "🚀 Setting up simple AWS EventBridge + Lambda solution..."

# Step 1: Create Lambda function code
echo "📝 Creating Lambda function code..."
cat > lambda-function.js << EOF
const https = require('https');
const url = require('url');

exports.handler = async (event) => {
    console.log('Processing queue via EventBridge trigger');
    
    const endpoint = '${VERCEL_URL}/api/queue/process-all';
    const parsedUrl = url.parse(endpoint);
    
    const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        path: parsedUrl.path,
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ${CRON_SECRET}',
            'Content-Type': 'application/json'
        }
    };
    
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log('Response:', data);
                resolve({
                    statusCode: 200,
                    body: JSON.stringify({
                        message: 'Queue processed successfully',
                        response: data
                    })
                });
            });
        });
        
        req.on('error', (error) => {
            console.error('Error:', error);
            reject({
                statusCode: 500,
                body: JSON.stringify({
                    error: 'Failed to process queue',
                    message: error.message
                })
            });
        });
        
        req.end();
    });
};
EOF

# Step 2: Create deployment package
echo "📦 Creating deployment package..."
zip lambda-function.zip lambda-function.js

# Step 3: Create IAM role for Lambda (if it doesn't exist)
echo "🔐 Creating IAM role for Lambda..."
aws iam create-role \
  --role-name lambda-basic-execution \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Service": "lambda.amazonaws.com"
        },
        "Action": "sts:AssumeRole"
      }
    ]
  }' 2>/dev/null || echo "Role already exists"

# Attach basic execution policy
aws iam attach-role-policy \
  --role-name lambda-basic-execution \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

# Wait for role to be ready
echo "⏳ Waiting for IAM role to be ready..."
sleep 10

# Step 4: Create Lambda function
echo "⚡ Creating Lambda function..."
aws lambda create-function \
  --region $AWS_REGION \
  --function-name $FUNCTION_NAME \
  --runtime nodejs18.x \
  --role arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/lambda-basic-execution \
  --handler lambda-function.handler \
  --zip-file fileb://lambda-function.zip \
  --timeout 30 \
  --description "Process Loopletter email queue"

# Step 5: Create EventBridge rule
echo "📅 Creating EventBridge rule..."
aws events put-rule \
  --region $AWS_REGION \
  --name "loopletter-queue-trigger" \
  --schedule-expression "rate(1 minute)" \
  --description "Trigger Loopletter queue processing every minute"

# Step 6: Add Lambda as target
echo "🎯 Adding Lambda as target..."
aws events put-targets \
  --region $AWS_REGION \
  --rule "loopletter-queue-trigger" \
  --targets "Id"="1","Arn"="arn:aws:lambda:$AWS_REGION:$(aws sts get-caller-identity --query Account --output text):function:$FUNCTION_NAME"

# Step 7: Grant EventBridge permission to invoke Lambda
echo "🔑 Granting EventBridge permission..."
aws lambda add-permission \
  --region $AWS_REGION \
  --function-name $FUNCTION_NAME \
  --statement-id allow-eventbridge \
  --action lambda:InvokeFunction \
  --principal events.amazonaws.com \
  --source-arn arn:aws:events:$AWS_REGION:$(aws sts get-caller-identity --query Account --output text):rule/loopletter-queue-trigger

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 What was created:"
echo "- Lambda function: $FUNCTION_NAME"
echo "- EventBridge rule: loopletter-queue-trigger (runs every minute)"
echo "- IAM role: lambda-basic-execution"
echo ""
echo "🔍 To test the Lambda function:"
echo "aws lambda invoke --function-name $FUNCTION_NAME response.json && cat response.json"
echo ""
echo "🗑️ To clean up later:"
echo "aws lambda delete-function --function-name $FUNCTION_NAME"
echo "aws events remove-targets --rule loopletter-queue-trigger --ids 1"
echo "aws events delete-rule --name loopletter-queue-trigger"

# Cleanup temporary files
rm lambda-function.js lambda-function.zip
