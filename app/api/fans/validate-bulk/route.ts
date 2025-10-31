import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getOrCreateArtistByClerkId } from '@/lib/db';
import { validateBulkImport, createComplianceAuditLog } from '@/lib/spam-prevention';
export async function POST(request: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const artist = await getOrCreateArtistByClerkId(user.id, user.primaryEmailAddress?.emailAddress || '', user.fullName || 'Artist');
        if (artist.sending_suspended) {
            return NextResponse.json({
                error: 'Account suspended from adding fans due to compliance issues',
                reason: artist.suspension_reason
            }, { status: 403 });
        }
        const body = await request.json();
        const { emails, source = 'import' } = body;
        const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';
        if (!Array.isArray(emails) || emails.length === 0) {
            return NextResponse.json({ error: 'Emails array is required' }, { status: 400 });
        }
        if (emails.length > 10000) {
            return NextResponse.json({
                error: 'Maximum 10,000 emails allowed per validation request'
            }, { status: 400 });
        }
        const validation = await validateBulkImport(emails, source, artist.id);
        await createComplianceAuditLog(artist.id, 'bulk_validation_requested', {
            total_emails: emails.length,
            valid_count: validation.valid.length,
            invalid_count: validation.invalid.length,
            requires_double_opt_in: validation.requiresDoubleOptIn.length,
            source,
            ip_address: clientIP,
            user_agent: userAgent
        });
        const complianceGuidance = [];
        if (validation.requiresDoubleOptIn.length > 0) {
            complianceGuidance.push(`${validation.requiresDoubleOptIn.length} emails require double opt-in confirmation to comply with anti-spam regulations.`);
        }
        if (source === 'import') {
            complianceGuidance.push('For imported email lists, you must have documented consent from each subscriber. ' +
                'This includes signup forms, purchase confirmations, or explicit opt-in requests.');
        }
        if (validation.invalid.length > validation.valid.length * 0.1) {
            complianceGuidance.push('High percentage of invalid emails detected. This may indicate a purchased or scraped list, ' +
                'which violates AWS SES Terms of Service and anti-spam regulations.');
        }
        return NextResponse.json({
            success: true,
            validation,
            compliance_guidance: complianceGuidance,
            recommendations: [
                'Only import emails from subscribers who explicitly opted in to receive your emails',
                'Keep records of how and when each email address was collected',
                'Consider sending a re-engagement campaign to imported lists',
                'Remove any email addresses that bounce or complain immediately',
                'Monitor your sending reputation closely after importing'
            ]
        });
    }
    catch (error) {
        console.error('Error validating bulk import:', error);
        return NextResponse.json({ error: 'Failed to validate bulk import' }, { status: 500 });
    }
}
