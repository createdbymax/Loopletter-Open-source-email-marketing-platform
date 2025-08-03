import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getOrCreateArtistByClerkId, createCampaignWithDefaults } from '@/lib/db';
import { validateFromEmail, generateDefaultFromEmail } from '@/lib/domain-security';
import { serverAnalytics } from '@/lib/server-analytics';
import type { CampaignFormData } from '@/lib/types';

// Helper function to validate UUID format
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get artist
    const artist = await getOrCreateArtistByClerkId(
      user.id,
      user.primaryEmailAddress?.emailAddress || '',
      user.fullName || 'Artist'
    );

    const body = await request.json();
    const { title, subject, message, status, template_id, templateData, settings, from_name, from_email } = body;

    // Validate required fields - be more lenient for drafts and template-based campaigns
    if (status === 'sent' || status === 'sending') {
      // For sent campaigns, require title and subject
      if (!title || !subject) {
        return NextResponse.json({ 
          error: 'Title and subject are required for sending campaigns' 
        }, { status: 400 });
      }
      
      // For message, allow template-based campaigns to have placeholder content
      if (!message && !templateData) {
        return NextResponse.json({ 
          error: 'Message content or template data is required for sending campaigns' 
        }, { status: 400 });
      }
    } else {
      // For drafts, only require at least one field to be present
      if (!title && !subject && !message && !templateData) {
        return NextResponse.json({ 
          error: 'At least one of title, subject, message, or template data is required' 
        }, { status: 400 });
      }
    }

    // Validate from_email if provided
    let validatedFromEmail = from_email;
    if (from_email) {
      const emailValidation = await validateFromEmail(artist.id, from_email);
      if (!emailValidation.valid) {
        return NextResponse.json({ 
          error: `Invalid from email: ${emailValidation.reason}` 
        }, { status: 400 });
      }
      validatedFromEmail = from_email;
    } else {
      // Generate safe default
      validatedFromEmail = generateDefaultFromEmail(artist);
    }

    // Validate template_id - if it's not a valid UUID, set to null for now
    // This handles cases like "spotify-generated" which are string identifiers
    let validTemplateId = template_id;
    let enhancedTemplateData = templateData;
    
    if (template_id && !isValidUUID(template_id)) {
      console.log(`Template ID "${template_id}" is not a valid UUID, storing in template_data instead`);
      validTemplateId = null;
      
      // Store the original template identifier in template_data so we don't lose it
      enhancedTemplateData = {
        ...templateData,
        _originalTemplateId: template_id
      };
    }

    // Prepare campaign data
    const campaignData: CampaignFormData = {
      title,
      subject,
      message,
      from_name: from_name || artist.default_from_name || artist.name,
      from_email: validatedFromEmail,
      template_id: validTemplateId,
      template_data: enhancedTemplateData,
      settings: settings || {
        send_time_optimization: false,
        track_opens: true,
        track_clicks: true,
        auto_tweet: false,
        send_to_unsubscribed: false,
      },
    };

    // Save campaign to database
    console.log('Creating campaign with data:', campaignData);
    const campaign = await createCampaignWithDefaults(campaignData, artist.id);
    console.log('Campaign created successfully:', campaign);

    // Track campaign creation
    await serverAnalytics.track(user.id, 'Campaign Created', {
      campaign_id: campaign.id,
      campaign_title: title,
      campaign_type: template_id ? 'template' : 'custom',
      template_id: template_id,
      has_subject: !!subject,
      has_message: !!message,
      status: status || 'draft',
    });

    // Update status if it's being sent immediately
    if (status === 'sent' || status === 'sending') {
      // TODO: Update campaign status to 'sent' and set send_date
      // This would require an updateCampaign function
    }

    return NextResponse.json({ 
      success: true,
      campaign,
      message: status === 'sending' ? 'Campaign created and sending' : 'Campaign saved as draft'
    });

  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get artist
    const artist = await getOrCreateArtistByClerkId(
      user.id,
      user.primaryEmailAddress?.emailAddress || '',
      user.fullName || 'Artist'
    );

    // Fetch campaigns from database
    const { getCampaignsByArtist } = await import('@/lib/db');
    const campaigns = await getCampaignsByArtist(artist.id);

    return NextResponse.json({ 
      success: true,
      campaigns,
      total: campaigns.length
    });

  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}