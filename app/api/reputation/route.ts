import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getOrCreateArtistByClerkId } from '@/lib/db';
import { checkSendingReputation } from '@/lib/spam-prevention';
import { supabase } from '@/lib/supabase';
export async function GET() {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const artist = await getOrCreateArtistByClerkId(user.id, user.primaryEmailAddress?.emailAddress || '', user.fullName || 'Artist');
        const reputationCheck = await checkSendingReputation(artist.id);
        const { data: historicalData, error } = await supabase
            .from('email_reputation')
            .select('*')
            .eq('artist_id', artist.id)
            .order('period_start', { ascending: false })
            .limit(30);
        if (error) {
            console.error('Error fetching historical reputation data:', error);
        }
        const { data: suppressionData, error: suppressionError } = await supabase
            .from('suppression_list')
            .select('reason, suppression_type')
            .eq('artist_id', artist.id);
        if (suppressionError) {
            console.error('Error fetching suppression data:', suppressionError);
        }
        const { data: auditLogs, error: auditError } = await supabase
            .from('compliance_audit_logs')
            .select('action, timestamp, details')
            .eq('artist_id', artist.id)
            .order('timestamp', { ascending: false })
            .limit(50);
        if (auditError) {
            console.error('Error fetching audit logs:', auditError);
        }
        const trends = historicalData?.map(record => ({
            date: new Date(record.period_start).toLocaleDateString(),
            bounce_rate: parseFloat(record.bounce_rate) * 100,
            complaint_rate: parseFloat(record.complaint_rate) * 100,
            engagement_rate: parseFloat(record.engagement_rate) * 100,
            reputation_score: record.reputation_score
        })) || [];
        const recommendations = [];
        if (reputationCheck.metrics.bounceRate > 0.05) {
            recommendations.push({
                type: 'warning',
                title: 'High Bounce Rate',
                message: 'Your bounce rate is above 5%. Clean your email list by removing invalid addresses.',
                action: 'Review and clean your subscriber list'
            });
        }
        if (reputationCheck.metrics.complaintRate > 0.001) {
            recommendations.push({
                type: 'critical',
                title: 'High Complaint Rate',
                message: 'Your complaint rate is above 0.1%. This can severely impact deliverability.',
                action: 'Review your content and ensure all subscribers opted in'
            });
        }
        if (reputationCheck.metrics.engagementRate < 0.1) {
            recommendations.push({
                type: 'info',
                title: 'Low Engagement',
                message: 'Your engagement rate is below 10%. Consider improving your content or list quality.',
                action: 'Send more targeted, relevant content to your audience'
            });
        }
        const awsGuidance = {
            bounce_rate_limit: '5% (AWS may suspend sending if exceeded)',
            complaint_rate_limit: '0.1% (AWS may suspend sending if exceeded)',
            current_status: artist.sending_suspended ? 'SUSPENDED' : 'ACTIVE',
            next_steps: artist.sending_suspended ? [
                'Contact AWS Support to understand the suspension reason',
                'Clean your email list thoroughly',
                'Implement double opt-in for new subscribers',
                'Review and improve your email content',
                'Submit a sending review request to AWS'
            ] : [
                'Continue monitoring your metrics closely',
                'Maintain good list hygiene practices',
                'Focus on engagement and relevant content',
                'Respond quickly to bounces and complaints'
            ]
        };
        return NextResponse.json({
            success: true,
            current_reputation: {
                reputation: reputationCheck.reputation,
                can_send: reputationCheck.canSend,
                metrics: {
                    bounce_rate: Math.round(reputationCheck.metrics.bounceRate * 10000) / 100,
                    complaint_rate: Math.round(reputationCheck.metrics.complaintRate * 100000) / 1000,
                    engagement_rate: Math.round(reputationCheck.metrics.engagementRate * 10000) / 100
                },
                warnings: reputationCheck.warnings
            },
            trends,
            suppression_summary: suppressionData?.reduce((acc, item) => {
                const key = `${item.reason}_${item.suppression_type}`;
                acc[key] = (acc[key] || 0) + 1;
                return acc;
            }, {} as Record<string, number>) || {},
            recent_activity: auditLogs?.slice(0, 10) || [],
            recommendations,
            aws_guidance: awsGuidance,
            compliance_status: {
                sending_suspended: artist.sending_suspended,
                suspension_reason: artist.suspension_reason,
                compliance_flags: artist.compliance_flags || [],
                last_reputation_check: artist.last_reputation_check
            }
        });
    }
    catch (error) {
        console.error('Error fetching reputation data:', error);
        return NextResponse.json({ error: 'Failed to fetch reputation data' }, { status: 500 });
    }
}
