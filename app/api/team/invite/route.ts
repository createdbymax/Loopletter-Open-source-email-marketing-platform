import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { getOrCreateArtistByClerkId } from '@/lib/db';
import { hasPermission } from '@/lib/rbac';
import { v4 as uuidv4 } from 'uuid';
import { sendTeamInvitationEmail } from '@/lib/email-sender';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the artist associated with the current user
    const artist = await getOrCreateArtistByClerkId(userId, '', '');

    // Check if the user has permission to invite team members
    // If they're the owner, they automatically have permission
    if (artist.clerk_user_id !== userId) {
      // Check if they're a team member with invite permissions
      const { data: teamMember } = await supabase
        .from('team_members')
        .select('*')
        .eq('artist_id', artist.id)
        .eq('email', artist.email)
        .single();

      if (!teamMember || !hasPermission(teamMember, 'team.invite')) {
        return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
      }
    }

    // Parse the request body
    const { email, name, role, permissions = [] } = await request.json();

    // Validate input
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!['admin', 'editor', 'viewer'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Check if the email is already a team member
    const { data: existingMember } = await supabase
      .from('team_members')
      .select('id, status')
      .eq('artist_id', artist.id)
      .eq('email', email)
      .single();

    if (existingMember) {
      if (existingMember.status === 'active') {
        return NextResponse.json({ error: 'User is already a team member' }, { status: 400 });
      } else if (existingMember.status === 'pending') {
        return NextResponse.json({ error: 'Invitation already sent to this email' }, { status: 400 });
      }
    }

    // Generate invitation token
    const invitationToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    // Create team member record
    const { data: teamMember, error } = await supabase
      .from('team_members')
      .insert({
        artist_id: artist.id,
        email,
        name: name || email.split('@')[0],
        role,
        permissions,
        invited_at: new Date().toISOString(),
        status: 'pending',
        invitation_token: invitationToken,
        invitation_expires_at: expiresAt.toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating team member:', error);
      return NextResponse.json({ error: 'Failed to create team member' }, { status: 500 });
    }

    // Send invitation email
    try {
      await sendTeamInvitationEmail({
        to: email,
        artistName: artist.name,
        inviterName: artist.name,
        role,
        invitationUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/team/accept-invitation?token=${invitationToken}`
      });
    } catch (emailError) {
      console.error('Error sending invitation email:', emailError);
      // Continue even if email fails, as the invitation is still created
    }

    return NextResponse.json(teamMember);
  } catch (error) {
    console.error('Error inviting team member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}