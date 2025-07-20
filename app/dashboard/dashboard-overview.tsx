"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Mail, 
  BarChart3, 
  Zap, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle,
  Plus,
  TrendingUp,
  Calendar,
  Eye,
  Send
} from 'lucide-react';
import { Artist, Campaign, Fan } from '@/lib/types';
import { getUserSubscriptionPlan, getUserLimits } from '@/lib/subscription';
import Link from 'next/link';
import { useUser } from "@clerk/nextjs";
import { getCampaignsByArtist, getFansByArtist, getOrCreateArtistByClerkId } from "@/lib/db";

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
  const [loading, setLoading] = useState(!props.artist || !props.stats || !props.initialCampaigns || !props.initialFans);
  
  // Use provided stats or calculate from fetched data
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
      if (!user) return;
      setLoading(true);
      try {
        // If artist wasn't provided as a prop, fetch it
        let artistData = artist;
        if (!artistData) {
          artistData = await getOrCreateArtistByClerkId(
            user.id,
            user.primaryEmailAddress?.emailAddress || '',
            user.fullName || user.username || "Artist"
          );
          setArtist(artistData);
        }

        if (artistData) {
          const [campaignsData, fansData] = await Promise.all([
            getCampaignsByArtist(artistData.id),
            getFansByArtist(artistData.id)
          ]);
          
          setCampaigns(campaignsData);
          setFans(fansData);
          
          // Calculate stats from fetched data
          const sentCampaigns = campaignsData.filter(c => c.status === 'sent');
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
          
          setStats({
            totalFans: fansData.length,
            activeFans: fansData.filter(f => f.status === 'subscribed').length,
            totalCampaigns: campaignsData.length,
            totalEmailsSent: totalEmailsSent,
            monthlyEmailsSent: thisMonthSent,
            openRate: avgOpenRate,
            clickRate: avgClickRate,
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    // Initialize with props if available
    if (props.artist) {
      setArtist(props.artist);
    }
    
    if (props.stats) {
      setStats(props.stats);
    }
    
    // Use initialCampaigns and initialFans if provided
    if (props.initialCampaigns && props.initialCampaigns.length > 0) {
      setCampaigns(props.initialCampaigns);
    }
    
    if (props.initialFans && props.initialFans.length > 0) {
      setFans(props.initialFans);
    }
    
    // If we have all the data from props, we can stop loading
    if (props.artist && props.stats && 
        props.initialCampaigns && props.initialFans) {
      setLoading(false);
    }
    // If we have artist but not the other data, fetch what's missing
    else if (props.artist && props.artist.id && isLoaded) {
      // If we don't have campaigns and fans data, fetch them
      if (!props.initialCampaigns || !props.initialFans) {
        Promise.all([
          getCampaignsByArtist(props.artist.id),
          getFansByArtist(props.artist.id)
        ]).then(([campaignsData, fansData]) => {
          setCampaigns(campaignsData);
          setFans(fansData);
          setLoading(false);
        }).catch(error => {
          console.error('Error fetching campaigns and fans:', error);
          setLoading(false);
        });
      }
    } 
    // Only fetch all data if we don't have an artist from props
    else if (isLoaded && user) {
      fetchData();
    } else if (isLoaded) {
      setLoading(false);
    }
  }, [user, isLoaded, props.artist, props.stats, props.initialCampaigns, props.initialFans, artist]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!artist) {
    return <div>No artist data available</div>;
  }

  const plan = getUserSubscriptionPlan(artist);
  const { maxSubscribers, maxEmailSends } = getUserLimits(artist);
  
  // Calculate usage percentages
  const subscriberPercentage = maxSubscribers === 'unlimited' 
    ? 0 
    : Math.min(100, Math.round((stats.totalFans / (maxSubscribers as number)) * 100));
  
  const emailPercentage = maxEmailSends === 'unlimited' 
    ? 0 
    : Math.min(100, Math.round((stats.monthlyEmailsSent / (maxEmailSends as number)) * 100));
  
  // Determine if user is approaching limits
  const approachingSubscriberLimit = subscriberPercentage >= 80;
  const approachingEmailLimit = maxEmailSends !== 'unlimited' && emailPercentage >= 80;

  // Get recent and filtered campaigns
  const recentCampaigns = campaigns.slice(0, 5);
  const sentCampaigns = campaigns.filter(c => c.status === 'sent');
  const draftCampaigns = campaigns.filter(c => c.status === 'draft');

  // Calculate this month's campaigns
  const now = new Date();
  const thisMonthCampaigns = campaigns.filter(c => {
    const campaignDate = new Date(c.created_at);
    return (
      campaignDate.getMonth() === now.getMonth() &&
      campaignDate.getFullYear() === now.getFullYear()
    );
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {artist.name}!</h1>
          <p className="text-gray-600">Here's what's happening with your email marketing</p>
        </div>
        
        <Link href="/dashboard/campaigns/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </Link>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <Mail className="w-5 h-5 text-blue-600" />
            <h3 className="ml-2 text-sm font-medium text-gray-900">Total Campaigns</h3>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">{campaigns.length}</p>
          <p className="text-sm text-gray-600 mt-1">{draftCampaigns.length} drafts, {sentCampaigns.length} sent</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <Users className="w-5 h-5 text-green-600" />
            <h3 className="ml-2 text-sm font-medium text-gray-900">Total Fans</h3>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">{fans.length}</p>
          <p className="text-sm text-gray-600 mt-1">Active subscribers</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <h3 className="ml-2 text-sm font-medium text-gray-900">Open Rate</h3>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {stats.openRate > 0 ? `${stats.openRate.toFixed(1)}%` : '--'}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {stats.openRate > 0 ? 'Average across campaigns' : 'Send campaigns to see data'}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-orange-600" />
            <h3 className="ml-2 text-sm font-medium text-gray-900">This Month</h3>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">{thisMonthCampaigns}</p>
          <p className="text-sm text-gray-600 mt-1">Campaigns created</p>
        </div>
      </div>

      {/* Plan Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Your Plan: {plan === 'starter' ? 'Starter' : plan === 'independent' ? 'Independent' : 'Label/Agency'}</span>
            <Link href="/dashboard/settings?tab=subscription">
              <Button variant="outline" size="sm">
                Manage Subscription
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Subscriber Usage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Subscriber Usage</span>
                </div>
                <span className="text-sm font-medium">
                  {stats.totalFans.toLocaleString()} / {maxSubscribers === 'unlimited' ? 'Unlimited' : maxSubscribers.toLocaleString()}
                </span>
              </div>
              
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    approachingSubscriberLimit ? 'bg-amber-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${subscriberPercentage}%` }}
                ></div>
              </div>
              
              {approachingSubscriberLimit && (
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span>You're approaching your subscriber limit</span>
                  <Link href="/dashboard/settings?tab=subscription&feature=maxSubscribers" className="text-blue-600 hover:underline ml-auto">
                    Upgrade
                  </Link>
                </div>
              )}
            </div>
            
            {/* Email Send Usage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Email Send Usage</span>
                </div>
                <span className="text-sm font-medium">
                  {stats.totalEmailsSent.toLocaleString()} / {maxEmailSends === 'unlimited' ? 'Unlimited' : maxEmailSends.toLocaleString()}
                </span>
              </div>
              
              {maxEmailSends !== 'unlimited' ? (
                <>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        approachingEmailLimit ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${emailPercentage}%` }}
                    ></div>
                  </div>
                  
                  {approachingEmailLimit && (
                    <div className="flex items-center gap-2 text-sm text-amber-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span>You're approaching your monthly email limit</span>
                      <Link href="/dashboard/settings?tab=subscription&feature=maxEmailSends" className="text-blue-600 hover:underline ml-auto">
                        Upgrade
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Unlimited email sends with your current plan</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/dashboard/campaigns/create">
              <div className="flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h4 className="font-medium">Create Campaign</h4>
                  <p className="text-sm text-gray-600">Start with a professional template</p>
                </div>
              </div>
            </Link>
            
            <Link href="/dashboard/fans">
              <div className="flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h4 className="font-medium">Manage Fans</h4>
                  <p className="text-sm text-gray-600">Add and organize subscribers</p>
                </div>
              </div>
            </Link>
            
            <Link href="/dashboard/analytics">
              <div className="flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h4 className="font-medium">View Analytics</h4>
                  <p className="text-sm text-gray-600">Track campaign performance</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Campaigns */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className="text-lg font-medium">Recent Campaigns</h3>
          <Link href="/dashboard/campaigns">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>
        <div className="p-6">
          {recentCampaigns.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h4>
              <p className="text-gray-600 mb-4">Create your first email campaign to get started</p>
              <Link href="/dashboard/campaigns/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Campaign
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentCampaigns.map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      campaign.status === 'sent' ? 'bg-green-500' :
                      campaign.status === 'scheduled' ? 'bg-blue-500' :
                      'bg-gray-400'
                    }`}></div>
                    <div>
                      <h4 className="font-medium">{campaign.title}</h4>
                      <p className="text-sm text-gray-600">
                        {campaign.status === 'sent' ? 'Sent' : 'Created'} {' '}
                        {new Date(campaign.status === 'sent' ? campaign.send_date : campaign.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      campaign.status === 'sent' ? 'bg-green-100 text-green-800' :
                      campaign.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </span>
                    <Link href={`/dashboard/campaigns/${campaign.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Getting Started - Show only if no campaigns and no fans */}
      {campaigns.length === 0 && fans.length === 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">🚀 Getting Started</h3>
            <p className="text-gray-600 mb-4">Welcome to your email marketing dashboard! Here's how to get started:</p>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-xs font-bold text-blue-600">1</span>
                </div>
                <span className="text-sm">Add your first fans to build your audience</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-xs font-bold text-blue-600">2</span>
                </div>
                <span className="text-sm">Create your first campaign using our professional templates</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-xs font-bold text-blue-600">3</span>
                </div>
                <span className="text-sm">Send your campaign and track performance in analytics</span>
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
        </div>
      )}
    </div>
  );
}