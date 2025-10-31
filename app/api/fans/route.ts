import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getOrCreateArtistByClerkId, addFanWithValidation, getFansByArtist } from '@/lib/db';
import { validateEmailForSpam, checkRateLimits, validateBulkImport, recordConsentVerification, createComplianceAuditLog, type ConsentVerification } from '@/lib/spam-prevention';
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
        const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';
        const fansData = body.fans || [body];
        const source = body.source || 'manual';
        const consentVerification = body.consent_verification as ConsentVerification | undefined;
        if (!Array.isArray(fansData) || fansData.length === 0) {
            return NextResponse.json({ error: 'Fan data is required' }, { status: 400 });
        }
        const rateLimitCheck = await checkRateLimits(artist.id);
        if (!rateLimitCheck.allowed) {
            return NextResponse.json({
                error: rateLimitCheck.message,
                code: 'RATE_LIMIT_EXCEEDED'
            }, { status: 429 });
        }
        if (fansData.length > 10 || source === 'import') {
            const emails = fansData.map(f => f.email).filter(Boolean);
            const bulkValidation = await validateBulkImport(emails, source, artist.id);
            if (bulkValidation.invalid.length > 0) {
                await createComplianceAuditLog(artist.id, 'bulk_import_rejected', {
                    total_emails: emails.length,
                    invalid_count: bulkValidation.invalid.length,
                    invalid_emails: bulkValidation.invalid,
                    source,
                    ip_address: clientIP,
                    user_agent: userAgent
                });
            }
            return NextResponse.json({
                success: false,
                validation_results: bulkValidation,
                message: 'Bulk import validation completed. Review results before proceeding.'
            });
        }
        const addedFans = [];
        const errors = [];
        const warnings = [];
        for (const fanData of fansData) {
            if (!fanData.email || typeof fanData.email !== 'string' || !fanData.email.includes('@')) {
                errors.push(`Invalid email: ${fanData.email}`);
                continue;
            }
            const spamCheck = await validateEmailForSpam(fanData.email, source);
            if (spamCheck.action === 'reject') {
                errors.push(`${fanData.email}: ${spamCheck.flags.join(', ')} (Auto-rejected)`);
                await createComplianceAuditLog(artist.id, 'fan_rejected_spam', {
                    email: fanData.email,
                    risk_score: spamCheck.riskScore,
                    flags: spamCheck.flags,
                    source,
                    ip_address: clientIP,
                    user_agent: userAgent
                });
                continue;
            }
            if (spamCheck.action === 'quarantine') {
                try {
                    const { quarantineFan } = await import('@/lib/spam-prevention');
                    const reviewId = await quarantineFan({
                        email: fanData.email.trim(),
                        name: fanData.name?.trim() || null,
                        tags: fanData.tags || null,
                        source: source,
                        custom_fields: fanData.custom_fields || {}
                    }, artist.id, spamCheck, source === 'import' ? 'bulk_import' : 'spam_detection');
                    warnings.push(`${fanData.email}: Quarantined for manual review (Risk: ${spamCheck.riskScore})`);
                    await createComplianceAuditLog(artist.id, 'fan_quarantined', {
                        email: fanData.email,
                        risk_score: spamCheck.riskScore,
                        flags: spamCheck.flags,
                        review_id: reviewId,
                        source,
                        ip_address: clientIP,
                        user_agent: userAgent
                    });
                    continue;
                }
                catch (error) {
                    errors.push(`Failed to quarantine ${fanData.email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    continue;
                }
            }
            if (spamCheck.riskScore > 30) {
                warnings.push(`${fanData.email}: Moderate risk score (${spamCheck.riskScore}). ${spamCheck.recommendations.join(', ')}`);
            }
            try {
                const fan = await addFanWithValidation({
                    email: fanData.email.trim(),
                    name: fanData.name?.trim() || null,
                    tags: fanData.tags || null,
                    source: source,
                    custom_fields: {
                        ...fanData.custom_fields,
                        risk_score: spamCheck.riskScore,
                        spam_flags: spamCheck.flags
                    }
                }, artist.id);
                if (consentVerification) {
                    await recordConsentVerification(fan.id, {
                        ...consentVerification,
                        timestamp: new Date().toISOString()
                    });
                }
                await createComplianceAuditLog(artist.id, 'fan_added', {
                    fan_id: fan.id,
                    email: fan.email,
                    source,
                    risk_score: spamCheck.riskScore,
                    consent_verified: !!consentVerification,
                    ip_address: clientIP,
                    user_agent: userAgent
                }, fan.id);
                addedFans.push(fan);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                errors.push(`Failed to add ${fanData.email}: ${errorMessage}`);
                await createComplianceAuditLog(artist.id, 'fan_add_failed', {
                    email: fanData.email,
                    error: errorMessage,
                    source,
                    ip_address: clientIP,
                    user_agent: userAgent
                });
            }
        }
        return NextResponse.json({
            success: true,
            added: addedFans.length,
            fans: addedFans,
            errors: errors.length > 0 ? errors : undefined,
            warnings: warnings.length > 0 ? warnings : undefined,
            message: `Successfully added ${addedFans.length} fan${addedFans.length !== 1 ? 's' : ''}`,
            compliance_note: source === 'import' ? 'Imported emails must have verifiable consent. Consider sending confirmation emails.' : undefined
        });
    }
    catch (error) {
        console.error('Error adding fans:', error);
        return NextResponse.json({ error: 'Failed to add fans' }, { status: 500 });
    }
}
export async function GET() {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const artist = await getOrCreateArtistByClerkId(user.id, user.primaryEmailAddress?.emailAddress || '', user.fullName || 'Artist');
        const fans = await getFansByArtist(artist.id);
        return NextResponse.json({
            success: true,
            fans,
            total: fans.length
        });
    }
    catch (error) {
        console.error('Error fetching fans:', error);
        return NextResponse.json({ error: 'Failed to fetch fans' }, { status: 500 });
    }
}
