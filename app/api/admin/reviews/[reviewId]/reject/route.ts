import { NextRequest, NextResponse } from 'next/server';
import { rejectFan } from '@/lib/spam-prevention';
import { requireReviewAccess, REVIEW_PERMISSIONS, logReviewAction } from '@/lib/rbac-reviews';
export async function POST(request: NextRequest, { params }: {
    params: Promise<{
        reviewId: string;
    }>;
}) {
    try {
        const { user, artist, role } = await requireReviewAccess();
        const { reviewId } = await params;
        const body = await request.json();
        const { notes } = body;
        if (!reviewId) {
            return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
        }
        await logReviewAction(artist.id, reviewId, 'rejected', user.id, {
            role,
            notes,
            timestamp: new Date().toISOString()
        });
        await rejectFan(reviewId, user.id, notes);
        return NextResponse.json({
            success: true,
            message: 'Fan rejected successfully'
        });
    }
    catch (error) {
        console.error('Error rejecting fan:', error);
        if (error instanceof Error && error.message.includes('Forbidden')) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: error.message }, { status: 401 });
        }
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Failed to reject fan'
        }, { status: 500 });
    }
}
