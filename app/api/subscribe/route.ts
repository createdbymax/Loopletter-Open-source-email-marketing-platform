import { NextRequest, NextResponse } from 'next/server';
import { getArtistBySlug, addFan } from '@/lib/db';
import { Fan } from '@/lib/types';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, name, artist_slug, source = 'api' } = body;

        if (!email || !artist_slug) {
            return NextResponse.json(
                { error: 'Email and artist slug are required' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Please enter a valid email address' },
                { status: 400 }
            );
        }

        // Get artist
        const artist = await getArtistBySlug(artist_slug);
        if (!artist) {
            return NextResponse.json(
                { error: 'Artist not found' },
                { status: 404 }
            );
        }

        // Check if fan already exists
        const { supabase } = await import('@/lib/supabase');
        const { data: existingFan } = await supabase
            .from('fans')
            .select('id, status')
            .eq('email', email)
            .eq('artist_id', artist.id)
            .single();

        if (existingFan) {
            if (existingFan.status === 'subscribed') {
                return NextResponse.json(
                    { error: 'You are already subscribed!' },
                    { status: 400 }
                );
            } else if (existingFan.status === 'unsubscribed') {
                // Resubscribe the fan
                const { data: resubscribedFan, error } = await supabase
                    .from('fans')
                    .update({
                        status: 'subscribed',
                        unsubscribed_at: null,
                        updated_at: new Date().toISOString(),
                        name: name || null,
                        source,
                    })
                    .eq('id', existingFan.id)
                    .select()
                    .single();

                if (error) throw error;

                return NextResponse.json({
                    success: true,
                    message: 'Welcome back! You have been resubscribed.',
                    fan: resubscribedFan,
                });
            }
        }

        // Create new fan
        const newFan: Omit<Fan, 'id'> = {
            email,
            name: name || null,
            artist_id: artist.id,
            status: 'subscribed',
            source,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const fan = await addFan(newFan);

        // TODO: Send welcome email
        // await sendWelcomeEmail(fan, artist);

        return NextResponse.json({
            success: true,
            message: 'Successfully subscribed!',
            fan: {
                id: fan.id,
                email: fan.email,
                name: fan.name,
                status: fan.status,
            },
        });

    } catch (error) {
        console.error('Subscription error:', error);

        if (error instanceof Error && error.message.includes('already exists')) {
            return NextResponse.json(
                { error: 'You are already subscribed!' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to subscribe. Please try again.' },
            { status: 500 }
        );
    }
}