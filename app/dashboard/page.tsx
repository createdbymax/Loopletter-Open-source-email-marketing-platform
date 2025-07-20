import { generateDashboardMetadata } from "@/lib/metadata";
import { DashboardOverview } from "./dashboard-overview";

export const metadata = generateDashboardMetadata(
  "Dashboard",
  "Your LoopLetter dashboard. Manage campaigns, track fans, analyze performance, and grow your music career with email marketing."
);

import { getOrCreateArtistByClerkId, getCampaignsByArtist, getFansByArtist } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  // Get the current user from Clerk
  const user = await currentUser();
  
  if (!user) {
    return <div>Please sign in to access your dashboard</div>;
  }
  
  // Get the artist data from the database
  const artist = await getOrCreateArtistByClerkId(
    user.id, 
    user.emailAddresses[0]?.emailAddress || '', 
    user.firstName || ''
  );
  
  // Fetch actual data for the dashboard
  const [campaigns, fans] = await Promise.all([
    getCampaignsByArtist(artist.id),
    getFansByArtist(artist.id)
  ]);
  
  // Calculate stats from fetched data
  const sentCampaigns = campaigns.filter(c => c.status === 'sent');
  const totalEmailsSent = sentCampaigns.reduce((total, campaign) => {
    return total + (campaign.stats?.total_sent || 0);
  }, 0);
  
  // Calculate this month's sent emails
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
  
  // Calculate average open and click rates
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
  
  // Pass both the stats and the actual data collections to avoid refetching
  return <DashboardOverview 
    artist={artist} 
    stats={stats} 
    initialCampaigns={campaigns} 
    initialFans={fans} 
  />;
}