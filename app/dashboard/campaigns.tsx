"use client";
import { useUser } from "@clerk/nextjs";
import { getCampaignsByArtist, getOrCreateArtistByClerkId, getFansByArtist, } from "@/lib/db";
import type { Campaign } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { useEffect, useState } from "react";
import { Plus, Mail, Calendar, Users, MoreHorizontal, Eye, Copy, Trash2, } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
interface Artist {
    id: string;
    email: string;
    name: string;
}
export function Campaigns() {
    const { user, isLoaded } = useUser();
    const [artist, setArtist] = useState<Artist | null>(null);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [fanCount, setFanCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        async function fetchArtistAndCampaigns() {
            if (!user)
                return;
            setLoading(true);
            setError(null);
            try {
                const a = await getOrCreateArtistByClerkId(user.id, user.primaryEmailAddress?.emailAddress ||
                    user.emailAddresses[0]?.emailAddress ||
                    "", user.fullName || user.username || "Artist");
                setArtist(a);
                const [campaignsData, fansData] = await Promise.all([
                    getCampaignsByArtist(a.id),
                    getFansByArtist(a.id),
                ]);
                setCampaigns(campaignsData as Campaign[]);
                setFanCount(fansData.length);
            }
            catch (e) {
                setError(e instanceof Error ? e.message : "An error occurred");
            }
            finally {
                setLoading(false);
            }
        }
        if (isLoaded)
            fetchArtistAndCampaigns();
    }, [user, isLoaded]);
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "sent":
                return (<Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            Sent
          </Badge>);
            case "scheduled":
                return (<Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            Scheduled
          </Badge>);
            case "draft":
                return <Badge variant="secondary">Draft</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };
    const handlePreviewCampaign = (campaignId: string) => {
        window.location.href = `/dashboard/campaigns/${campaignId}/edit`;
    };
    const handleDuplicateCampaign = async (campaignId: string) => {
        try {
            const response = await fetch(`/api/campaigns/${campaignId}/duplicate`, {
                method: "POST",
            });
            if (response.ok) {
                if (artist) {
                    const data = await getCampaignsByArtist(artist.id);
                    setCampaigns(data as Campaign[]);
                }
                alert("Campaign duplicated successfully!");
            }
            else {
                throw new Error("Failed to duplicate campaign");
            }
        }
        catch (error) {
            console.error("Error duplicating campaign:", error);
            alert("Failed to duplicate campaign");
        }
    };
    const handleDeleteCampaign = async (campaignId: string) => {
        if (confirm("Are you sure you want to delete this campaign? This action cannot be undone.")) {
            try {
                const response = await fetch(`/api/campaigns/${campaignId}`, {
                    method: "DELETE",
                });
                if (response.ok) {
                    setCampaigns(campaigns.filter((c) => c.id !== campaignId));
                    alert("Campaign deleted successfully!");
                }
                else {
                    throw new Error("Failed to delete campaign");
                }
            }
            catch (error) {
                console.error("Error deleting campaign:", error);
                alert("Failed to delete campaign");
            }
        }
    };
    if (loading) {
        return (<div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-neutral-100 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-neutral-400">Loading campaigns...</p>
        </div>
      </div>);
    }
    if (error) {
        return (<div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">Error: {error}</p>
      </div>);
    }
    return (<div className="space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-neutral-100">Campaigns</h1>
          <p className="text-gray-600 dark:text-neutral-400">
            Create and manage your email campaigns
          </p>
        </div>
        <Button onClick={() => (window.location.href = "/dashboard/campaigns/create")} className="bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200">
          <Plus className="w-4 h-4 mr-2"/>
          Create Campaign
        </Button>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border dark:border-neutral-700">
          <div className="flex items-center">
            <Mail className="w-5 h-5 text-blue-600"/>
            <h3 className="ml-2 text-sm font-medium text-gray-900 dark:text-neutral-100">
              Total Campaigns
            </h3>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-neutral-100">
            {campaigns.length}
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border dark:border-neutral-700">
          <div className="flex items-center">
            <Users className="w-5 h-5 text-green-600"/>
            <h3 className="ml-2 text-sm font-medium text-gray-900 dark:text-neutral-100">
              Total Subscribers
            </h3>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-neutral-100">
            {fanCount.toLocaleString()}
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border dark:border-neutral-700">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-purple-600"/>
            <h3 className="ml-2 text-sm font-medium text-gray-900 dark:text-neutral-100">
              This Month
            </h3>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-neutral-100">
            {campaigns.filter((c) => {
            const campaignDate = new Date(c.created_at);
            const now = new Date();
            return (campaignDate.getMonth() === now.getMonth() &&
                campaignDate.getFullYear() === now.getFullYear());
        }).length}
          </p>
        </div>
      </div>

      
      <div className="bg-white dark:bg-neutral-800 rounded-lg border dark:border-neutral-700">
        {campaigns.length === 0 ? (<div className="text-center py-12">
            <Mail className="w-12 h-12 text-gray-400 dark:text-neutral-500 mx-auto mb-4"/>
            <h3 className="text-lg font-medium text-gray-900 dark:text-neutral-100 mb-2">
              No campaigns yet
            </h3>
            <p className="text-gray-600 dark:text-neutral-400 mb-6">
              Get started by creating your first email campaign
            </p>
            <Button onClick={() => (window.location.href = "/dashboard/campaigns/create")} className="bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200">
              <Plus className="w-4 h-4 mr-2"/>
              Create Your First Campaign
            </Button>
          </div>) : (<Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (<TableRow key={campaign.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700">
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-neutral-100">
                        {campaign.subject || campaign.title || "Untitled Campaign"}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-neutral-400 truncate max-w-xs">
                        {campaign.message?.substring(0, 60)}...
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-gray-600 dark:text-neutral-400">
                      <Users className="w-4 h-4 mr-1"/>
                      {fanCount.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 dark:text-neutral-400">
                    {formatDate(campaign.created_at)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 dark:text-neutral-400">
                    {campaign.send_date ? formatDate(campaign.send_date) : "-"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4"/>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handlePreviewCampaign(campaign.id)}>
                          <Eye className="w-4 h-4 mr-2"/>
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateCampaign(campaign.id)}>
                          <Copy className="w-4 h-4 mr-2"/>
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 dark:text-red-400" onClick={() => handleDeleteCampaign(campaign.id)}>
                          <Trash2 className="w-4 h-4 mr-2"/>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>))}
            </TableBody>
          </Table>)}
      </div>
    </div>);
}
