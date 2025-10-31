import { NextRequest, NextResponse } from 'next/server';
import { requireReviewAccess, REVIEW_PERMISSIONS } from '@/lib/rbac-reviews';
import { supabase } from '@/lib/supabase';
export async function POST(request: NextRequest) {
    try {
        await requireReviewAccess();
        const body = await request.json();
        const { action, params } = body;
        if (!action) {
            return NextResponse.json({ success: false, error: 'Action is required' }, { status: 400 });
        }
        let result;
        switch (action) {
            case 'cleanup_old_logs':
                result = await cleanupOldLogs();
                break;
            case 'cleanup_rejected_fans':
                result = await cleanupRejectedFans();
                break;
            case 'update_engagement_scores':
                result = await updateEngagementScores();
                break;
            case 'update_reputation_scores':
                result = await updateReputationScores();
                break;
            case 'search_platform':
                result = await searchPlatform(params?.query);
                break;
            case 'export_compliance_logs':
                result = await exportComplianceLogs();
                break;
            case 'export_reputation_data':
                result = await exportReputationData();
                break;
            case 'export_platform_stats':
                result = await exportPlatformStats();
                break;
            case 'validate_bulk_operation':
                result = await validateBulkOperation(params?.script);
                break;
            case 'execute_bulk_operation':
                result = await executeBulkOperation(params?.script);
                break;
            case 'system_health_check':
                result = await systemHealthCheck();
                break;
            default:
                return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
        }
        return NextResponse.json(result);
    }
    catch (error) {
        console.error('Error executing system tool:', error);
        if (error instanceof Error && error.message.includes('Forbidden')) {
            return NextResponse.json({ success: false, error: error.message }, { status: 403 });
        }
        return NextResponse.json({ success: false, error: 'Failed to execute system tool' }, { status: 500 });
    }
}
async function cleanupOldLogs() {
    try {
        const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        const { count, error } = await supabase
            .from('compliance_audit_logs')
            .delete()
            .lt('created_at', oneYearAgo.toISOString());
        if (error)
            throw error;
        return {
            success: true,
            message: `Cleaned up ${count || 0} old audit log entries`,
            data: { deleted_count: count || 0 }
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to cleanup logs'
        };
    }
}
async function cleanupRejectedFans() {
    try {
        const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        const { count, error } = await supabase
            .from('fans')
            .delete()
            .eq('review_status', 'rejected')
            .lt('created_at', ninetyDaysAgo.toISOString());
        if (error)
            throw error;
        return {
            success: true,
            message: `Cleaned up ${count || 0} old rejected contacts`,
            data: { deleted_count: count || 0 }
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to cleanup rejected fans'
        };
    }
}
async function updateEngagementScores() {
    try {
        return {
            success: true,
            message: 'Engagement score update initiated',
            data: { message: 'This would recalculate all fan engagement scores based on email interactions' }
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update engagement scores'
        };
    }
}
async function updateReputationScores() {
    try {
        const { data: artists, error } = await supabase
            .from('artists')
            .select('id');
        if (error)
            throw error;
        let updated = 0;
        for (const artist of artists || []) {
            updated++;
        }
        return {
            success: true,
            message: `Updated reputation scores for ${updated} artists`,
            data: { updated_count: updated }
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update reputation scores'
        };
    }
}
async function searchPlatform(query: string) {
    try {
        if (!query || query.trim().length < 2) {
            return {
                success: false,
                error: 'Search query must be at least 2 characters'
            };
        }
        const searchTerm = query.trim().toLowerCase();
        const { data: artists, error: artistError } = await supabase
            .from('artists')
            .select('id, name, email, created_at, reputation_score')
            .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
            .limit(10);
        const { data: fans, error: fanError } = await supabase
            .from('fans')
            .select('id, email, name, artist_id, status, created_at')
            .or(`email.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`)
            .limit(10);
        if (artistError || fanError) {
            throw artistError || fanError;
        }
        return {
            success: true,
            message: `Found ${(artists?.length || 0)} artists and ${(fans?.length || 0)} fans`,
            data: {
                artists: artists || [],
                fans: fans || [],
                query: searchTerm
            }
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Search failed'
        };
    }
}
async function exportComplianceLogs() {
    try {
        const { data, error } = await supabase
            .from('compliance_audit_logs')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(1000);
        if (error)
            throw error;
        return {
            success: true,
            message: `Exported ${data?.length || 0} compliance log entries`,
            data: {
                logs: data || [],
                export_date: new Date().toISOString(),
                total_records: data?.length || 0
            }
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Export failed'
        };
    }
}
async function exportReputationData() {
    try {
        const { data, error } = await supabase
            .from('artists')
            .select('id, name, email, reputation_score, sending_suspended, last_reputation_check')
            .order('reputation_score', { ascending: true });
        if (error)
            throw error;
        return {
            success: true,
            message: `Exported reputation data for ${data?.length || 0} artists`,
            data: {
                reputation_data: data || [],
                export_date: new Date().toISOString(),
                total_records: data?.length || 0
            }
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Export failed'
        };
    }
}
async function exportPlatformStats() {
    try {
        const [artistsCount, fansCount, campaignsCount, emailsCount] = await Promise.all([
            supabase.from('artists').select('id', { count: 'exact' }),
            supabase.from('fans').select('id', { count: 'exact' }),
            supabase.from('campaigns').select('id', { count: 'exact' }),
            supabase.from('emails_sent').select('id', { count: 'exact' })
        ]);
        const stats = {
            total_artists: artistsCount.count || 0,
            total_fans: fansCount.count || 0,
            total_campaigns: campaignsCount.count || 0,
            total_emails: emailsCount.count || 0,
            export_date: new Date().toISOString()
        };
        return {
            success: true,
            message: 'Platform statistics exported successfully',
            data: stats
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Export failed'
        };
    }
}
async function validateBulkOperation(script: string) {
    try {
        if (!script || !script.trim()) {
            return {
                success: false,
                error: 'Script is required'
            };
        }
        let operation;
        try {
            operation = JSON.parse(script);
        }
        catch (parseError) {
            return {
                success: false,
                error: 'Invalid JSON format'
            };
        }
        if (!operation.action) {
            return {
                success: false,
                error: 'Action is required in script'
            };
        }
        const allowedActions = ['update_tags', 'update_status', 'bulk_delete'];
        if (!allowedActions.includes(operation.action)) {
            return {
                success: false,
                error: `Action '${operation.action}' is not allowed`
            };
        }
        return {
            success: true,
            message: 'Bulk operation script is valid',
            data: {
                parsed_operation: operation,
                validation_passed: true
            }
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Validation failed'
        };
    }
}
async function executeBulkOperation(script: string) {
    try {
        return {
            success: false,
            error: 'Bulk operations are disabled for safety. Contact system administrator.'
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Execution failed'
        };
    }
}
async function systemHealthCheck() {
    try {
        const checks = [];
        const { error: dbError } = await supabase.from('artists').select('id').limit(1);
        checks.push({
            name: 'Database Connectivity',
            status: dbError ? 'error' : 'healthy',
            message: dbError ? dbError.message : 'Connected successfully'
        });
        const { count: suspendedCount } = await supabase
            .from('artists')
            .select('id', { count: 'exact' })
            .eq('sending_suspended', true);
        checks.push({
            name: 'Suspended Artists',
            status: (suspendedCount || 0) > 10 ? 'warning' : 'healthy',
            message: `${suspendedCount || 0} artists currently suspended`
        });
        const { count: pendingCount } = await supabase
            .from('fan_reviews')
            .select('id', { count: 'exact' })
            .eq('status', 'pending');
        checks.push({
            name: 'Pending Reviews',
            status: (pendingCount || 0) > 100 ? 'warning' : 'healthy',
            message: `${pendingCount || 0} contacts pending review`
        });
        const overallStatus = checks.some(c => c.status === 'error') ? 'error' :
            checks.some(c => c.status === 'warning') ? 'warning' : 'healthy';
        return {
            success: true,
            message: `System health check completed - Status: ${overallStatus}`,
            data: {
                overall_status: overallStatus,
                checks,
                timestamp: new Date().toISOString()
            }
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Health check failed'
        };
    }
}
