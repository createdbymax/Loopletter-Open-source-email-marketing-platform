'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Save, AlertTriangle, CheckCircle, Loader2, Users, Mail, BarChart3 } from 'lucide-react';
import { DataRetentionPolicy } from '@/lib/types';
interface DataRetentionEditorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    artistId: string;
    onPoliciesUpdated: () => void;
}
interface RetentionPolicyForm {
    fan_data: {
        retention_period_days: number;
        deletion_method: 'hard_delete' | 'anonymize' | 'archive';
        auto_delete_enabled: boolean;
    };
    campaign_data: {
        retention_period_days: number;
        deletion_method: 'hard_delete' | 'anonymize' | 'archive';
        auto_delete_enabled: boolean;
    };
    analytics_data: {
        retention_period_days: number;
        deletion_method: 'hard_delete' | 'anonymize' | 'archive';
        auto_delete_enabled: boolean;
    };
}
export function DataRetentionEditor({ open, onOpenChange, artistId, onPoliciesUpdated }: DataRetentionEditorProps) {
    const [policies, setPolicies] = useState<RetentionPolicyForm>({
        fan_data: {
            retention_period_days: 2555,
            deletion_method: 'anonymize',
            auto_delete_enabled: true
        },
        campaign_data: {
            retention_period_days: 1095,
            deletion_method: 'anonymize',
            auto_delete_enabled: true
        },
        analytics_data: {
            retention_period_days: 730,
            deletion_method: 'anonymize',
            auto_delete_enabled: true
        }
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    useEffect(() => {
        if (open) {
            loadCurrentPolicies();
        }
    }, [open, artistId]);
    const loadCurrentPolicies = async () => {
        try {
            const response = await fetch(`/api/privacy/retention-policies?artistId=${artistId}`);
            if (response.ok) {
                const currentPolicies: DataRetentionPolicy[] = await response.json();
                const updatedPolicies = { ...policies };
                currentPolicies.forEach(policy => {
                    if (policy.data_type in updatedPolicies) {
                        updatedPolicies[policy.data_type as keyof RetentionPolicyForm] = {
                            retention_period_days: policy.retention_period_days,
                            deletion_method: policy.deletion_method as any,
                            auto_delete_enabled: policy.auto_delete_enabled
                        };
                    }
                });
                setPolicies(updatedPolicies);
            }
        }
        catch (error) {
            console.warn('Error loading current policies:', error);
        }
    };
    const handleSave = async () => {
        try {
            setSaving(true);
            setError('');
            setSuccess(false);
            const savePromises = Object.entries(policies).map(([dataType, policy]) => fetch('/api/privacy/retention-policies', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    artistId,
                    dataType,
                    ...policy
                }),
            }));
            const responses = await Promise.all(savePromises);
            const failedResponses = responses.filter(r => !r.ok);
            if (failedResponses.length > 0) {
                throw new Error('Failed to update some retention policies');
            }
            setSuccess(true);
            onPoliciesUpdated();
            setTimeout(() => {
                onOpenChange(false);
                setSuccess(false);
            }, 1500);
        }
        catch (error) {
            console.error('Error updating retention policies:', error);
            setError('Failed to update retention policies. Please try again.');
        }
        finally {
            setSaving(false);
        }
    };
    const handlePolicyChange = (dataType: keyof RetentionPolicyForm, field: keyof RetentionPolicyForm['fan_data'], value: any) => {
        setPolicies(prev => ({
            ...prev,
            [dataType]: {
                ...prev[dataType],
                [field]: value
            }
        }));
    };
    const getDaysFromYears = (years: number) => Math.round(years * 365.25);
    const getYearsFromDays = (days: number) => Math.round((days / 365.25) * 10) / 10;
    const getPolicyIcon = (dataType: string) => {
        switch (dataType) {
            case 'fan_data':
                return <Users className="h-5 w-5"/>;
            case 'campaign_data':
                return <Mail className="h-5 w-5"/>;
            case 'analytics_data':
                return <BarChart3 className="h-5 w-5"/>;
            default:
                return <Database className="h-5 w-5"/>;
        }
    };
    const getPolicyTitle = (dataType: string) => {
        switch (dataType) {
            case 'fan_data':
                return 'Fan Data';
            case 'campaign_data':
                return 'Campaign Data';
            case 'analytics_data':
                return 'Analytics Data';
            default:
                return dataType;
        }
    };
    const getPolicyDescription = (dataType: string) => {
        switch (dataType) {
            case 'fan_data':
                return 'Subscriber information, preferences, and contact details';
            case 'campaign_data':
                return 'Email campaigns, templates, and sending history';
            case 'analytics_data':
                return 'Engagement metrics, open/click tracking, and behavior data';
            default:
                return 'Data retention policy';
        }
    };
    return (<Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5"/>
            Data Retention Policies
          </DialogTitle>
          <DialogDescription>
            Configure how long different types of data are retained and how they are deleted
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4"/>
            <AlertDescription className="text-sm">
              <div className="space-y-2">
                <p><strong>Important:</strong> These settings affect GDPR and CCPA compliance.</p>
                <p>GDPR recommends maximum retention periods: Personal data (7 years), Marketing data (3 years), Analytics (2 years).</p>
              </div>
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(policies).map(([dataType, policy]) => (<Card key={dataType}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    {getPolicyIcon(dataType)}
                    {getPolicyTitle(dataType)}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {getPolicyDescription(dataType)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Retention Period</Label>
                    <div className="flex gap-2">
                      <Input type="number" value={policy.retention_period_days} onChange={(e) => handlePolicyChange(dataType as keyof RetentionPolicyForm, 'retention_period_days', parseInt(e.target.value) || 0)} placeholder="Days" className="flex-1"/>
                      <span className="text-sm text-muted-foreground self-center">
                        ({getYearsFromDays(policy.retention_period_days)} years)
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Deletion Method</Label>
                    <Select value={policy.deletion_method} onValueChange={(value) => handlePolicyChange(dataType as keyof RetentionPolicyForm, 'deletion_method', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="anonymize">Anonymize (Recommended)</SelectItem>
                        <SelectItem value="hard_delete">Hard Delete</SelectItem>
                        <SelectItem value="archive">Archive</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {policy.deletion_method === 'anonymize' && 'Replace personal data with anonymous identifiers'}
                      {policy.deletion_method === 'hard_delete' && 'Permanently delete all data'}
                      {policy.deletion_method === 'archive' && 'Move data to long-term storage'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">Auto-delete</Label>
                      <p className="text-xs text-muted-foreground">
                        Automatically apply retention policy
                      </p>
                    </div>
                    <Switch checked={policy.auto_delete_enabled} onCheckedChange={(checked) => handlePolicyChange(dataType as keyof RetentionPolicyForm, 'auto_delete_enabled', checked)}/>
                  </div>
                </CardContent>
              </Card>))}
          </div>

          
          <div className="space-y-4">
            <Separator />
            <div>
              <h4 className="font-medium mb-3">Quick Presets</h4>
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => setPolicies({
            fan_data: { retention_period_days: getDaysFromYears(7), deletion_method: 'anonymize', auto_delete_enabled: true },
            campaign_data: { retention_period_days: getDaysFromYears(3), deletion_method: 'anonymize', auto_delete_enabled: true },
            analytics_data: { retention_period_days: getDaysFromYears(2), deletion_method: 'anonymize', auto_delete_enabled: true }
        })}>
                  GDPR Recommended
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPolicies({
            fan_data: { retention_period_days: getDaysFromYears(5), deletion_method: 'anonymize', auto_delete_enabled: true },
            campaign_data: { retention_period_days: getDaysFromYears(2), deletion_method: 'anonymize', auto_delete_enabled: true },
            analytics_data: { retention_period_days: getDaysFromYears(1), deletion_method: 'anonymize', auto_delete_enabled: true }
        })}>
                  Conservative
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPolicies({
            fan_data: { retention_period_days: getDaysFromYears(10), deletion_method: 'archive', auto_delete_enabled: false },
            campaign_data: { retention_period_days: getDaysFromYears(5), deletion_method: 'archive', auto_delete_enabled: false },
            analytics_data: { retention_period_days: getDaysFromYears(3), deletion_method: 'anonymize', auto_delete_enabled: true }
        })}>
                  Extended
                </Button>
              </div>
            </div>
          </div>

          
          {error && (<Alert variant="destructive">
              <AlertTriangle className="h-4 w-4"/>
              <AlertDescription>{error}</AlertDescription>
            </Alert>)}

          {success && (<Alert>
              <CheckCircle className="h-4 w-4"/>
              <AlertDescription>
                Data retention policies updated successfully!
              </AlertDescription>
            </Alert>)}

          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (<>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
                  Saving...
                </>) : (<>
                  <Save className="h-4 w-4 mr-2"/>
                  Save Policies
                </>)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>);
}
