import { supabase } from './supabase';
import { currentUser } from '@clerk/nextjs/server';
import { getOrCreateArtistByClerkId } from './db';
export const REVIEW_PERMISSIONS = {
    VIEW_REVIEWS: 'view_reviews',
    APPROVE_REVIEWS: 'approve_reviews',
    REJECT_REVIEWS: 'reject_reviews',
    MANAGE_QUARANTINE: 'manage_quarantine'
} as const;
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
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL ?? null;
export async function isSuperAdmin(clerkUserId: string): Promise<boolean> {
    try {
        const { clerkClient } = await import('@clerk/nextjs/server');
        const client = await clerkClient();
        const user = await client.users.getUser(clerkUserId);
        if (user.publicMetadata?.role === 'super_admin') {
            return true;
        }
        const userEmail = user.primaryEmailAddress?.emailAddress;
        if (SUPER_ADMIN_EMAIL && userEmail === SUPER_ADMIN_EMAIL) {
            await client.users.updateUserMetadata(clerkUserId, {
                publicMetadata: { role: 'super_admin' }
            });
            return true;
        }
        return false;
    }
    catch (error) {
        console.error('Error checking super admin status:', error);
        try {
            const { data: artist, error: dbError } = await supabase
                .from('artists')
                .select('email')
                .eq('clerk_user_id', clerkUserId)
                .single();
            if (!SUPER_ADMIN_EMAIL || dbError || !artist) {
                return false;
            }
            return artist.email === SUPER_ADMIN_EMAIL;
        }
        catch (dbError) {
            console.error('Database fallback also failed:', dbError);
            return false;
        }
    }
}
export async function getUserRoleAndPermissions(clerkUserId: string, artistId?: string): Promise<{
    role: UserRole | null;
    permissions: ReviewPermission[];
    isOwner: boolean;
    canAccessReviews: boolean;
    isSuperAdmin: boolean;
}> {
    try {
        const superAdmin = await isSuperAdmin(clerkUserId);
        if (superAdmin) {
            return {
                role: 'owner',
                permissions: [...ROLE_PERMISSIONS.owner],
                isOwner: true,
                canAccessReviews: true,
                isSuperAdmin: true
            };
        }
        return {
            role: null,
            permissions: [],
            isOwner: false,
            canAccessReviews: false,
            isSuperAdmin: false
        };
    }
    catch (error) {
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
export async function hasPermission(clerkUserId: string, permission: ReviewPermission): Promise<boolean> {
    return await isSuperAdmin(clerkUserId);
}
export async function requireReviewAccess() {
    const user = await currentUser();
    if (!user) {
        throw new Error('Unauthorized: No user found');
    }
    const superAdmin = await isSuperAdmin(user.id);
    if (!superAdmin) {
        throw new Error('Forbidden: Admin access restricted to authorized personnel only');
    }
    const artist = await getOrCreateArtistByClerkId(user.id, user.primaryEmailAddress?.emailAddress || '', user.fullName || 'Artist');
    return {
        user,
        artist,
        role: 'owner' as UserRole,
        permissions: [...ROLE_PERMISSIONS.owner],
        isOwner: true,
        isSuperAdmin: true
    };
}
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
    }
    catch (error) {
        console.error('Error getting review accessible members:', error);
        return [];
    }
}
export async function logReviewAction(artistId: string, reviewId: string, action: 'viewed' | 'approved' | 'rejected' | 'flagged', userId: string, details?: Record<string, any>) {
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
    }
    catch (error) {
        console.error('Error logging review action:', error);
    }
}
