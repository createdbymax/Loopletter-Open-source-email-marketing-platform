import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get token from request body
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json({ error: 'Missing invitation token' }, { status: 400 });
    }
    
    // Verify the token
    const { data: invitation, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('invitation_token', token)
      .eq('status', 'pending')
      .single();
    
    if (error || !invitation) {
      return NextResponse.json({ error: 'Invalid invitation token' }, { status: 404 });
    }
    
    // Check if invitation has expired
    const expiresAt = new Date(invitation.invitation_expires_at);
    if (expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 410 });
    }
    
    // Get user's email from Clerk
    const user = await auth().getUser(userId);
    const userEmail = user.emailAddresses[0]?.emailAddress;
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }
    
    // Check if the invitation email matches the user's email
    if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
      return NextResponse.json({ 
        error: 'This invitation was sent to a different email address' 
      }, { status: 403 });
    }
    
    // Update the team member record
    const { data: updatedMember, error: updateError } = await supabase
      .from('team_members')
      .update({
        status: 'active',
        joined_at: new Date().toISOString(),
        clerk_user_id: userId,
        invitation_token: null,
        invitation_expires_at: null
      })
      .eq('id', invitation.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating team member:', updateError);
      return NextResponse.json({ error: 'Failed to accept invitation' }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Invitation accepted successfully',
      teamMember: updatedMember
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}