import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getOrCreateArtistByClerkId, getCampaignById, updateCampaign, deleteCampaign } from '@/lib/db';
export async function GET(request: NextRequest, { params }: {
    params: Promise<{
        id: string;
    }>;
}) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { id } = await params;
        const artist = await getOrCreateArtistByClerkId(user.id, user.primaryEmailAddress?.emailAddress || '', user.fullName || 'Artist');
        const campaign = await getCampaignById(id);
        if (!campaign) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }
        if (campaign.artist_id !== artist.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
        return NextResponse.json(campaign);
    }
    catch (error) {
        console.error('Error fetching campaign:', error);
        return NextResponse.json({ error: 'Failed to fetch campaign' }, { status: 500 });
    }
}
export async function PUT(request: NextRequest, { params }: {
    params: Promise<{
        id: string;
    }>;
}) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { id } = await params;
        const body = await request.json();
        console.log('Campaign API - PUT request for campaign:', id);
        console.log('Campaign API - Update data:', {
            ...body,
            message: body.message ? `${body.message.substring(0, 100)}...` : 'No message'
        });
        const artist = await getOrCreateArtistByClerkId(user.id, user.primaryEmailAddress?.emailAddress || '', user.fullName || 'Artist');
        const existingCampaign = await getCampaignById(id);
        if (!existingCampaign) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }
        if (existingCampaign.artist_id !== artist.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
        if (existingCampaign.status === 'sent') {
            return NextResponse.json({ error: 'Cannot edit sent campaigns' }, { status: 400 });
        }
        const updateData = {
            ...body,
            updated_at: new Date().toISOString()
        };
        console.log('Campaign API - Calling updateCampaign with:', {
            ...updateData,
            message: updateData.message ? `${updateData.message.substring(0, 100)}...` : 'No message'
        });
        const updatedCampaign = await updateCampaign(id, updateData);
        console.log('Campaign API - Update successful:', {
            id: updatedCampaign.id,
            title: updatedCampaign.title,
            messageLength: updatedCampaign.message?.length || 0
        });
        return NextResponse.json(updatedCampaign);
    }
    catch (error) {
        console.error('Error updating campaign:', error);
        return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 });
    }
}
export async function DELETE(request: NextRequest, { params }: {
    params: Promise<{
        id: string;
    }>;
}) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { id } = await params;
        const artist = await getOrCreateArtistByClerkId(user.id, user.primaryEmailAddress?.emailAddress || '', user.fullName || 'Artist');
        const existingCampaign = await getCampaignById(id);
        if (!existingCampaign) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }
        if (existingCampaign.artist_id !== artist.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
        if (existingCampaign.status === 'sent') {
            return NextResponse.json({ error: 'Cannot delete sent campaigns' }, { status: 400 });
        }
        await deleteCampaign(id);
        return NextResponse.json({ success: true });
    }
    catch (error) {
        console.error('Error deleting campaign:', error);
        return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 });
    }
}
