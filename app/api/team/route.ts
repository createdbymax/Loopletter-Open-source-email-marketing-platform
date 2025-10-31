import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateArtistByClerkId, getTeamMembersByArtist, inviteTeamMember } from "@/lib/db";
export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const artist = await getOrCreateArtistByClerkId(userId, "", "");
        const teamMembers = await getTeamMembersByArtist(artist.id);
        return NextResponse.json(teamMembers);
    }
    catch (error) {
        console.error("Error fetching team members:", error);
        return NextResponse.json({ error: "Failed to fetch team members" }, { status: 500 });
    }
}
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const artist = await getOrCreateArtistByClerkId(userId, "", "");
        if (userId !== artist.clerk_user_id) {
            return NextResponse.json({ error: "Only the artist owner can invite team members" }, { status: 403 });
        }
        const newMember = await request.json();
        if (!newMember.email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }
        const memberToInvite = {
            ...newMember,
            artist_id: artist.id,
            status: "pending"
        };
        const invitedMember = await inviteTeamMember(memberToInvite);
        return NextResponse.json(invitedMember);
    }
    catch (error) {
        console.error("Error inviting team member:", error);
        return NextResponse.json({ error: "Failed to invite team member" }, { status: 500 });
    }
}
