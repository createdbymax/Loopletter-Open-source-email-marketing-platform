import { NextRequest, NextResponse } from 'next/server';
import { withFeatureAccess } from '@/app/api/middleware/feature-access';
import { createAutomation, getAutomationsByArtist } from '@/lib/db';
import { Artist } from '@/lib/types';

// Handler for automations
async function handler(req: NextRequest, artist: Artist) {
  // GET - Fetch automations
  if (req.method === 'GET') {
    try {
      const automations = await getAutomationsByArtist(artist.id);
      return NextResponse.json(automations);
    } catch (error) {
      console.error('Error fetching automations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch automations' },
        { status: 500 }
      );
    }
  }

  // POST - Create new automation
  if (req.method === 'POST') {
    try {
      const data = await req.json();

      const automation = await createAutomation({
        name: data.name,
        description: data.description || '',
        artist_id: artist.id,
        trigger: data.trigger,
        actions: data.actions || [],
        status: 'draft',
      });

      return NextResponse.json(automation);
    } catch (error) {
      console.error('Error creating automation:', error);
      return NextResponse.json(
        { error: 'Failed to create automation' },
        { status: 500 }
      );
    }
  }

  // Method not allowed
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

// Wrap the handler with feature access middleware
export const GET = withFeatureAccess('automations', handler);
export const POST = withFeatureAccess('automations', handler);