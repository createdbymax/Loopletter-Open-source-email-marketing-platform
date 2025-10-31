"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Bell, FileText, Send } from 'lucide-react';
export default function TestNotificationsPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{
        success: boolean;
        message: string;
    } | null>(null);
    const [formData, setFormData] = useState({
        type: 'system_alert',
        title: '',
        message: '',
    });
    const sendTestNotification = async () => {
        setLoading(true);
        setResult(null);
        try {
            const response = await fetch('/api/notifications/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (response.ok) {
                setResult({ success: true, message: data.message });
                setFormData({
                    type: 'system_alert',
                    title: '',
                    message: '',
                });
            }
            else {
                setResult({ success: false, message: data.error || 'Failed to send notification' });
            }
        }
        catch (error) {
            setResult({ success: false, message: 'Network error occurred' });
        }
        finally {
            setLoading(false);
        }
    };
    const sendPresetNotification = async (preset: string) => {
        setLoading(true);
        setResult(null);
        const presets = {
            import_success: {
                type: 'import_completed',
                title: 'Fan import completed',
                message: 'Successfully imported 150 fans from test-file.csv (5 failed, 2 skipped)',
                data: {
                    filename: 'test-file.csv',
                    imported: 150,
                    failed: 5,
                    skipped: 2,
                    total_records: 157
                }
            },
            import_failed: {
                type: 'import_failed',
                title: 'Fan import failed',
                message: 'Import of test-file.csv failed: Invalid CSV format detected',
                data: {
                    filename: 'test-file.csv',
                    error_message: 'Invalid CSV format detected'
                }
            },
            campaign_sent: {
                type: 'campaign_sent',
                title: 'Campaign sent successfully',
                message: 'Your campaign "New Album Release" has been sent to 1,250 fans',
                data: {
                    campaign_name: 'New Album Release',
                    recipients: 1250,
                    sent_at: new Date().toISOString()
                }
            },
            system_alert: {
                type: 'system_alert',
                title: 'System maintenance scheduled',
                message: 'Scheduled maintenance will occur tonight from 2-4 AM EST. No action required.',
                data: {
                    maintenance_window: '2-4 AM EST',
                    impact: 'minimal'
                }
            }
        };
        try {
            const response = await fetch('/api/notifications/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(presets[preset as keyof typeof presets]),
            });
            const data = await response.json();
            if (response.ok) {
                setResult({ success: true, message: `${preset} notification sent successfully!` });
            }
            else {
                setResult({ success: false, message: data.error || 'Failed to send notification' });
            }
        }
        catch (error) {
            setResult({ success: false, message: 'Network error occurred' });
        }
        finally {
            setLoading(false);
        }
    };
    return (<div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Test Notifications</h1>
        <p className="text-gray-600">
          Send test notifications to verify the notification system is working
        </p>
      </div>

      
      <Card>
        <CardHeader>
          <CardTitle>Quick Test Notifications</CardTitle>
          <CardDescription>
            Send preset notifications to test different notification types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" onClick={() => sendPresetNotification('import_success')} disabled={loading} className="flex items-center gap-2 h-auto p-4">
              <CheckCircle className="h-5 w-5 text-green-500"/>
              <div className="text-left">
                <div className="font-medium">Import Success</div>
                <div className="text-sm text-gray-500">Test successful import notification</div>
              </div>
            </Button>

            <Button variant="outline" onClick={() => sendPresetNotification('import_failed')} disabled={loading} className="flex items-center gap-2 h-auto p-4">
              <AlertCircle className="h-5 w-5 text-red-500"/>
              <div className="text-left">
                <div className="font-medium">Import Failed</div>
                <div className="text-sm text-gray-500">Test failed import notification</div>
              </div>
            </Button>

            <Button variant="outline" onClick={() => sendPresetNotification('campaign_sent')} disabled={loading} className="flex items-center gap-2 h-auto p-4">
              <Send className="h-5 w-5 text-blue-500"/>
              <div className="text-left">
                <div className="font-medium">Campaign Sent</div>
                <div className="text-sm text-gray-500">Test campaign notification</div>
              </div>
            </Button>

            <Button variant="outline" onClick={() => sendPresetNotification('system_alert')} disabled={loading} className="flex items-center gap-2 h-auto p-4">
              <Bell className="h-5 w-5 text-yellow-500"/>
              <div className="text-left">
                <div className="font-medium">System Alert</div>
                <div className="text-sm text-gray-500">Test system notification</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      
      <Card>
        <CardHeader>
          <CardTitle>Custom Test Notification</CardTitle>
          <CardDescription>
            Create a custom notification with your own title and message
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Notification Type</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system_alert">System Alert</SelectItem>
                <SelectItem value="import_completed">Import Completed</SelectItem>
                <SelectItem value="import_failed">Import Failed</SelectItem>
                <SelectItem value="campaign_sent">Campaign Sent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Enter notification title" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}/>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" placeholder="Enter notification message" rows={3} value={formData.message} onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}/>
          </div>

          <Button onClick={sendTestNotification} disabled={loading || (!formData.title && !formData.message)} className="w-full">
            {loading ? 'Sending...' : 'Send Custom Notification'}
          </Button>
        </CardContent>
      </Card>

      
      {result && (<Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          {result.success ? (<CheckCircle className="h-4 w-4 text-green-600"/>) : (<AlertCircle className="h-4 w-4 text-red-600"/>)}
          <AlertDescription className={result.success ? 'text-green-800' : 'text-red-800'}>
            {result.message}
          </AlertDescription>
        </Alert>)}

      
      <Card>
        <CardHeader>
          <CardTitle>How to Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>1. Click any of the preset notification buttons above to send a test notification</p>
          <p>2. Check the notification bell in the sidebar header - it should show a red badge with the count</p>
          <p>3. You should see a blue "X new" bubble appear and bounce for 3 seconds</p>
          <p>4. Click the notification bell to see the dropdown with your test notifications</p>
          <p>5. Visit the <a href="/dashboard/notifications" className="text-blue-600 hover:underline">Notifications page</a> to see all notifications</p>
        </CardContent>
      </Card>
    </div>);
}
