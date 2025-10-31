import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, UserX, Filter, Search, Lightbulb, AlertTriangle } from 'lucide-react';
export default function AudienceManagementPage() {
    return (<div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Audience Management</h1>
        <p className="text-xl text-muted-foreground mt-4">
          Effectively manage your fan base with tools for organization, maintenance, and engagement tracking.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4"/>
              Fan Profiles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View detailed information about each subscriber including engagement history and preferences.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Filter className="h-4 w-4"/>
              List Filtering
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Filter your audience by various criteria to find specific groups of fans quickly.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <UserCheck className="h-4 w-4"/>
              Status Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Track subscriber status including active, unsubscribed, and bounced contacts.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Search className="h-4 w-4"/>
              Search & Export
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Search for specific fans and export audience data for external analysis.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fan Profile Information</CardTitle>
          <CardDescription>
            What information is tracked for each subscriber
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-3">Basic Information</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Email Address:</strong> Primary contact method</li>
                <li>• <strong>Name:</strong> First and last name (if provided)</li>
                <li>• <strong>Location:</strong> City, state, or country</li>
                <li>• <strong>Signup Date:</strong> When they subscribed</li>
                <li>• <strong>Signup Source:</strong> How they found you</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-3">Engagement Data</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Open Rate:</strong> Percentage of emails opened</li>
                <li>• <strong>Click Rate:</strong> Link engagement frequency</li>
                <li>• <strong>Last Activity:</strong> Most recent interaction</li>
                <li>• <strong>Campaign History:</strong> Which emails they received</li>
                <li>• <strong>Preferences:</strong> Content and frequency settings</li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Custom Fields</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Additional information you can collect and track:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Badge variant="outline">Birthday</Badge>
              <Badge variant="outline">Favorite Genre</Badge>
              <Badge variant="outline">Purchase History</Badge>
              <Badge variant="outline">Social Media</Badge>
              <Badge variant="outline">Concert Attendance</Badge>
              <Badge variant="outline">Merchandise Interests</Badge>
              <Badge variant="outline">Communication Preferences</Badge>
              <Badge variant="outline">VIP Status</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subscriber Status Types</CardTitle>
          <CardDescription>
            Understanding different subscriber states
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800">Active</Badge>
                <span className="text-sm">Subscribed and receiving emails</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Fans who are currently subscribed and can receive your campaigns.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-red-100 text-red-800">Unsubscribed</Badge>
                <span className="text-sm">Opted out of emails</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Fans who have chosen to stop receiving emails. Cannot be re-added without explicit consent.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-orange-100 text-orange-800">Bounced</Badge>
                <span className="text-sm">Email delivery failed</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Email addresses that couldn't receive messages due to invalid addresses or full inboxes.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-100 text-yellow-800">Complained</Badge>
                <span className="text-sm">Marked as spam</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Fans who marked your emails as spam. Automatically suppressed from future sends.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>List Hygiene & Maintenance</CardTitle>
          <CardDescription>
            Keep your audience list healthy and engaged
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Regular Maintenance Tasks</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">Weekly</Badge>
                <div>
                  <p className="text-sm"><strong>Review Bounces:</strong> Check for hard bounces and remove invalid emails</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">Monthly</Badge>
                <div>
                  <p className="text-sm"><strong>Engagement Analysis:</strong> Identify inactive subscribers and plan re-engagement</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">Quarterly</Badge>
                <div>
                  <p className="text-sm"><strong>List Cleaning:</strong> Remove consistently unengaged subscribers</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Suppression Lists</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Automatically managed lists of contacts who shouldn't receive emails:
            </p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• <strong>Unsubscribed:</strong> Fans who opted out</li>
              <li>• <strong>Hard Bounces:</strong> Invalid email addresses</li>
              <li>• <strong>Spam Complaints:</strong> Marked emails as spam</li>
              <li>• <strong>Manual Suppressions:</strong> Contacts you've manually excluded</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600"/>
        <AlertDescription className="text-orange-800">
          <strong>Important:</strong> Never re-add unsubscribed contacts to your list. This violates email marketing laws and can damage your sender reputation.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Filtering & Search</CardTitle>
          <CardDescription>
            Find specific fans or groups quickly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Filter Options</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-sm font-medium mb-2">By Status</h4>
                <div className="space-y-1">
                  <Badge variant="outline" className="text-xs">Active subscribers</Badge>
                  <Badge variant="outline" className="text-xs">Unsubscribed</Badge>
                  <Badge variant="outline" className="text-xs">Bounced emails</Badge>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">By Engagement</h4>
                <div className="space-y-1">
                  <Badge variant="outline" className="text-xs">High engagement</Badge>
                  <Badge variant="outline" className="text-xs">Low engagement</Badge>
                  <Badge variant="outline" className="text-xs">Never opened</Badge>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">By Date</h4>
                <div className="space-y-1">
                  <Badge variant="outline" className="text-xs">Signup date range</Badge>
                  <Badge variant="outline" className="text-xs">Last activity</Badge>
                  <Badge variant="outline" className="text-xs">Campaign received</Badge>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">By Attributes</h4>
                <div className="space-y-1">
                  <Badge variant="outline" className="text-xs">Location</Badge>
                  <Badge variant="outline" className="text-xs">Tags</Badge>
                  <Badge variant="outline" className="text-xs">Custom fields</Badge>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Search Functionality</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• <strong>Email Search:</strong> Find specific email addresses</li>
              <li>• <strong>Name Search:</strong> Search by first or last name</li>
              <li>• <strong>Tag Search:</strong> Find fans with specific tags</li>
              <li>• <strong>Advanced Search:</strong> Combine multiple criteria</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Export & Analysis</CardTitle>
          <CardDescription>
            Export your audience data for external analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Export Options</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-sm font-medium mb-2">Full Export</h4>
                <p className="text-sm text-muted-foreground">
                  Export your entire audience with all available data fields.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Filtered Export</h4>
                <p className="text-sm text-muted-foreground">
                  Export only fans matching specific criteria or segments.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Engagement Export</h4>
                <p className="text-sm text-muted-foreground">
                  Export engagement data for performance analysis.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Custom Fields Export</h4>
                <p className="text-sm text-muted-foreground">
                  Export specific data fields for targeted analysis.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Export Formats</h3>
            <div className="flex gap-2">
              <Badge variant="outline">CSV</Badge>
              <Badge variant="outline">Excel</Badge>
              <Badge variant="outline">JSON</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Privacy & Compliance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-3">Data Protection</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Secure data storage and encryption</li>
                <li>• Regular security audits</li>
                <li>• Access controls and permissions</li>
                <li>• Data retention policies</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-3">Compliance Features</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• GDPR compliance tools</li>
                <li>• CAN-SPAM compliance</li>
                <li>• Automatic unsubscribe handling</li>
                <li>• Data deletion requests</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Lightbulb className="h-4 w-4"/>
        <AlertDescription>
          <strong>Best Practice:</strong> Regularly review and clean your audience list to maintain high engagement rates and good sender reputation.
        </AlertDescription>
      </Alert>
    </div>);
}
