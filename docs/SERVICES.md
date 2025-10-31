# External Services Setup Guide

This guide explains how to set up all external services required to run Loopletter locally.

## Required Services

These services must be configured for the application to function:

### Clerk Authentication

Clerk provides secure user authentication and management.

#### Setup Steps

1. Go to [clerk.com](https://clerk.com) and sign up for a free account
2. Create a new application
3. Choose your authentication methods (Email, Google, GitHub, etc.)
4. Go to the **API Keys** section
5. Copy your keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (Public key)
   - `CLERK_SECRET_KEY` (Secret key)
6. Add these to your `.env.local` file

#### Configuration

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

#### Documentation
- [Clerk Documentation](https://clerk.com/docs)
- [Clerk + Next.js Setup](https://clerk.com/docs/quickstarts/nextjs)

### Supabase Database

Supabase provides a PostgreSQL database with real-time capabilities.

#### Setup Steps

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project (free tier available)
3. Wait for the project to initialize
4. Go to **Settings** → **API**
5. Copy these values:
   - `NEXT_PUBLIC_SUPABASE_URL` (Project URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Anon key)
   - `SUPABASE_SERVICE_ROLE_KEY` (Service role key - keep this secret)
6. Add these to your `.env.local` file

#### Database Setup

Option 1: Using Supabase Dashboard
1. Go to the **SQL Editor** in your Supabase dashboard
2. Run the migration scripts in `supabase/migrations/` in numerical order

Option 2: Using Supabase CLI
```bash
npx supabase link --project-ref your-project-ref
npx supabase push
```

#### Configuration

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Documentation
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Getting Started](https://supabase.com/docs/guides/getting-started)

### AWS SES (Email Sending)

AWS SES (Simple Email Service) handles email delivery.

#### Setup Steps

1. Create an [AWS account](https://aws.amazon.com)
2. Go to **Services** → **SES** (Simple Email Service)
3. Select your desired region (e.g., `us-east-1`)
4. **Important**: By default, SES starts in sandbox mode. To send to any email:
   - Request production access in the SES dashboard
   - Or verify individual email addresses for testing
5. Create an IAM user for SES:
   - Go to **IAM** → **Users** → **Create User**
   - Attach the `AmazonSESFullAccess` policy
   - Generate access keys
6. Add these to your `.env.local`:

#### Configuration

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

#### Domain Verification

For production, verify your sending domain:
1. In SES dashboard, go to **Domains**
2. Click **Verify a New Domain**
3. Add DNS records (CNAME, SPF, DKIM) to your domain registrar
4. Wait for verification to complete

#### Documentation
- [AWS SES Documentation](https://docs.aws.amazon.com/ses/)
- [Verifying Identities in SES](https://docs.aws.amazon.com/ses/latest/dg/verify-addresses-and-domains.html)

## Optional Services

These services add functionality but are not required for basic operation.

### AWS S3 (File Uploads)

S3 handles file storage for campaign assets, templates, etc.

#### Setup Steps

1. In AWS Console, go to **S3** → **Create Bucket**
2. Create a bucket (e.g., `loopletter-uploads-yourname`)
3. Create an IAM user with S3 access (or use the same SES user)
4. Attach `AmazonS3FullAccess` policy
5. Generate access keys
6. Update `.env.local`:

```env
AWS_S3_BUCKET_NAME=loopletter-uploads-yourname
AWS_S3_REGION=us-east-1
```

### Stripe (Payments)

Stripe enables payment processing and subscription management.

#### Setup Steps

1. Go to [stripe.com](https://stripe.com) and create an account
2. Go to **Developers** → **API Keys**
3. Copy your keys:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (Publishable key)
   - `STRIPE_SECRET_KEY` (Secret key)
4. Add to `.env.local`:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

#### Documentation
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing](https://stripe.com/docs/testing)

### Redis (Caching & Job Queue)

Redis provides in-memory caching and job queue functionality.

#### Setup Steps

**Option 1: Local Installation**
- macOS: `brew install redis`
- Linux: `sudo apt-get install redis-server`
- Windows: Use [Redis for Windows](https://github.com/microsoftarchive/redis/releases)

**Option 2: Managed Service**
- Use [Redis Cloud](https://redis.com/cloud/) for managed hosting

#### Configuration

```env
REDIS_URL=redis://localhost:6379
# Or for Redis Cloud:
REDIS_URL=redis://user:password@host:port
```

#### Testing

```bash
npm run test-redis
```

### PostHog (Analytics)

PostHog provides product analytics and feature flags.

#### Setup Steps

1. Go to [posthog.com](https://posthog.com) and sign up
2. Create a new project
3. Get your project key from the settings
4. Add to `.env.local`:

```env
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

#### Documentation
- [PostHog Documentation](https://posthog.com/docs)

### Sentry (Error Tracking)

Sentry captures and tracks errors in production.

#### Setup Steps

1. Go to [sentry.io](https://sentry.io) and create an account
2. Create a new project for Next.js
3. Get your DSN (Data Source Name)
4. Add to `.env.local`:

```env
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
```

#### Documentation
- [Sentry Documentation](https://docs.sentry.io/)

## Testing Services

You can test your service configurations with the provided scripts:

```bash
# Test AWS configuration
npm run test-aws

# Test AWS SES
npm run test-ses

# Test Redis connection
npm run test-redis

# Test complete system
npm run test-system

# Start the queue worker
npm run queue-worker
```

## Troubleshooting

### SES: "Message Rejected"
- Ensure SES has production access or verify your email address
- Check that your from email matches verified domain/address

### Supabase: Connection refused
- Verify your URL and keys are correct
- Check that your Supabase project is active
- Run migrations if database tables don't exist

### Clerk: Not authenticating
- Verify your publishable and secret keys
- Check that your application is added to your Clerk account
- Clear browser cache and try again

### Redis: Connection refused
- Ensure Redis is running: `redis-cli ping`
- Check the Redis URL format in `.env.local`
- For managed services, verify firewall/security rules

## Cost Considerations

- **Clerk**: Free tier available with generous limits
- **Supabase**: Free tier with good limits, pay-as-you-go after
- **AWS SES**: Very cheap ($0.10 per 1000 emails)
- **AWS S3**: Free tier + pay-as-you-go (~$0.023 per GB)
- **Stripe**: 2.9% + $0.30 per transaction
- **Redis**: Free tier available, managed Redis starts at ~$15/month
- **PostHog**: Free tier available
- **Sentry**: Free tier with 5000 events/month

Start with free tiers to test, upgrade as needed.

## Getting Help

- Check the relevant service's documentation
- Open an issue on [GitHub](https://github.com/yourusername/loopletter/issues)
- See [CONTRIBUTING.md](../CONTRIBUTING.md) for more help
