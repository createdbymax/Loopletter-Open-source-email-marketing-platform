'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Database, CheckCircle, Copy, ExternalLink, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
export function PrivacySetupInstructions() {
    const [copied, setCopied] = useState(false);
    const sqlScript = `-- Privacy Compliance Setup Script
-- Copy and paste this into your Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Privacy consent management table
CREATE TABLE IF NOT EXISTS privacy_consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fan_id UUID NOT NULL,
  artist_id UUID NOT NULL,
  consent_type VARCHAR(50) NOT NULL,
  consent_given BOOLEAN NOT NULL,
  consent_method VARCHAR(50) NOT NULL,
  consent_text TEXT,
  privacy_policy_version VARCHAR(20) NOT NULL,
  legal_basis VARCHAR(50),
  ip_address INET,
  user_agent TEXT,
  consent_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  withdrawn_at TIMESTAMP,
  withdrawal_method VARCHAR(50),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Data subject requests table
CREATE TABLE IF NOT EXISTS data_subject_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id VARCHAR(50) UNIQUE NOT NULL,
  fan_id UUID,
  artist_id UUID NOT NULL,
  email VARCHAR(255) NOT NULL,
  request_type VARCHAR(50) NOT NULL,
  regulation VARCHAR(10) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  request_details TEXT,
  identity_verified BOOLEAN DEFAULT FALSE,
  verification_method VARCHAR(50),
  verification_token VARCHAR(255),
  verification_expires_at TIMESTAMP,
  processed_by VARCHAR(255),
  processed_at TIMESTAMP,
  response_data JSONB,
  rejection_reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Data retention policies table
CREATE TABLE IF NOT EXISTS data_retention_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL,
  data_type VARCHAR(50) NOT NULL,
  retention_period_days INTEGER NOT NULL,
  deletion_method VARCHAR(50) NOT NULL,
  auto_delete_enabled BOOLEAN DEFAULT TRUE,
  last_cleanup_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Privacy settings table
CREATE TABLE IF NOT EXISTS privacy_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL,
  cookie_consent_required BOOLEAN DEFAULT TRUE,
  analytics_opt_out_available BOOLEAN DEFAULT TRUE,
  data_processing_transparency BOOLEAN DEFAULT TRUE,
  automatic_deletion_enabled BOOLEAN DEFAULT TRUE,
  privacy_policy_url VARCHAR(500),
  privacy_policy_version VARCHAR(20) DEFAULT '1.0',
  dpo_contact_email VARCHAR(255),
  gdpr_representative_contact TEXT,
  ccpa_contact_info TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(artist_id)
);

-- Compliance audit logs table
CREATE TABLE IF NOT EXISTS compliance_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID,
  fan_id UUID,
  action VARCHAR(100) NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_privacy_consents_fan_id ON privacy_consents(fan_id);
CREATE INDEX IF NOT EXISTS idx_privacy_consents_artist_id ON privacy_consents(artist_id);
CREATE INDEX IF NOT EXISTS idx_data_subject_requests_email ON data_subject_requests(email);
CREATE INDEX IF NOT EXISTS idx_data_retention_policies_artist ON data_retention_policies(artist_id);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_logs_artist_id ON compliance_audit_logs(artist_id);

-- Insert default settings for existing artists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'artists') THEN
    INSERT INTO privacy_settings (artist_id, privacy_policy_version)
    SELECT id, '1.0' 
    FROM artists 
    WHERE id NOT IN (SELECT artist_id FROM privacy_settings WHERE artist_id IS NOT NULL);
    
    INSERT INTO data_retention_policies (artist_id, data_type, retention_period_days, deletion_method)
    SELECT 
      a.id,
      data_type,
      retention_days,
      'anonymize'
    FROM artists a
    CROSS JOIN (
      VALUES 
        ('fan_data', 2555),
        ('campaign_data', 1095),
        ('analytics_data', 730)
    ) AS policies(data_type, retention_days)
    WHERE NOT EXISTS (
      SELECT 1 FROM data_retention_policies drp 
      WHERE drp.artist_id = a.id AND drp.data_type = policies.data_type
    );
  END IF;
END $$;`;
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(sqlScript);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
        catch (error) {
            console.error('Failed to copy:', error);
        }
    };
    return (<div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5"/>
            Privacy Compliance Setup Required
          </CardTitle>
          <CardDescription>
            Set up the privacy compliance database tables to enable GDPR and CCPA features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4"/>
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Database tables are not set up yet</p>
                <p className="text-sm">
                  The privacy compliance features require additional database tables. 
                  Follow the instructions below to set them up.
                </p>
              </div>
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h4 className="font-medium">Setup Instructions:</h4>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">1</Badge>
                <div>
                  <p className="font-medium text-sm">Open Supabase Dashboard</p>
                  <p className="text-sm text-muted-foreground">
                    Go to your Supabase project dashboard
                  </p>
                  <Button variant="outline" size="sm" className="mt-2" asChild>
                    <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2"/>
                      Open Supabase
                    </a>
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">2</Badge>
                <div>
                  <p className="font-medium text-sm">Navigate to SQL Editor</p>
                  <p className="text-sm text-muted-foreground">
                    Click on "SQL Editor" in the left sidebar
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">3</Badge>
                <div className="flex-1">
                  <p className="font-medium text-sm">Copy and Run SQL Script</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Copy the SQL script below and paste it into the SQL Editor, then click "Run"
                  </p>
                  
                  <div className="relative">
                    <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-xs overflow-x-auto max-h-64 border">
                      <code>{sqlScript}</code>
                    </pre>
                    <Button variant="outline" size="sm" className="absolute top-2 right-2" onClick={copyToClipboard}>
                      {copied ? (<>
                          <CheckCircle className="h-4 w-4 mr-2"/>
                          Copied!
                        </>) : (<>
                          <Copy className="h-4 w-4 mr-2"/>
                          Copy SQL
                        </>)}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">4</Badge>
                <div>
                  <p className="font-medium text-sm">Refresh This Page</p>
                  <p className="text-sm text-muted-foreground">
                    After running the script successfully, refresh this page to access privacy features
                  </p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>
                    Refresh Page
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Alert>
            <CheckCircle className="h-4 w-4"/>
            <AlertDescription className="text-sm">
              <div className="space-y-2">
                <p><strong>What this script does:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Creates privacy consent tracking tables</li>
                  <li>Sets up data subject request management</li>
                  <li>Configures data retention policies</li>
                  <li>Enables compliance audit logging</li>
                  <li>Adds default settings for existing artists</li>
                  <li>Fixes duplicate key constraints automatically</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2">
                  <strong>Note:</strong> If you get duplicate key errors, the script includes automatic fixes for existing data.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>);
}
