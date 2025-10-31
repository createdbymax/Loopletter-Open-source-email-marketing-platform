import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { getOrCreateArtistByClerkId, updateArtist } from '@/lib/db';
import { canAccessFeature } from '@/lib/subscription';
import { canClaimDomain, claimDomainWithVerification } from '@/lib/domain-ownership-verification';
export async function POST(request: NextRequest) {
    try {
        const { userId } = getAuth(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const artist = await getOrCreateArtistByClerkId(userId, '', '');
        if (!canAccessFeature(artist, 'customSignupDomain')) {
            return NextResponse.json({
                error: 'Feature not available',
                message: `This feature requires an upgrade to access.`,
                feature: 'customSignupDomain',
                upgradeUrl: `/dashboard/settings?tab=subscription&feature=customSignupDomain`,
            }, { status: 403 });
        }
        const { domain } = await request.json();
        if (!domain) {
            return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
        }
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
        if (!domainRegex.test(domain)) {
            return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 });
        }
        const claimCheck = await canClaimDomain(domain, artist.id);
        if (!claimCheck.canClaim) {
            return NextResponse.json({ error: claimCheck.reason || 'Domain cannot be claimed' }, { status: 409 });
        }
        const claimResult = await claimDomainWithVerification(artist.id, domain);
        if (!claimResult.success) {
            return NextResponse.json({ error: claimResult.error || 'Failed to claim domain' }, { status: 400 });
        }
        return NextResponse.json({
            success: true,
            message: 'Domain claimed successfully. Please add the DNS records to complete verification.',
            domain,
            status: 'pending_verification',
            verificationToken: claimResult.verificationToken,
        });
    }
    catch (error) {
        console.error('Error updating custom domain:', error);
        return NextResponse.json({ error: 'Failed to update custom domain' }, { status: 500 });
    }
}
