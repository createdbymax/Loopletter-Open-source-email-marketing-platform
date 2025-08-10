import { NextRequest, NextResponse } from 'next/server';
import { supabase } from './supabase-client';

// Privacy compliance middleware for email tracking endpoints

export async function withPrivacyCompliance(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const url = new URL(request.url);
  
  // Check if this is a tracking endpoint
  const isTrackingEndpoint = url.pathname.includes('/track/');
  
  if (isTrackingEndpoint) {
    // Extract tracking parameters
    const trackingId = url.searchParams.get('id');
    const fanId = url.searchParams.get('fan');
    
    if (trackingId || fanId) {
      // Check if user has consented to tracking
      const hasTrackingConsent = await checkTrackingConsent(fanId, trackingId);
      
      if (!hasTrackingConsent) {
        // Log the tracking attempt but don't record it
        await logPrivacyEvent('tracking_blocked', {
          fan_id: fanId,
          tracking_id: trackingId,
          reason: 'no_consent',
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown'
        });
        
        // Return a 1x1 transparent pixel for email tracking
        if (url.pathname.includes('/open')) {
          return new NextResponse(
            Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'),
            {
              status: 200,
              headers: {
                'Content-Type': 'image/gif',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
              }
            }
          );
        }
        
        // For click tracking, redirect without recording
        const redirectUrl = url.searchParams.get('url');
        if (redirectUrl) {
          return NextResponse.redirect(redirectUrl);
        }
        
        return new NextResponse('Tracking blocked - no consent', { status: 204 });
      }
    }
  }
  
  // Proceed with original handler
  return handler(request);
}

async function checkTrackingConsent(fanId?: string | null, trackingId?: string | null): Promise<boolean> {
  if (!fanId && !trackingId) return false;
  
  try {
    let actualFanId = fanId;
    
    // If we only have trackingId, try to find the fan
    if (!fanId && trackingId) {
      const { data: emailSent } = await supabase
        .from('emails_sent')
        .select('fan_id')
        .eq('id', trackingId)
        .single();
      
      if (emailSent) {
        actualFanId = emailSent.fan_id;
      }
    }
    
    if (!actualFanId) return false;
    
    // Check if fan has given analytics consent
    const { data: fan } = await supabase
      .from('fans')
      .select('analytics_consent, tracking_preferences')
      .eq('id', actualFanId)
      .single();
    
    if (!fan) return false;
    
    // Check explicit analytics consent
    if (fan.analytics_consent === false) return false;
    
    // Check tracking preferences
    if (fan.tracking_preferences) {
      const prefs = fan.tracking_preferences as any;
      if (prefs.allow_open_tracking === false || prefs.allow_click_tracking === false) {
        return false;
      }
    }
    
    // Check for valid privacy consent
    const { data: consent } = await supabase
      .from('privacy_consents')
      .select('consent_given')
      .eq('fan_id', actualFanId)
      .eq('consent_type', 'analytics')
      .eq('consent_given', true)
      .order('consent_timestamp', { ascending: false })
      .limit(1)
      .single();
    
    return !!consent;
    
  } catch (error) {
    console.error('Error checking tracking consent:', error);
    // Default to blocking tracking if we can't verify consent
    return false;
  }
}

async function logPrivacyEvent(event: string, details: any): Promise<void> {
  try {
    await supabase
      .from('compliance_audit_logs')
      .insert({
        artist_id: details.artist_id,
        fan_id: details.fan_id,
        action: event,
        details,
        timestamp: new Date().toISOString(),
        ip_address: details.ip,
        user_agent: details.user_agent
      });
  } catch (error) {
    console.error('Error logging privacy event:', error);
  }
}

// Rate limiting for privacy-sensitive endpoints
export async function withRateLimit(
  request: NextRequest,
  options: { max: number; window: string; key?: string }
): Promise<boolean> {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  const key = options.key || `rate_limit_${ip}`;
  const windowMs = parseTimeWindow(options.window);
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMs);
  
  try {
    // Count requests in the current window
    const { count } = await supabase
      .from('rate_limits')
      .select('*', { count: 'exact' })
      .eq('action', key)
      .gte('window_start', windowStart.toISOString());
    
    if ((count || 0) >= options.max) {
      return false; // Rate limit exceeded
    }
    
    // Record this request
    await supabase
      .from('rate_limits')
      .insert({
        artist_id: null, // System-level rate limiting
        action: key,
        count: 1,
        window_start: windowStart.toISOString(),
        window_end: now.toISOString()
      });
    
    return true;
    
  } catch (error) {
    console.error('Error checking rate limit:', error);
    // Allow request if rate limiting fails
    return true;
  }
}

function parseTimeWindow(window: string): number {
  const match = window.match(/^(\d+)([smhd])$/);
  if (!match) return 60000; // Default to 1 minute
  
  const [, amount, unit] = match;
  const multipliers = {
    s: 1000,
    m: 60000,
    h: 3600000,
    d: 86400000
  };
  
  return parseInt(amount) * (multipliers[unit as keyof typeof multipliers] || 60000);
}

// GDPR/CCPA compliance checker
export async function checkDataProcessingCompliance(
  artistId: string,
  fanId: string,
  processingType: 'marketing' | 'analytics' | 'service_delivery'
): Promise<boolean> {
  try {
    // Check if fan has given appropriate consent
    const { data: consent } = await supabase
      .from('privacy_consents')
      .select('consent_given, legal_basis')
      .eq('fan_id', fanId)
      .eq('artist_id', artistId)
      .eq('consent_type', processingType === 'marketing' ? 'email_marketing' : 'data_processing')
      .eq('consent_given', true)
      .order('consent_timestamp', { ascending: false })
      .limit(1)
      .single();
    
    if (consent) return true;
    
    // Check if processing is based on legitimate interest
    if (processingType === 'service_delivery') {
      // Service delivery can be based on contract/legitimate interest
      return true;
    }
    
    return false;
    
  } catch (error) {
    console.error('Error checking data processing compliance:', error);
    return false;
  }
}

// Data retention compliance
export async function enforceDataRetention(artistId: string): Promise<number> {
  try {
    // Get retention policies for this artist
    const { data: policies } = await supabase
      .from('data_retention_policies')
      .select('*')
      .eq('artist_id', artistId)
      .eq('auto_delete_enabled', true);
    
    if (!policies || policies.length === 0) return 0;
    
    let totalDeleted = 0;
    
    for (const policy of policies) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - policy.retention_period_days);
      
      if (policy.data_type === 'fan_data') {
        if (policy.deletion_method === 'anonymize') {
          const { data, error } = await supabase
            .from('fans')
            .update({
              email: `anonymized_${Date.now()}@deleted.local`,
              name: null,
              custom_fields: '{}',
              anonymized: true,
              anonymized_at: new Date().toISOString()
            })
            .eq('artist_id', artistId)
            .lt('created_at', cutoffDate.toISOString())
            .eq('anonymized', false)
            .select('id');
          
          if (!error && data) {
            totalDeleted += data.length;
          }
        }
      }
    }
    
    return totalDeleted;
    
  } catch (error) {
    console.error('Error enforcing data retention:', error);
    return 0;
  }
}