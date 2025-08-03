import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { cleanupExpiredDomainClaims } from '@/lib/domain-ownership-verification';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In production, you might want to restrict this to admin users only
    // For now, any authenticated user can trigger cleanup
    
    await cleanupExpiredDomainClaims();

    return NextResponse.json({
      success: true,
      message: 'Expired domain claims cleaned up successfully'
    });

  } catch (error) {
    console.error('Error during domain cleanup:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup expired domains' },
      { status: 500 }
    );
  }
}