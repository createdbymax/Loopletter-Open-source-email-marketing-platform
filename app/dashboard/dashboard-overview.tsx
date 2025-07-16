"use client";

import { useUser } from "@clerk/nextjs";
import { getCampaignsByArtist, getFansByArtist, getOrCreateArtistByClerkId } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { 
  Plus, 
  Mail, 
  Users, 
  TrendingUp, 
  Calendar,
  Eye,
  Send,
  BarChart3
} from "lucide-react";
import { Campaign, Fan, Artist } from "@/lib/types";
import Link from "next/link";

export function DashboardOverview() {
  const { user, isLoaded } = useUser();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [fans, setFans] = useState<Fan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      setLoading(true);
      try {
        const a = await getOrCreateArtistByClerkId(
          user.id,
          user.primaryEmailAddress?.emailAddress || '',
          user.fullName || user.username || "Artist"
        );
        setArtist(a);
        
        const [campaignsData, fansData] = await Promise.all([
          getCampaignsByArtist(a.id),
          getFansByArtist(a.id)
        ]);
        
        setCampaigns(campaignsData);
        setFans(fansData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    if (isLoaded) fetchData();
  }, [user, isLoaded]);

  const recentCampaigns = campaigns.slice(0, 5);
  const sentCampaigns = campaigns.filter(c => c.status === 'sent');
  const draftCampaigns = campaigns.filter(c => c.status === 'draft');

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Welcome back, {artist?.name || user?.firstName || 'Artist'}!
          </h1>
          <p className="text-gray-600">Here's what's happening with your email marketing</p>
        </div>
        <Link href="/dashboard/campaigns/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
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
          <p className="text-sm text-gray-600 mt-1">
            {draftCampaigns.length} drafts, {sentCampaigns.length} sent
          </p>
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
          <p className="mt-2 text-3xl font-bold text-gray-900">--</p>
          <p className="text-sm text-gray-600 mt-1">Send campaigns to see data</p>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-orange-600" />
            <h3 className="ml-2 text-sm font-medium text-gray-900">This Month</h3>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {campaigns.filter(c => {
              const campaignDate = new Date(c.created_at);
              const now = new Date();
              return (
                campaignDate.getMonth() === now.getMonth() &&
                campaignDate.getFullYear() === now.getFullYear()
              );
            }).length}
          </p>
          <p className="text-sm text-gray-600 mt-1">Campaigns created</p>
        </div>
      </div>

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
              <p className="text-gray-600 mb-4">
                Create your first email campaign to get started
              </p>
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

      {/* Getting Started */}
      {campaigns.length === 0 && fans.length === 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">🚀 Getting Started</h3>
            <p className="text-gray-600 mb-4">
              Welcome to your email marketing dashboard! Here's how to get started:
            </p>
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