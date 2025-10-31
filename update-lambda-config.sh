#!/bin/bash

# Update Lambda function with your actual configuration
VERCEL_URL="https://your-app.vercel.app"  # Replace with your production domain
CRON_SECRET="your-cron-secret-here"       # Replace with your generated CRON_SECRET
FUNCTION_NAME="loopletter-queue-processor"

echo "🔧 Updating Lambda function configuration..."

# Create updated Lambda function code
cat > lambda-function-updated.js << EOF
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
                console.log('Response status:', res.statusCode);
                console.log('Response:', data);
                resolve({
                    statusCode: 200,
                    body: JSON.stringify({
                        message: 'Queue processed successfully',
                        statusCode: res.statusCode,
                        response: data
                    })
                });
            });
        });
        
        req.on('error', (error) => {
            console.error('Error:', error);
            resolve({
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

# Create new deployment package
zip lambda-function-updated.zip lambda-function-updated.js

# Update the Lambda function
aws lambda update-function-code \
  --function-name $FUNCTION_NAME \
  --zip-file fileb://lambda-function-updated.zip

echo "✅ Lambda function updated!"

# Clean up
rm lambda-function-updated.js lambda-function-updated.zip

echo ""
echo "🧪 Test the function:"
echo "aws lambda invoke --function-name $FUNCTION_NAME response.json && cat response.json"
