import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getOrCreateArtistByClerkId, updateArtist } from '@/lib/db';
export async function POST(request: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const body = await request.json();
        const { slug } = body;
        if (!slug || typeof slug !== 'string') {
            return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
        }
        const slugRegex = /^[a-z0-9-]+$/;
        if (!slugRegex.test(slug)) {
            return NextResponse.json({
                error: 'Invalid slug format. Use only lowercase letters, numbers, and hyphens.'
            }, { status: 400 });
        }
        if (slug.length < 2 || slug.length > 50) {
            return NextResponse.json({
                error: 'Slug must be between 2 and 50 characters long.'
            }, { status: 400 });
        }
        const artist = await getOrCreateArtistByClerkId(user.id, user.primaryEmailAddress?.emailAddress || '', user.fullName || 'Artist');
        if (artist.slug === slug) {
            return NextResponse.json({
                success: true,
                message: 'Slug is already set to this value.',
                artist: { ...artist, slug }
            });
        }
        const checkResponse = await fetch(`${request.nextUrl.origin}/api/check-slug?slug=${encodeURIComponent(slug)}`, {
            headers: {
                'Cookie': request.headers.get('Cookie') || ''
            }
        });
        const checkData = await checkResponse.json();
        if (!checkData.available) {
            return NextResponse.json({
                error: checkData.error || 'Slug is not available'
            }, { status: 400 });
        }
        const updatedArtist = await updateArtist(artist.id, { slug });
        return NextResponse.json({
            success: true,
            message: 'Slug updated successfully!',
            artist: updatedArtist
        });
    }
    catch (error) {
        console.error('Error updating slug:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
