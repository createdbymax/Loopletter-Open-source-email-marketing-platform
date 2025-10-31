import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { getOrCreateArtistByClerkId, createAutomation, getAutomationsByArtist } from '@/lib/db';
import { canAccessFeature } from '@/lib/subscription';
export async function GET(request: NextRequest) {
    try {
        const { userId } = getAuth(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const artist = await getOrCreateArtistByClerkId(userId, '', '');
        if (!canAccessFeature(artist, 'automations')) {
            return NextResponse.json({
                error: 'Feature not available',
                message: `This feature requires an upgrade to access.`,
                feature: 'automations',
                upgradeUrl: `/dashboard/settings?tab=subscription&feature=automations`,
            }, { status: 403 });
        }
        const automations = await getAutomationsByArtist(artist.id);
        return NextResponse.json(automations);
    }
    catch (error) {
        console.error('Error fetching automations:', error);
        return NextResponse.json({ error: 'Failed to fetch automations' }, { status: 500 });
    }
}
export async function POST(request: NextRequest) {
    try {
        const { userId } = getAuth(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const artist = await getOrCreateArtistByClerkId(userId, '', '');
        if (!canAccessFeature(artist, 'automations')) {
            return NextResponse.json({
                error: 'Feature not available',
                message: `This feature requires an upgrade to access.`,
                feature: 'automations',
                upgradeUrl: `/dashboard/settings?tab=subscription&feature=automations`,
            }, { status: 403 });
        }
        const data = await request.json();
        const automation = await createAutomation({
            name: data.name,
            description: data.description || '',
            artist_id: artist.id,
            trigger: data.trigger,
            actions: data.actions || [],
            status: 'draft',
        });
        return NextResponse.json(automation);
    }
    catch (error) {
        console.error('Error creating automation:', error);
        return NextResponse.json({ error: 'Failed to create automation' }, { status: 500 });
    }
}
