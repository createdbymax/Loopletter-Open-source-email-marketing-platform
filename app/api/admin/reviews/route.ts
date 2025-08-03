import { NextRequest, NextResponse } from 'next/server';
import { getPendingReviews, getReviewStats } from '@/lib/spam-prevention';
import { requireReviewAccess, REVIEW_PERMISSIONS, logReviewAction } from '@/lib/rbac-reviews';

export async function GET(request: NextRequest) {
  try {
    // Check permissions
    const { user, artist, role } = await requireReviewAccess();

    // Log the access
    await logReviewAction(artist.id, 'dashboard', 'viewed', user.id, {
      role,
      timestamp: new Date().toISOString()
    });

    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('include_stats') === 'true';

    // Get pending reviews
    const pendingReviews = await getPendingReviews(artist.id);

    // Get stats if requested
    let stats = null;
    if (includeStats) {
      stats = await getReviewStats(artist.id);
    }

    // Format the response
    const formattedReviews = pendingReviews.map(review => ({
      id: review.id,
      email: review.fans?.email,
      name: review.fans?.name,
      risk_score: review.risk_score,
      flags: review.flags,
      recommendations: review.recommendations,
      review_type: review.review_type,
      auto_flagged_at: review.auto_flagged_at,
      original_data: review.original_data,
      quarantine_summary: {
        primary_concerns: review.flags?.slice(0, 3) || [],
        risk_level: review.risk_score >= 70 ? 'high' : review.risk_score >= 50 ? 'medium' : 'low',
        source: review.original_data?.source || 'unknown'
      }
    }));

    return NextResponse.json({
      success: true,
      reviews: formattedReviews,
      stats,
      total: formattedReviews.length,
      user_info: {
        role,
        can_approve: role === 'owner' || role === 'admin',
        can_reject: role === 'owner' || role === 'admin'
      }
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    
    // Handle permission errors specifically
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}