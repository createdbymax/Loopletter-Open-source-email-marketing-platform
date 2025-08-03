import { Metadata } from 'next';
import { AdminReviewDashboard } from '@/components/admin-review-dashboard';
import { ProtectedAdminRoute } from '@/components/protected-admin-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const metadata: Metadata = {
  title: 'Contact Reviews - Admin Dashboard',
  description: 'Review and manage flagged contacts for spam prevention and compliance',
};

export default function AdminReviewsPage() {
  return (
    <ProtectedAdminRoute requiredPermission="view" fallbackPath="/dashboard">
      <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Contact Reviews
          </h1>
          <p className="text-muted-foreground mt-2">
            Review and approve contacts flagged by our spam prevention system
          </p>
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              Why Contacts Get Flagged
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>• <strong>High Risk Score:</strong> Email patterns suggest potential spam</div>
            <div>• <strong>Suspicious Domains:</strong> Temporary or disposable email services</div>
            <div>• <strong>Bulk Imports:</strong> Large imports require extra verification</div>
            <div>• <strong>Role-based Emails:</strong> admin@, info@, support@ addresses</div>
            <div>• <strong>Pattern Matching:</strong> Bot-like email patterns detected</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Review Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>• <strong>Approve:</strong> Legitimate contacts with documented consent</div>
            <div>• <strong>Reject:</strong> Suspicious emails or potential spam</div>
            <div>• <strong>Check Source:</strong> Verify how the email was obtained</div>
            <div>• <strong>Consider Context:</strong> Artist type and typical audience</div>
            <div>• <strong>When in Doubt:</strong> Err on the side of caution and reject</div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Compliance Notice:</strong> Only approve contacts where you can verify legitimate consent. 
          Approving spam emails can result in AWS SES suspension and legal issues. All review decisions 
          are logged for audit purposes.
        </AlertDescription>
      </Alert>

      {/* Main Dashboard */}
      <AdminReviewDashboard />

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>
            Guidelines for making review decisions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-green-700 mb-2">✅ Approve When:</h4>
              <ul className="text-sm space-y-1 text-green-600">
                <li>• Email came from a legitimate signup form</li>
                <li>• You have documented consent (purchase, event signup)</li>
                <li>• The email pattern looks human and realistic</li>
                <li>• It's from a known domain (company, organization)</li>
                <li>• The risk score is low-medium with minor flags</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-red-700 mb-2">❌ Reject When:</h4>
              <ul className="text-sm space-y-1 text-red-600">
                <li>• Email is from a temporary/disposable service</li>
                <li>• No clear consent or suspicious source</li>
                <li>• Pattern suggests automated/bot generation</li>
                <li>• High risk score with multiple red flags</li>
                <li>• You cannot verify how the email was obtained</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Remember:</h4>
            <p className="text-sm text-blue-800">
              It's better to reject a legitimate email than to approve a spam email. 
              Rejected contacts can always be manually re-added later with proper consent documentation.
              Your review decisions help train our spam detection system and protect your sending reputation.
            </p>
          </div>
        </CardContent>
      </Card>
      </div>
    </ProtectedAdminRoute>
  );
}