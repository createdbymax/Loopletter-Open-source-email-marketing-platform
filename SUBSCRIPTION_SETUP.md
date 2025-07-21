# Loopletter Subscription System Setup Guide

This guide will help you set up the subscription system for Loopletter using Stripe.

## 1. Database Setup

First, run the database schema updates to add the necessary tables and fields:

```sql
-- Run the SQL commands in database-schema-updates.sql
```

## 2. Stripe Setup

### Create a Stripe Account

1. Sign up for a Stripe account at [stripe.com](https://stripe.com) if you don't have one already.
2. Go to the Stripe Dashboard and switch to Test mode for development.

### Create Products and Prices

1. In the Stripe Dashboard, go to Products > Add Product.
2. Create the following products and prices:

#### Independent Plan (Monthly)
- Name: Independent Plan
- Description: For growing artists and indie labels
- Price: $29/month (recurring)
- ID: Copy the Price ID (starts with "price_")

#### Independent Plan (Annual)
- Name: Independent Plan (Annual)
- Description: For growing artists and indie labels
- Price: $290/year (recurring)
- ID: Copy the Price ID (starts with "price_")

#### Independent Plus Plan
- Name: Independent Plus Plan
- Description: For artists with up to 25,000 subscribers
- Price: $49/month (recurring)
- ID: Copy the Price ID (starts with "price_")

#### Label/Agency Plan (Monthly)
- Name: Label/Agency Plan
- Description: For teams managing multiple artists
- Price: $99/month (recurring)
- ID: Copy the Price ID (starts with "price_")

#### Label/Agency Plan (Annual)
- Name: Label/Agency Plan (Annual)
- Description: For teams managing multiple artists
- Price: $990/year (recurring)
- ID: Copy the Price ID (starts with "price_")

### Set Up Webhooks

1. In the Stripe Dashboard, go to Developers > Webhooks > Add Endpoint.
2. Enter your webhook URL: `https://your-domain.com/api/webhooks/stripe`
3. Select the following events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
4. Click "Add Endpoint" to create the webhook.
5. Copy the Signing Secret (starts with "whsec_").

## 3. Environment Variables

Add the following environment variables to your `.env` file:

```
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs
STRIPE_PRICE_INDEPENDENT_MONTHLY=price_...
STRIPE_PRICE_INDEPENDENT_ANNUAL=price_...
STRIPE_PRICE_INDEPENDENT_PLUS=price_...
STRIPE_PRICE_LABEL_MONTHLY=price_...
STRIPE_PRICE_LABEL_ANNUAL=price_...
```

Replace the values with your actual Stripe API keys and price IDs.

## 4. Testing the Subscription System

1. Start your development server.
2. Go to the Settings > Subscription page.
3. Try upgrading to the Independent plan.
4. Use Stripe test card numbers for testing:
   - Successful payment: 4242 4242 4242 4242
   - Failed payment: 4000 0000 0000 0002
5. Check that webhooks are being received and processed correctly.

## 5. Going Live

When you're ready to go live:

1. Switch to Stripe Live mode.
2. Update your environment variables with the live API keys and price IDs.
3. Update your webhook endpoint to use the live webhook signing secret.
4. Test a real payment to ensure everything works correctly.

## Troubleshooting

- Check Stripe Dashboard > Developers > Webhooks to see if webhooks are being delivered successfully.
- Check your server logs for any errors related to Stripe API calls or webhook processing.
- Ensure your database schema has been updated correctly.
- Verify that the price IDs in your environment variables match the ones in your Stripe account.