import { NextRequest, NextResponse } from 'next/server';
import { SESClient, VerifyDomainIdentityCommand, GetIdentityDkimAttributesCommand } from '@aws-sdk/client-ses';
const AWS_REGION = process.env.AWS_REGION!;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID!;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY!;
const ses = new SESClient({
    region: AWS_REGION,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
});
export async function POST(req: NextRequest) {
    const { domain } = await req.json();
    if (!domain) {
        return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }
    try {
        const command = new VerifyDomainIdentityCommand({ Domain: domain });
        const result = await ses.send(command);
        const records = [];
        records.push({
            type: 'TXT',
            name: `_amazonses.${domain}`,
            value: result.VerificationToken,
            priority: null,
            ttl: 3600,
            status: 'pending',
        });
        try {
            const dkimCommand = new GetIdentityDkimAttributesCommand({ Identities: [domain] });
            const dkimResult = await ses.send(dkimCommand);
            const dkimAttrs = dkimResult.DkimAttributes?.[domain];
            if (dkimAttrs && dkimAttrs.DkimTokens) {
                for (const token of dkimAttrs.DkimTokens) {
                    records.push({
                        type: 'CNAME',
                        name: `${token}._domainkey.${domain}`,
                        value: `${token}.dkim.amazonses.com`,
                        priority: null,
                        ttl: 3600,
                        status: 'pending',
                    });
                }
            }
        }
        catch { }
        records.push({
            type: 'TXT',
            name: domain,
            value: 'v=spf1 include:amazonses.com ~all',
            priority: null,
            ttl: 3600,
            status: 'pending',
        });
        records.push({
            type: 'TXT',
            name: `_dmarc.${domain}`,
            value: 'v=DMARC1; p=none; rua=mailto:postmaster@' + domain,
            priority: null,
            ttl: 3600,
            status: 'pending',
        });
        return NextResponse.json({ dns: records });
    }
    catch (e: unknown) {
        let message = 'SES error';
        if (e && typeof e === 'object' && 'message' in e && typeof (e as {
            message?: string;
        }).message === 'string') {
            message = (e as {
                message: string;
            }).message;
        }
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
