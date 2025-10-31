"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Mail, Bell, FileText, AlertCircle } from 'lucide-react';
interface NotificationSettings {
    email_notifications: boolean;
    import_completion_email: boolean;
    import_failure_email: boolean;
    campaign_notifications: boolean;
    system_alerts: boolean;
}
export default function NotificationSettingsPage() {
    const [settings, setSettings] = useState<NotificationSettings>({
        email_notifications: true,
        import_completion_email: true,
        import_failure_email: true,
        campaign_notifications: true,
        system_alerts: true,
    });
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const handleSettingChange = (key: keyof NotificationSettings, value: boolean) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setSaved(false);
    };
    const saveSettings = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }
        catch (error) {
            console.error('Error saving notification settings:', error);
        }
        finally {
            setLoading(false);
        }
    };
    return (<div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Notification Settings</h1>
        <p className="text-gray-600">
          Configure how and when you receive notifications
        </p>
      </div>

      {saved && (<Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600"/>
          <AlertDescription className="text-green-800">
            Notification settings saved successfully!
          </AlertDescription>
        </Alert>)}

      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5"/>
            Email Notifications
          </CardTitle>
          <CardDescription>
            Control when we send you email notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Enable Email Notifications</Label>
              <p className="text-sm text-gray-500">
                Receive email notifications for important events
              </p>
            </div>
            <Switch id="email-notifications" checked={settings.email_notifications} onCheckedChange={(checked) => handleSettingChange('email_notifications', checked)}/>
          </div>

          <div className="pl-4 space-y-4 border-l-2 border-gray-100">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="import-completion">Import Completion</Label>
                <p className="text-sm text-gray-500">
                  Get notified when fan imports complete successfully
                </p>
              </div>
              <Switch id="import-completion" checked={settings.import_completion_email} onCheckedChange={(checked) => handleSettingChange('import_completion_email', checked)} disabled={!settings.email_notifications}/>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="import-failure">Import Failures</Label>
                <p className="text-sm text-gray-500">
                  Get notified when fan imports fail
                </p>
              </div>
              <Switch id="import-failure" checked={settings.import_failure_email} onCheckedChange={(checked) => handleSettingChange('import_failure_email', checked)} disabled={!settings.email_notifications}/>
            </div>
          </div>
        </CardContent>
      </Card>

      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5"/>
            Dashboard Notifications
          </CardTitle>
          <CardDescription>
            Control what notifications appear in your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="campaign-notifications">Campaign Notifications</Label>
              <p className="text-sm text-gray-500">
                Get notified about campaign sends and performance
              </p>
            </div>
            <Switch id="campaign-notifications" checked={settings.campaign_notifications} onCheckedChange={(checked) => handleSettingChange('campaign_notifications', checked)}/>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="system-alerts">System Alerts</Label>
              <p className="text-sm text-gray-500">
                Receive notifications about system maintenance and updates
              </p>
            </div>
            <Switch id="system-alerts" checked={settings.system_alerts} onCheckedChange={(checked) => handleSettingChange('system_alerts', checked)}/>
          </div>
        </CardContent>
      </Card>

      
      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={loading}>
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>• Email notifications are sent to your account email address</p>
          <p>• Dashboard notifications appear in the notification bell in the sidebar</p>
          <p>• You can always change these settings later</p>
          <p>• Some critical notifications (like security alerts) cannot be disabled</p>
        </CardContent>
      </Card>
    </div>);
}
