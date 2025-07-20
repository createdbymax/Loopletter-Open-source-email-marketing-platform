import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');

    if (!domain) {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 });
    }

    // In a real implementation, this would check AWS SES for actual verification status
    // For now, we'll simulate the verification data
    const verificationData = {
      domain,
      verified: false, // This would come from actual SES API
      verificationToken: `loopletter-verify-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      dkimTokens: [
        `dkim1-${Math.random().toString(36).substring(7)}`,
        `dkim2-${Math.random().toString(36).substring(7)}`,
        `dkim3-${Math.random().toString(36).substring(7)}`
      ],
      spfRecord: `v=spf1 include:amazonses.com include:loopletter.com ~all`,
      dmarcRecord: `v=DMARC1; p=quarantine; rua=mailto:dmarc@${domain}; ruf=mailto:dmarc@${domain}; fo=1`,
      mxRecord: `10 inbound-smtp.us-east-1.amazonaws.com`,
    };

    return NextResponse.json(verificationData);

  } catch (error) {
    console.error("Error checking domain status:", error);
    return NextResponse.json(
      { error: "Failed to check domain status" },
      { status: 500 }
    );
  }
}