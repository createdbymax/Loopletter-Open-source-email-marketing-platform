import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateArtistByClerkId, getTeamMembersByArtist, inviteTeamMember } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the artist associated with the current user
    const artist = await getOrCreateArtistByClerkId(userId, "", "");
    
    // Get team members for this artist
    const teamMembers = await getTeamMembersByArtist(artist.id);
    
    return NextResponse.json(teamMembers);
  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the artist associated with the current user
    const artist = await getOrCreateArtistByClerkId(userId, "", "");
    
    // Only allow the artist owner to invite team members
    if (userId !== artist.clerk_user_id) {
      return NextResponse.json(
        { error: "Only the artist owner can invite team members" },
        { status: 403 }
      );
    }
    
    // Get the new team member data from the request
    const newMember = await request.json();
    
    // Validate required fields
    if (!newMember.email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }
    
    // Add artist_id to the new member
    const memberToInvite = {
      ...newMember,
      artist_id: artist.id,
      status: "pending"
    };
    
    // Invite the team member
    const invitedMember = await inviteTeamMember(memberToInvite);
    
    // TODO: Send invitation email to the team member
    
    return NextResponse.json(invitedMember);
  } catch (error) {
    console.error("Error inviting team member:", error);
    return NextResponse.json(
      { error: "Failed to invite team member" },
      { status: 500 }
    );
  }
}