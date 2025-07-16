import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { SESClient, GetIdentityVerificationAttributesCommand } from '@aws-sdk/client-ses';

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
    
    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    // Check verification status
    const command = new GetIdentityVerificationAttributesCommand({
      Identities: [domain],
    });
    
    const result = await ses.send(command);
    const attributes = result.VerificationAttributes?.[domain];
    
    const verified = attributes?.VerificationStatus === 'Success';

    return NextResponse.json({
      domain,
      verified,
      status: attributes?.VerificationStatus || 'NotStarted',
    });
  } catch (error: any) {
    console.error('Error checking domain verification:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check domain verification' },
      { status: 500 }
    );
  }
}