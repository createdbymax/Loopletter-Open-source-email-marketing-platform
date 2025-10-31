"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Mail, BarChart3, Zap, ArrowRight, CheckCircle, AlertTriangle, Plus, TrendingUp, Calendar, Eye, } from "lucide-react";
import { Artist, Campaign, Fan } from "@/lib/types";
import { getUserSubscriptionPlan, getUserLimits } from "@/lib/subscription";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { getCampaignsByArtist, getFansByArtist, getOrCreateArtistByClerkId, } from "@/lib/db";
import { OnboardingProgress } from "@/components/onboarding/onboarding-progress";
import { getOnboardingStatus } from "@/lib/onboarding";
interface DashboardOverviewProps {
    artist?: Artist;
    stats?: {
        totalFans: number;
        activeFans: number;
        totalCampaigns: number;
        totalEmailsSent: number;
        monthlyEmailsSent: number;
        openRate: number;
        clickRate: number;
    };
    initialCampaigns?: Campaign[];
    initialFans?: Fan[];
}
export function DashboardOverview(props: DashboardOverviewProps) {
    const { user, isLoaded } = useUser();
    const [artist, setArtist] = useState<Artist | null>(props.artist || null);
    const [campaigns, setCampaigns] = useState<Campaign[]>(props.initialCampaigns || []);
    const [fans, setFans] = useState<Fan[]>(props.initialFans || []);
    const [loading, setLoading] = useState(!props.artist ||
        !props.stats ||
        !props.initialCampaigns ||
        !props.initialFans);
    const [stats, setStats] = useState(props.stats || {
        totalFans: 0,
        activeFans: 0,
        totalCampaigns: 0,
        totalEmailsSent: 0,
        monthlyEmailsSent: 0,
        openRate: 0,
        clickRate: 0,
    });
    useEffect(() => {
        async function fetchData() {
            if (!user)
                return;
            setLoading(true);
            try {
                let artistData = artist;
                if (!artistData) {
                    artistData = await getOrCreateArtistByClerkId(user.id, user.primaryEmailAddress?.emailAddress || "", user.fullName || user.username || "Artist");
                    setArtist(artistData);
                }
                if (artistData) {
                    const [campaignsData, fansData] = await Promise.all([
                        getCampaignsByArtist(artistData.id),
                        getFansByArtist(artistData.id),
                    ]);
                    setCampaigns(campaignsData);
                    setFans(fansData);
                    const sentCampaigns = campaignsData.filter((c) => c.status === "sent");
                    const totalEmailsSent = sentCampaigns.reduce((total, campaign) => {
                        return total + (campaign.stats?.total_sent || 0);
                    }, 0);
                    const now = new Date();
                    const thisMonthSent = sentCampaigns
                        .filter((c) => {
                        const sendDate = new Date(c.send_date);
                        return (sendDate.getMonth() === now.getMonth() &&
                            sendDate.getFullYear() === now.getFullYear());
                    })
                        .reduce((total, campaign) => {
                        return total + (campaign.stats?.total_sent || 0);
                    }, 0);
                    let totalOpenRate = 0;
                    let totalClickRate = 0;
                    let campaignsWithStats = 0;
                    sentCampaigns.forEach((campaign) => {
                        if (campaign.stats && campaign.stats.open_rate > 0) {
                            totalOpenRate += campaign.stats.open_rate;
                            totalClickRate += campaign.stats.click_rate;
                            campaignsWithStats++;
                        }
                    });
                    const avgOpenRate = campaignsWithStats > 0 ? totalOpenRate / campaignsWithStats : 0;
                    const avgClickRate = campaignsWithStats > 0 ? totalClickRate / campaignsWithStats : 0;
                    setStats({
                        totalFans: fansData.length,
                        activeFans: fansData.filter((f) => f.status === "subscribed")
                            .length,
                        totalCampaigns: campaignsData.length,
                        totalEmailsSent: totalEmailsSent,
                        monthlyEmailsSent: thisMonthSent,
                        openRate: avgOpenRate,
                        clickRate: avgClickRate,
                    });
                }
            }
            catch (error) {
                console.error("Error fetching dashboard data:", error);
            }
            finally {
                setLoading(false);
            }
        }
        if (props.artist) {
            setArtist(props.artist);
        }
        if (props.stats) {
            setStats(props.stats);
        }
        if (props.initialCampaigns && props.initialCampaigns.length > 0) {
            setCampaigns(props.initialCampaigns);
        }
        if (props.initialFans && props.initialFans.length > 0) {
            setFans(props.initialFans);
        }
        if (props.artist &&
            props.stats &&
            props.initialCampaigns &&
            props.initialFans) {
            setLoading(false);
        }
        else if (props.artist && props.artist.id && isLoaded) {
            if (!props.initialCampaigns || !props.initialFans) {
                Promise.all([
                    getCampaignsByArtist(props.artist.id),
                    getFansByArtist(props.artist.id),
                ])
                    .then(([campaignsData, fansData]) => {
                    setCampaigns(campaignsData);
                    setFans(fansData);
                    setLoading(false);
                })
                    .catch((error) => {
                    console.error("Error fetching campaigns and fans:", error);
                    setLoading(false);
                });
            }
        }
        else if (isLoaded && user) {
            fetchData();
        }
        else if (isLoaded) {
            setLoading(false);
        }
    }, [
        user,
        isLoaded,
        props.artist,
        props.stats,
        props.initialCampaigns,
        props.initialFans,
        artist,
    ]);
    if (loading) {
        return (<div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900 dark:border-neutral-100 mx-auto"></div>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">Loading dashboard...</p>
        </div>
      </div>);
    }
    if (!artist) {
        return <div>No artist data available</div>;
    }
    const plan = getUserSubscriptionPlan(artist);
    const { maxSubscribers, maxEmailSends } = getUserLimits(artist);
    const subscriberPercentage = Math.min(100, Math.round((stats.totalFans / maxSubscribers) * 100));
    const emailPercentage = maxEmailSends === "unlimited"
        ? 0
        : Math.min(100, Math.round((stats.monthlyEmailsSent / (maxEmailSends as number)) * 100));
    const approachingSubscriberLimit = subscriberPercentage >= 80;
    const approachingEmailLimit = maxEmailSends !== "unlimited" && emailPercentage >= 80;
    const recentCampaigns = campaigns.slice(0, 5);
    const sentCampaigns = campaigns.filter((c) => c.status === "sent");
    const draftCampaigns = campaigns.filter((c) => c.status === "draft");
    const onboardingStatus = getOnboardingStatus(artist, fans, campaigns);
    const showOnboardingProgress = !onboardingStatus.isComplete && (fans.length > 0 || campaigns.length > 0);
    const now = new Date();
    const thisMonthCampaigns = campaigns.filter((c) => {
        const campaignDate = new Date(c.created_at);
        return (campaignDate.getMonth() === now.getMonth() &&
            campaignDate.getFullYear() === now.getFullYear());
    }).length;
    return (<div className="space-y-6">
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          
          

          <div>
            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              Welcome back, {artist.name}!
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Here's what's happening with your email marketing
            </p>
          </div>
        </div>

        <Link href="/dashboard/campaigns/create">
          <Button>
            <Plus className="h-4 w-4 mr-2"/>
            Create Campaign
          </Button>
        </Link>
      </div>

      
      {showOnboardingProgress && (<OnboardingProgress artist={artist} fans={fans} campaigns={campaigns}/>)}

      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border dark:border-neutral-700">
          <div className="flex items-center">
            <Mail className="w-5 h-5 text-blue-600"/>
            <h3 className="ml-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Total Campaigns
            </h3>
          </div>
          <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {campaigns.length}
          </p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            {draftCampaigns.length} drafts, {sentCampaigns.length} sent
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border dark:border-neutral-700">
          <div className="flex items-center">
            <Users className="w-5 h-5 text-green-600"/>
            <h3 className="ml-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Total Fans
            </h3>
          </div>
          <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">{fans.length}</p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Active subscribers</p>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border dark:border-neutral-700">
          <div className="flex items-center">
            <TrendingUp className="w-5 h-5 text-purple-600"/>
            <h3 className="ml-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Open Rate
            </h3>
          </div>
          <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {stats.openRate > 0 ? `${stats.openRate.toFixed(1)}%` : "--"}
          </p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            {stats.openRate > 0
            ? "Average across campaigns"
            : "Send campaigns to see data"}
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border dark:border-neutral-700">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-orange-600"/>
            <h3 className="ml-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
              This Month
            </h3>
          </div>
          <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {thisMonthCampaigns}
          </p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Campaigns created</p>
        </div>
      </div>

      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              Your Plan:{" "}
              {plan === "starter"
            ? "Starter"
            : plan === "independent"
                ? "Independent"
                : "Label/Agency"}
            </span>
            <Link href="/dashboard/settings?tab=subscription">
              <Button variant="outline" size="sm">
                Manage Subscription
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600"/>
                  <span className="font-medium">Subscriber Usage</span>
                </div>
                <span className="text-sm font-medium">
                  {stats.totalFans.toLocaleString()} /{" "}
                  {maxSubscribers.toLocaleString()}
                </span>
              </div>

              <div className="h-2 bg-gray-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${approachingSubscriberLimit ? "bg-amber-500" : "bg-blue-600"}`} style={{ width: `${subscriberPercentage}%` }}></div>
              </div>

              {approachingSubscriberLimit && (<div className="flex items-center gap-2 text-sm text-amber-600">
                  <AlertTriangle className="h-4 w-4"/>
                  <span>You're approaching your subscriber limit</span>
                  <Link href="/dashboard/settings?tab=subscription&feature=maxSubscribers" className="text-blue-600 hover:underline ml-auto">
                    Upgrade
                  </Link>
                </div>)}
            </div>

            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600"/>
                  <span className="font-medium">Email Send Usage</span>
                </div>
                <span className="text-sm font-medium">
                  {stats.totalEmailsSent.toLocaleString()} /{" "}
                  {maxEmailSends === "unlimited"
            ? "Unlimited"
            : maxEmailSends.toLocaleString()}
                </span>
              </div>

              {maxEmailSends !== "unlimited" ? (<>
                  <div className="h-2 bg-gray-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${approachingEmailLimit ? "bg-amber-500" : "bg-blue-600"}`} style={{ width: `${emailPercentage}%` }}></div>
                  </div>

                  {approachingEmailLimit && (<div className="flex items-center gap-2 text-sm text-amber-600">
                      <AlertTriangle className="h-4 w-4"/>
                      <span>You're approaching your monthly email limit</span>
                      <Link href="/dashboard/settings?tab=subscription&feature=maxEmailSends" className="text-blue-600 hover:underline ml-auto">
                        Upgrade
                      </Link>
                    </div>)}
                </>) : (<div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4"/>
                  <span>Unlimited email sends with your current plan</span>
                </div>)}
            </div>
          </div>
        </CardContent>
      </Card>

      
      <div className="bg-white dark:bg-neutral-800 rounded-lg border dark:border-neutral-700">
        <div className="p-6 border-b dark:border-neutral-700">
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/dashboard/campaigns/create">
              <div className="flex items-center p-4 border dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 cursor-pointer">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                  <Mail className="w-6 h-6 text-blue-600"/>
                </div>
                <div className="ml-4">
                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100">Create Campaign</h4>
                  <p className="text-sm text-gray-600 dark:text-neutral-400">
                    Start with a professional template
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/dashboard/fans">
              <div className="flex items-center p-4 border dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 cursor-pointer">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-green-600"/>
                </div>
                <div className="ml-4">
                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100">Manage Fans</h4>
                  <p className="text-sm text-gray-600 dark:text-neutral-400">
                    Add and organize subscribers
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/dashboard/analytics">
              <div className="flex items-center p-4 border dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 cursor-pointer">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-purple-600"/>
                </div>
                <div className="ml-4">
                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100">View Analytics</h4>
                  <p className="text-sm text-gray-600 dark:text-neutral-400">
                    Track campaign performance
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      
      <div className="bg-white dark:bg-neutral-800 rounded-lg border dark:border-neutral-700">
        <div className="p-6 border-b dark:border-neutral-700 flex items-center justify-between">
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">Recent Campaigns</h3>
          <Link href="/dashboard/campaigns">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
        <div className="p-6">
          {recentCampaigns.length === 0 ? (<div className="text-center py-8">
              <Mail className="w-12 h-12 text-gray-400 dark:text-neutral-500 mx-auto mb-4"/>
              <h4 className="text-lg font-medium text-gray-900 dark:text-neutral-100 mb-2">
                No campaigns yet
              </h4>
              <p className="text-gray-600 dark:text-neutral-400 mb-4">
                Create your first email campaign to get started
              </p>
              <Link href="/dashboard/campaigns/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2"/>
                  Create Your First Campaign
                </Button>
              </Link>
            </div>) : (<div className="space-y-4">
              {recentCampaigns.map((campaign) => (<div key={campaign.id} className="flex items-center justify-between p-4 border dark:border-neutral-700 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${campaign.status === "sent"
                    ? "bg-green-500"
                    : campaign.status === "scheduled"
                        ? "bg-blue-500"
                        : "bg-gray-400"}`}></div>
                    <div>
                      <h4 className="font-medium text-neutral-900 dark:text-neutral-100">{campaign.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-neutral-400">
                        {campaign.status === "sent" ? "Sent" : "Created"}{" "}
                        {new Date(campaign.status === "sent"
                    ? campaign.send_date
                    : campaign.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${campaign.status === "sent"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : campaign.status === "scheduled"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-gray-100 text-gray-800 dark:bg-neutral-700 dark:text-neutral-300"}`}>
                      {campaign.status.charAt(0).toUpperCase() +
                    campaign.status.slice(1)}
                    </span>
                    <Link href={`/dashboard/campaigns/${campaign.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4"/>
                      </Button>
                    </Link>
                  </div>
                </div>))}
            </div>)}
        </div>
      </div>

      
      {campaigns.length === 0 && fans.length === 0 && (<div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-neutral-100 mb-2">
              🚀 Getting Started
            </h3>
            <p className="text-gray-600 dark:text-neutral-400 mb-4">
              Welcome to your email marketing dashboard! Here's how to get
              started:
            </p>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3">
                  <span className="text-xs font-bold text-blue-600">1</span>
                </div>
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                  Add your first fans to build your audience
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3">
                  <span className="text-xs font-bold text-blue-600">2</span>
                </div>
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                  Create your first campaign using our professional templates
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3">
                  <span className="text-xs font-bold text-blue-600">3</span>
                </div>
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                  Send your campaign and track performance in analytics
                </span>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Link href="/dashboard/fans">
                <Button variant="outline">Add Fans</Button>
              </Link>
              <Link href="/dashboard/campaigns/create">
                <Button>Create Campaign</Button>
              </Link>
            </div>
          </div>
        </div>)}
    </div>);
}
