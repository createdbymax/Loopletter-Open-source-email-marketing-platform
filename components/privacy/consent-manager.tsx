'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle, AlertTriangle, Info, Clock, User, Mail, BarChart3 } from 'lucide-react';
import { PrivacyConsent } from '@/lib/types';
interface ConsentManagerProps {
    fanId?: string;
    artistId: string;
    email?: string;
    onConsentChange?: (consents: PrivacyConsent[]) => void;
    embedded?: boolean;
}
export function ConsentManager({ fanId, artistId, email, onConsentChange, embedded = false }: ConsentManagerProps) {
    const [consents, setConsents] = useState<PrivacyConsent[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [consentStates, setConsentStates] = useState({
        email_marketing: false,
        analytics: false,
        data_processing: false
    });
    useEffect(() => {
        if (fanId) {
            loadConsentHistory();
        }
    }, [fanId]);
    const loadConsentHistory = async () => {
        if (!fanId)
            return;
        try {
            setLoading(true);
            const response = await fetch(`/api/privacy/consents?fanId=${fanId}`);
            const data = await response.json();
            setConsents(data);
            const latestConsents = data.reduce((acc: any, consent: PrivacyConsent) => {
                if (!acc[consent.consent_type] ||
                    new Date(consent.consent_timestamp) > new Date(acc[consent.consent_type].consent_timestamp)) {
                    acc[consent.consent_type] = consent;
                }
                return acc;
            }, {});
            setConsentStates({
                email_marketing: latestConsents.email_marketing?.consent_given || false,
                analytics: latestConsents.analytics?.consent_given || false,
                data_processing: latestConsents.data_processing?.consent_given || false
            });
        }
        catch (error) {
            console.error('Error loading consent history:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleConsentChange = async (consentType: 'email_marketing' | 'analytics' | 'data_processing', granted: boolean) => {
        if (!fanId && !email) {
            console.error('Either fanId or email is required');
            return;
        }
        try {
            setSaving(true);
            const consentData = {
                fanId,
                email,
                artistId,
                consent_type: consentType,
                consent_given: granted,
                consent_method: 'checkbox',
                privacy_policy_version: '1.0',
                legal_basis: 'consent' as const
            };
            const response = await fetch('/api/privacy/consents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(consentData),
            });
            if (!response.ok) {
                throw new Error('Failed to update consent');
            }
            const newConsent = await response.json();
            setConsentStates(prev => ({
                ...prev,
                [consentType]: granted
            }));
            setConsents(prev => [newConsent, ...prev]);
            if (onConsentChange) {
                onConsentChange([newConsent, ...consents]);
            }
        }
        catch (error) {
            console.error('Error updating consent:', error);
            setConsentStates(prev => ({
                ...prev,
                [consentType]: !granted
            }));
        }
        finally {
            setSaving(false);
        }
    };
    const getConsentIcon = (consentType: string) => {
        switch (consentType) {
            case 'email_marketing':
                return <Mail className="h-4 w-4"/>;
            case 'analytics':
                return <BarChart3 className="h-4 w-4"/>;
            case 'data_processing':
                return <User className="h-4 w-4"/>;
            default:
                return <Shield className="h-4 w-4"/>;
        }
    };
    const getConsentDescription = (consentType: string) => {
        switch (consentType) {
            case 'email_marketing':
                return 'Receive marketing emails, newsletters, and promotional content';
            case 'analytics':
                return 'Allow collection of analytics data to improve our services';
            case 'data_processing':
                return 'Process your personal data for account management and service delivery';
            default:
                return 'General data processing consent';
        }
    };
    if (embedded) {
        return (<div className="space-y-4">
        <div className="space-y-3">
          {Object.entries(consentStates).map(([type, granted]) => (<div key={type} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                {getConsentIcon(type)}
                <div>
                  <Label className="text-sm font-medium">
                    {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {getConsentDescription(type)}
                  </p>
                </div>
              </div>
              <Switch checked={granted} onCheckedChange={(checked) => handleConsentChange(type as any, checked)} disabled={saving}/>
            </div>))}
        </div>

        <Alert>
          <Info className="h-4 w-4"/>
          <AlertDescription className="text-xs">
            You can change these preferences at any time. 
            <a href="/privacy-policy" className="underline ml-1">View Privacy Policy</a>
          </AlertDescription>
        </Alert>
      </div>);
    }
    return (<div className="space-y-6">
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5"/>
            Privacy Consent Management
          </CardTitle>
          <CardDescription>
            Manage your privacy preferences and consent settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-4">
              <Mail className="h-5 w-5 text-blue-600"/>
              <div>
                <Label className="text-base font-medium">Email Marketing</Label>
                <p className="text-sm text-muted-foreground">
                  Receive marketing emails, newsletters, and promotional content
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch checked={consentStates.email_marketing} onCheckedChange={(checked) => handleConsentChange('email_marketing', checked)} disabled={saving}/>
              <Badge variant={consentStates.email_marketing ? 'default' : 'secondary'}>
                {consentStates.email_marketing ? 'Granted' : 'Denied'}
              </Badge>
            </div>
          </div>

          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-4">
              <BarChart3 className="h-5 w-5 text-green-600"/>
              <div>
                <Label className="text-base font-medium">Analytics & Tracking</Label>
                <p className="text-sm text-muted-foreground">
                  Allow collection of analytics data to improve our services
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch checked={consentStates.analytics} onCheckedChange={(checked) => handleConsentChange('analytics', checked)} disabled={saving}/>
              <Badge variant={consentStates.analytics ? 'default' : 'secondary'}>
                {consentStates.analytics ? 'Granted' : 'Denied'}
              </Badge>
            </div>
          </div>

          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-4">
              <User className="h-5 w-5 text-purple-600"/>
              <div>
                <Label className="text-base font-medium">Data Processing</Label>
                <p className="text-sm text-muted-foreground">
                  Process your personal data for account management and service delivery
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch checked={consentStates.data_processing} onCheckedChange={(checked) => handleConsentChange('data_processing', checked)} disabled={saving}/>
              <Badge variant={consentStates.data_processing ? 'default' : 'secondary'}>
                {consentStates.data_processing ? 'Granted' : 'Denied'}
              </Badge>
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4"/>
            <AlertDescription>
              Your consent choices are recorded with timestamps and can be withdrawn at any time. 
              Changes may affect the services we can provide to you.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      
      {consents.length > 0 && (<Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5"/>
              Consent History
            </CardTitle>
            <CardDescription>
              Complete history of your consent decisions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {consents.map((consent) => (<div key={consent.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getConsentIcon(consent.consent_type)}
                    <div>
                      <div className="font-medium text-sm">
                        {consent.consent_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(consent.consent_timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={consent.consent_given ? 'default' : 'secondary'}>
                      {consent.consent_given ? 'Granted' : 'Withdrawn'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      via {consent.consent_method}
                    </span>
                  </div>
                </div>))}
            </div>
          </CardContent>
        </Card>)}
    </div>);
}
