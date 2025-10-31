#!/bin/bash

# Setup IAM permissions for Loopletter EventBridge integration
# Run this script to create the necessary IAM policy and attach it to your user

POLICY_NAME="LoopletterEventBridgePolicy"
USER_NAME="your-iam-username"  # Replace with your actual IAM username

echo "🔐 Setting up IAM permissions for Loopletter EventBridge..."

# Step 1: Create the IAM policy
echo "📋 Creating IAM policy..."
POLICY_ARN=$(aws iam create-policy \
  --policy-name $POLICY_NAME \
  --policy-document file://aws-iam-policy.json \
  --description "Permissions for Loopletter EventBridge queue processing setup" \
  --query 'Policy.Arn' \
  --output text 2>/dev/null)

if [ $? -eq 0 ]; then
    echo "✅ Policy created: $POLICY_ARN"
else
    # Policy might already exist, get its ARN
    POLICY_ARN=$(aws iam list-policies \
      --scope Local \
      --query "Policies[?PolicyName=='$POLICY_NAME'].Arn" \
      --output text)
    echo "ℹ️  Policy already exists: $POLICY_ARN"
fi

# Step 2: Attach policy to user (if USER_NAME is provided)
if [ "$USER_NAME" != "your-iam-username" ]; then
    echo "👤 Attaching policy to user: $USER_NAME"
    aws iam attach-user-policy \
      --user-name $USER_NAME \
      --policy-arn $POLICY_ARN
    
    if [ $? -eq 0 ]; then
        echo "✅ Policy attached to user successfully"
    else
        echo "❌ Failed to attach policy to user"
    fi
else
    echo "⚠️  Please update USER_NAME in this script and run again, or attach manually:"
    echo "   aws iam attach-user-policy --user-name YOUR_USERNAME --policy-arn $POLICY_ARN"
fi

echo ""
echo "🎯 Alternative: Attach to a group"
echo "If you prefer to attach to a group instead:"
echo "aws iam attach-group-policy --group-name YOUR_GROUP --policy-arn $POLICY_ARN"
echo ""
echo "📋 Policy ARN: $POLICY_ARN"
echo "📋 Policy Name: $POLICY_NAME"
