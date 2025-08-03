'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { usePendingReviews } from '@/hooks/use-pending-reviews';

export function QuarantineStatusCard() {
  const { user, isLoaded } = useUser();
  const { stats, loading, hasPendingReviews } = usePendingReviews();

  // Don't render if user isn't loaded or isn't super admin
  if (!isLoaded || user?.publicMetadata?.role !== 'super_admin') {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Spam Protection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const getStatusColor = () => {
    if (stats.pending > 10) return 'text-red-600';
    if (stats.pending > 5) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusIcon = () => {
    if (stats.pending > 10) return <AlertTriangle className="h-5 w-5 text-red-500" />;
    if (stats.pending > 0) return <Clock className="h-5 w-5 text-yellow-500" />;
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  };

  const getStatusMessage = () => {
    if (stats.pending === 0) return 'All contacts approved';
    if (stats.pending === 1) return '1 contact needs review';
    return `${stats.pending} contacts need review`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Spam Protection Status
        </CardTitle>
        <CardDescription>
          Contact quarantine and review system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Status Overview */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className={`font-medium ${getStatusColor()}`}>
                {getStatusMessage()}
              </span>
            </div>
            
            {hasPendingReviews && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                Action Required
              </Badge>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span className="text-2xl font-bold text-yellow-600">{stats.pending}</span>
              </div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-2xl font-bold text-green-600">{stats.approved}</span>
              </div>
              <div className="text-xs text-muted-foreground">Approved</div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-2xl font-bold text-red-600">{stats.rejected}</span>
              </div>
              <div className="text-xs text-muted-foreground">Rejected</div>
            </div>
          </div>

          {/* Action Button */}
          {hasPendingReviews && (
            <Link href="/dashboard/admin/reviews" className="block">
              <Button className="w-full" variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Review Pending Contacts
              </Button>
            </Link>
          )}

          {/* Protection Summary */}
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center justify-between">
              <span>Total Reviews:</span>
              <span className="font-medium">{stats.total}</span>
            </div>
            {stats.total > 0 && (
              <div className="flex items-center justify-between">
                <span>Approval Rate:</span>
                <span className="font-medium">
                  {Math.round((stats.approved / stats.total) * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}