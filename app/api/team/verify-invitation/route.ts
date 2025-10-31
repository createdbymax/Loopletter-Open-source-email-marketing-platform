import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');
        if (!token) {
            return NextResponse.json({ error: 'Missing invitation token' }, { status: 400 });
        }
        const { data: invitation, error } = await supabase
            .from('team_members')
            .select('*, artists:artist_id(name)')
            .eq('invitation_token', token)
            .eq('status', 'pending')
            .single();
        if (error || !invitation) {
            return NextResponse.json({ error: 'Invalid invitation token' }, { status: 404 });
        }
        const expiresAt = new Date(invitation.invitation_expires_at);
        if (expiresAt < new Date()) {
            return NextResponse.json({ error: 'Invitation has expired' }, { status: 410 });
        }
        return NextResponse.json({
            id: invitation.id,
            email: invitation.email,
            role: invitation.role,
            artistId: invitation.artist_id,
            artistName: invitation.artists.name,
            expiresAt: invitation.invitation_expires_at
        });
    }
    catch (error) {
        console.error('Error verifying invitation:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
