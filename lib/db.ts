import { supabase, createClerkSupabaseClient, getSupabaseAdmin } from './supabase';
import type { Artist, Fan, Campaign, EmailSent, Segment, Automation, ABTest, Template, Webhook, TeamMember, Integration, AnalyticsData, CampaignFormData, FanFormData } from './types';
function mapArtistFields(artist: any): Artist {
    if (!artist) {
        console.error('mapArtistFields called with null or undefined artist');
        console.trace('Stack trace for null artist:');
        throw new Error('Cannot map null or undefined artist');
    }
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
    return {
        ...artist,
        subscription
    };
}
export async function getArtistById(id: string) {
    const { data, error } = await supabase
        .from('artists')
        .select('*')
        .eq('id', id)
        .maybeSingle();
    if (error && error.code !== 'PGRST116')
        throw error;
    return data ? (mapArtistFields(data) as Artist) : null;
}
export async function getArtistBySlug(slug: string) {
    const { data, error } = await supabase.from('artists').select('*').eq('slug', slug).single();
    if (error)
        throw error;
    return mapArtistFields(data) as Artist;
}
export async function updateArtist(id: string, updates: Partial<Artist>) {
    const { data, error } = await supabase.from('artists').update(updates).eq('id', id).select().single();
    if (error)
        throw error;
    if (!data) {
        throw new Error('No data returned from artist update');
    }
    return mapArtistFields(data) as Artist;
}
export async function updateArtistProfile(clerkUserId: string, updates: {
    name?: string;
    bio?: string;
    settings?: any;
}) {
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
    if (error)
        throw error;
    return mapArtistFields(data) as Artist;
}
export async function updateArtistSettings(clerkUserId: string, settingsUpdate: any) {
    const { data: artist, error: fetchError } = await supabase
        .from('artists')
        .select('settings')
        .eq('clerk_user_id', clerkUserId)
        .single();
    if (fetchError)
        throw fetchError;
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
    if (error)
        throw error;
    if (!data) {
        console.log('No data returned from update, fetching artist by clerk ID');
        const artist = await getOrCreateArtistByClerkId(clerkUserId, '', '');
        return artist;
    }
    return mapArtistFields(data) as Artist;
}
async function createSafeSlug(inputName: string, attempt = 0): Promise<string> {
    let baseSlug = inputName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    if (baseSlug === 'sign-in' || baseSlug === 'signin' || baseSlug === 'login' || baseSlug === '' || baseSlug === 'api' || baseSlug === 'dashboard') {
        baseSlug = 'artist';
    }
    if (!baseSlug) {
        baseSlug = 'artist';
    }
    const slug = attempt > 0 ? `${baseSlug}-${attempt}` : baseSlug;
    const { data: existingArtist } = await supabase
        .from('artists')
        .select('id')
        .eq('slug', slug)
        .single();
    if (existingArtist) {
        return createSafeSlug(inputName, attempt + 1);
    }
    return slug;
}
async function createNewArtist(clerkUserId: string, email: string, name: string) {
    const slug = await createSafeSlug(name);
    console.log('Attempting to create artist with:', { clerkUserId, email, name, slug });
    const { data: newArtist, error } = await supabase
        .from("artists")
        .insert({
        clerk_user_id: clerkUserId,
        email: email || 'no-email@example.com',
        name: name || 'Artist',
        slug,
    })
        .select()
        .single();
    if (error) {
        console.error('Error creating artist:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        if (error.code === '23505') {
            console.error('Duplicate key error - trying to find existing artist');
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
        if (error.message?.includes('RLS') || error.message?.includes('policy')) {
            throw new Error('Database permission error. Please check your Supabase RLS policies.');
        }
        throw new Error(`Failed to create artist: ${error.message || JSON.stringify(error)}`);
    }
    return mapArtistFields(newArtist);
}
export async function getOrCreateArtistByClerkId(clerkUserId: string, email: string, name: string, clerkToken?: string) {
    const client = clerkToken ? createClerkSupabaseClient(clerkToken) : supabase;
    const { data: artist, error: fetchError } = await client
        .from("artists")
        .select("*")
        .eq("clerk_user_id", clerkUserId)
        .single();
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
                return mapArtistFields(updatedArtist);
            }
        }
        return mapArtistFields(artist);
    }
    if (fetchError && fetchError.code === 'PGRST116') {
        return await createNewArtist(clerkUserId, email, name);
    }
    if (fetchError) {
        console.error('Error fetching artist:', fetchError);
        throw fetchError;
    }
    if (!artist) {
        console.error('Artist is null after successful query - this should not happen');
        throw new Error('Artist data is unexpectedly null');
    }
    return mapArtistFields(artist);
}
export async function addFan(fan: Omit<Fan, 'id'>) {
    const { data, error } = await supabase.from('fans').insert(fan).select().single();
    if (error)
        throw error;
    return data as Fan;
}
export async function getFansByArtist(artist_id: string, includeQuarantined: boolean = false) {
    let query = supabase.from('fans').select('*').eq('artist_id', artist_id);
    if (!includeQuarantined) {
        query = query.neq('review_status', 'pending');
    }
    const { data, error } = await query;
    if (error)
        throw error;
    return data as Fan[];
}
export async function updateFan(id: string, updates: Partial<Fan>) {
    const { data, error } = await supabase.from('fans').update(updates).eq('id', id).select().single();
    if (error)
        throw error;
    if (!data) {
        throw new Error('No data returned from fan update');
    }
    return data as Fan;
}
export async function createCampaign(campaign: Omit<Campaign, 'id'>) {
    const { data, error } = await supabase.from('campaigns').insert(campaign).select().single();
    if (error)
        throw error;
    return data as Campaign;
}
export async function getCampaignsByArtist(artist_id: string) {
    const { data, error } = await supabase.from('campaigns').select('*').eq('artist_id', artist_id).order('created_at', { ascending: false });
    if (error)
        throw error;
    return data as Campaign[];
}
export async function getCampaignById(id: string) {
    const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .maybeSingle();
    if (error && error.code !== 'PGRST116')
        throw error;
    return data as Campaign | null;
}
export async function updateCampaign(id: string, updates: Partial<Campaign>) {
    const supabaseAdmin = await getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.from('campaigns').update(updates).eq('id', id).select().single();
    if (error)
        throw error;
    return data as Campaign;
}
export async function deleteCampaign(id: string) {
    const { error } = await supabase.from('campaigns').delete().eq('id', id);
    if (error)
        throw error;
}
export async function duplicateCampaign(id: string, artistId: string) {
    const original = await getCampaignById(id);
    if (!original) {
        throw new Error('Campaign not found');
    }
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
export async function logEmailSent(email: Omit<EmailSent, 'id'>) {
    const supabaseAdmin = await getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.from('emails_sent').insert(email).select().single();
    if (error)
        throw error;
    return data as EmailSent;
}
export async function getEmailsSentByCampaign(campaign_id: string) {
    const { data, error } = await supabase.from('emails_sent').select('*').eq('campaign_id', campaign_id);
    if (error)
        throw error;
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
    if (error)
        throw error;
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
    if (error)
        throw error;
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
    if (error)
        throw error;
    return data as EmailSent;
}
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
    if (error)
        throw error;
    return data as Segment;
}
export async function getSegmentsByArtist(artist_id: string) {
    const { data, error } = await supabase
        .from('segments')
        .select('*')
        .eq('artist_id', artist_id)
        .order('created_at', { ascending: false });
    if (error)
        throw error;
    return data as Segment[];
}
export async function getSegmentById(id: string) {
    const { data, error } = await supabase.from('segments').select('*').eq('id', id).single();
    if (error)
        throw error;
    return data as Segment;
}
export async function updateSegment(id: string, updates: Partial<Segment>) {
    const { data, error } = await supabase
        .from('segments')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
    if (error)
        throw error;
    return data as Segment;
}
export async function deleteSegment(id: string) {
    const { error } = await supabase.from('segments').delete().eq('id', id);
    if (error)
        throw error;
}
export async function getFansBySegment(_segment_id: string) {
    return [] as Fan[];
}
export async function getApprovedFansByArtist(artist_id: string) {
    const { data, error } = await supabase
        .from('fans')
        .select('*')
        .eq('artist_id', artist_id)
        .eq('status', 'subscribed')
        .in('review_status', ['approved', null])
        .neq('review_status', 'pending')
        .neq('review_status', 'rejected');
    if (error)
        throw error;
    return data as Fan[];
}
export async function getQuarantinedFansByArtist(artist_id: string) {
    const { data, error } = await supabase
        .from('fans')
        .select('*')
        .eq('artist_id', artist_id)
        .eq('review_status', 'pending');
    if (error)
        throw error;
    return data as Fan[];
}
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
    if (error)
        throw error;
    return data as Automation;
}
export async function getAutomationsByArtist(artist_id: string) {
    const { data, error } = await supabase
        .from('automations')
        .select('*')
        .eq('artist_id', artist_id)
        .order('created_at', { ascending: false });
    if (error)
        throw error;
    return data as Automation[];
}
export async function updateAutomation(id: string, updates: Partial<Automation>) {
    const { data, error } = await supabase
        .from('automations')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
    if (error)
        throw error;
    return data as Automation;
}
export async function createABTest(abTest: Omit<ABTest, 'id' | 'created_at'>) {
    const { data, error } = await supabase
        .from('ab_tests')
        .insert({
        ...abTest,
        created_at: new Date().toISOString(),
    })
        .select()
        .single();
    if (error)
        throw error;
    return data as ABTest;
}
export async function getABTestsByCampaign(campaign_id: string) {
    const { data, error } = await supabase
        .from('ab_tests')
        .select('*')
        .eq('campaign_id', campaign_id);
    if (error)
        throw error;
    return data as ABTest[];
}
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
    if (error)
        throw error;
    return data as Template;
}
export async function getTemplatesByArtist(artist_id: string) {
    const { data, error } = await supabase
        .from('templates')
        .select('*')
        .or(`artist_id.eq.${artist_id},is_public.eq.true`)
        .order('created_at', { ascending: false });
    if (error)
        throw error;
    return data as Template[];
}
export async function getPublicTemplates() {
    const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });
    if (error)
        throw error;
    return data as Template[];
}
export async function createWebhook(webhook: Omit<Webhook, 'id' | 'created_at'>) {
    const { data, error } = await supabase
        .from('webhooks')
        .insert({
        ...webhook,
        created_at: new Date().toISOString(),
    })
        .select()
        .single();
    if (error)
        throw error;
    return data as Webhook;
}
export async function getWebhooksByArtist(artist_id: string) {
    const { data, error } = await supabase
        .from('webhooks')
        .select('*')
        .eq('artist_id', artist_id)
        .order('created_at', { ascending: false });
    if (error)
        throw error;
    return data as Webhook[];
}
export async function inviteTeamMember(member: Omit<TeamMember, 'id' | 'invited_at'>) {
    const { data, error } = await supabase
        .from('team_members')
        .insert({
        ...member,
        invited_at: new Date().toISOString(),
    })
        .select()
        .single();
    if (error)
        throw error;
    return data as TeamMember;
}
export async function getTeamMembersByArtist(artist_id: string) {
    const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('artist_id', artist_id)
        .order('invited_at', { ascending: false });
    if (error)
        throw error;
    return data as TeamMember[];
}
export async function getTeamMemberByClerkId(_clerk_id: string, _artist_id: string) {
    return null;
}
export async function createIntegration(integration: Omit<Integration, 'id' | 'created_at'>) {
    const { data, error } = await supabase
        .from('integrations')
        .insert({
        ...integration,
        created_at: new Date().toISOString(),
    })
        .select()
        .single();
    if (error)
        throw error;
    return data as Integration;
}
export async function getIntegrationsByArtist(artist_id: string) {
    const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('artist_id', artist_id)
        .order('created_at', { ascending: false });
    if (error)
        throw error;
    return data as Integration[];
}
export async function getCampaignAnalytics(campaign_id: string) {
    const { data: emails, error } = await supabase
        .from('emails_sent')
        .select('*')
        .eq('campaign_id', campaign_id);
    if (error)
        throw error;
    const stats = {
        total_sent: emails.length,
        delivered: emails.filter((e: any) => e.status === 'delivered').length,
        opens: emails.filter((e: any) => e.opened_at).length,
        unique_opens: emails.filter((e: any) => e.opened_at).length,
        clicks: emails.filter((e: any) => e.clicked_at).length,
        unique_clicks: emails.filter((e: any) => e.clicked_at).length,
        bounces: emails.filter((e: any) => e.status === 'bounced').length,
        complaints: emails.filter((e: any) => e.status === 'complained').length,
        unsubscribes: 0,
        open_rate: 0,
        click_rate: 0,
        bounce_rate: 0,
        unsubscribe_rate: 0,
    };
    if (stats.delivered > 0) {
        stats.open_rate = (stats.opens / stats.delivered) * 100;
        stats.click_rate = (stats.clicks / stats.delivered) * 100;
        stats.bounce_rate = (stats.bounces / stats.total_sent) * 100;
    }
    return stats;
}
export async function getArtistAnalytics(artist_id: string, period: 'day' | 'week' | 'month' | 'year' = 'month') {
    const now = new Date();
    const daysBack = period === 'day' ? 1 : period === 'week' ? 7 : period === 'month' ? 30 : 365;
    const periodStart = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    const { data: campaigns } = await supabase
        .from('campaigns')
        .select('id, status, created_at, stats')
        .eq('artist_id', artist_id)
        .gte('created_at', periodStart.toISOString());
    const { data: allFans } = await supabase
        .from('fans')
        .select('id, status, created_at, unsubscribed_at')
        .eq('artist_id', artist_id);
    const campaignIds = campaigns?.map(c => c.id) || [];
    let emailsData: any[] = [];
    if (campaignIds.length > 0) {
        const { data: emails } = await supabase
            .from('emails_sent')
            .select('id, status, opened_at, clicked_at, sent_at, campaign_id')
            .in('campaign_id', campaignIds);
        emailsData = emails || [];
    }
    const sentCampaigns = campaigns?.filter(c => c.status === 'sent') || [];
    const delivered = emailsData.filter(e => e.status === 'delivered' || e.status === 'sent').length;
    const totalOpens = emailsData.filter(e => e.opened_at).length;
    const totalClicks = emailsData.filter(e => e.clicked_at).length;
    const newSubscribers = allFans?.filter(f => {
        const createdDate = new Date(f.created_at);
        return createdDate >= periodStart && f.status === 'subscribed';
    }).length || 0;
    const unsubscribes = allFans?.filter(f => {
        if (!f.unsubscribed_at)
            return false;
        const unsubDate = new Date(f.unsubscribed_at);
        return unsubDate >= periodStart;
    }).length || 0;
    const trends = [];
    for (let i = daysBack - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const dayOpens = emailsData.filter(e => {
            if (!e.opened_at)
                return false;
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
export async function addFanWithValidation(fanData: FanFormData, artist_id: string) {
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
    if (error)
        throw error;
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
    if (error)
        throw error;
    return data as Fan;
}
export async function deleteFan(fan_id: string) {
    const { data, error } = await supabase
        .from('fans')
        .delete()
        .eq('id', fan_id)
        .select()
        .single();
    if (error)
        throw error;
    return data as Fan;
}
export async function getFanById(id: string) {
    const { data, error } = await supabase
        .from('fans')
        .select('*')
        .eq('id', id)
        .maybeSingle();
    if (error && error.code !== 'PGRST116')
        throw error;
    return data as Fan | null;
}
export async function getTemplateById(id: string) {
    const { data, error } = await supabase.from('templates').select('*').eq('id', id).single();
    if (error)
        throw error;
    return data as Template;
}
export async function updateTemplate(id: string, updates: Partial<Template>) {
    const { data, error } = await supabase
        .from('templates')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
    if (error)
        throw error;
    return data as Template;
}
export async function deleteTemplate(id: string) {
    const { error } = await supabase.from('templates').delete().eq('id', id);
    if (error)
        throw error;
}
export async function updateTeamMember(id: string, updates: Partial<TeamMember>) {
    const { data, error } = await supabase
        .from('team_members')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error)
        throw error;
    return data as TeamMember;
}
export async function deleteTeamMember(id: string) {
    const { error } = await supabase.from('team_members').delete().eq('id', id);
    if (error)
        throw error;
}
export async function updateIntegration(id: string, updates: Partial<Integration>) {
    const { data, error } = await supabase
        .from('integrations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error)
        throw error;
    return data as Integration;
}
export async function deleteIntegration(id: string) {
    const { error } = await supabase.from('integrations').delete().eq('id', id);
    if (error)
        throw error;
}
export async function updateWebhook(id: string, updates: Partial<Webhook>) {
    const { data, error } = await supabase
        .from('webhooks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error)
        throw error;
    return data as Webhook;
}
export async function deleteWebhook(id: string) {
    const { error } = await supabase.from('webhooks').delete().eq('id', id);
    if (error)
        throw error;
}
export async function createCampaignWithDefaults(campaignData: CampaignFormData, artist_id: string) {
    const now = new Date().toISOString();
    const campaign: Omit<Campaign, 'id'> = {
        title: campaignData.title,
        subject: campaignData.subject,
        message: campaignData.message,
        from_name: campaignData.from_name || null,
        from_email: campaignData.from_email || null,
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
