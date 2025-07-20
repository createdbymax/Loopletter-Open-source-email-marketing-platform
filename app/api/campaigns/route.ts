import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateArtistByClerkId, createCampaignWithDefaults } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the artist associated with the current user
    const artist = await getOrCreateArtistByClerkId(userId, "", "");
    
    // Get campaign data from request
    const campaignData = await request.json();
    
    // Fix for template ID - if it's a string like "music-release", treat it as a template name, not a UUID
    if (campaignData.templateId && typeof campaignData.templateId === 'string') {
      // If it's not a UUID format, set it to null and store the name in template_data
      if (!campaignData.templateId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        if (!campaignData.templateData) {
          campaignData.templateData = {};
        }
        // Store the template name in the template_data
        campaignData.templateData.templateName = campaignData.templateId;
        campaignData.templateId = null;
      }
    }
    
    // Create the campaign
    const campaign = await createCampaignWithDefaults({
      title: campaignData.title || "Untitled Campaign",
      subject: campaignData.subject || campaignData.title || "Untitled Campaign",
      message: campaignData.message || "",
      template_id: campaignData.templateId || null,
      template_data: campaignData.templateData || null,
      segment_id: campaignData.segmentId || null,
      send_date: campaignData.sendDate || new Date().toISOString(),
      settings: campaignData.settings || {
        send_time_optimization: false,
        track_opens: true,
        track_clicks: true,
        auto_tweet: false,
        send_to_unsubscribed: false
      }
    }, artist.id);
    
    return NextResponse.json(campaign);
  } catch (error) {
    console.error("Failed to create campaign:", error);
    return NextResponse.json(
      { error: "Failed to create campaign", details: error.message },
      { status: 500 }
    );
  }
}