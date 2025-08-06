"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { getOrCreateArtistByClerkId, getFansByArtist } from "@/lib/db";
import { MailyEditor } from "@/components/email-builder/maily-editor";
import { CampaignSendingModal } from "@/components/email-builder/campaign-sending-modal";
import { Campaign, Artist } from "@/lib/types";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { generateEmailHtml } from "@/lib/email-generator";

interface CampaignEditorProps {
  campaignId: string;
}

export function CampaignEditor({ campaignId }: CampaignEditorProps) {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [artist, setArtist] = useState<Artist | null>(null);
  const [fanCount, setFanCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showSendingModal, setShowSendingModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [campaignId, user, isLoaded]);

  const fetchData = async () => {
    if (!user || !isLoaded) return;

    try {
      // Fetch artist and fan count
      const artistData = await getOrCreateArtistByClerkId(
        user.id,
        user.primaryEmailAddress?.emailAddress || "",
        user.fullName || user.username || "Artist"
      );
      setArtist(artistData);

      const fans = await getFansByArtist(artistData.id);
      setFanCount(fans.length);

      // Fetch campaign
      const response = await fetch(`/api/campaigns/${campaignId}`);
      if (response.ok) {
        const campaignData = await response.json();
        setCampaign(campaignData);
      } else {
        throw new Error("Failed to fetch campaign");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to load campaign");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (htmlContent: string) => {
    if (!campaign || !artist) return;

    // Use the HTML content passed from the editor
    // const htmlContent = campaign.message || "";

    console.log(
      "Campaign Editor - handleSave called with content length:",
      htmlContent.length
    );
    console.log(
      "Campaign Editor - HTML content preview:",
      htmlContent.substring(0, 200) + "..."
    );

    try {
      // Generate the complete HTML email with footer if on starter plan
      const completeHtml = generateEmailHtml({
        title: campaign.subject || "Email Campaign",
        previewText: campaign.title || "",
        content: htmlContent,
        subscriptionPlan: getUserSubscriptionPlan(artist),
      });

      const updateData = {
        message: completeHtml,
        // Clear template_id and template_data once the campaign has been edited
        // This ensures future edits use the HTML content, not the original template
        template_id: null,
        template_data: null,
        updated_at: new Date().toISOString(),
      };

      console.log(
        "Campaign Editor - Sending update with complete HTML length:",
        completeHtml.length
      );

      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Campaign Editor - Save successful:", result);
        alert("Campaign saved successfully!");

        // Update local state to reflect the changes
        setCampaign((prev) =>
          prev
            ? {
                ...prev,
                message: completeHtml,
                template_id: null,
                template_data: null,
                updated_at: new Date().toISOString(),
              }
            : null
        );
      } else {
        const errorData = await response.json();
        console.error("Campaign Editor - Save failed:", errorData);
        throw new Error(errorData.error || "Failed to save campaign");
      }
    } catch (error) {
      console.error("Error saving campaign:", error);
      alert(
        `Failed to save campaign: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleSend = async (data: {
    subject: string;
    previewText: string;
    content: string;
  }) => {
    if (!campaign || !artist) return;

    const confirmMessage = `Are you sure you want to send this campaign to all ${fanCount} subscribers?\n\nThis action cannot be undone.`;

    if (confirm(confirmMessage)) {
      try {
        // Generate the complete HTML email with footer if on starter plan
        const completeHtml = generateEmailHtml({
          title: data.subject,
          previewText: data.previewText,
          content: data.content,
          subscriptionPlan: getUserSubscriptionPlan(artist),
        });

        // Update the campaign with the latest content, subject, and preview text
        const updateResponse = await fetch(`/api/campaigns/${campaignId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject: data.subject,
            title: data.previewText, // title field is used for preview text
            message: completeHtml,
            template_id: null,
            template_data: null,
            updated_at: new Date().toISOString(),
          }),
        });

        if (!updateResponse.ok) {
          const errorData = await updateResponse.json();
          throw new Error(errorData.error || "Failed to update campaign");
        }

        // Show the sending modal instead of alert
        setShowSendingModal(true);
      } catch (error) {
        console.error("Error preparing campaign:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        alert(`Failed to prepare campaign: ${errorMessage}`);
      }
    }
  };

  const handleSendingComplete = (result: {
    success: boolean;
    queued?: boolean;
    sentCount?: number;
    failedCount?: number;
    totalCount: number;
    errors?: string[];
    jobId?: string;
    estimatedTime?: string;
    status?: string;
  }) => {
    // The modal will handle the redirect to analytics
    console.log("Campaign sending completed:", result);
  };

  const handleCloseSendingModal = () => {
    setShowSendingModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-neutral-100 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-neutral-400">
            Loading campaign...
          </p>
        </div>
      </div>
    );
  }

  if (!campaign || !artist) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">Campaign not found</p>
      </div>
    );
  }

  // Don't allow editing sent campaigns
  if (campaign.status === "sent") {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-neutral-400">
          This campaign has already been sent and cannot be edited.
        </p>
        <button
          onClick={() => router.push("/dashboard/campaigns")}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          Back to Campaigns
        </button>
      </div>
    );
  }

  // Get the template ID (either from template_id or _originalTemplateId)
  const templateId =
    campaign.template_id ||
    (campaign.template_data as any)?._originalTemplateId;

  // Minimal logging for debugging

  // Check if this is a Spotify-generated campaign
  const isSpotifyGenerated =
    templateId === "spotify-generated" ||
    (campaign.template_data as any)?._originalTemplateId ===
      "spotify-generated";

  // Check if this campaign has been edited (has real HTML content)
  const hasBeenEdited =
    campaign.message &&
    campaign.message !== "Template-based email content" &&
    campaign.message.trim().length > 0 &&
    campaign.message !== "<p>Start writing your email content here...</p>" &&
    !campaign.template_data; // If template_data is null, it means it was edited

  let initialHtml = "";
  let useTemplateData = false;

  if (hasBeenEdited) {
    // If the campaign has been edited, we need to handle the HTML content
    // For now, we'll start with a basic structure and let the user re-edit
    // TODO: Implement proper HTML to JSON conversion for better UX
    initialHtml = "";
    useTemplateData = false;
    // Campaign has been edited
  } else {
    // Only use template data for campaigns that haven't been edited yet
    if (isSpotifyGenerated && campaign.template_data) {
      useTemplateData = true;
      initialHtml = "";
      // Using Spotify template data
    } else if (campaign.template_data) {
      useTemplateData = true;
      initialHtml = "";
      // Using template data
    } else {
      initialHtml = campaign.message || "";
      useTemplateData = false;
      // Using fallback content
    }
  }

  // Configuration ready

  return (
    <div>
      {hasBeenEdited && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4 mx-6 mt-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Previously Edited Campaign
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <p>
                  This campaign has been previously edited and saved. Your
                  content is preserved and will be sent as-is. You can continue
                  editing using the editor below, and your changes will be saved
                  when you click "Save Draft".
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <MailyEditor
        initialHtml={initialHtml}
        templateId={useTemplateData ? templateId : undefined}
        templateData={useTemplateData ? campaign.template_data : undefined}
        fanCount={fanCount}
        subscriptionPlan={getUserSubscriptionPlan(artist)}
        subject={campaign.subject || ""}
        previewText={campaign.preview_text || ""}
        fromName={campaign.from_name || artist.default_from_name || artist.name}
        artist={artist}
        onBack={() => router.push("/dashboard/campaigns")}
        onSave={handleSave}
        onSend={handleSend}
      />

      {/* Sending Modal */}
      <CampaignSendingModal
        isOpen={showSendingModal}
        onClose={handleCloseSendingModal}
        campaignId={campaignId}
        fanCount={fanCount}
        onComplete={handleSendingComplete}
      />
    </div>
  );
}
