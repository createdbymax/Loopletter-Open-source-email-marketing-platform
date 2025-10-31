# Database Resources

This directory contains SQL helpers for self-hosted deployments. Import the schema before running the application to ensure the subscription, billing, and analytics tables exist.

## Applying the Schema

```bash
npx supabase db push --db-url postgres://USER:PASSWORD@HOST:PORT/postgres -f docs/database/schema.sql
```

Or copy the statements into the Supabase SQL editor and run them manually. Update the file whenever new tables or columns are added so other operators can stay in sync.

## Contents

- `schema.sql` – subscription-related tables and column extensions used by the Stripe integration.
