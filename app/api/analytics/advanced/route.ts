import { NextRequest, NextResponse } from 'next/server';
import { withFeatureAccess } from '@/app/api/middleware/feature-access';
import { getArtistAnalytics } from '@/lib/db';
import { Artist } from '@/lib/types';

// Handler for advanced analytics data
async function handler(req: NextRequest, artist: Artist) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') as 'day' | 'week' | 'month' | 'year' || 'month';

    // Get basic analytics data
    const analytics = await getArtistAnalytics(artist.id, period);

    // Add advanced analytics data
    const advancedData = {
      ...analytics,
      advanced: {
        // Location data
        locations: [
          { city: 'New York', country: 'US', count: 245 },
          { city: 'Los Angeles', country: 'US', count: 187 },
          { city: 'London', country: 'UK', count: 156 },
          { city: 'Berlin', country: 'DE', count: 98 },
          { city: 'Paris', country: 'FR', count: 87 },
        ],
        // Device data
        devices: [
          { type: 'Mobile', count: 1245, percentage: 62 },
          { type: 'Desktop', count: 687, percentage: 34 },
          { type: 'Tablet', count: 78, percentage: 4 },
        ],
        // Email client data
        emailClients: [
          { name: 'Gmail', count: 876, percentage: 43 },
          { name: 'Apple Mail', count: 543, percentage: 27 },
          { name: 'Outlook', count: 321, percentage: 16 },
          { name: 'Yahoo Mail', count: 187, percentage: 9 },
          { name: 'Other', count: 98, percentage: 5 },
        ],
        // Time of day data
        timeOfDay: [
          { hour: '00:00', opens: 12 },
          { hour: '01:00', opens: 8 },
          { hour: '02:00', opens: 5 },
          { hour: '03:00', opens: 3 },
          { hour: '04:00', opens: 2 },
          { hour: '05:00', opens: 4 },
          { hour: '06:00', opens: 15 },
          { hour: '07:00', opens: 45 },
          { hour: '08:00', opens: 87 },
          { hour: '09:00', opens: 134 },
          { hour: '10:00', opens: 156 },
          { hour: '11:00', opens: 143 },
          { hour: '12:00', opens: 132 },
          { hour: '13:00', opens: 121 },
          { hour: '14:00', opens: 98 },
          { hour: '15:00', opens: 87 },
          { hour: '16:00', opens: 76 },
          { hour: '17:00', opens: 65 },
          { hour: '18:00', opens: 87 },
          { hour: '19:00', opens: 109 },
          { hour: '20:00', opens: 132 },
          { hour: '21:00', opens: 121 },
          { hour: '22:00', opens: 87 },
          { hour: '23:00', opens: 43 },
        ],
      }
    };

    return NextResponse.json(advancedData);
  } catch (error) {
    console.error('Error fetching advanced analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch advanced analytics' },
      { status: 500 }
    );
  }
}

// Wrap the handler with feature access middleware
export const GET = withFeatureAccess('advancedAnalytics', handler);