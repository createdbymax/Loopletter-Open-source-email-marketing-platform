'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Lock, UserX, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
interface UserPermissions {
    role: string | null;
    can_approve: boolean;
    can_reject: boolean;
    canAccessReviews: boolean;
}
interface ProtectedAdminRouteProps {
    children: React.ReactNode;
    requiredPermission?: 'view' | 'approve' | 'reject';
    fallbackPath?: string;
}
export function ProtectedAdminRoute({ children, requiredPermission = 'view', fallbackPath = '/dashboard' }: ProtectedAdminRouteProps) {
    const { user, isLoaded } = useUser();
    const [permissions, setPermissions] = useState<UserPermissions | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        const checkPermissions = async () => {
            if (!isLoaded || !user) {
                setLoading(false);
                return;
            }
            const isSuperAdmin = user.publicMetadata?.role === 'super_admin';
            if (!isSuperAdmin) {
                setError('Access denied. This page does not exist or you do not have permission to view it.');
                setLoading(false);
                return;
            }
            try {
                const response = await fetch('/api/admin/reviews?include_stats=true');
                if (response.status === 401) {
                    setError('You are not authenticated. Please sign in.');
                    setLoading(false);
                    return;
                }
                if (response.status === 403) {
                    setError('Access denied. This page does not exist or you do not have permission to view it.');
                    setLoading(false);
                    return;
                }
                if (!response.ok) {
                    throw new Error('Failed to check permissions');
                }
                const data = await response.json();
                setPermissions(data.user_info);
                setError(null);
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to check permissions');
            }
            finally {
                setLoading(false);
            }
        };
        checkPermissions();
    }, [isLoaded, user]);
    if (!isLoaded || loading) {
        return (<div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin"/>
              <span>Checking permissions...</span>
            </div>
          </CardContent>
        </Card>
      </div>);
    }
    if (!user) {
        return (<div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserX className="h-6 w-6 text-red-500"/>
              Authentication Required
            </CardTitle>
            <CardDescription>
              You must be signed in to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Link href="/sign-in">
                <Button>Sign In</Button>
              </Link>
              <Link href={fallbackPath}>
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2"/>
                  Go Back
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>);
    }
    if (error) {
        return (<div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-6 w-6 text-red-500"/>
              Page Not Found
            </CardTitle>
            <CardDescription>
              The page you're looking for doesn't exist or you don't have access to it.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4"/>
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                If you believe this is an error, please check the URL or contact support.
              </p>
            </div>

            <div className="flex gap-3">
              <Link href={fallbackPath}>
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2"/>
                  Go Back
                </Button>
              </Link>
              <Button onClick={() => window.location.reload()} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2"/>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>);
    }
    if (permissions) {
        const hasRequiredPermission = requiredPermission === 'view' ? true :
            requiredPermission === 'approve' ? permissions.can_approve :
                requiredPermission === 'reject' ? permissions.can_reject :
                    true;
        if (!hasRequiredPermission) {
            return (<div className="container mx-auto py-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-yellow-500"/>
                Insufficient Permissions
              </CardTitle>
              <CardDescription>
                Your current role does not allow this action.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span>Your role:</span>
                <Badge variant="outline">
                  {permissions.role?.toUpperCase() || 'UNKNOWN'}
                </Badge>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4"/>
                <AlertDescription>
                  {requiredPermission === 'approve' && 'Only owners and admins can approve contacts.'}
                  {requiredPermission === 'reject' && 'Only owners and admins can reject contacts.'}
                </AlertDescription>
              </Alert>

              <Link href={fallbackPath}>
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2"/>
                  Go Back
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>);
        }
    }
    return <>{children}</>;
}
