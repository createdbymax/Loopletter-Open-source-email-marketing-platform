import { NextRequest, NextResponse } from 'next/server';
import { requireReviewAccess, REVIEW_PERMISSIONS } from '@/lib/rbac-reviews';
import { supabase } from '@/lib/supabase';
export async function GET(request: NextRequest) {
    try {
        await requireReviewAccess();
        const { searchParams } = new URL(request.url);
        const range = searchParams.get('range') || '30d';
        const now = new Date();
        const daysBack = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
        const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
        const [artistsData, fansData, campaignsData, emailsData, reviewsData, reputationData] = await Promise.all([
            supabase
                .from('artists')
                .select('id, created_at, reputation_score, sending_suspended')
                .gte('created_at', startDate.toISOString()),
            supabase
                .from('fans')
                .select('id, created_at, status')
                .gte('created_at', startDate.toISOString()),
            supabase
                .from('campaigns')
                .select('id, created_at, status, stats')
                .gte('created_at', startDate.toISOString()),
            supabase
                .from('emails_sent')
                .select('id, sent_at, status, opened_at, clicked_at, bounced_at')
                .gte('sent_at', startDate.toISOString()),
            supabase
                .from('fan_reviews')
                .select('id, status, flags, created_at'),
            supabase
                .from('artists')
                .select('id, reputation_score, sending_suspended')
        ]);
        const totalArtists = (await supabase.from('artists').select('id', { count: 'exact' })).count || 0;
        const totalFans = (await supabase.from('fans').select('id', { count: 'exact' }).eq('status', 'subscribed')).count || 0;
        const totalCampaigns = (await supabase.from('campaigns').select('id', { count: 'exact' })).count || 0;
        const totalEmails = (await supabase.from('emails_sent').select('id', { count: 'exact' })).count || 0;
        const emails = emailsData.data || [];
        const totalSent = emails.length;
        const totalOpened = emails.filter(e => e.opened_at).length;
        const totalClicked = emails.filter(e => e.clicked_at).length;
        const totalBounced = emails.filter(e => e.status === 'bounced').length;
        const avgOpenRate = totalSent > 0 ? totalOpened / totalSent : 0;
        const avgClickRate = totalSent > 0 ? totalClicked / totalSent : 0;
        const avgBounceRate = totalSent > 0 ? totalBounced / totalSent : 0;
        const growthTrends = generateGrowthTrends(artistsData.data || [], fansData.data || [], campaignsData.data || [], daysBack);
        const allArtists = reputationData.data || [];
        const reputationDistribution = [
            {
                category: 'Excellent',
                count: allArtists.filter(a => (a.reputation_score || 100) >= 90 && !a.sending_suspended).length,
                percentage: 0
            },
            {
                category: 'Good',
                count: allArtists.filter(a => (a.reputation_score || 100) >= 70 && (a.reputation_score || 100) < 90 && !a.sending_suspended).length,
                percentage: 0
            },
            {
                category: 'Fair',
                count: allArtists.filter(a => (a.reputation_score || 100) >= 50 && (a.reputation_score || 100) < 70 && !a.sending_suspended).length,
                percentage: 0
            },
            {
                category: 'Poor',
                count: allArtists.filter(a => (a.reputation_score || 100) < 50 && !a.sending_suspended).length,
                percentage: 0
            },
            {
                category: 'Suspended',
                count: allArtists.filter(a => a.sending_suspended).length,
                percentage: 0
            }
        ];
        const totalForReputation = reputationDistribution.reduce((sum, item) => sum + item.count, 0);
        reputationDistribution.forEach(item => {
            item.percentage = totalForReputation > 0 ? Math.round((item.count / totalForReputation) * 100) : 0;
        });
        const reviews = reviewsData.data || [];
        const spamPrevention = {
            total_quarantined: reviews.filter(r => r.status === 'pending').length,
            total_approved: reviews.filter(r => r.status === 'approved').length,
            total_rejected: reviews.filter(r => r.status === 'rejected').length,
            top_risk_factors: getTopRiskFactors(reviews)
        };
        const engagementMetrics = generateEngagementTrends(emails, daysBack);
        const analytics = {
            overview: {
                total_artists: totalArtists,
                total_fans: totalFans,
                total_campaigns: totalCampaigns,
                total_emails_sent: totalEmails,
                avg_open_rate: avgOpenRate,
                avg_click_rate: avgClickRate,
                avg_bounce_rate: avgBounceRate
            },
            growth_trends: growthTrends,
            reputation_distribution: reputationDistribution,
            spam_prevention: spamPrevention,
            engagement_metrics: engagementMetrics
        };
        return NextResponse.json(analytics);
    }
    catch (error) {
        console.error('Error fetching admin analytics:', error);
        if (error instanceof Error && error.message.includes('Forbidden')) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}
function generateGrowthTrends(artists: any[], fans: any[], campaigns: any[], daysBack: number) {
    const trends = [];
    const now = new Date();
    for (let i = daysBack - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const artistsOnDate = artists.filter(a => new Date(a.created_at).toISOString().split('T')[0] <= dateStr).length;
        const fansOnDate = fans.filter(f => new Date(f.created_at).toISOString().split('T')[0] <= dateStr).length;
        const campaignsOnDate = campaigns.filter(c => new Date(c.created_at).toISOString().split('T')[0] <= dateStr).length;
        trends.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            artists: artistsOnDate,
            fans: fansOnDate,
            campaigns: campaignsOnDate
        });
    }
    return trends;
}
function getTopRiskFactors(reviews: any[]) {
    const factorCounts: Record<string, number> = {};
    reviews.forEach(review => {
        if (review.flags && Array.isArray(review.flags)) {
            review.flags.forEach((flag: string) => {
                factorCounts[flag] = (factorCounts[flag] || 0) + 1;
            });
        }
    });
    return Object.entries(factorCounts)
        .map(([factor, count]) => ({ factor, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
}
function generateEngagementTrends(emails: any[], daysBack: number) {
    const trends = [];
    const now = new Date();
    for (let i = daysBack - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const dayEmails = emails.filter(e => new Date(e.sent_at).toISOString().split('T')[0] === dateStr);
        const sent = dayEmails.length;
        const opened = dayEmails.filter(e => e.opened_at).length;
        const clicked = dayEmails.filter(e => e.clicked_at).length;
        const bounced = dayEmails.filter(e => e.status === 'bounced').length;
        trends.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            open_rate: sent > 0 ? opened / sent : 0,
            click_rate: sent > 0 ? clicked / sent : 0,
            bounce_rate: sent > 0 ? bounced / sent : 0
        });
    }
    return trends;
}
