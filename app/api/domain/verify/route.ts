import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { domain } = body;

    if (!domain || typeof domain !== 'string') {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 });
    }

    // For now, return mock DNS records
    // In a real implementation, this would integrate with AWS SES
    const dnsRecords = [
      {
        type: 'TXT',
        name: `_amazonses.${domain}`,
        value: 'mock-verification-token-12345'
      },
      {
        type: 'CNAME',
        name: `mock-dkim._domainkey.${domain}`,
        value: 'mock-dkim.dkim.amazonses.com'
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
      message: 'DNS records generated. Add these to your domain DNS settings.'
    });

  } catch (error) {
    console.error('Error verifying domain:', error);
    return NextResponse.json(
      { error: 'Failed to verify domain' },
      { status: 500 }
    );
  }
}