import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { spotifyTemplateGenerator } from '@/lib/spotify-template-generator';
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const body = await request.json();
        const { spotifyUrl, platformLinks } = body;
        if (!spotifyUrl) {
            return NextResponse.json({ error: 'Spotify URL is required' }, { status: 400 });
        }
        const spotifyData = await spotifyTemplateGenerator.generateFromSpotifyUrl(spotifyUrl, platformLinks);
        return NextResponse.json({
            releaseData: spotifyData.releaseData,
            platformLinks: spotifyData.platformLinks,
            htmlContent: spotifyData.generatedHtml,
            mailyJson: spotifyData.mailyJson,
            colorPalette: spotifyData.colorPalette
        });
    }
    catch (error) {
        console.error('Error generating Spotify template:', error);
        if (error instanceof Error) {
            if (error.message.includes('Invalid Spotify URL')) {
                return NextResponse.json({ error: 'Invalid Spotify URL format' }, { status: 400 });
            }
            if (error.message.includes('Spotify API error')) {
                return NextResponse.json({ error: 'Failed to fetch data from Spotify' }, { status: 502 });
            }
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { searchParams } = new URL(request.url);
        const spotifyUrl = searchParams.get('url');
        if (!spotifyUrl) {
            return NextResponse.json({ error: 'Spotify URL is required' }, { status: 400 });
        }
        const spotifyData = await spotifyTemplateGenerator.generateFromSpotifyUrl(spotifyUrl);
        return NextResponse.json({
            releaseData: spotifyData.releaseData,
            platformLinks: spotifyData.platformLinks,
            previewHtml: spotifyData.generatedHtml
        });
    }
    catch (error) {
        console.error('Error previewing Spotify data:', error);
        if (error instanceof Error) {
            if (error.message.includes('Invalid Spotify URL')) {
                return NextResponse.json({ error: 'Invalid Spotify URL format' }, { status: 400 });
            }
            if (error.message.includes('Spotify API error')) {
                return NextResponse.json({ error: 'Failed to fetch data from Spotify' }, { status: 502 });
            }
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
