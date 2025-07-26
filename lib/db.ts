import { supabase, createClerkSupabaseClient } from './supabase';
import type { 
  Artist, Fan, Campaign, EmailSent, Segment, Automation, ABTest, 
  Template, Webhook, TeamMember, Integration, AnalyticsData,
  CampaignFormData, FanFormData
} from './types';

// Helper function to map database fields to expected structure
function mapArtistFields(artist: any): Artist {
  // Handle null or undefined artist
  if (!artist) {
    console.error('mapArtistFields called with null or undefined artist');
    return artist;
  }
  
  // Create a subscription object from the individual fields
  const hasSubscriptionData = artist.subscription_plan || artist.stripe_subscription_id;
  const subscription = hasSubscriptionData ? {
    plan: artist.subscription_plan || 'starter',
    status: artist.subscription_status || 'active',
    stripe_customer_id: artist.stripe_customer_id,
    stripe_subscription_id: artist.stripe_subscription_id,
    current_period_end: artist.subscription_current_period_end,
    cancel_at_period_end: artist.subscription_cancel_at_period_end,
    metadata: artist.subscription_metadata || {}
  } : undefined;

  // Return the artist with the mapped subscription
  return {
    ...artist,
    subscription
  };
}

// ARTISTS
export async function getArtistById(id: string) {
  const { data, error } = await supabase.from('artists').select('*').eq('id', id).single();
  if (error) throw error;
  return mapArtistFields(data) as Artist;
}

export async function getArtistBySlug(slug: string) {
  const { data, error } = await supabase.from('artists').select('*').eq('slug', slug).single();
  if (error) throw error;
  return mapArtistFields(data) as Artist;
}

export async function updateArtist(id: string, updates: Partial<Artist>) {
  const { data, error } = await supabase.from('artists').update(updates).eq('id', id).single();
  if (error) throw error;
  return mapArtistFields(data) as Artist;
}

export async function updateArtistProfile(clerkUserId: string, updates: { name?: string; bio?: string; settings?: any }) {
  const { data, error } = await supabase
    .from('artists')
    .update({
      name: updates.name,
      bio: updates.bio,
      settings: updates.settings,
      updated_at: new Date().toISOString()
    })
    .eq('clerk_user_id', clerkUserId)
    .select()
    .single();
  
  if (error) throw error;
  return mapArtistFields(data) as Artist;
}

export async function updateArtistSettings(clerkUserId: string, settingsUpdate: any) {
  // First get current settings
  const { data: artist, error: fetchError } = await supabase
    .from('artists')
    .select('settings')
    .eq('clerk_user_id', clerkUserId)
    .single();
  
  if (fetchError) throw fetchError;
  
  // Merge with existing settings
  const currentSettings = artist.settings || {};
  const newSettings = { ...currentSettings, ...settingsUpdate };
  
  const { data, error } = await supabase
    .from('artists')
    .update({
      settings: newSettings,
      updated_at: new Date().toISOString()
    })
    .eq('clerk_user_id', clerkUserId)
    .select()
    .single();
  
  if (error) throw error;
  
  // If no data was returned, fetch the artist to get the updated data
  if (!data) {
    console.log('No data returned from update, fetching artist by clerk ID');
    const artist = await getOrCreateArtistByClerkId(clerkUserId, '', '');
    return artist;
  }
  
  return mapArtistFields(data) as Artist;
}

// Helper function to create a safe slug
async function createSafeSlug(inputName: string, attempt = 0): Promise<string> {
  let baseSlug = inputName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  
  // Never allow problematic slugs
  if (baseSlug === 'sign-in' || baseSlug === 'signin' || baseSlug === 'login' || baseSlug === '' || baseSlug === 'api' || baseSlug === 'dashboard') {
    baseSlug = 'artist';
  }
  
  // If empty, use default
  if (!baseSlug) {
    baseSlug = 'artist';
  }
  
  // Add number suffix if this is a retry
  const slug = attempt > 0 ? `${baseSlug}-${attempt}` : baseSlug;
  
  // Check if slug already exists
  const { data: existingArtist } = await supabase
    .from('artists')
    .select('id')
    .eq('slug', slug)
    .single();
  
  // If slug exists, try with a number suffix
  if (existingArtist) {
    return createSafeSlug(inputName, attempt + 1);
  }
  
  return slug;
}

// Helper function to create a new artist
async function createNewArtist(clerkUserId: string, email: string, name: string) {
  const slug = await createSafeSlug(name);
  console.log('Attempting to create artist with:', { clerkUserId, email, name, slug });
  
  // Try to create the artist
  const { data: newArtist, error } = await supabase
    .from("artists")
    .insert({
      clerk_user_id: clerkUserId,
      email: email || 'no-email@example.com', // Fallback email
      name: name || 'Artist',
      slug,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating artist:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    // Handle specific error cases
    if (error.code === '23505') {
      console.error('Duplicate key error - trying to find existing artist');
      // Try to find the existing artist
      const { data: existingArtist } = await supabase
        .from("artists")
        .select("*")
        .eq("clerk_user_id", clerkUserId)
        .single();
      
      if (existingArtist) {
        console.log('Found existing artist, returning it');
        return mapArtistFields(existingArtist);
      }
    }
    
    // If it's an RLS error, provide helpful message
    if (error.message?.includes('RLS') || error.message?.includes('policy')) {
      throw new Error('Database permission error. Please check your Supabase RLS policies.');
    }
    
    throw new Error(`Failed to create artist: ${error.message || JSON.stringify(error)}`);
  }
  
  return mapArtistFields(newArtist);
}

export async function getOrCreateArtistByClerkId(clerkUserId: string, email: string, name: string, clerkToken?: string) {
  // Use Clerk-authenticated Supabase client if token is provided
  const client = clerkToken ? createClerkSupabaseClient(clerkToken) : supabase;
  
  // First try to get the artist
  const { data: artist, error: fetchError } = await client
    .from("artists")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .single();
  
  // If we found an artist, check if we need to update the slug
  if (artist && !fetchError) {
    if (!artist.slug || artist.slug === 'sign-in' || artist.slug === 'signin') {
      const slug = await createSafeSlug(artist.name || name);
      const { data: updatedArtist, error: updateError } = await supabase
        .from("artists")
        .update({ slug })
        .eq("id", artist.id)
        .select()
        .single();
      
      if (!updateError && updatedArtist) {
        // Map database fields to expected structure
        return mapArtistFields(updatedArtist);
      }
    }
    // Map database fields to expected structure
    return mapArtistFields(artist);
  }
  
  // If artist doesn't exist, create one
  if (fetchError && fetchError.code === 'PGRST116') {
    // Artist doesn't exist, create new one
    return await createNewArtist(clerkUserId, email, name);
  }
  
  // If there's another error, throw it
  if (fetchError) {
    console.error('Error fetching artist:', fetchError);
    throw fetchError;
  }
  
  return mapArtistFields(artist);
}

// FANS
export async function addFan(fan: Omit<Fan, 'id'>) {
  const { data, error } = await supabase.from('fans').insert(fan).select().single();
  if (error) throw error;
  return data as Fan;
}

export async function getFansByArtist(artist_id: string) {
  const { data, error } = await supabase.from('fans').select('*').eq('artist_id', artist_id);
  if (error) throw error;
  return data as Fan[];
}

export async function updateFan(id: string, updates: Partial<Fan>) {
  const { data, error } = await supabase.from('fans').update(updates).eq('id', id).single();
  if (error) throw error;
  return data as Fan;
}

// CAMPAIGNS
export async function createCampaign(campaign: Omit<Campaign, 'id'>) {
  const { data, error } = await supabase.from('campaigns').insert(campaign).select().single();
  if (error) throw error;
  return data as Campaign;
}

export async function getCampaignsByArtist(artist_id: string) {
  const { data, error } = await supabase.from('campaigns').select('*').eq('artist_id', artist_id).order('created_at', { ascending: false });
  if (error) throw error;
  return data as Campaign[];
}

export async function getCampaignById(id: string) {
  const { data, error } = await supabase.from('campaigns').select('*').eq('id', id).single();
  if (error) throw error;
  return data as Campaign;
}

export async function updateCampaign(id: string, updates: Partial<Campaign>) {
  const { data, error } = await supabase.from('campaigns').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as Campaign;
}

export async function deleteCampaign(id: string) {
  const { error } = await supabase.from('campaigns').delete().eq('id', id);
  if (error) throw error;
}

export async function duplicateCampaign(id: string, artistId: string) {
  const original = await getCampaignById(id);
  const now = new Date().toISOString();
  
  const duplicate: Omit<Campaign, 'id'> = {
    title: `${original.title} (Copy)`,
    subject: original.subject,
    message: original.message,
    artist_id: artistId,
    status: 'draft' as const,
    send_date: now,
    artwork_url: original.artwork_url,
    template_id: original.template_id,
    template_data: original.template_data,
    settings: original.settings,
    stats: {
      total_sent: 0,
      delivered: 0,
      opens: 0,
      unique_opens: 0,
      clicks: 0,
      unique_clicks: 0,
      bounces: 0,
      complaints: 0,
      unsubscribes: 0,
      open_rate: 0,
      click_rate: 0,
      bounce_rate: 0,
      unsubscribe_rate: 0,
    },
    created_at: now,
    updated_at: now,
  };

  return createCampaign(duplicate);
}

// EMAILS SENT
export async function logEmailSent(email: Omit<EmailSent, 'id'>) {
  const { data, error } = await supabase.from('emails_sent').insert(email).select().single();
  if (error) throw error;
  return data as EmailSent;
}

export async function getEmailsSentByCampaign(campaign_id: string) {
  const { data, error } = await supabase.from('emails_sent').select('*').eq('campaign_id', campaign_id);
  if (error) throw error;
  return data as EmailSent[];
}

export async function updateEmailStatus(id: string, status: EmailSent['status'], timestamp?: string) {
  const updates: Partial<EmailSent> = { status };
  
  switch (status) {
    case 'delivered':
      break;
    case 'bounced':
      updates.bounced_at = timestamp || new Date().toISOString();
      break;
    case 'complained':
      updates.complained_at = timestamp || new Date().toISOString();
      break;
  }

  const { data, error } = await supabase.from('emails_sent').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as EmailSent;
}

export async function trackEmailOpen(fan_id: string, campaign_id: string) {
  const { data, error } = await supabase
    .from('emails_sent')
    .update({ opened_at: new Date().toISOString() })
    .eq('fan_id', fan_id)
    .eq('campaign_id', campaign_id)
    .is('opened_at', null)
    .select()
    .single();
  
  if (error) throw error;
  return data as EmailSent;
}

export async function trackEmailClick(fan_id: string, campaign_id: string) {
  const { data, error } = await supabase
    .from('emails_sent')
    .update({ clicked_at: new Date().toISOString() })
    .eq('fan_id', fan_id)
    .eq('campaign_id', campaign_id)
    .select()
    .single();
  
  if (error) throw error;
  return data as EmailSent;
}

// SEGMENTS
export async function createSegment(segment: Omit<Segment, 'id' | 'fan_count' | 'created_at' | 'updated_at'>) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('segments')
    .insert({
      ...segment,
      fan_count: 0,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as Segment;
}

export async function getSegmentsByArtist(artist_id: string) {
  const { data, error } = await supabase
    .from('segments')
    .select('*')
    .eq('artist_id', artist_id)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as Segment[];
}

export async function getSegmentById(id: string) {
  const { data, error } = await supabase.from('segments').select('*').eq('id', id).single();
  if (error) throw error;
  return data as Segment;
}

export async function updateSegment(id: string, updates: Partial<Segment>) {
  const { data, error } = await supabase
    .from('segments')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Segment;
}

export async function deleteSegment(id: string) {
  const { error } = await supabase.from('segments').delete().eq('id', id);
  if (error) throw error;
}

export async function getFansBySegment(_segment_id: string) {
  // This would need complex logic to evaluate segment conditions
  // For now, return empty array - implement based on your segment logic
  return [] as Fan[];
}

// AUTOMATIONS
export async function createAutomation(automation: Omit<Automation, 'id' | 'stats' | 'created_at' | 'updated_at'>) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('automations')
    .insert({
      ...automation,
      stats: { triggered: 0, completed: 0, conversion_rate: 0 },
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as Automation;
}

export async function getAutomationsByArtist(artist_id: string) {
  const { data, error } = await supabase
    .from('automations')
    .select('*')
    .eq('artist_id', artist_id)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as Automation[];
}

export async function updateAutomation(id: string, updates: Partial<Automation>) {
  const { data, error } = await supabase
    .from('automations')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Automation;
}

// AB TESTS
export async function createABTest(abTest: Omit<ABTest, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('ab_tests')
    .insert({
      ...abTest,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as ABTest;
}

export async function getABTestsByCampaign(campaign_id: string) {
  const { data, error } = await supabase
    .from('ab_tests')
    .select('*')
    .eq('campaign_id', campaign_id);
  
  if (error) throw error;
  return data as ABTest[];
}

// TEMPLATES
export async function createTemplate(template: Omit<Template, 'id' | 'created_at' | 'updated_at'>) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('templates')
    .insert({
      ...template,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as Template;
}

export async function getTemplatesByArtist(artist_id: string) {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .or(`artist_id.eq.${artist_id},is_public.eq.true`)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as Template[];
}

export async function getPublicTemplates() {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as Template[];
}

// WEBHOOKS
export async function createWebhook(webhook: Omit<Webhook, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('webhooks')
    .insert({
      ...webhook,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as Webhook;
}

export async function getWebhooksByArtist(artist_id: string) {
  const { data, error } = await supabase
    .from('webhooks')
    .select('*')
    .eq('artist_id', artist_id)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as Webhook[];
}

// TEAM MEMBERS
export async function inviteTeamMember(member: Omit<TeamMember, 'id' | 'invited_at'>) {
  const { data, error } = await supabase
    .from('team_members')
    .insert({
      ...member,
      invited_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as TeamMember;
}

export async function getTeamMembersByArtist(artist_id: string) {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('artist_id', artist_id)
    .order('invited_at', { ascending: false });
  
  if (error) throw error;
  return data as TeamMember[];
}

export async function getTeamMemberByClerkId(_clerk_id: string, _artist_id: string) {
  // Since we don't have a direct clerk_id field in the team_members table,
  // we need to modify the domain/reputation/route.ts approach instead
  
  // For now, let's implement a simple version that returns null
  // This will allow the artist owner to access the reputation data
  // but team members will need to be handled differently
  return null;
}

// INTEGRATIONS
export async function createIntegration(integration: Omit<Integration, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('integrations')
    .insert({
      ...integration,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as Integration;
}

export async function getIntegrationsByArtist(artist_id: string) {
  const { data, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('artist_id', artist_id)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as Integration[];
}

// ANALYTICS
export async function getCampaignAnalytics(campaign_id: string) {
  const { data: emails, error } = await supabase
    .from('emails_sent')
    .select('*')
    .eq('campaign_id', campaign_id);
  
  if (error) throw error;
  
  const stats = {
    total_sent: emails.length,
    delivered: emails.filter((e: any) => e.status === 'delivered').length,
    opens: emails.filter((e: any) => e.opened_at).length,
    unique_opens: emails.filter((e: any) => e.opened_at).length, // Simplified
    clicks: emails.filter((e: any) => e.clicked_at).length,
    unique_clicks: emails.filter((e: any) => e.clicked_at).length, // Simplified
    bounces: emails.filter((e: any) => e.status === 'bounced').length,
    complaints: emails.filter((e: any) => e.status === 'complained').length,
    unsubscribes: 0, // Would need separate tracking
    open_rate: 0,
    click_rate: 0,
    bounce_rate: 0,
    unsubscribe_rate: 0,
  };
  
  // Calculate rates
  if (stats.delivered > 0) {
    stats.open_rate = (stats.opens / stats.delivered) * 100;
    stats.click_rate = (stats.clicks / stats.delivered) * 100;
    stats.bounce_rate = (stats.bounces / stats.total_sent) * 100;
  }
  
  return stats;
}

export async function getArtistAnalytics(artist_id: string, period: 'day' | 'week' | 'month' | 'year' = 'month') {
  // Calculate date range
  const now = new Date();
  const daysBack = period === 'day' ? 1 : period === 'week' ? 7 : period === 'month' ? 30 : 365;
  const periodStart = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

  // Get campaigns for this artist
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id, status, created_at, stats')
    .eq('artist_id', artist_id)
    .gte('created_at', periodStart.toISOString());

  // Get fans data
  const { data: allFans } = await supabase
    .from('fans')
    .select('id, status, created_at, unsubscribed_at')
    .eq('artist_id', artist_id);

  // Get email tracking data for campaigns in this period
  const campaignIds = campaigns?.map(c => c.id) || [];
  let emailsData: any[] = [];
  
  if (campaignIds.length > 0) {
    const { data: emails } = await supabase
      .from('emails_sent')
      .select('id, status, opened_at, clicked_at, sent_at, campaign_id')
      .in('campaign_id', campaignIds);
    
    emailsData = emails || [];
  }

  // Calculate metrics
  const sentCampaigns = campaigns?.filter(c => c.status === 'sent') || [];
  const delivered = emailsData.filter(e => e.status === 'delivered' || e.status === 'sent').length;
  const totalOpens = emailsData.filter(e => e.opened_at).length;
  const totalClicks = emailsData.filter(e => e.clicked_at).length;

  // New subscribers in period
  const newSubscribers = allFans?.filter(f => {
    const createdDate = new Date(f.created_at);
    return createdDate >= periodStart && f.status === 'subscribed';
  }).length || 0;

  // Unsubscribes in period
  const unsubscribes = allFans?.filter(f => {
    if (!f.unsubscribed_at) return false;
    const unsubDate = new Date(f.unsubscribed_at);
    return unsubDate >= periodStart;
  }).length || 0;

  // Generate trends data (daily breakdown)
  const trends = [];
  for (let i = daysBack - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    
    // Count opens for this day
    const dayOpens = emailsData.filter(e => {
      if (!e.opened_at) return false;
      const openDate = new Date(e.opened_at).toISOString().split('T')[0];
      return openDate === dateStr;
    }).length;

    trends.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: dayOpens,
    });
  }

  const analytics: AnalyticsData = {
    period,
    metrics: {
      campaigns_sent: sentCampaigns.length,
      emails_delivered: delivered,
      total_opens: totalOpens,
      total_clicks: totalClicks,
      new_subscribers: newSubscribers,
      unsubscribes: unsubscribes,
    },
    trends,
  };
  
  return analytics;
}

// ENHANCED FAN FUNCTIONS
export async function addFanWithValidation(fanData: FanFormData, artist_id: string) {
  // Check for existing fan
  const { data: existing } = await supabase
    .from('fans')
    .select('id')
    .eq('email', fanData.email)
    .eq('artist_id', artist_id)
    .single();
  
  if (existing) {
    throw new Error('Fan with this email already exists');
  }
  
  const fan: Omit<Fan, 'id'> = {
    ...fanData,
    artist_id,
    status: 'subscribed',
    source: fanData.source || 'manual',
    custom_fields: fanData.custom_fields as Record<string, string | number | boolean> | undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  return addFan(fan);
}

export async function unsubscribeFan(fan_id: string) {
  const { data, error } = await supabase
    .from('fans')
    .update({
      status: 'unsubscribed',
      unsubscribed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', fan_id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Fan;
}

export async function resubscribeFan(fan_id: string) {
  const { data, error } = await supabase
    .from('fans')
    .update({
      status: 'subscribed',
      unsubscribed_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', fan_id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Fan;
}

// Missing function implementations
export async function getFanById(id: string) {
  const { data, error } = await supabase.from('fans').select('*').eq('id', id).single();
  if (error) throw error;
  return data as Fan;
}

export async function getTemplateById(id: string) {
  const { data, error } = await supabase.from('templates').select('*').eq('id', id).single();
  if (error) throw error;
  return data as Template;
}

export async function updateTemplate(id: string, updates: Partial<Template>) {
  const { data, error } = await supabase
    .from('templates')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Template;
}

export async function deleteTemplate(id: string) {
  const { error } = await supabase.from('templates').delete().eq('id', id);
  if (error) throw error;
}

export async function updateTeamMember(id: string, updates: Partial<TeamMember>) {
  const { data, error } = await supabase
    .from('team_members')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as TeamMember;
}

export async function deleteTeamMember(id: string) {
  const { error } = await supabase.from('team_members').delete().eq('id', id);
  if (error) throw error;
}

export async function updateIntegration(id: string, updates: Partial<Integration>) {
  const { data, error } = await supabase
    .from('integrations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Integration;
}

export async function deleteIntegration(id: string) {
  const { error } = await supabase.from('integrations').delete().eq('id', id);
  if (error) throw error;
}

export async function updateWebhook(id: string, updates: Partial<Webhook>) {
  const { data, error } = await supabase
    .from('webhooks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Webhook;
}

export async function deleteWebhook(id: string) {
  const { error } = await supabase.from('webhooks').delete().eq('id', id);
  if (error) throw error;
}

// ENHANCED CAMPAIGN FUNCTIONS
export async function createCampaignWithDefaults(campaignData: CampaignFormData, artist_id: string) {
  const now = new Date().toISOString();
  
  const campaign: Omit<Campaign, 'id'> = {
    title: campaignData.title,
    subject: campaignData.subject,
    message: campaignData.message,
    artist_id,
    status: 'draft',
    send_date: campaignData.send_date || now,
    template_id: campaignData.template_id || null,
    template_data: campaignData.template_data || null,
    segment_id: campaignData.segment_id || null,
    settings: {
      ...campaignData.settings,
    },
    stats: {
      total_sent: 0,
      delivered: 0,
      opens: 0,
      unique_opens: 0,
      clicks: 0,
      unique_clicks: 0,
      bounces: 0,
      complaints: 0,
      unsubscribes: 0,
      open_rate: 0,
      click_rate: 0,
      bounce_rate: 0,
      unsubscribe_rate: 0,
    },
    created_at: now,
    updated_at: now,
  };
  
  return createCampaign(campaign);
}