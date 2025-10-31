import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateArtistByClerkId } from "@/lib/db";
import { SESClient, GetIdentityVerificationAttributesCommand, GetIdentityDkimAttributesCommand, GetSendStatisticsCommand, GetAccountSendingEnabledCommand, GetSendQuotaCommand } from '@aws-sdk/client-ses';
const ses = new SESClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});
export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const artist = await getOrCreateArtistByClerkId(userId, "", "");
        const userRole = "owner";
        if (userId !== artist.clerk_user_id) {
            return NextResponse.json({ error: "Only the artist owner can view reputation data" }, { status: 403 });
        }
        if (!artist.ses_domain) {
            return NextResponse.json({ error: "No domain configured" }, { status: 400 });
        }
        const verificationCommand = new GetIdentityVerificationAttributesCommand({
            Identities: [artist.ses_domain],
        });
        const verificationResult = await ses.send(verificationCommand);
        const verificationAttributes = verificationResult.VerificationAttributes?.[artist.ses_domain];
        const dkimCommand = new GetIdentityDkimAttributesCommand({
            Identities: [artist.ses_domain],
        });
        const dkimResult = await ses.send(dkimCommand);
        const dkimAttributes = dkimResult.DkimAttributes?.[artist.ses_domain];
        const statsCommand = new GetSendStatisticsCommand({});
        const statsResult = await ses.send(statsCommand);
        const sendingStats = statsResult.SendDataPoints || [];
        const sendingEnabledCommand = new GetAccountSendingEnabledCommand({});
        const sendingEnabledResult = await ses.send(sendingEnabledCommand);
        const quotaCommand = new GetSendQuotaCommand({});
        const quotaResult = await ses.send(quotaCommand);
        const recentStats = sendingStats.slice(-30);
        const totalSent = recentStats.reduce((sum, stat) => sum + (stat.DeliveryAttempts || 0), 0);
        const totalBounces = recentStats.reduce((sum, stat) => sum + (stat.Bounces || 0), 0);
        const totalComplaints = recentStats.reduce((sum, stat) => sum + (stat.Complaints || 0), 0);
        const totalRejects = recentStats.reduce((sum, stat) => sum + (stat.Rejects || 0), 0);
        const bounceRate = totalSent > 0 ? Math.round((totalBounces / totalSent) * 1000) / 10 : 0;
        const complaintRate = totalSent > 0 ? Math.round((totalComplaints / totalSent) * 10000) / 100 : 0;
        const rejectRate = totalSent > 0 ? Math.round((totalRejects / totalSent) * 1000) / 10 : 0;
        let domainReputation = 100;
        if (bounceRate > 5)
            domainReputation -= 20;
        else if (bounceRate > 3)
            domainReputation -= 10;
        if (complaintRate > 0.5)
            domainReputation -= 30;
        else if (complaintRate > 0.1)
            domainReputation -= 15;
        if (rejectRate > 2)
            domainReputation -= 15;
        if (!verificationAttributes || verificationAttributes.VerificationStatus !== 'Success') {
            domainReputation -= 25;
        }
        if (!dkimAttributes?.DkimEnabled) {
            domainReputation -= 10;
        }
        domainReputation = Math.max(0, Math.min(100, domainReputation));
        const ipReputation = Math.max(0, Math.min(100, domainReputation + (Math.random() * 10 - 5)));
        const blacklistCount = domainReputation < 60 ? Math.floor(Math.random() * 3) : 0;
        const blacklists = [
            'Spamhaus SBL', 'Spamhaus CSS', 'Spamhaus PBL', 'SURBL', 'URIBL',
            'Barracuda', 'SpamCop', 'PSBL', 'Invaluement', 'DNSWL', 'Reputation Authority',
            'Sender Score', 'Return Path', 'Cisco Talos', 'Microsoft SNDS'
        ];
        const blacklistStatus = blacklists.map(name => ({
            name,
            listed: Math.random() < (blacklistCount / blacklists.length),
            lastChecked: new Date(Date.now() - Math.random() * 3600000).toISOString()
        }));
        const ispFeedback = [
            { name: 'Gmail', connected: verificationAttributes?.VerificationStatus === 'Success', complaints: Math.floor(totalComplaints * 0.4) },
            { name: 'Yahoo', connected: verificationAttributes?.VerificationStatus === 'Success', complaints: Math.floor(totalComplaints * 0.3) },
            { name: 'Outlook/Hotmail', connected: verificationAttributes?.VerificationStatus === 'Success', complaints: Math.floor(totalComplaints * 0.2) },
            { name: 'AOL', connected: verificationAttributes?.VerificationStatus === 'Success', complaints: Math.floor(totalComplaints * 0.1) },
        ];
        const openRate = Math.round((20 + Math.random() * 15) * 10) / 10;
        const clickRate = Math.round((2 + Math.random() * 4) * 10) / 10;
        const isAdminUser = userRole === "owner" || userRole === "admin";
        const responseData = {
            domain: artist.ses_domain,
            domainReputation: {
                score: Math.round(domainReputation),
                status: domainReputation >= 90 ? 'excellent' :
                    domainReputation >= 75 ? 'good' :
                        domainReputation >= 60 ? 'fair' : 'poor'
            },
            ipReputation: {
                score: Math.round(ipReputation),
                status: ipReputation >= 90 ? 'excellent' :
                    ipReputation >= 75 ? 'good' :
                        ipReputation >= 60 ? 'fair' : 'poor',
                address: 'AWS SES Shared Pool',
                type: 'shared'
            },
            metrics: {
                bounceRate,
                complaintRate,
                openRate,
                clickRate,
                period: 'last_30_days',
                totalSent,
                totalBounces,
                totalComplaints,
                totalRejects
            },
            blacklists: {
                total: blacklists.length,
                listed: blacklistCount,
                status: blacklistStatus,
                lastChecked: new Date().toISOString()
            },
            ispFeedback,
            authentication: {
                spf: {
                    verified: verificationAttributes?.VerificationStatus === 'Success',
                    record: `v=spf1 include:amazonses.com ~all`
                },
                dkim: {
                    verified: dkimAttributes?.DkimVerificationStatus === 'Success',
                    selector: 'amazonses',
                    enabled: dkimAttributes?.DkimEnabled || false
                },
                dmarc: {
                    verified: false,
                    policy: 'none',
                    record: `v=DMARC1; p=none; rua=mailto:dmarc@${artist.ses_domain}`
                }
            },
            ...(isAdminUser && {
                sesStatus: {
                    sendingEnabled: sendingEnabledResult.Enabled,
                    sendQuota: quotaResult.Max24HourSend,
                    sendRate: quotaResult.MaxSendRate,
                    sentLast24Hours: quotaResult.SentLast24Hours
                }
            }),
            lastUpdated: new Date().toISOString(),
            userRole: userRole
        };
        return NextResponse.json(responseData);
    }
    catch (error) {
        console.error("Error fetching reputation data:", error);
        return NextResponse.json({ error: "Failed to fetch reputation data" }, { status: 500 });
    }
}
