-- Add subscription fields to artists table
ALTER TABLE artists ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'starter';
ALTER TABLE artists ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'active';
ALTER TABLE artists ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);
ALTER TABLE artists ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255);
ALTER TABLE artists ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMP;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS subscription_cancel_at_period_end BOOLEAN DEFAULT FALSE;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS subscription_metadata JSONB DEFAULT '{}'::jsonb;

-- Create subscriptions table to track subscription history
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255),
  stripe_price_id VARCHAR(255),
  plan VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create invoices table to track billing history
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  stripe_invoice_id VARCHAR(255) NOT NULL,
  stripe_payment_intent_id VARCHAR(255),
  amount_due INTEGER NOT NULL,
  amount_paid INTEGER NOT NULL,
  currency VARCHAR(3) NOT NULL,
  status VARCHAR(50) NOT NULL,
  invoice_pdf VARCHAR(255),
  hosted_invoice_url VARCHAR(255),
  invoice_date TIMESTAMP NOT NULL,
  paid_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create usage_logs table to track feature usage
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  feature VARCHAR(50) NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_artist_subscription ON artists(subscription_plan, subscription_status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_artist_id ON subscriptions(artist_id);
CREATE INDEX IF NOT EXISTS idx_invoices_artist_id ON invoices(artist_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_artist_id_feature ON usage_logs(artist_id, feature);