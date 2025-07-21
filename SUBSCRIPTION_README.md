# LoopLetter Subscription System

This document provides an overview of the subscription system implemented for LoopLetter, an email platform for independent music artists.

## Overview

The subscription system allows artists to choose from three different plans:

1. **Starter (Free)**
   - 1,000 subscribers limit
   - 3,000 emails/month limit
   - Basic features only

2. **Independent ($29/month)**
   - 10,000 subscribers limit (or 25,000 for $49/month)
   - Unlimited emails
   - Advanced features including scheduling, analytics, segmentation, and automations

3. **Label/Agency ($99/month)**
   - 50,000+ subscribers
   - Unlimited emails
   - All features including team management, multi-artist support, and white-labeling

## Architecture

The subscription system consists of the following components:

1. **Database Schema**
   - Artist table with subscription fields
   - Subscriptions table for subscription history
   - Invoices table for billing history
   - Usage logs table for tracking feature usage

2. **Stripe Integration**
   - Checkout sessions for subscription purchases
   - Customer portal for subscription management
   - Webhooks for subscription event handling

3. **Feature Access Control**
   - Utility functions to check feature access based on subscription plan
   - UI components for feature gating with upgrade prompts
   - API middleware to protect premium features

4. **Subscription Management UI**
   - Plan comparison and selection
   - Billing history and invoice access
   - Payment method management

## Setup Instructions

Follow these steps to set up the subscription system:

1. **Database Setup**
   - Run the SQL commands in `database-schema-updates.sql` to create the necessary tables and fields

2. **Stripe Setup**
   - Create a Stripe account
   - Create products and prices for each plan
   - Set up webhooks to listen for subscription events
   - Configure environment variables with Stripe API keys and price IDs

3. **Environment Variables**
   - Add Stripe API keys and price IDs to your `.env` file
   - See `SUBSCRIPTION_SETUP.md` for detailed instructions

## Usage

### For Users

Users can manage their subscription through the Settings > Subscription page, where they can:

1. View their current plan and features
2. Upgrade to a higher plan
3. Manage their payment methods
4. View their billing history and download invoices

### For Developers

The subscription system provides the following APIs and utilities:

1. **Feature Access Control**
   - `canAccessFeature(artist, feature)`: Check if a user has access to a specific feature
   - `hasReachedSubscriberLimit(artist, count)`: Check if a user has reached their subscriber limit
   - `hasReachedEmailSendLimit(artist, count)`: Check if a user has reached their email send limit

2. **UI Components**
   - `<FeatureGate>`: Conditionally render content based on feature access
   - `<SubscriberLimitWarning>`: Display a warning when approaching subscriber limit
   - `<EmailLimitWarning>`: Display a warning when approaching email send limit

3. **API Routes**
   - `/api/subscription/checkout`: Create a Stripe checkout session for subscription upgrade
   - `/api/subscription/portal`: Create a Stripe customer portal session for subscription management
   - `/api/subscription/invoices`: Get a user's invoice history
   - `/api/webhooks/stripe`: Handle Stripe webhook events

## Implementation Details

### Feature Access Control

Feature access is controlled through the `canAccessFeature` function in `lib/subscription.ts`, which checks if a user's subscription plan includes a specific feature. This function is used in both the frontend and backend to ensure consistent access control.

```typescript
// Example usage
if (canAccessFeature(artist, 'advancedAnalytics')) {
  // Show advanced analytics
} else {
  // Show upgrade prompt
}
```

### UI Feature Gating

The `FeatureGate` component in `components/ui/feature-access.tsx` provides a reusable way to conditionally render content based on feature access, with an optional fallback for users who don't have access.

```tsx
// Example usage
<FeatureGate
  feature="advancedAnalytics"
  artist={artist}
  fallback={<UpgradePrompt feature="advancedAnalytics" />}
>
  <AdvancedAnalytics />
</FeatureGate>
```

### API Protection

API routes that provide access to premium features are protected using the `withFeatureAccess` middleware in `app/api/middleware/feature-access.ts`, which checks if a user has access to a specific feature before allowing the request to proceed.

```typescript
// Example usage
export const GET = withFeatureAccess('advancedAnalytics', handler);
```

### Stripe Integration

The Stripe integration is handled through the functions in `lib/stripe.ts`, which provide a clean interface for creating checkout sessions, managing subscriptions, and processing webhook events.

```typescript
// Example usage
const session = await createCheckoutSession(
  artist,
  priceId,
  successUrl,
  cancelUrl
);
```

## Testing

To test the subscription system:

1. Use Stripe test card numbers:
   - Successful payment: 4242 4242 4242 4242
   - Failed payment: 4000 0000 0000 0002

2. Test feature access control:
   - Try accessing premium features on the Starter plan
   - Upgrade to the Independent plan and verify access
   - Downgrade back to Starter and verify access is revoked

3. Test limit warnings:
   - Add subscribers up to the limit and verify warnings appear
   - Try to exceed the limit and verify the action is blocked

## Troubleshooting

If you encounter issues with the subscription system:

1. Check Stripe Dashboard > Developers > Webhooks to see if webhooks are being delivered successfully
2. Check your server logs for any errors related to Stripe API calls or webhook processing
3. Verify that the database schema has been updated correctly
4. Ensure that the price IDs in your environment variables match the ones in your Stripe account

## Maintenance

To maintain the subscription system:

1. Keep your Stripe API keys and price IDs up to date
2. Monitor webhook delivery and handle any failed events
3. Update the feature access control logic if you add new features or change plan tiers
4. Regularly test the subscription flow to ensure it works correctly