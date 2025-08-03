'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  Clock, 
  Eye,
  ChevronRight,
  X
} from 'lucide-react';
import Link from 'next/link';

interface PendingReviewsNotificationProps {
  onDismiss?: () => void;
  showDismiss?: boolean;
}

export function PendingReviewsNotification({ 
  onDismiss, 
  showDismiss = true 
}: PendingReviewsNotificationProps) {
  const { user, isLoaded } = useUser();
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchPendingCount = async () => {
      if (!isLoaded || !user) {
        setLoading(false);
        return;
      }

      // Check if user has super admin role
      const isSuperAdmin = user.publicMetadata?.role === 'super_admin';
      
      if (!isSuperAdmin) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/admin/reviews?include_stats=true');
        if (response.ok) {
          const data = await response.json();
          setPendingCount(data.stats?.pending || 0);
        }
      } catch (error) {
        console.error('Error fetching pending reviews count:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingCount();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, [isLoaded, user]);

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  // Don't show if not loaded, dismissed, no pending reviews, or user isn't super admin
  if (!isLoaded || loading || dismissed || pendingCount === 0 || user?.publicMetadata?.role !== 'super_admin') {
    return null;
  }

  return (
    <Alert className="border-yellow-200 bg-yellow-50">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertDescription>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-yellow-800">
              {pendingCount} contact{pendingCount !== 1 ? 's' : ''} pending review
            </span>
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
              <Clock className="h-3 w-3 mr-1" />
              Action Required
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Link href="/dashboard/admin/reviews">
              <Button size="sm" variant="outline" className="text-yellow-800 border-yellow-300 hover:bg-yellow-100">
                <Eye className="h-4 w-4 mr-1" />
                Review Now
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
            
            {showDismiss && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        <div className="mt-2 text-sm text-yellow-700">
          These contacts were flagged by our spam detection system and need manual approval before they can receive emails.
        </div>
      </AlertDescription>
    </Alert>
  );
}