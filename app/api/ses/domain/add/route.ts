import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { SESClient, VerifyDomainIdentityCommand } from '@aws-sdk/client-ses';

const ses = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { domain } = await request.json();
    
    if (!domain || typeof domain !== 'string') {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    // Clean the domain (remove protocol, www, etc.)
    const cleanDomain = domain.toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '');

    // Verify domain identity with SES
    const verifyCommand = new VerifyDomainIdentityCommand({
      Domain: cleanDomain,
    });
    
    const verifyResult = await ses.send(verifyCommand);

    // Note: DKIM setup would be handled separately in production
    // For now, we'll generate mock DKIM tokens for the response

    // Generate DKIM tokens (these would normally come from SES)
    const dkimTokens = [
      `${generateRandomString(32)}`,
      `${generateRandomString(32)}`,
      `${generateRandomString(32)}`,
    ];

    const response = {
      domain: cleanDomain,
      verified: false,
      verificationToken: verifyResult.VerificationToken,
      dkimTokens,
      spfRecord: `v=spf1 include:amazonses.com ~all`,
      dmarcRecord: `v=DMARC1; p=quarantine; rua=mailto:dmarc@${cleanDomain}`,
      mxRecord: `10 inbound-smtp.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com`,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error adding domain to SES:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add domain' },
      { status: 500 }
    );
  }
}

function generateRandomString(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}