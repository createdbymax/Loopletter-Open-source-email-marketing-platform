'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Shield, AlertTriangle, CheckCircle, Clock, Download, Settings, FileText, Database } from 'lucide-react';
import { PrivacyComplianceStatus, DataSubjectRequest, PrivacySettings } from '@/lib/types';
import { PrivacySetupInstructions } from './privacy-setup-instructions';
import { PrivacySettingsEditor } from './privacy-settings-editor';
import { DataRetentionEditor } from './data-retention-editor';
interface PrivacyDashboardProps {
    artistId: string;
}
export function PrivacyDashboard({ artistId }: PrivacyDashboardProps) {
    const [complianceStatus, setComplianceStatus] = useState<PrivacyComplianceStatus | null>(null);
    const [dataRequests, setDataRequests] = useState<DataSubjectRequest[]>([]);
    const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [settingsEditorOpen, setSettingsEditorOpen] = useState(false);
    const [retentionEditorOpen, setRetentionEditorOpen] = useState(false);
    const exportDataRequests = () => {
        if (dataRequests.length === 0) {
            alert('No data requests to export');
            return;
        }
        const csvContent = [
            ['Request ID', 'Email', 'Type', 'Regulation', 'Status', 'Created Date', 'Details'].join(','),
            ...dataRequests.map(request => [
                request.request_id,
                request.email,
                request.request_type,
                request.regulation,
                request.status,
                new Date(request.created_at).toLocaleDateString(),
                request.request_details || ''
            ].map(field => `"${field}"`).join(','))
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `data-subject-requests-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };
    const exportAuditLog = async () => {
        try {
            const response = await fetch(`/api/privacy/audit-log?artistId=${artistId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch audit log');
            }
            const auditLog = await response.json();
            if (auditLog.length === 0) {
                alert('No audit log entries to export');
                return;
            }
            const csvContent = [
                ['Timestamp', 'Action', 'Fan ID', 'IP Address', 'User Agent', 'Details'].join(','),
                ...auditLog.map((entry: any) => [
                    new Date(entry.timestamp).toLocaleString(),
                    entry.action,
                    entry.fan_id || '',
                    entry.ip_address || '',
                    entry.user_agent || '',
                    JSON.stringify(entry.details || {})
                ].map(field => `"${field}"`).join(','))
            ].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `privacy-audit-log-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }
        catch (error) {
            console.error('Error exporting audit log:', error);
            alert('Failed to export audit log. The feature may not be fully set up yet.');
        }
    };
    useEffect(() => {
        loadPrivacyData();
    }, [artistId]);
    const loadPrivacyData = async () => {
        try {
            setLoading(true);
            try {
                const statusResponse = await fetch(`/api/privacy/compliance-status?artistId=${artistId}`);
                if (statusResponse.ok) {
                    const status = await statusResponse.json();
                    setComplianceStatus(status);
                }
                else {
                    console.warn('Privacy compliance status not available yet');
                    setComplianceStatus({
                        gdpr_compliant: false,
                        ccpa_compliant: false,
                        consent_management_enabled: false,
                        data_retention_configured: false,
                        privacy_policy_current: false,
                        breach_procedures_documented: false,
                        dpo_appointed: false,
                        compliance_score: 0,
                        issues: ['Privacy compliance tables not set up yet'],
                        recommendations: ['Run the privacy compliance database setup script']
                    });
                }
            }
            catch (error) {
                console.warn('Error loading compliance status:', error);
            }
            try {
                const requestsResponse = await fetch(`/api/privacy/data-requests?artistId=${artistId}`);
                if (requestsResponse.ok) {
                    const requests = await requestsResponse.json();
                    setDataRequests(requests);
                }
            }
            catch (error) {
                console.warn('Error loading data requests:', error);
                setDataRequests([]);
            }
            try {
                const settingsResponse = await fetch(`/api/privacy/settings?artistId=${artistId}`);
                if (settingsResponse.ok) {
                    const settings = await settingsResponse.json();
                    setPrivacySettings(settings);
                }
            }
            catch (error) {
                console.warn('Error loading privacy settings:', error);
                setPrivacySettings(null);
            }
        }
        catch (error) {
            console.error('Error loading privacy data:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const getComplianceColor = (score: number) => {
        if (score >= 80)
            return 'text-green-600';
        if (score >= 60)
            return 'text-yellow-600';
        return 'text-red-600';
    };
    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            pending: 'outline',
            in_progress: 'secondary',
            completed: 'default',
            rejected: 'destructive'
        };
        return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
    };
    if (loading) {
        return (<div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>);
    }
    return (<div className="space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              <span className={getComplianceColor(complianceStatus?.compliance_score || 0)}>
                {complianceStatus?.compliance_score || 0}%
              </span>
            </div>
            <Progress value={complianceStatus?.compliance_score || 0} className="mb-2"/>
            <p className="text-xs text-muted-foreground">
              {complianceStatus?.gdpr_compliant ? 'GDPR Compliant' : 'GDPR Issues Found'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dataRequests.filter(r => r.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retention Status</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {complianceStatus?.data_retention_configured ? (<CheckCircle className="h-6 w-6 text-green-600"/>) : (<AlertTriangle className="h-6 w-6 text-yellow-600"/>)}
            </div>
            <p className="text-xs text-muted-foreground">
              {complianceStatus?.data_retention_configured ? 'Configured' : 'Needs Setup'}
            </p>
          </CardContent>
        </Card>
      </div>

      
      {complianceStatus && complianceStatus.issues.includes('Privacy compliance tables not set up yet') && (<PrivacySetupInstructions />)}

      
      {complianceStatus && (complianceStatus.issues.length > 0 || complianceStatus.recommendations.length > 0) &&
            !complianceStatus.issues.includes('Privacy compliance tables not set up yet') && (<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {complianceStatus.issues.length > 0 && (<Alert>
              <AlertTriangle className="h-4 w-4"/>
              <AlertDescription>
                <div className="font-medium mb-2">Compliance Issues:</div>
                <ul className="list-disc list-inside space-y-1">
                  {complianceStatus.issues.map((issue, index) => (<li key={index} className="text-sm">{issue}</li>))}
                </ul>
              </AlertDescription>
            </Alert>)}

          {complianceStatus.recommendations.length > 0 && (<Alert>
              <CheckCircle className="h-4 w-4"/>
              <AlertDescription>
                <div className="font-medium mb-2">Recommendations:</div>
                <ul className="list-disc list-inside space-y-1">
                  {complianceStatus.recommendations.map((rec, index) => (<li key={index} className="text-sm">{rec}</li>))}
                </ul>
              </AlertDescription>
            </Alert>)}
        </div>)}

      
      {complianceStatus && !complianceStatus.issues.includes('Privacy compliance tables not set up yet') && (<Tabs defaultValue="requests" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="requests">Data Requests</TabsTrigger>
          <TabsTrigger value="settings">Privacy Settings</TabsTrigger>
          <TabsTrigger value="retention">Data Retention</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Data Subject Requests</h3>
            <Button variant="outline" size="sm" onClick={exportDataRequests}>
              <Download className="h-4 w-4 mr-2"/>
              Export Requests
            </Button>
          </div>

          <div className="space-y-4">
            {dataRequests.length === 0 ? (<Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    No data subject requests found
                  </div>
                </CardContent>
              </Card>) : (dataRequests.map((request) => (<Card key={request.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">
                          {request.request_type.charAt(0).toUpperCase() + request.request_type.slice(1)} Request
                        </CardTitle>
                        <CardDescription>
                          {request.email} • {request.regulation} • {new Date(request.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {request.request_details && (<p className="text-sm text-muted-foreground mb-4">
                        {request.request_details}
                      </p>)}
                    <div className="flex gap-2">
                      {request.status === 'pending' && (<Button size="sm" variant="outline">
                          Process Request
                        </Button>)}
                      {request.status === 'completed' && request.response_data && (<Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2"/>
                          Download Response
                        </Button>)}
                    </div>
                  </CardContent>
                </Card>)))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Privacy Settings</h3>
            <Button variant="outline" size="sm" onClick={() => setSettingsEditorOpen(true)}>
              <Settings className="h-4 w-4 mr-2"/>
              Edit Settings
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Cookie Consent Required</span>
                  <Badge variant={privacySettings?.cookie_consent_required ? 'default' : 'secondary'}>
                    {privacySettings?.cookie_consent_required ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Analytics Opt-out Available</span>
                  <Badge variant={privacySettings?.analytics_opt_out_available ? 'default' : 'secondary'}>
                    {privacySettings?.analytics_opt_out_available ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Automatic Deletion</span>
                  <Badge variant={privacySettings?.automatic_deletion_enabled ? 'default' : 'secondary'}>
                    {privacySettings?.automatic_deletion_enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm font-medium">Privacy Policy URL</span>
                  <p className="text-sm text-muted-foreground">
                    {privacySettings?.privacy_policy_url || 'Not set'}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium">DPO Contact</span>
                  <p className="text-sm text-muted-foreground">
                    {privacySettings?.dpo_contact_email || 'Not set'}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium">Privacy Policy Version</span>
                  <p className="text-sm text-muted-foreground">
                    {privacySettings?.privacy_policy_version || '1.0'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="retention" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Data Retention Policies</h3>
            <Button variant="outline" size="sm" onClick={() => setRetentionEditorOpen(true)}>
              <Settings className="h-4 w-4 mr-2"/>
              Configure Policies
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Fan Data</CardTitle>
                <CardDescription>Subscriber information and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Retention Period</span>
                    <span className="text-sm font-medium">7 years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Deletion Method</span>
                    <span className="text-sm font-medium">Anonymize</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Auto-delete</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Campaign Data</CardTitle>
                <CardDescription>Email campaigns and analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Retention Period</span>
                    <span className="text-sm font-medium">3 years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Deletion Method</span>
                    <span className="text-sm font-medium">Anonymize</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Auto-delete</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Analytics Data</CardTitle>
                <CardDescription>Engagement and behavior data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Retention Period</span>
                    <span className="text-sm font-medium">2 years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Deletion Method</span>
                    <span className="text-sm font-medium">Anonymize</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Auto-delete</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Privacy Audit Log</h3>
            <Button variant="outline" size="sm" onClick={exportAuditLog}>
              <Download className="h-4 w-4 mr-2"/>
              Export Log
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                Audit log functionality coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>)}

      
      <PrivacySettingsEditor open={settingsEditorOpen} onOpenChange={setSettingsEditorOpen} artistId={artistId} currentSettings={privacySettings} onSettingsUpdated={(updatedSettings) => {
            setPrivacySettings(updatedSettings);
            loadPrivacyData();
        }}/>

      
      <DataRetentionEditor open={retentionEditorOpen} onOpenChange={setRetentionEditorOpen} artistId={artistId} onPoliciesUpdated={() => {
            loadPrivacyData();
        }}/>
    </div>);
}
