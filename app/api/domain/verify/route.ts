import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getOrCreateArtistByClerkId } from '@/lib/db';
import { canClaimDomain, claimDomainWithVerification } from '@/lib/domain-ownership-verification';
export async function POST(request: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const artist = await getOrCreateArtistByClerkId(user.id, user.primaryEmailAddress?.emailAddress || '', user.fullName || 'Artist');
        const body = await request.json();
        const { domain } = body;
        if (!domain || typeof domain !== 'string') {
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
            return NextResponse.json({ error: claimResult.error || 'Failed to initiate domain verification' }, { status: 400 });
        }
        const dnsRecords = [
            {
                type: 'TXT',
                name: `_amazonses.${domain}`,
                value: claimResult.verificationToken
            },
            {
                type: 'TXT',
                name: domain,
                value: 'v=spf1 include:amazonses.com ~all'
            }
        ];
        return NextResponse.json({
            success: true,
            domain,
            dnsRecords,
            verificationToken: claimResult.verificationToken,
            message: 'Domain claimed successfully. Add these DNS records to complete verification.'
        });
    }
    catch (error) {
        console.error('Error verifying domain:', error);
        return NextResponse.json({ error: 'Failed to verify domain' }, { status: 500 });
    }
}
