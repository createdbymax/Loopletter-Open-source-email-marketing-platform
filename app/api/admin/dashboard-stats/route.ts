import { NextResponse } from 'next/server';
import { requireReviewAccess, REVIEW_PERMISSIONS } from '@/lib/rbac-reviews';
import { supabase } from '@/lib/supabase';
export async function GET() {
    try {
        await requireReviewAccess();
        const [artistsResult, fansResult, campaignsResult, reviewsResult, reputationResult, activityResult] = await Promise.all([
            supabase
                .from('artists')
                .select('id, created_at, updated_at')
                .order('created_at', { ascending: false }),
            supabase
                .from('fans')
                .select('id, status')
                .eq('status', 'subscribed'),
            supabase
                .from('campaigns')
                .select('id, status'),
            supabase
                .from('fan_reviews')
                .select('status'),
            supabase
                .from('artists')
                .select('id, reputation_score, sending_suspended'),
            supabase
                .from('compliance_audit_logs')
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(20)
        ]);
        const artists = artistsResult.data || [];
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const activeArtists = artists.filter(artist => new Date(artist.updated_at) > thirtyDaysAgo);
        const fans = fansResult.data || [];
        const campaigns = campaignsResult.data || [];
        const reviews = reviewsResult.data || [];
        const reviewStats = {
            pending: reviews.filter(r => r.status === 'pending').length,
            approved: reviews.filter(r => r.status === 'approved').length,
            rejected: reviews.filter(r => r.status === 'rejected').length,
            total: reviews.length
        };
        const reputationData = reputationResult.data || [];
        const reputationStats = {
            artists_with_good_reputation: reputationData.filter(a => (a.reputation_score || 100) >= 80 && !a.sending_suspended).length,
            artists_with_warnings: reputationData.filter(a => (a.reputation_score || 100) >= 60 && (a.reputation_score || 100) < 80 && !a.sending_suspended).length,
            suspended_artists: reputationData.filter(a => a.sending_suspended).length
        };
        const activityData = activityResult.data || [];
        const recentActivity = activityData.map(log => ({
            id: log.id,
            action: formatActionName(log.action),
            details: formatActionDetails(log.action, log.details),
            timestamp: log.timestamp,
            severity: getActionSeverity(log.action)
        }));
        const stats = {
            platform: {
                total_artists: artists.length,
                active_artists: activeArtists.length,
                total_fans: fans.length,
                total_campaigns: campaigns.length
            },
            reviews: reviewStats,
            reputation: reputationStats,
            recent_activity: recentActivity
        };
        return NextResponse.json(stats);
    }
    catch (error) {
        console.error('Error fetching admin dashboard stats:', error);
        if (error instanceof Error && error.message.includes('Forbidden')) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }
        return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
    }
}
function formatActionName(action: string): string {
    const actionMap: Record<string, string> = {
        'fan_added': 'Contact Added',
        'fan_quarantined': 'Contact Quarantined',
        'fan_approved': 'Contact Approved',
        'fan_rejected': 'Contact Rejected',
        'campaign_validated': 'Campaign Validated',
        'bulk_import_rejected': 'Bulk Import Rejected',
        'review_viewed': 'Review Dashboard Accessed',
        'review_approved': 'Review Approved',
        'review_rejected': 'Review Rejected'
    };
    return actionMap[action] || action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}
function formatActionDetails(action: string, details: any): string {
    try {
        if (typeof details === 'string') {
            return details;
        }
        switch (action) {
            case 'fan_quarantined':
                return `Email: ${details.email || 'Unknown'} (Risk: ${details.risk_score || 'N/A'})`;
            case 'fan_approved':
            case 'fan_rejected':
                return `Review processed with notes: ${details.notes || 'No notes'}`;
            case 'bulk_import_rejected':
                return `${details.invalid_count || 0} of ${details.total_emails || 0} emails rejected`;
            case 'campaign_validated':
                return `Campaign validated (Score: ${details.compliance_score || 'N/A'})`;
            default:
                return details.email || details.message || 'System action performed';
        }
    }
    catch {
        return 'Action performed';
    }
}
function getActionSeverity(action: string): 'info' | 'warning' | 'critical' {
    const criticalActions = ['fan_rejected', 'bulk_import_rejected'];
    const warningActions = ['fan_quarantined', 'campaign_validated'];
    if (criticalActions.includes(action))
        return 'critical';
    if (warningActions.includes(action))
        return 'warning';
    return 'info';
}
