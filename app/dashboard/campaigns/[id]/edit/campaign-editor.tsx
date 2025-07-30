"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Save, Send, ArrowLeft, Users, Mail, Calendar, BarChart3 } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { getOrCreateArtistByClerkId, getFansByArtist } from "@/lib/db";
import { TemplatePreview } from "@/components/ui/template-preview";
import { TemplateEditor } from "../../create/template-editor";
import { Campaign } from "@/lib/types";
import {
  MusicReleaseTemplateProps,
  ShowAnnouncementTemplateProps,
  MerchandiseTemplateProps,
} from "@/app/dashboard/email-templates";

interface CampaignEditorProps {
  campaignId: string;
}

export function CampaignEditor({ campaignId }: CampaignEditorProps) {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [fanCount, setFanCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  // Email metadata
  const [emailData, setEmailData] = useState({
    subject: '',
    from: '',
    previewText: '',
    audience: 'all-subscribers'
  });

  useEffect(() => {
    fetchCampaign();
    fetchFanCount();
  }, [campaignId, user, isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchFanCount = async () => {
    if (!user || !isLoaded) return;
    try {
      const artist = await getOrCreateArtistByClerkId(
        user.id,
        user.primaryEmailAddress?.emailAddress || '',
        user.fullName || user.username || "Artist"
      );
      const fans = await getFansByArtist(artist.id);
      setFanCount(fans.length);
    } catch (error) {
      console.error('Error fetching fan count:', error);
    }
  };

  const fetchCampaign = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`);
      if (response.ok) {
        const data = await response.json();
        setCampaign(data);
        setEmailData({
          subject: data.title || '',
          from: '',
          previewText: '',
          audience: 'all-subscribers'
        });
      } else {
        throw new Error('Failed to fetch campaign');
      }
    } catch (error) {
      console.error('Error fetching campaign:', error);
      alert('Failed to load campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!campaign) return;
    
    setSaving(true);
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: emailData.subject,
          template_data: campaign.template_data,
        })
      });

      if (response.ok) {
        alert('Campaign saved successfully!');
      } else {
        throw new Error('Failed to save campaign');
      }
    } catch (error) {
      console.error('Error saving campaign:', error);
      alert('Failed to save campaign');
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async () => {
    if (!campaign) return;

    if (confirm('Are you sure you want to send this campaign to all subscribers?')) {
      setSending(true);
      try {
        // First save any changes
        await handleSave();
        
        // Then send
        const response = await fetch(`/api/campaigns/${campaignId}/send`, {
          method: 'POST'
        });

        if (response.ok) {
          const result = await response.json();
          alert(`Campaign sent successfully to ${result.sentCount} subscribers!`);
          router.push('/dashboard/campaigns');
        } else {
          throw new Error('Failed to send campaign');
        }
      } catch (error) {
        console.error('Error sending campaign:', error);
        alert('Failed to send campaign');
      } finally {
        setSending(false);
      }
    }
  };

  const updateTemplateData = (newData: unknown) => {
    if (campaign) {
      setCampaign({
        ...campaign,
        template_data: newData as Record<string, unknown> | null
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-neutral-100 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-neutral-400">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">Campaign not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-800 border-b dark:border-neutral-700 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push('/dashboard/campaigns')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Campaigns
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Edit Campaign</h1>
              <p className="text-sm text-gray-600 dark:text-neutral-400">
                {campaign.status === 'sent' ? 'View sent campaign' : 'Edit your campaign'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {campaign.status !== 'sent' && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSave}
                  disabled={saving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save'}
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSend}
                  disabled={sending}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {sending ? 'Sending...' : 'Send Campaign'}
                </Button>
              </>
            )}
            {campaign.status === 'sent' && (
              <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                Sent
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Email Settings */}
          <div className="col-span-3 space-y-6">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border dark:border-neutral-700 p-4">
              <h3 className="font-medium mb-4 text-neutral-900 dark:text-neutral-100">Email Settings</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject Line</Label>
                  <Input
                    id="subject"
                    value={emailData.subject}
                    onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Enter subject line..."
                    disabled={campaign.status === 'sent'}
                  />
                </div>
                
                <div>
                  <Label>Status</Label>
                  <div className="mt-2">
                    <Badge 
                      variant={campaign.status === 'sent' ? 'default' : 'secondary'}
                      className={campaign.status === 'sent' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                    >
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <Label>Audience</Label>
                  <div className="mt-2">
                    <Badge variant="secondary">All Subscribers ({fanCount.toLocaleString()})</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Editor */}
          <div className="col-span-6">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border dark:border-neutral-700">
              <div className="p-6">
                {campaign.template_id && campaign.template_data ? (
                  <TemplatePreview 
                    templateId={campaign.template_id}
                    templateData={campaign.template_data as unknown as MusicReleaseTemplateProps | ShowAnnouncementTemplateProps | MerchandiseTemplateProps}
                  />
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-neutral-400">
                    <p>No template data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Template Editor */}
          <div className="col-span-3">
            {campaign.template_id && campaign.template_data && campaign.status !== 'sent' ? (
              <TemplateEditor
                templateId={campaign.template_id}
                templateData={campaign.template_data}
                onUpdate={updateTemplateData}
              />
            ) : (
              <div className="bg-white dark:bg-neutral-800 rounded-lg border dark:border-neutral-700 p-4">
                <h3 className="font-medium mb-2 text-neutral-900 dark:text-neutral-100">Campaign Info</h3>
                <div className="space-y-2 text-sm text-gray-600 dark:text-neutral-400">
                  <p>Created: {new Date(campaign.created_at).toLocaleDateString()}</p>
                  {campaign.send_date && (
                    <p>Sent: {new Date(campaign.send_date).toLocaleDateString()}</p>
                  )}
                  <p>Status: {campaign.status}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}