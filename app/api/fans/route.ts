import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { getOrCreateArtistByClerkId, addFanWithValidation, getFansByArtist } from '@/lib/db';
import { hasReachedSubscriberLimit } from '@/lib/subscription';

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await req.json();
    
    // Get artist
    const artist = await getOrCreateArtistByClerkId(
      userId,
      '', // Email will be fetched from Clerk
      '' // Name will be fetched from Clerk
    );
    
    // Check subscriber limits
    const fans = await getFansByArtist(artist.id);
    if (hasReachedSubscriberLimit(artist, fans.length)) {
      return NextResponse.json(
        {
          error: 'Subscriber limit reached',
          message: `You've reached the maximum number of subscribers for your plan.`,
          limit: artist.subscription?.plan === 'starter' ? 1000 : 
                 artist.subscription?.plan === 'independent' ? 10000 : 50000,
          currentCount: fans.length,
          upgradeUrl: '/dashboard/settings?tab=subscription&feature=maxSubscribers',
        },
        { status: 403 }
      );
    }
    
    // Add fan
    const fan = await addFanWithValidation({
      email: data.email,
      name: data.name,
      tags: data.tags,
      custom_fields: data.custom_fields,
      source: data.source || 'manual',
    }, artist.id);
    
    return NextResponse.json(fan);
  } catch (error) {
    console.error('Error adding fan:', error);
    
    // Handle duplicate fan error
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json(
        { error: 'Fan with this email already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to add fan' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get artist
    const artist = await getOrCreateArtistByClerkId(
      userId,
      '', // Email will be fetched from Clerk
      '' // Name will be fetched from Clerk
    );
    
    // Get fans
    const fans = await getFansByArtist(artist.id);
    
    return NextResponse.json(fans);
  } catch (error) {
    console.error('Error fetching fans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fans' },
      { status: 500 }
    );
  }
}