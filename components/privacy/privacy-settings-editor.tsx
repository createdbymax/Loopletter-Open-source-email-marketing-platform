'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Shield, Save, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { PrivacySettings } from '@/lib/types';
interface PrivacySettingsEditorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    artistId: string;
    currentSettings: PrivacySettings | null;
    onSettingsUpdated: (settings: PrivacySettings) => void;
}
export function PrivacySettingsEditor({ open, onOpenChange, artistId, currentSettings, onSettingsUpdated }: PrivacySettingsEditorProps) {
    const [settings, setSettings] = useState<Partial<PrivacySettings>>({
        cookie_consent_required: true,
        analytics_opt_out_available: true,
        data_processing_transparency: true,
        automatic_deletion_enabled: true,
        privacy_policy_url: '',
        privacy_policy_version: '1.0',
        dpo_contact_email: '',
        gdpr_representative_contact: '',
        ccpa_contact_info: ''
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    useEffect(() => {
        if (currentSettings) {
            setSettings({
                cookie_consent_required: currentSettings.cookie_consent_required,
                analytics_opt_out_available: currentSettings.analytics_opt_out_available,
                data_processing_transparency: currentSettings.data_processing_transparency,
                automatic_deletion_enabled: currentSettings.automatic_deletion_enabled,
                privacy_policy_url: currentSettings.privacy_policy_url || '',
                privacy_policy_version: currentSettings.privacy_policy_version,
                dpo_contact_email: currentSettings.dpo_contact_email || '',
                gdpr_representative_contact: currentSettings.gdpr_representative_contact || '',
                ccpa_contact_info: currentSettings.ccpa_contact_info || ''
            });
        }
    }, [currentSettings]);
    const handleSave = async () => {
        try {
            setSaving(true);
            setError('');
            setSuccess(false);
            const response = await fetch('/api/privacy/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    artistId,
                    ...settings
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to update privacy settings');
            }
            const updatedSettings = await response.json();
            onSettingsUpdated(updatedSettings);
            setSuccess(true);
            setTimeout(() => {
                onOpenChange(false);
                setSuccess(false);
            }, 1500);
        }
        catch (error) {
            console.error('Error updating privacy settings:', error);
            setError('Failed to update privacy settings. Please try again.');
        }
        finally {
            setSaving(false);
        }
    };
    const handleInputChange = (field: keyof PrivacySettings, value: any) => {
        setSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };
    return (<Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5"/>
            Privacy Settings
          </DialogTitle>
          <DialogDescription>
            Configure privacy compliance settings for your account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          
          <div className="space-y-4">
            <h4 className="font-medium">General Settings</h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Cookie Consent Required</Label>
                  <p className="text-sm text-muted-foreground">
                    Require explicit consent before setting cookies
                  </p>
                </div>
                <Switch checked={settings.cookie_consent_required} onCheckedChange={(checked) => handleInputChange('cookie_consent_required', checked)}/>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Analytics Opt-out Available</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow users to opt-out of analytics tracking
                  </p>
                </div>
                <Switch checked={settings.analytics_opt_out_available} onCheckedChange={(checked) => handleInputChange('analytics_opt_out_available', checked)}/>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Data Processing Transparency</Label>
                  <p className="text-sm text-muted-foreground">
                    Provide clear information about data processing
                  </p>
                </div>
                <Switch checked={settings.data_processing_transparency} onCheckedChange={(checked) => handleInputChange('data_processing_transparency', checked)}/>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Automatic Data Deletion</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically delete data based on retention policies
                  </p>
                </div>
                <Switch checked={settings.automatic_deletion_enabled} onCheckedChange={(checked) => handleInputChange('automatic_deletion_enabled', checked)}/>
              </div>
            </div>
          </div>

          <Separator />

          
          <div className="space-y-4">
            <h4 className="font-medium">Privacy Policy</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="privacy_policy_url">Privacy Policy URL</Label>
                <Input id="privacy_policy_url" type="url" value={settings.privacy_policy_url} onChange={(e) => handleInputChange('privacy_policy_url', e.target.value)} placeholder="https://example.com/privacy"/>
              </div>

              <div className="space-y-2">
                <Label htmlFor="privacy_policy_version">Privacy Policy Version</Label>
                <Input id="privacy_policy_version" value={settings.privacy_policy_version} onChange={(e) => handleInputChange('privacy_policy_version', e.target.value)} placeholder="1.0"/>
              </div>
            </div>
          </div>

          <Separator />

          
          <div className="space-y-4">
            <h4 className="font-medium">Contact Information</h4>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dpo_contact_email">Data Protection Officer Email</Label>
                <Input id="dpo_contact_email" type="email" value={settings.dpo_contact_email} onChange={(e) => handleInputChange('dpo_contact_email', e.target.value)} placeholder="dpo@example.com"/>
                <p className="text-sm text-muted-foreground">
                  Required for GDPR compliance if processing large amounts of personal data
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gdpr_representative_contact">GDPR Representative Contact</Label>
                <Textarea id="gdpr_representative_contact" value={settings.gdpr_representative_contact} onChange={(e) => handleInputChange('gdpr_representative_contact', e.target.value)} placeholder="Contact information for your GDPR representative (if applicable)" rows={3}/>
                <p className="text-sm text-muted-foreground">
                  Required if you're not established in the EU but process EU residents' data
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ccpa_contact_info">CCPA Contact Information</Label>
                <Textarea id="ccpa_contact_info" value={settings.ccpa_contact_info} onChange={(e) => handleInputChange('ccpa_contact_info', e.target.value)} placeholder="Contact information for CCPA-related requests" rows={3}/>
                <p className="text-sm text-muted-foreground">
                  Contact information for California residents to exercise their privacy rights
                </p>
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
                Privacy settings updated successfully!
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
                  Save Settings
                </>)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>);
}
