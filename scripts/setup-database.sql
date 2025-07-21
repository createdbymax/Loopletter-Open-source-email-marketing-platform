-- Loopletter Database Schema Setup
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Artists table
CREATE TABLE IF NOT EXISTS artists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  clerk_user_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  bio TEXT,
  slug TEXT UNIQUE NOT NULL,
  ses_domain_verified BOOLEAN DEFAULT FALSE,
  ses_domain TEXT,
  ses_status TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fans table
CREATE TABLE IF NOT EXISTS fans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT NOT NULL,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  name TEXT,
  tags TEXT[],
  custom_fields JSONB DEFAULT '{}',
  status TEXT DEFAULT 'subscribed' CHECK (status IN ('subscribed', 'unsubscribed', 'bounced', 'pending')),
  source TEXT DEFAULT 'manual',
  location JSONB DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(email, artist_id)
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  artwork_url TEXT,
  link TEXT,
  send_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled')),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  template_id UUID,
  template_data JSONB,
  segment_id UUID,
  ab_test_id UUID,
  settings JSONB DEFAULT '{}',
  stats JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emails sent table
CREATE TABLE IF NOT EXISTS emails_sent (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  fan_id UUID REFERENCES fans(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  email_address TEXT NOT NULL,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'bounced', 'complained')),
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,
  complained_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  message_id TEXT,
  error_message TEXT
);

-- Segments table
CREATE TABLE IF NOT EXISTS segments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  conditions JSONB NOT NULL DEFAULT '[]',
  fan_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Automations table
CREATE TABLE IF NOT EXISTS automations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  trigger JSONB NOT NULL,
  actions JSONB NOT NULL DEFAULT '[]',
  status TEXT DEFAULT 'draft' CHECK (status IN ('active', 'paused', 'draft')),
  stats JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  thumbnail_url TEXT,
  html_content TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  is_public BOOLEAN DEFAULT FALSE,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AB Tests table
CREATE TABLE IF NOT EXISTS ab_tests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  test_type TEXT NOT NULL,
  variants JSONB NOT NULL DEFAULT '[]',
  traffic_split INTEGER[] NOT NULL,
  winner_criteria TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'completed', 'cancelled')),
  winner_variant_id TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team Members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  permissions TEXT[] DEFAULT '{}',
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  joined_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended'))
);

-- Integrations table
CREATE TABLE IF NOT EXISTS integrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  config JSONB DEFAULT '{}',
  status TEXT DEFAULT 'connected' CHECK (status IN ('connected', 'disconnected', 'error')),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhooks table
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL,
  secret TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused')),
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_fans_artist_id ON fans(artist_id);
CREATE INDEX IF NOT EXISTS idx_fans_email ON fans(email);
CREATE INDEX IF NOT EXISTS idx_fans_status ON fans(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_artist_id ON campaigns(artist_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_emails_sent_campaign_id ON emails_sent(campaign_id);
CREATE INDEX IF NOT EXISTS idx_emails_sent_fan_id ON emails_sent(fan_id);
CREATE INDEX IF NOT EXISTS idx_segments_artist_id ON segments(artist_id);
CREATE INDEX IF NOT EXISTS idx_automations_artist_id ON automations(artist_id);
CREATE INDEX IF NOT EXISTS idx_templates_artist_id ON templates(artist_id);
CREATE INDEX IF NOT EXISTS idx_templates_public ON templates(is_public);

-- Enable Row Level Security (RLS)
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE fans ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails_sent ENABLE ROW LEVEL SECURITY;
ALTER TABLE segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic examples - customize as needed)
CREATE POLICY "Users can view their own artist data" ON artists
  FOR ALL USING (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can manage their own fans" ON fans
  FOR ALL USING (artist_id IN (
    SELECT id FROM artists WHERE clerk_user_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can manage their own campaigns" ON campaigns
  FOR ALL USING (artist_id IN (
    SELECT id FROM artists WHERE clerk_user_id = auth.jwt() ->> 'sub'
  ));

-- Add similar policies for other tables...

-- Insert some default public templates
INSERT INTO templates (name, description, category, html_content, variables, is_public, artist_id) VALUES
(
  'Simple Newsletter',
  'A clean and simple newsletter template',
  'newsletter',
  '<!DOCTYPE html><html><body><h1>{{title}}</h1><p>{{content}}</p></body></html>',
  '[{"name": "title", "type": "text", "label": "Title", "required": true}, {"name": "content", "type": "text", "label": "Content", "required": true}]',
  true,
  null
),
(
  'Music Release Announcement',
  'Perfect for announcing new music releases',
  'music_release',
  '<!DOCTYPE html><html><body><h1>🎵 New Release: {{release_title}}</h1><p>{{artist_name}} just dropped a new {{release_type}}!</p><img src="{{cover_art}}" alt="Cover Art" style="max-width: 300px;"><p>{{message}}</p></body></html>',
  '[{"name": "release_title", "type": "text", "label": "Release Title", "required": true}, {"name": "artist_name", "type": "text", "label": "Artist Name", "required": true}, {"name": "release_type", "type": "text", "label": "Release Type", "required": true}, {"name": "cover_art", "type": "image", "label": "Cover Art URL", "required": false}, {"name": "message", "type": "text", "label": "Message", "required": false}]',
  true,
  null
);

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_artists_updated_at BEFORE UPDATE ON artists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fans_updated_at BEFORE UPDATE ON fans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_segments_updated_at BEFORE UPDATE ON segments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_automations_updated_at BEFORE UPDATE ON automations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-
- Function to increment campaign statistics
CREATE OR REPLACE FUNCTION increment_campaign_stat(
  campaign_id UUID,
  stat_name TEXT
) RETURNS VOID AS $$
BEGIN
  UPDATE campaigns 
  SET stats = jsonb_set(
    COALESCE(stats, '{}'),
    ARRAY[stat_name],
    (COALESCE((stats->>stat_name)::int, 0) + 1)::text::jsonb
  )
  WHERE id = campaign_id;
END;
$$ LANGUAGE plpgsql;

-- Add tracking preferences to fans table
ALTER TABLE fans ADD COLUMN IF NOT EXISTS tracking_preferences JSONB DEFAULT '{"allow_open_tracking": true, "allow_click_tracking": true}';

-- Create email tracking events table for detailed tracking
CREATE TABLE IF NOT EXISTS email_tracking_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  fan_id UUID REFERENCES fans(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('open', 'click', 'bounce', 'complaint', 'unsubscribe')),
  event_data JSONB DEFAULT '{}',
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for tracking events
CREATE INDEX IF NOT EXISTS idx_email_tracking_events_fan_campaign ON email_tracking_events(fan_id, campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_tracking_events_type ON email_tracking_events(event_type);
CREATE INDEX IF NOT EXISTS idx_email_tracking_events_created_at ON email_tracking_events(created_at);