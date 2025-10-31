import { generateDashboardMetadata } from "@/lib/metadata";
import { DashboardOverview } from "./dashboard-overview";
import { OnboardingWrapper } from "./onboarding-wrapper";
export const metadata = generateDashboardMetadata("Dashboard", "Your Loopletter dashboard. Manage campaigns, track fans, analyze performance, and grow your music career with email marketing.");
import { getOrCreateArtistByClerkId, getCampaignsByArtist, getFansByArtist } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { shouldShowOnboarding } from "@/lib/onboarding";
export default async function DashboardPage() {
    const user = await currentUser();
    if (!user) {
        return <div>Please sign in to access your dashboard</div>;
    }
    const artist = await getOrCreateArtistByClerkId(user.id, user.emailAddresses[0]?.emailAddress || '', user.firstName || '');
    const [campaigns, fans] = await Promise.all([
        getCampaignsByArtist(artist.id),
        getFansByArtist(artist.id)
    ]);
    const sentCampaigns = campaigns.filter(c => c.status === 'sent');
    const totalEmailsSent = sentCampaigns.reduce((total, campaign) => {
        return total + (campaign.stats?.total_sent || 0);
    }, 0);
    const now = new Date();
    const thisMonthSent = sentCampaigns
        .filter(c => {
        const sendDate = new Date(c.send_date);
        return sendDate.getMonth() === now.getMonth() &&
            sendDate.getFullYear() === now.getFullYear();
    })
        .reduce((total, campaign) => {
        return total + (campaign.stats?.total_sent || 0);
    }, 0);
    let totalOpenRate = 0;
    let totalClickRate = 0;
    let campaignsWithStats = 0;
    sentCampaigns.forEach(campaign => {
        if (campaign.stats && campaign.stats.open_rate > 0) {
            totalOpenRate += campaign.stats.open_rate;
            totalClickRate += campaign.stats.click_rate;
            campaignsWithStats++;
        }
    });
    const avgOpenRate = campaignsWithStats > 0 ? totalOpenRate / campaignsWithStats : 0;
    const avgClickRate = campaignsWithStats > 0 ? totalClickRate / campaignsWithStats : 0;
    const stats = {
        totalFans: fans.length,
        activeFans: fans.filter(f => f.status === 'subscribed').length,
        totalCampaigns: campaigns.length,
        totalEmailsSent: totalEmailsSent,
        monthlyEmailsSent: thisMonthSent,
        openRate: avgOpenRate,
        clickRate: avgClickRate,
    };
    const needsOnboarding = shouldShowOnboarding(artist, fans, campaigns);
    return (<OnboardingWrapper artist={artist} fans={fans} campaigns={campaigns} showOnboarding={needsOnboarding}>
      <DashboardOverview artist={artist} stats={stats} initialCampaigns={campaigns} initialFans={fans}/>
    </OnboardingWrapper>);
}
