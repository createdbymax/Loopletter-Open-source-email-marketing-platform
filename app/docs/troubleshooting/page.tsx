import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, HelpCircle, Mail, Users, BarChart3, Settings, MessageCircle } from 'lucide-react';
export default function TroubleshootingPage() {
    return (<div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Troubleshooting Guide</h1>
        <p className="text-xl text-muted-foreground mt-4">
          Common issues and solutions to help you resolve problems quickly and get back to engaging with your fans.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="h-4 w-4"/>
              Email Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Problems with sending, deliverability, and email formatting.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4"/>
              Audience Problems
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Issues with importing, managing, and segmenting your fan list.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4"/>
              Analytics Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Problems with tracking, reporting, and understanding metrics.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings className="h-4 w-4"/>
              Account & Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Login, billing, domain setup, and configuration issues.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Delivery Issues</CardTitle>
          <CardDescription>
            Common problems with email sending and deliverability
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500"/>
              Emails Going to Spam
            </h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium mb-2">Possible Causes:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Domain not properly authenticated (missing SPF, DKIM, DMARC)</li>
                  <li>• Poor sender reputation</li>
                  <li>• Spam trigger words in subject line or content</li>
                  <li>• High image-to-text ratio</li>
                  <li>• Sending to unengaged or purchased lists</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Solutions:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Complete domain authentication setup</li>
                  <li>• Clean your email list regularly</li>
                  <li>• Avoid spam trigger words</li>
                  <li>• Include more text content relative to images</li>
                  <li>• Send only to engaged, opted-in subscribers</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500"/>
              High Bounce Rate
            </h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium mb-2">Possible Causes:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Invalid or outdated email addresses</li>
                  <li>• Typos in email addresses</li>
                  <li>• Full recipient inboxes</li>
                  <li>• Recipient email servers blocking your domain</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Solutions:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Validate email addresses before importing</li>
                  <li>• Remove hard bounces immediately</li>
                  <li>• Use double opt-in for new subscribers</li>
                  <li>• Monitor bounce rates and investigate spikes</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500"/>
              Low Open Rates
            </h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium mb-2">Possible Causes:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Poor subject lines</li>
                  <li>• Wrong send times</li>
                  <li>• Unengaged subscriber list</li>
                  <li>• Sender name not recognizable</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Solutions:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• A/B test subject lines</li>
                  <li>• Optimize send times for your audience</li>
                  <li>• Segment and target engaged subscribers</li>
                  <li>• Use a recognizable sender name</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audience Management Issues</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">CSV Import Problems</h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium mb-2">File Format Issues:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• <strong>Wrong encoding:</strong> Save CSV as UTF-8</li>
                  <li>• <strong>Special characters:</strong> May cause import errors</li>
                  <li>• <strong>Large files:</strong> Break into smaller chunks (&lt;10MB)</li>
                  <li>• <strong>Missing headers:</strong> First row should be column names</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Data Quality Issues:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• <strong>Invalid emails:</strong> Fix format errors before import</li>
                  <li>• <strong>Missing required fields:</strong> Email is always required</li>
                  <li>• <strong>Inconsistent formatting:</strong> Standardize data format</li>
                  <li>• <strong>Duplicate entries:</strong> System removes duplicates automatically</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Segmentation Problems</h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium mb-2">Common Issues:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Segments showing wrong number of subscribers</li>
                  <li>• Dynamic segments not updating</li>
                  <li>• Complex criteria not working as expected</li>
                  <li>• Fans not appearing in expected segments</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Solutions:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Check segment criteria for accuracy</li>
                  <li>• Verify fan data matches segment conditions</li>
                  <li>• Allow time for dynamic segments to update</li>
                  <li>• Test with simple criteria first, then add complexity</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Creation Issues</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Email Editor Problems</h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium mb-2">Common Issues:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Images not displaying correctly</li>
                  <li>• Formatting lost when switching between editors</li>
                  <li>• Mobile preview not matching actual appearance</li>
                  <li>• Links not working properly</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Solutions:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Use supported image formats (JPG, PNG, GIF)</li>
                  <li>• Keep images under 1MB each</li>
                  <li>• Test emails in multiple clients before sending</li>
                  <li>• Use absolute URLs for links</li>
                  <li>• Include alt text for all images</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Scheduling Problems</h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium mb-2">Common Issues:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Campaigns not sending at scheduled time</li>
                  <li>• Time zone confusion</li>
                  <li>• Unable to modify scheduled campaigns</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Solutions:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Verify your account time zone settings</li>
                  <li>• Check that campaign is fully approved before scheduling</li>
                  <li>• Cancel and reschedule if changes are needed</li>
                  <li>• Allow buffer time for processing</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Analytics and Reporting Issues</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Tracking Problems</h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium mb-2">Common Issues:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Open rates seem too low or too high</li>
                  <li>• Click tracking not working</li>
                  <li>• Analytics data delayed or missing</li>
                  <li>• Unsubscribe tracking inconsistent</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Explanations & Solutions:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• <strong>Low opens:</strong> Many email clients block tracking pixels</li>
                  <li>• <strong>High opens:</strong> May include automated email scanners</li>
                  <li>• <strong>Click issues:</strong> Ensure links use tracking domains</li>
                  <li>• <strong>Data delays:</strong> Analytics update every 15-30 minutes</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Report Generation Issues</h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium mb-2">Common Problems:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Export files are empty or incomplete</li>
                  <li>• Date ranges not working correctly</li>
                  <li>• Missing data in custom reports</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Solutions:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Check date range settings</li>
                  <li>• Ensure campaigns exist in selected timeframe</li>
                  <li>• Try smaller date ranges for large exports</li>
                  <li>• Contact support for persistent export issues</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account and Billing Issues</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-3">Login Problems</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Forgot password:</strong> Use password reset link</li>
                <li>• <strong>Account locked:</strong> Contact support</li>
                <li>• <strong>Two-factor issues:</strong> Check authenticator app</li>
                <li>• <strong>Email not recognized:</strong> Try alternate email addresses</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-3">Billing Issues</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Payment failed:</strong> Update payment method</li>
                <li>• <strong>Subscription questions:</strong> Check billing section</li>
                <li>• <strong>Upgrade/downgrade:</strong> Change plan in settings</li>
                <li>• <strong>Refund requests:</strong> Contact support</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Getting Help</CardTitle>
          <CardDescription>
            When you need additional support beyond this troubleshooting guide
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Before Contacting Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Check this troubleshooting guide and FAQ</li>
              <li>• Note the exact error message or issue</li>
              <li>• Try reproducing the problem</li>
              <li>• Gather relevant details (campaign names, dates, etc.)</li>
              <li>• Take screenshots if helpful</li>
            </ul>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageCircle className="h-4 w-4"/>
                  Contact Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Email: support@loopletter.co</li>
                  <li>• In-app chat (bottom right)</li>
                  <li>• Response time: 24-48 hours</li>
                  <li>• Priority support for paid plans</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <HelpCircle className="h-4 w-4"/>
                  Self-Help Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• FAQ section</li>
                  <li>• Video tutorials</li>
                  <li>• Community forum</li>
                  <li>• Knowledge base articles</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <HelpCircle className="h-4 w-4"/>
        <AlertDescription>
          <strong>Can't find a solution?</strong> Don't hesitate to reach out to our support team. 
          We're here to help you succeed with your email marketing.
        </AlertDescription>
      </Alert>
    </div>);
}
