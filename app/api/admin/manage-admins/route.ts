import { NextRequest, NextResponse } from 'next/server';
import { requireReviewAccess, REVIEW_PERMISSIONS } from '@/lib/rbac-reviews';
import { promoteUserToSuperAdmin, demoteUserFromSuperAdmin, listSuperAdmins } from '@/lib/admin-utils';

// GET - List all super admins
export async function GET() {
  try {
    // Only super admins can manage other admins
    await requireReviewAccess();

    const superAdmins = await listSuperAdmins();

    return NextResponse.json({
      success: true,
      admins: superAdmins
    });

  } catch (error) {
    console.error('Error listing super admins:', error);
    
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to list super admins' },
      { status: 500 }
    );
  }
}

// POST - Promote user to super admin
export async function POST(request: NextRequest) {
  try {
    // Only super admins can manage other admins
    await requireReviewAccess();

    const body = await request.json();
    const { email, action } = body;

    if (!email || !action) {
      return NextResponse.json(
        { error: 'Email and action are required' },
        { status: 400 }
      );
    }

    let success = false;
    let message = '';

    if (action === 'promote') {
      success = await promoteUserToSuperAdmin(email);
      message = success ? `Successfully promoted ${email} to super admin` : `Failed to promote ${email}`;
    } else if (action === 'demote') {
      success = await demoteUserFromSuperAdmin(email);
      message = success ? `Successfully removed super admin status from ${email}` : `Failed to demote ${email}`;
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "promote" or "demote"' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success,
      message
    });

  } catch (error) {
    console.error('Error managing super admin:', error);
    
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to manage super admin' },
      { status: 500 }
    );
  }
}