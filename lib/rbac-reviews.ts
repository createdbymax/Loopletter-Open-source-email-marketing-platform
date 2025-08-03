import { supabase } from './supabase';
import { currentUser } from '@clerk/nextjs/server';
import { getOrCreateArtistByClerkId } from './db';

// Define permissions for review management
export const REVIEW_PERMISSIONS = {
  VIEW_REVIEWS: 'view_reviews',
  APPROVE_REVIEWS: 'approve_reviews',
  REJECT_REVIEWS: 'reject_reviews',
  MANAGE_QUARANTINE: 'manage_quarantine'
} as const;

// Role-based permissions mapping
export const ROLE_PERMISSIONS = {
  owner: [
    REVIEW_PERMISSIONS.VIEW_REVIEWS,
    REVIEW_PERMISSIONS.APPROVE_REVIEWS,
    REVIEW_PERMISSIONS.REJECT_REVIEWS,
    REVIEW_PERMISSIONS.MANAGE_QUARANTINE
  ],
  admin: [
    REVIEW_PERMISSIONS.VIEW_REVIEWS,
    REVIEW_PERMISSIONS.APPROVE_REVIEWS,
    REVIEW_PERMISSIONS.REJECT_REVIEWS,
    REVIEW_PERMISSIONS.MANAGE_QUARANTINE
  ],
  editor: [
    REVIEW_PERMISSIONS.VIEW_REVIEWS
  ],
  viewer: []
} as const;

export type ReviewPermission = typeof REVIEW_PERMISSIONS[keyof typeof REVIEW_PERMISSIONS];
export type UserRole = keyof typeof ROLE_PERMISSIONS;

// Super admin email - only this user can access admin features
const SUPER_ADMIN_EMAIL = 'maxjasper@icloud.com';

/**
 * Check if user is the super admin using Clerk metadata
 */
export async function isSuperAdmin(clerkUserId: string): Promise<boolean> {
  try {
    // First check Clerk metadata (faster)
    const { clerkClient } = await import('@clerk/nextjs/server');
    const client = await clerkClient();
    const user = await client.users.getUser(clerkUserId);
    
    // Check if user has admin role in metadata
    if (user.publicMetadata?.role === 'super_admin') {
      return true;
    }
    
    // Fallback to email check for initial setup
    const userEmail = user.primaryEmailAddress?.emailAddress;
    if (userEmail === SUPER_ADMIN_EMAIL) {
      // Auto-promote the super admin user
      await client.users.updateUserMetadata(clerkUserId, {
        publicMetadata: { role: 'super_admin' }
      });
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking super admin status:', error);
    
    // Fallback to database check if Clerk fails
    try {
      const { data: artist, error: dbError } = await supabase
        .from('artists')
        .select('email')
        .eq('clerk_user_id', clerkUserId)
        .single();

      if (dbError || !artist) {
        return false;
      }

      return artist.email === SUPER_ADMIN_EMAIL;
    } catch (dbError) {
      console.error('Database fallback also failed:', dbError);
      return false;
    }
  }
}

/**
 * Get user's role and permissions for an artist account
 */
export async function getUserRoleAndPermissions(clerkUserId: string, artistId?: string): Promise<{
  role: UserRole | null;
  permissions: ReviewPermission[];
  isOwner: boolean;
  canAccessReviews: boolean;
  isSuperAdmin: boolean;
}> {
  try {
    // Check if user is super admin first
    const superAdmin = await isSuperAdmin(clerkUserId);
    
    if (superAdmin) {
      // Super admin has all permissions
      return {
        role: 'owner',
        permissions: [...ROLE_PERMISSIONS.owner],
        isOwner: true,
        canAccessReviews: true,
        isSuperAdmin: true
      };
    }

    // For non-super-admin users, deny access to admin features
    return {
      role: null,
      permissions: [],
      isOwner: false,
      canAccessReviews: false,
      isSuperAdmin: false
    };

    // Original logic commented out - only super admin can access now
    /*
    // First check if user is the artist owner
    const { data: artist, error: artistError } = await supabase
      .from('artists')
      .select('id, clerk_user_id')
      .eq('clerk_user_id', clerkUserId)
      .single();

    if (!artistError && artist) {
      // User is the artist owner
      return {
        role: 'owner',
        permissions: ROLE_PERMISSIONS.owner,
        isOwner: true,
        canAccessReviews: true,
        isSuperAdmin: false
      };
    }
    */

    // Original team member logic commented out - only super admin can access now
    /*
    // If artistId is provided, check team membership
    if (artistId) {
      const { data: teamMember, error: teamError } = await supabase
        .from('team_members')
        .select('role, permissions, status')
        .eq('artist_id', artistId)
        .eq('email', clerkUserId) // This might need to be adjusted based on how team members are linked
        .eq('status', 'active')
        .single();

      if (!teamError && teamMember) {
        const role = teamMember.role as UserRole;
        const permissions = ROLE_PERMISSIONS[role] || [];
        
        return {
          role,
          permissions,
          isOwner: false,
          canAccessReviews: permissions.includes(REVIEW_PERMISSIONS.VIEW_REVIEWS),
          isSuperAdmin: false
        };
      }
    }
    */

  } catch (error) {
    console.error('Error checking user permissions:', error);
    return {
      role: null,
      permissions: [],
      isOwner: false,
      canAccessReviews: false,
      isSuperAdmin: false
    };
  }
}

/**
 * Check if user has specific permission
 */
export async function hasPermission(
  clerkUserId: string, 
  permission: ReviewPermission
): Promise<boolean> {
  // Only super admin has permissions
  return await isSuperAdmin(clerkUserId);
}

/**
 * Middleware to check review access permissions
 */
export async function requireReviewAccess() {
  const user = await currentUser();
  
  if (!user) {
    throw new Error('Unauthorized: No user found');
  }

  // Check if user is super admin
  const superAdmin = await isSuperAdmin(user.id);
  
  if (!superAdmin) {
    throw new Error('Forbidden: Admin access restricted to authorized personnel only');
  }

  // Get artist for this user (super admin can access any artist's data)
  const artist = await getOrCreateArtistByClerkId(
    user.id,
    user.primaryEmailAddress?.emailAddress || '',
    user.fullName || 'Artist'
  );

  return {
    user,
    artist,
    role: 'owner' as UserRole,
    permissions: [...ROLE_PERMISSIONS.owner],
    isOwner: true,
    isSuperAdmin: true
  };
}

/**
 * Get team members who can access reviews
 */
export async function getReviewAccessibleMembers(artistId: string) {
  try {
    const { data: teamMembers, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('artist_id', artistId)
      .eq('status', 'active')
      .in('role', ['owner', 'admin', 'editor']);

    if (error) {
      console.error('Error fetching team members:', error);
      return [];
    }

    return teamMembers?.filter(member => {
      const role = member.role as UserRole;
      const permissions = ROLE_PERMISSIONS[role] as readonly ReviewPermission[];
      return permissions.includes(REVIEW_PERMISSIONS.VIEW_REVIEWS);
    }) || [];

  } catch (error) {
    console.error('Error getting review accessible members:', error);
    return [];
  }
}

/**
 * Log review action for audit trail
 */
export async function logReviewAction(
  artistId: string,
  reviewId: string,
  action: 'viewed' | 'approved' | 'rejected' | 'flagged',
  userId: string,
  details?: Record<string, any>
) {
  try {
    await supabase
      .from('compliance_audit_logs')
      .insert({
        artist_id: artistId,
        action: `review_${action}`,
        details: {
          review_id: reviewId,
          user_id: userId,
          timestamp: new Date().toISOString(),
          ...details
        },
        timestamp: new Date().toISOString()
      });
  } catch (error) {
    console.error('Error logging review action:', error);
    // Don't throw - audit logging shouldn't break the main flow
  }
}