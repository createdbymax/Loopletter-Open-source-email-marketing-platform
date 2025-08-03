import { supabase } from './supabase';
import type { Fan, Artist } from './types';

// Spam prevention configuration
export const SPAM_PREVENTION_CONFIG = {
  // Rate limits
  MAX_FANS_PER_HOUR: 100,
  MAX_FANS_PER_DAY: 1000,
  MAX_CAMPAIGNS_PER_DAY: 10,
  
  // Quarantine thresholds
  QUARANTINE_RISK_THRESHOLD: 50, // Risk score above this goes to quarantine
  AUTO_REJECT_THRESHOLD: 80,     // Risk score above this is auto-rejected
  
  // Email validation
  BLOCKED_DOMAINS: [
    'tempmail.org',
    '10minutemail.com',
    'guerrillamail.com',
    'mailinator.com',
    'yopmail.com',
    'temp-mail.org',
    'throwaway.email',
    'maildrop.cc',
    'sharklasers.com',
    'guerrillamailblock.com'
  ],
  
  // Suspicious patterns
  SUSPICIOUS_PATTERNS: [
    /^[a-z]+\d+@/i, // Simple pattern like user123@
    /^test\d*@/i,   // Test emails
    /^admin\d*@/i,  // Admin emails
    /^info\d*@/i,   // Info emails
    /^\w{1,3}@/i,   // Very short usernames
  ],
  
  // Content analysis
  SPAM_KEYWORDS: [
    'buy now',
    'limited time',
    'act now',
    'urgent',
    'winner',
    'congratulations',
    'free money',
    'make money fast',
    'work from home',
    'click here now',
    'guaranteed',
    'risk free',
    'no obligation',
    'cash bonus',
    'earn extra cash'
  ],
  
  // Engagement thresholds
  MIN_ENGAGEMENT_RATE: 0.05, // 5% minimum engagement rate
  MAX_BOUNCE_RATE: 0.10,     // 10% maximum bounce rate
  MAX_COMPLAINT_RATE: 0.001, // 0.1% maximum complaint rate
};

export type SpamCheckResult = {
  isValid: boolean;
  riskScore: number; // 0-100, higher is riskier
  flags: string[];
  recommendations: string[];
  requiresReview: boolean; // True if should be quarantined for manual review
  action: 'approve' | 'quarantine' | 'reject'; // Recommended action
};

export type ConsentVerification = {
  source: 'signup_form' | 'manual_entry' | 'import' | 'api';
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
  double_opt_in: boolean;
  consent_text?: string;
  verification_method: 'email_confirmation' | 'checkbox' | 'verbal' | 'written';
};

// Enhanced Fan type with consent tracking
export type FanWithConsent = Fan & {
  consent_verification?: ConsentVerification;
  engagement_score?: number;
  risk_score?: number;
  last_engagement?: string;
  source_details?: {
    campaign_id?: string;
    referrer?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
  };
};

/**
 * Validates email address and checks for spam indicators
 */
export async function validateEmailForSpam(email: string, source: string = 'manual'): Promise<SpamCheckResult> {
  const flags: string[] = [];
  let riskScore = 0;
  const recommendations: string[] = [];

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    flags.push('invalid_format');
    riskScore += 50;
    recommendations.push('Email format is invalid');
  }

  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) {
    flags.push('no_domain');
    riskScore += 50;
    return { 
      isValid: false, 
      riskScore, 
      flags, 
      recommendations,
      requiresReview: true,
      action: 'reject'
    };
  }

  // Check against blocked domains
  if (SPAM_PREVENTION_CONFIG.BLOCKED_DOMAINS.includes(domain)) {
    flags.push('blocked_domain');
    riskScore += 80;
    recommendations.push('Email uses a temporary/disposable email service');
  }

  // Check for suspicious patterns
  for (const pattern of SPAM_PREVENTION_CONFIG.SUSPICIOUS_PATTERNS) {
    if (pattern.test(email)) {
      flags.push('suspicious_pattern');
      riskScore += 30;
      recommendations.push('Email follows a suspicious pattern commonly used by bots');
      break;
    }
  }

  // Check for role-based emails (higher risk for cold outreach)
  const roleBasedPrefixes = ['admin', 'info', 'support', 'sales', 'marketing', 'noreply', 'no-reply'];
  const emailPrefix = email.split('@')[0].toLowerCase();
  if (roleBasedPrefixes.includes(emailPrefix)) {
    flags.push('role_based_email');
    riskScore += 40;
    recommendations.push('Role-based emails have lower engagement and higher complaint rates');
  }

  // Source-based risk assessment
  if (source === 'import' || source === 'api') {
    riskScore += 20;
    recommendations.push('Imported emails require extra verification of consent');
  }

  // Check for common typos in popular domains
  const commonDomainTypos: Record<string, string> = {
    'gmial.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'yahooo.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com',
    'outlok.com': 'outlook.com'
  };
  
  if (commonDomainTypos[domain]) {
    flags.push('domain_typo');
    riskScore += 25;
    recommendations.push(`Possible typo in domain. Did you mean ${commonDomainTypos[domain]}?`);
  }

  // Determine action based on risk score
  let action: 'approve' | 'quarantine' | 'reject';
  let requiresReview = false;
  let isValid = true;

  if (riskScore >= SPAM_PREVENTION_CONFIG.AUTO_REJECT_THRESHOLD) {
    action = 'reject';
    isValid = false;
  } else if (riskScore >= SPAM_PREVENTION_CONFIG.QUARANTINE_RISK_THRESHOLD) {
    action = 'quarantine';
    requiresReview = true;
    isValid = false; // Not valid for immediate use
  } else {
    action = 'approve';
    isValid = true;
  }
  
  return {
    isValid,
    riskScore,
    flags,
    recommendations,
    requiresReview,
    action
  };
}

/**
 * Checks rate limits for fan additions
 */
export async function checkRateLimits(artistId: string): Promise<{ allowed: boolean; message?: string }> {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Check hourly limit
  const { count: hourlyCount, error: hourlyError } = await supabase
    .from('fans')
    .select('id', { count: 'exact' })
    .eq('artist_id', artistId)
    .gte('created_at', oneHourAgo.toISOString());

  if (hourlyError) {
    console.error('Error checking hourly rate limit:', hourlyError);
    return { allowed: false, message: 'Unable to verify rate limits' };
  }

  if ((hourlyCount || 0) >= SPAM_PREVENTION_CONFIG.MAX_FANS_PER_HOUR) {
    return { 
      allowed: false, 
      message: `Rate limit exceeded: Maximum ${SPAM_PREVENTION_CONFIG.MAX_FANS_PER_HOUR} fans per hour` 
    };
  }

  // Check daily limit
  const { count: dailyCount, error: dailyError } = await supabase
    .from('fans')
    .select('id', { count: 'exact' })
    .eq('artist_id', artistId)
    .gte('created_at', oneDayAgo.toISOString());

  if (dailyError) {
    console.error('Error checking daily rate limit:', dailyError);
    return { allowed: false, message: 'Unable to verify rate limits' };
  }

  if ((dailyCount || 0) >= SPAM_PREVENTION_CONFIG.MAX_FANS_PER_DAY) {
    return { 
      allowed: false, 
      message: `Rate limit exceeded: Maximum ${SPAM_PREVENTION_CONFIG.MAX_FANS_PER_DAY} fans per day` 
    };
  }

  return { allowed: true };
}

/**
 * Analyzes campaign content for spam indicators
 */
export function analyzeCampaignContent(subject: string, content: string): SpamCheckResult {
  const flags: string[] = [];
  let riskScore = 0;
  const recommendations: string[] = [];

  const fullText = `${subject} ${content}`.toLowerCase();

  // Check for spam keywords
  for (const keyword of SPAM_PREVENTION_CONFIG.SPAM_KEYWORDS) {
    if (fullText.includes(keyword.toLowerCase())) {
      flags.push('spam_keyword');
      riskScore += 20;
      recommendations.push(`Contains spam keyword: "${keyword}"`);
    }
  }

  // Check for excessive capitalization
  const capitalRatio = (subject.match(/[A-Z]/g) || []).length / subject.length;
  if (capitalRatio > 0.3) {
    flags.push('excessive_capitalization');
    riskScore += 15;
    recommendations.push('Subject line has excessive capitalization');
  }

  // Check for suspicious URL patterns
  const urlRegex = /https?:\/\/[^\s]+/g;
  const urls = fullText.match(urlRegex) || [];
  const suspiciousUrlPatterns = [
    /bit\.ly/,
    /tinyurl\.com/,
    /goo\.gl/,
    /t\.co/,
    /is\.gd/,
    /v\.gd/
  ];

  for (const url of urls) {
    for (const pattern of suspiciousUrlPatterns) {
      if (pattern.test(url)) {
        flags.push('suspicious_urls');
        riskScore += 30;
        recommendations.push('Shortened URLs can reduce deliverability');
        break;
      }
    }
  }

  // Determine action based on risk score
  let action: 'approve' | 'quarantine' | 'reject';
  let requiresReview = false;
  let isValid = true;

  if (riskScore >= SPAM_PREVENTION_CONFIG.AUTO_REJECT_THRESHOLD) {
    action = 'reject';
    isValid = false;
  } else if (riskScore >= SPAM_PREVENTION_CONFIG.QUARANTINE_RISK_THRESHOLD) {
    action = 'quarantine';
    requiresReview = true;
    isValid = false;
  } else {
    action = 'approve';
    isValid = true;
  }

  return {
    isValid,
    riskScore,
    flags,
    recommendations,
    requiresReview,
    action
  };
}

/**
 * Tracks consent verification for compliance
 */
export async function recordConsentVerification(
  fanId: string,
  verification: ConsentVerification
): Promise<void> {
  try {
    // Store consent verification in fan's custom_fields
    const { error } = await supabase
      .from('fans')
      .update({
        custom_fields: {
          consent_verification: verification
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', fanId);

    if (error) {
      console.error('Error recording consent verification:', error);
      throw error;
    }

    // Log the consent verification for audit trail
    await supabase
      .from('audit_logs')
      .insert({
        fan_id: fanId,
        action: 'consent_recorded',
        details: verification,
        timestamp: new Date().toISOString()
      });

  } catch (error) {
    console.error('Failed to record consent verification:', error);
    throw error;
  }
}

/**
 * Monitors artist's sending reputation
 */
export async function checkSendingReputation(artistId: string): Promise<{
  canSend: boolean;
  reputation: 'excellent' | 'good' | 'fair' | 'poor' | 'suspended';
  metrics: {
    bounceRate: number;
    complaintRate: number;
    engagementRate: number;
  };
  warnings: string[];
}> {
  const warnings: string[] = [];
  
  // Get recent campaign statistics
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const { data: recentEmails, error } = await supabase
    .from('emails_sent')
    .select(`
      status,
      opened_at,
      clicked_at,
      bounced_at,
      complained_at,
      campaigns!inner(artist_id)
    `)
    .eq('campaigns.artist_id', artistId)
    .gte('sent_at', thirtyDaysAgo.toISOString());

  if (error) {
    console.error('Error checking sending reputation:', error);
    return {
      canSend: false,
      reputation: 'poor',
      metrics: { bounceRate: 0, complaintRate: 0, engagementRate: 0 },
      warnings: ['Unable to verify sending reputation']
    };
  }

  const totalSent = recentEmails?.length || 0;
  
  if (totalSent === 0) {
    return {
      canSend: true,
      reputation: 'good',
      metrics: { bounceRate: 0, complaintRate: 0, engagementRate: 0 },
      warnings: []
    };
  }

  const bounced = recentEmails?.filter(e => e.status === 'bounced').length || 0;
  const complained = recentEmails?.filter(e => e.status === 'complained').length || 0;
  const opened = recentEmails?.filter(e => e.opened_at).length || 0;
  const clicked = recentEmails?.filter(e => e.clicked_at).length || 0;

  const bounceRate = bounced / totalSent;
  const complaintRate = complained / totalSent;
  const engagementRate = (opened + clicked) / totalSent;

  // Check against thresholds
  if (bounceRate > SPAM_PREVENTION_CONFIG.MAX_BOUNCE_RATE) {
    warnings.push(`High bounce rate: ${(bounceRate * 100).toFixed(2)}% (max: ${SPAM_PREVENTION_CONFIG.MAX_BOUNCE_RATE * 100}%)`);
  }

  if (complaintRate > SPAM_PREVENTION_CONFIG.MAX_COMPLAINT_RATE) {
    warnings.push(`High complaint rate: ${(complaintRate * 100).toFixed(3)}% (max: ${SPAM_PREVENTION_CONFIG.MAX_COMPLAINT_RATE * 100}%)`);
  }

  if (engagementRate < SPAM_PREVENTION_CONFIG.MIN_ENGAGEMENT_RATE) {
    warnings.push(`Low engagement rate: ${(engagementRate * 100).toFixed(2)}% (min: ${SPAM_PREVENTION_CONFIG.MIN_ENGAGEMENT_RATE * 100}%)`);
  }

  // Determine reputation and sending ability
  let reputation: 'excellent' | 'good' | 'fair' | 'poor' | 'suspended';
  let canSend = true;

  if (complaintRate > 0.005 || bounceRate > 0.15) { // 0.5% complaints or 15% bounces
    reputation = 'suspended';
    canSend = false;
    warnings.push('Sending suspended due to poor reputation metrics');
  } else if (complaintRate > 0.002 || bounceRate > 0.12) { // 0.2% complaints or 12% bounces
    reputation = 'poor';
    warnings.push('Poor sending reputation - consider list hygiene');
  } else if (complaintRate > 0.001 || bounceRate > 0.08) { // 0.1% complaints or 8% bounces
    reputation = 'fair';
  } else if (engagementRate > 0.15 && bounceRate < 0.05) { // 15% engagement, <5% bounces
    reputation = 'excellent';
  } else {
    reputation = 'good';
  }

  return {
    canSend,
    reputation,
    metrics: {
      bounceRate,
      complaintRate,
      engagementRate
    },
    warnings
  };
}

/**
 * Validates bulk import for compliance
 */
export async function validateBulkImport(
  emails: string[],
  source: string,
  artistId: string
): Promise<{
  valid: string[];
  invalid: { email: string; reason: string }[];
  warnings: string[];
  requiresDoubleOptIn: string[];
}> {
  const valid: string[] = [];
  const invalid: { email: string; reason: string }[] = [];
  const warnings: string[] = [];
  const requiresDoubleOptIn: string[] = [];

  // Check rate limits first
  const rateLimitCheck = await checkRateLimits(artistId);
  if (!rateLimitCheck.allowed) {
    throw new Error(rateLimitCheck.message);
  }

  // Check if import size exceeds remaining daily limit
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  const { count: todayCount } = await supabase
    .from('fans')
    .select('id', { count: 'exact' })
    .eq('artist_id', artistId)
    .gte('created_at', oneDayAgo.toISOString());

  const remainingQuota = SPAM_PREVENTION_CONFIG.MAX_FANS_PER_DAY - (todayCount || 0);
  
  if (emails.length > remainingQuota) {
    warnings.push(`Import size (${emails.length}) exceeds daily quota (${remainingQuota} remaining)`);
  }

  // Validate each email
  for (const email of emails) {
    const spamCheck = await validateEmailForSpam(email, source);
    
    if (!spamCheck.isValid) {
      invalid.push({
        email,
        reason: spamCheck.flags.join(', ')
      });
      continue;
    }

    // Check if email already exists
    const { data: existingFan } = await supabase
      .from('fans')
      .select('id, status')
      .eq('email', email)
      .eq('artist_id', artistId)
      .single();

    if (existingFan) {
      invalid.push({
        email,
        reason: 'Email already exists in your list'
      });
      continue;
    }

    // High-risk emails require double opt-in
    if (spamCheck.riskScore > 40 || source === 'import') {
      requiresDoubleOptIn.push(email);
    }

    valid.push(email);
  }

  // Add warnings for compliance
  if (source === 'import') {
    warnings.push('Imported emails must have verifiable consent. Consider sending confirmation emails.');
  }

  if (requiresDoubleOptIn.length > 0) {
    warnings.push(`${requiresDoubleOptIn.length} emails flagged for double opt-in verification`);
  }

  return {
    valid,
    invalid,
    warnings,
    requiresDoubleOptIn
  };
}

/**
 * Creates audit log entry for compliance tracking
 */
export async function createComplianceAuditLog(
  artistId: string,
  action: string,
  details: Record<string, any>,
  fanId?: string
): Promise<void> {
  try {
    await supabase
      .from('compliance_audit_logs')
      .insert({
        artist_id: artistId,
        fan_id: fanId,
        action,
        details,
        timestamp: new Date().toISOString(),
        ip_address: details.ip_address,
        user_agent: details.user_agent
      });
  } catch (error) {
    console.error('Failed to create compliance audit log:', error);
    // Don't throw - audit logging shouldn't break the main flow
  }
}

/**
 * Quarantines a fan for manual review
 */
export async function quarantineFan(
  fanData: any,
  artistId: string,
  spamCheck: SpamCheckResult,
  reviewType: 'spam_detection' | 'manual_flag' | 'bulk_import' = 'spam_detection'
): Promise<string> {
  try {
    const { data: reviewRecord, error } = await supabase
      .from('fan_reviews')
      .insert({
        artist_id: artistId,
        review_type: reviewType,
        risk_score: spamCheck.riskScore,
        flags: spamCheck.flags,
        recommendations: spamCheck.recommendations,
        original_data: fanData,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating fan review record:', error);
      throw error;
    }

    // Create a quarantined fan record
    const { data: fan, error: fanError } = await supabase
      .from('fans')
      .insert({
        email: fanData.email,
        name: fanData.name || null,
        artist_id: artistId,
        tags: fanData.tags || null,
        custom_fields: {
          ...fanData.custom_fields,
          risk_score: spamCheck.riskScore,
          spam_flags: spamCheck.flags,
          review_id: reviewRecord.id
        },
        source: fanData.source || 'manual',
        status: 'pending', // Special status for quarantined fans
        review_status: 'pending',
        quarantine_reason: `Risk score: ${spamCheck.riskScore}. Flags: ${spamCheck.flags.join(', ')}`,
        quarantined_at: new Date().toISOString(),
        risk_score: spamCheck.riskScore,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (fanError) {
      console.error('Error creating quarantined fan:', fanError);
      throw fanError;
    }

    // Update the review record with the fan ID
    await supabase
      .from('fan_reviews')
      .update({ fan_id: fan.id })
      .eq('id', reviewRecord.id);

    return reviewRecord.id;
  } catch (error) {
    console.error('Failed to quarantine fan:', error);
    throw error;
  }
}

/**
 * Gets pending reviews for an artist
 */
export async function getPendingReviews(artistId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('fan_reviews')
      .select(`
        *,
        fans!inner(email, name, created_at)
      `)
      .eq('artist_id', artistId)
      .eq('status', 'pending')
      .order('auto_flagged_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending reviews:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to get pending reviews:', error);
    throw error;
  }
}

/**
 * Approves a quarantined fan
 */
export async function approveFan(
  reviewId: string,
  reviewerId: string,
  notes?: string
): Promise<void> {
  try {
    // Get the review record
    const { data: review, error: reviewError } = await supabase
      .from('fan_reviews')
      .select('*')
      .eq('id', reviewId)
      .single();

    if (reviewError || !review) {
      throw new Error('Review record not found');
    }

    // Update the fan status to approved
    const { error: fanError } = await supabase
      .from('fans')
      .update({
        status: 'subscribed',
        review_status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewerId,
        review_notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', review.fan_id);

    if (fanError) {
      console.error('Error updating fan status:', fanError);
      throw fanError;
    }

    // Update the review record
    const { error: updateError } = await supabase
      .from('fan_reviews')
      .update({
        status: 'approved',
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
        review_notes: notes
      })
      .eq('id', reviewId);

    if (updateError) {
      console.error('Error updating review record:', updateError);
      throw updateError;
    }

    // Log the approval
    await createComplianceAuditLog(review.artist_id, 'fan_approved', {
      review_id: reviewId,
      fan_id: review.fan_id,
      reviewer_id: reviewerId,
      notes,
      original_risk_score: review.risk_score
    }, review.fan_id);

  } catch (error) {
    console.error('Failed to approve fan:', error);
    throw error;
  }
}

/**
 * Rejects a quarantined fan
 */
export async function rejectFan(
  reviewId: string,
  reviewerId: string,
  notes?: string
): Promise<void> {
  try {
    // Get the review record
    const { data: review, error: reviewError } = await supabase
      .from('fan_reviews')
      .select('*')
      .eq('id', reviewId)
      .single();

    if (reviewError || !review) {
      throw new Error('Review record not found');
    }

    // Update the fan status to rejected (or delete)
    const { error: fanError } = await supabase
      .from('fans')
      .update({
        status: 'rejected',
        review_status: 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewerId,
        review_notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', review.fan_id);

    if (fanError) {
      console.error('Error updating fan status:', fanError);
      throw fanError;
    }

    // Update the review record
    const { error: updateError } = await supabase
      .from('fan_reviews')
      .update({
        status: 'rejected',
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
        review_notes: notes
      })
      .eq('id', reviewId);

    if (updateError) {
      console.error('Error updating review record:', updateError);
      throw updateError;
    }

    // Log the rejection
    await createComplianceAuditLog(review.artist_id, 'fan_rejected', {
      review_id: reviewId,
      fan_id: review.fan_id,
      reviewer_id: reviewerId,
      notes,
      original_risk_score: review.risk_score
    }, review.fan_id);

  } catch (error) {
    console.error('Failed to reject fan:', error);
    throw error;
  }
}

/**
 * Gets review statistics for an artist
 */
export async function getReviewStats(artistId: string): Promise<{
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}> {
  try {
    const { data, error } = await supabase
      .from('fan_reviews')
      .select('status')
      .eq('artist_id', artistId);

    if (error) {
      console.error('Error fetching review stats:', error);
      throw error;
    }

    const stats = {
      pending: 0,
      approved: 0,
      rejected: 0,
      total: data?.length || 0
    };

    data?.forEach(review => {
      if (review.status === 'pending') stats.pending++;
      else if (review.status === 'approved') stats.approved++;
      else if (review.status === 'rejected') stats.rejected++;
    });

    return stats;
  } catch (error) {
    console.error('Failed to get review stats:', error);
    return { pending: 0, approved: 0, rejected: 0, total: 0 };
  }
}