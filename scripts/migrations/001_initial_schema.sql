-- Initial database schema for LoopLetter

-- Artists table
CREATE TABLE IF NOT EXISTS artists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  bio TEXT,
  email TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  ses_domain TEXT,
  ses_domain_verified BOOLEAN DEFAULT FALSE,
  ses_status TEXT,
  clerk_user_id TEXT NOT NULL UNIQUE,
  subscription JSONB DEFAULT '{"plan": "starter", "status": "active"}',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  settings JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fans table
CREATE TABLE IF NOT EXISTS fans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  tags TEXT[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'subscribed',
  source TEXT NOT NULL DEFAULT 'manual',
  location JSONB,
  preferences JSONB,
  tracking_preferences JSONB DEFAULT '{"allow_open_tracking": true, "allow_click_tracking": true}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(artist_id, email)
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT,
  artwork_url TEXT,
  link TEXT,
  send_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'draft',
  template_id UUID,
  template_data JSONB,
  segment_id UUID,
  ab_test_id UUID,
  settings JSONB DEFAULT '{"send_time_optimization": false, "track_opens": true, "track_clicks": true, "auto_tweet": false, "send_to_unsubscribed": false}',
  stats JSONB DEFAULT '{"total_sent": 0, "delivered": 0, "opens": 0, "unique_opens": 0, "clicks": 0, "unique_clicks": 0, "bounces": 0, "complaints": 0, "unsubscribes": 0, "open_rate": 0, "click_rate": 0, "bounce_rate": 0, "unsubscribe_rate": 0}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email sent records
CREATE TABLE IF NOT EXISTS email_sent (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fan_id UUID NOT NULL REFERENCES fans(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  email_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent',
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,
  complained_at TIMESTAMP WITH TIME ZONE,
  message_id TEXT,
  error_message TEXT
);

-- Email opens tracking
CREATE TABLE IF NOT EXISTS email_opens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id TEXT NOT NULL,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  fan_id UUID NOT NULL REFERENCES fans(id) ON DELETE CASCADE,
  opened_at TIMESTAMP WITH TIME ZONE NOT NULL,
  user_agent TEXT,
  ip_address TEXT,
  open_count INTEGER DEFAULT 1
);

-- Email clicks tracking
CREATE TABLE IF NOT EXISTS email_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id TEXT NOT NULL,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  fan_id UUID NOT NULL REFERENCES fans(id) ON DELETE CASCADE,
  link_id TEXT,
  url TEXT NOT NULL,
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL,
  user_agent TEXT,
  ip_address TEXT
);

-- Email events (bounces, complaints, etc.)
CREATE TABLE IF NOT EXISTS email_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  email TEXT NOT NULL,
  fan_id UUID REFERENCES fans(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  message_id TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  details JSONB
);

-- Segments table
CREATE TABLE IF NOT EXISTS segments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  conditions JSONB NOT NULL,
  fan_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  thumbnail_url TEXT,
  html_content TEXT NOT NULL,
  variables JSONB,
  is_public BOOLEAN DEFAULT FALSE,
  artist_id UUID REFERENCES artists(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'editor',
  permissions TEXT[] DEFAULT '{}',
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending',
  clerk_user_id TEXT,
  invitation_token TEXT,
  invitation_expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(artist_id, email)
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  stripe_price_id TEXT,
  plan TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT NOT NULL UNIQUE,
  stripe_payment_intent_id TEXT,
  amount_due INTEGER NOT NULL,
  amount_paid INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  invoice_pdf TEXT,
  hosted_invoice_url TEXT,
  invoice_date TIMESTAMP WITH TIME ZONE NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_fans_artist_id ON fans(artist_id);
CREATE INDEX IF NOT EXISTS idx_fans_email ON fans(email);
CREATE INDEX IF NOT EXISTS idx_fans_status ON fans(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_artist_id ON campaigns(artist_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_sent_campaign_id ON email_sent(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_sent_fan_id ON email_sent(fan_id);
CREATE INDEX IF NOT EXISTS idx_email_opens_campaign_id ON email_opens(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_clicks_campaign_id ON email_clicks(campaign_id);
CREATE INDEX IF NOT EXISTS idx_segments_artist_id ON segments(artist_id);
CREATE INDEX IF NOT EXISTS idx_team_members_artist_id ON team_members(artist_id);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email);

-- Create functions for updating campaign stats
CREATE OR REPLACE FUNCTION increment_campaign_opens(p_campaign_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE campaigns
  SET stats = jsonb_set(
    jsonb_set(
      stats,
      '{opens}',
      to_jsonb((stats->>'opens')::int + 1)
    ),
    '{open_rate}',
    to_jsonb(
      CASE 
        WHEN (stats->>'total_sent')::int > 0 
        THEN ((stats->>'opens')::int + 1)::float / (stats->>'total_sent')::float
        ELSE 0
      END
    )
  )
  WHERE id = p_campaign_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_campaign_clicks(p_campaign_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE campaigns
  SET stats = jsonb_set(
    jsonb_set(
      stats,
      '{clicks}',
      to_jsonb((stats->>'clicks')::int + 1)
    ),
    '{click_rate}',
    to_jsonb(
      CASE 
        WHEN (stats->>'total_sent')::int > 0 
        THEN ((stats->>'clicks')::int + 1)::float / (stats->>'total_sent')::float
        ELSE 0
      END
    )
  )
  WHERE id = p_campaign_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_campaign_total_clicks(p_campaign_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE campaigns
  SET stats = jsonb_set(
    stats,
    '{total_clicks}',
    to_jsonb(COALESCE((stats->>'total_clicks')::int, 0) + 1)
  )
  WHERE id = p_campaign_id;
END;
$$ LANGUAGE plpgsql;