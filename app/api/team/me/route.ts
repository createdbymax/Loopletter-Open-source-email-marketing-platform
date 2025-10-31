import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { getOrCreateArtistByClerkId } from '@/lib/db';
export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const artist = await getOrCreateArtistByClerkId(userId, '', '');
        if (artist.clerk_user_id === userId) {
            return NextResponse.json({
                id: 'owner',
                artist_id: artist.id,
                email: artist.email,
                name: artist.name,
                role: 'owner',
                permissions: [],
                invited_at: artist.created_at,
                joined_at: artist.created_at,
                status: 'active'
            });
        }
        const { data: teamMember, error } = await supabase
            .from('team_members')
            .select('*')
            .eq('artist_id', artist.id)
            .eq('email', artist.email)
            .single();
        if (error || !teamMember) {
            return NextResponse.json({ error: 'Not a team member' }, { status: 403 });
        }
        return NextResponse.json(teamMember);
    }
    catch (error) {
        console.error('Error fetching team member:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
