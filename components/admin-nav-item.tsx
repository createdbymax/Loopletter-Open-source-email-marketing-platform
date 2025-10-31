'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Shield, Clock } from 'lucide-react';
import { usePendingReviews } from '@/hooks/use-pending-reviews';
interface AdminNavItemProps {
    className?: string;
}
export function AdminNavItem({ className }: AdminNavItemProps) {
    const { user, isLoaded } = useUser();
    const [hasAccess, setHasAccess] = useState(false);
    const [loading, setLoading] = useState(true);
    const { stats, hasPendingReviews } = usePendingReviews();
    useEffect(() => {
        const checkAccess = async () => {
            if (!isLoaded || !user) {
                setLoading(false);
                return;
            }
            const isSuperAdmin = user.publicMetadata?.role === 'super_admin';
            if (!isSuperAdmin) {
                setHasAccess(false);
                setLoading(false);
                return;
            }
            try {
                const response = await fetch('/api/admin/reviews?include_stats=true');
                setHasAccess(response.ok && response.status !== 403);
            }
            catch {
                setHasAccess(false);
            }
            finally {
                setLoading(false);
            }
        };
        checkAccess();
    }, [isLoaded, user]);
    if (!isLoaded || loading || !hasAccess) {
        return null;
    }
    return (<Link href="/dashboard/admin/reviews" className={`flex items-center gap-2 hover:text-primary transition-colors ${className}`}>
      <Shield className="h-4 w-4"/>
      <span>Contact Reviews</span>
      {hasPendingReviews && (<Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <Clock className="h-3 w-3 mr-1"/>
          {stats?.pending}
        </Badge>)}
    </Link>);
}
