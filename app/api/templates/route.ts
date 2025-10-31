import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { getTemplatesByArtist, createTemplate, getOrCreateArtistByClerkId } from '@/lib/db';
export async function GET(request: NextRequest) {
    try {
        const { userId } = getAuth(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const artist = await getOrCreateArtistByClerkId(userId, '', '');
        const templates = await getTemplatesByArtist(artist.id);
        return NextResponse.json(templates);
    }
    catch (error) {
        console.error('Failed to fetch templates:', error);
        return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
    }
}
export async function POST(request: NextRequest) {
    try {
        const { userId } = getAuth(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const body = await request.json();
        const { name, description, category, html_content, variables, is_public } = body;
        const artist = await getOrCreateArtistByClerkId(userId, '', '');
        const template = await createTemplate({
            name,
            description,
            category,
            html_content,
            variables: variables || [],
            is_public: is_public || false,
            artist_id: artist.id,
        });
        return NextResponse.json(template);
    }
    catch (error) {
        console.error('Failed to create template:', error);
        return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
    }
}
