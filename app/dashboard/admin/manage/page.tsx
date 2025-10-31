import { Metadata } from 'next';
import { AdminManagement } from '@/components/admin-management';
import { ProtectedAdminRoute } from '@/components/protected-admin-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
export const metadata: Metadata = {
    title: 'Admin Management - Super Admin Dashboard',
    description: 'Manage super admin users and permissions',
};
export default function AdminManagePage() {
    return (<ProtectedAdminRoute requiredPermission="view" fallbackPath="/dashboard">
      <div className="container mx-auto py-6 space-y-6">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Users className="h-8 w-8 text-blue-600"/>
              Admin Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage super admin users and their access to the review system
            </p>
          </div>
        </div>

        
        <Alert>
          <AlertTriangle className="h-4 w-4"/>
          <AlertDescription>
            <strong>Important:</strong> Super admins have full access to review and manage all 
            quarantined contacts across the platform. Only grant this access to trusted personnel.
          </AlertDescription>
        </Alert>

        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500"/>
                Super Admin Capabilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>• View all pending contact reviews</div>
              <div>• Approve or reject quarantined contacts</div>
              <div>• Access compliance audit logs</div>
              <div>• Monitor reputation across all accounts</div>
              <div>• Manage other super admin users</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500"/>
                Security Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>• Only promote trusted team members</div>
              <div>• Regularly review active super admins</div>
              <div>• Remove access when no longer needed</div>
              <div>• All admin actions are logged for audit</div>
              <div>• Users must have existing platform accounts</div>
            </CardContent>
          </Card>
        </div>

        
        <AdminManagement />
      </div>
    </ProtectedAdminRoute>);
}
