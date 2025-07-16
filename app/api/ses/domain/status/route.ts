import { NextRequest, NextResponse } from 'next/server';
import { SESClient, GetIdentityVerificationAttributesCommand, GetIdentityDkimAttributesCommand } from '@aws-sdk/client-ses';

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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get('domain');
  if (!domain) {
    return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
  }

  try {
    // SES TXT status
    const command = new GetIdentityVerificationAttributesCommand({ Identities: [domain] });
    const result = await ses.send(command);
    const attrs = result.VerificationAttributes?.[domain];
    const sesStatus = attrs?.VerificationStatus || 'NotStarted';
    const sesToken = attrs?.VerificationToken || null;
    const records = [];
    // SES TXT
    records.push({
      type: 'TXT',
      name: `_amazonses.${domain}`,
      value: sesToken,
      priority: null,
      ttl: 3600,
      status: sesStatus,
    });
    // DKIM CNAMEs (real, from SES)
    try {
      const dkimCommand = new GetIdentityDkimAttributesCommand({ Identities: [domain] });
      const dkimResult = await ses.send(dkimCommand);
      const dkimAttrs = dkimResult.DkimAttributes?.[domain];
      if (dkimAttrs && dkimAttrs.DkimTokens) {
        for (const token of dkimAttrs.DkimTokens) {
          // DKIM status: check if enabled and verified
          let dkimStatus = 'pending';
          if (dkimAttrs.DkimVerificationStatus === 'Success' && dkimAttrs.DkimEnabled) dkimStatus = 'verified';
          records.push({
            type: 'CNAME',
            name: `${token}._domainkey.${domain}`,
            value: `${token}.dkim.amazonses.com`,
            priority: null,
            ttl: 3600,
            status: dkimStatus,
          });
        }
      }
    } catch {}
    // SPF TXT (recommended)
    records.push({
      type: 'TXT',
      name: domain,
      value: 'v=spf1 include:amazonses.com ~all',
      priority: null,
      ttl: 3600,
      status: 'pending',
    });
    // DMARC TXT (optional, best practice)
    records.push({
      type: 'TXT',
      name: `_dmarc.${domain}`,
      value: 'v=DMARC1; p=none; rua=mailto:postmaster@' + domain,
      priority: null,
      ttl: 3600,
      status: 'pending',
    });
    // Mock config for click/open tracking and TLS
    const config = {
      clickTracking: true,
      openTracking: true,
      tlsMode: 'opportunistic', // or 'enforced'
    };
    return NextResponse.json({ records, config });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'SES error' }, { status: 500 });
  }
} 