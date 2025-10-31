import { NextRequest, NextResponse } from 'next/server';
import { approveFan } from '@/lib/spam-prevention';
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
        await logReviewAction(artist.id, reviewId, 'approved', user.id, {
            role,
            notes,
            timestamp: new Date().toISOString()
        });
        await approveFan(reviewId, user.id, notes);
        return NextResponse.json({
            success: true,
            message: 'Fan approved successfully'
        });
    }
    catch (error) {
        console.error('Error approving fan:', error);
        if (error instanceof Error && error.message.includes('Forbidden')) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: error.message }, { status: 401 });
        }
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Failed to approve fan'
        }, { status: 500 });
    }
}
