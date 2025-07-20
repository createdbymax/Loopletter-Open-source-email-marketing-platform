import { NextRequest, NextResponse } from 'next/server';
import { getAuth, auth } from '@clerk/nextjs/server';
import { getOrCreateArtistByClerkId, updateArtist } from '@/lib/db';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the artist associated with the current user
    const artist = await getOrCreateArtistByClerkId(userId, '', '');
    
    // Return the subscription page settings or default settings
    const settings = artist.settings?.subscription_page_settings || {
      theme: 'gradient',
      colors: {
        primary: artist.settings?.brand_colors?.primary || '#3b82f6',
        secondary: artist.settings?.brand_colors?.secondary || '#1d4ed8',
        accent: '#8b5cf6'
      },
      layout: 'default',
      header: {
        title: `Join ${artist.name}'s Inner Circle`,
        subtitle: "Get exclusive updates, early access to new music, and personal messages",
        show_social_links: true,
        show_artist_image: false,
        artist_image_url: null
      },
      form: {
        button_text: "Join the Family",
        button_style: "gradient",
        show_name_field: true,
        placeholder_email: "your@email.com",
        placeholder_name: "Your first name"
      },
      benefits: {
        show_benefits: true,
        custom_benefits: [
          "Early access to new releases",
          "Exclusive behind-the-scenes content",
          "Personal updates and stories",
          "Tour announcements and presale access"
        ]
      },
      success_message: {
        title: "Welcome to the family! 🎉",
        message: `You're now part of ${artist.name}'s inner circle. Get ready for exclusive content, early access to new music, and behind-the-scenes updates.`
      }
    };

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching subscription page settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the artist associated with the current user
    const artist = await getOrCreateArtistByClerkId(userId, '', '');
    
    // Get settings from request body
    const { settings } = await request.json();
    
    if (!settings) {
      return NextResponse.json({ error: 'No settings provided' }, { status: 400 });
    }

    // Ensure all required ArtistSettings properties are present
    const prev = artist.settings as Partial<import('@/lib/types').ArtistSettings> || {};
    const updatedSettings = {
      timezone: prev.timezone || 'America/New_York',
      send_time_optimization: prev.send_time_optimization ?? false,
      double_opt_in: prev.double_opt_in ?? false,
      unsubscribe_redirect_url: prev.unsubscribe_redirect_url,
      brand_colors: prev.brand_colors || { primary: '#3b82f6', secondary: '#1d4ed8' },
      social_links: prev.social_links || {},
      subscription_page_settings: settings
    };

    // Update artist settings
    const updatedArtist = await updateArtist(artist.id, {
      settings: updatedSettings
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Settings updated successfully',
      settings: updatedArtist.settings?.subscription_page_settings
    });
  } catch (error) {
    console.error('Error updating subscription page settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}