import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { SESClient, GetIdentityVerificationAttributesCommand, GetIdentityDkimAttributesCommand } from '@aws-sdk/client-ses';

const ses = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    
    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    // Get verification status
    const verificationCommand = new GetIdentityVerificationAttributesCommand({
      Identities: [domain],
    });
    
    const verificationResult = await ses.send(verificationCommand);
    const verificationAttributes = verificationResult.VerificationAttributes?.[domain];

    // Get DKIM status
    const dkimCommand = new GetIdentityDkimAttributesCommand({
      Identities: [domain],
    });
    
    const dkimResult = await ses.send(dkimCommand);
    const dkimAttributes = dkimResult.DkimAttributes?.[domain];

    const response = {
      domain,
      verified: verificationAttributes?.VerificationStatus === 'Success',
      verificationToken: verificationAttributes?.VerificationToken || '',
      dkimEnabled: dkimAttributes?.DkimEnabled || false,
      dkimVerified: dkimAttributes?.DkimVerificationStatus === 'Success',
      dkimTokens: dkimAttributes?.DkimTokens || [],
      spfRecord: `v=spf1 include:amazonses.com ~all`,
      dmarcRecord: `v=DMARC1; p=quarantine; rua=mailto:dmarc@${domain}`,
      mxRecord: `10 inbound-smtp.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com`,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error checking domain status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check domain status' },
      { status: 500 }
    );
  }
}