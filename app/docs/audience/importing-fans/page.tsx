import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Upload, Users, FileText, CheckCircle, Lightbulb } from 'lucide-react';

export default function ImportingFansPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Importing Your Fan List</h1>
        <p className="text-xl text-muted-foreground mt-4">
          Building your email list is crucial for successful email marketing. This guide covers all the ways to import and grow your fan base.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              CSV Upload
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The fastest way to import existing contacts from spreadsheets or other platforms.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Manual Entry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Add individual fans directly through the dashboard for high-value contacts.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Integrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Connect with other platforms to sync your contacts automatically.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>CSV File Upload</CardTitle>
          <CardDescription>
            Prepare and upload your contact list from a CSV file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Required CSV Format</h3>
            <div className="bg-muted p-4 rounded-md">
              <div className="text-sm font-mono space-y-1">
                <div className="font-semibold">email,first_name,last_name,location,tags</div>
                <div>john@example.com,John,Smith,New York,VIP,early-supporter</div>
                <div>sarah@example.com,Sarah,Johnson,Los Angeles,newsletter</div>
                <div>mike@example.com,Mike,Brown,Chicago,tour-alerts,merch</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Column Descriptions</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge>Required</Badge>
                <span className="text-sm"><strong>email:</strong> Valid email addresses</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Optional</Badge>
                <span className="text-sm"><strong>first_name:</strong> Subscriber's first name</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Optional</Badge>
                <span className="text-sm"><strong>last_name:</strong> Subscriber's last name</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Optional</Badge>
                <span className="text-sm"><strong>location:</strong> City, state, or country</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Optional</Badge>
                <span className="text-sm"><strong>tags:</strong> Comma-separated tags</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Upload Process</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">1</Badge>
                <div>
                  <p className="text-sm"><strong>Navigate to Import:</strong> Go to Audience → Import Fans → Upload CSV</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">2</Badge>
                <div>
                  <p className="text-sm"><strong>Upload File:</strong> Drag and drop your CSV file or click to browse</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">3</Badge>
                <div>
                  <p className="text-sm"><strong>Map Fields:</strong> Match your CSV columns to Loopletter fields</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">4</Badge>
                <div>
                  <p className="text-sm"><strong>Review and Import:</strong> Preview the data and confirm the import</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <strong>Important:</strong> Only import contacts who have given permission to receive your emails. 
          Importing purchased lists or scraping emails violates our terms and hurts deliverability.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Data Quality Best Practices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Email Validation</h3>
            <p className="text-sm text-muted-foreground mb-3">Our system automatically:</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Checks email format validity
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Identifies obvious typos
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Flags potentially fake addresses
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Removes duplicates
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">List Cleaning Tips</h3>
            <p className="text-sm text-muted-foreground mb-3">Before importing:</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Remove old, inactive emails (6+ months)</li>
              <li>• Fix obvious typos (gmial.com → gmail.com)</li>
              <li>• Remove role-based emails (info@, admin@)</li>
              <li>• Verify consent for all contacts</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Organizing Your Imports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Tags and Segments</h3>
            <p className="text-sm text-muted-foreground mb-3">Organize fans during import:</p>
            <div className="space-y-2">
              <div><Badge variant="outline">Source Tags</Badge> Where they came from (website, concert, social)</div>
              <div><Badge variant="outline">Interest Tags</Badge> What they're interested in (tours, merch, new music)</div>
              <div><Badge variant="outline">Engagement Tags</Badge> How active they are (VIP, casual, new)</div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Custom Fields</h3>
            <p className="text-sm text-muted-foreground mb-3">Collect additional information:</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• <strong>Birthday:</strong> For birthday campaigns</li>
              <li>• <strong>Location:</strong> For tour targeting</li>
              <li>• <strong>Favorite Genre:</strong> For content personalization</li>
              <li>• <strong>Purchase History:</strong> For merchandise targeting</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Post-Import Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Welcome Campaign</h3>
            <p className="text-sm text-muted-foreground mb-3">Send a welcome email to new imports:</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Thank them for subscribing</li>
              <li>• Set expectations for email frequency</li>
              <li>• Provide easy unsubscribe option</li>
              <li>• Include your best content</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-3">Segmentation</h3>
            <p className="text-sm text-muted-foreground mb-3">Create segments based on import data:</p>
            <div className="grid grid-cols-2 gap-2">
              <Badge variant="outline">Import source</Badge>
              <Badge variant="outline">Geographic location</Badge>
              <Badge variant="outline">Engagement level</Badge>
              <Badge variant="outline">Interest categories</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Growing Your List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Organic Growth Strategies</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• <strong>Website signup forms:</strong> Add to your site</li>
              <li>• <strong>Social media:</strong> Promote email signup</li>
              <li>• <strong>Concerts/events:</strong> Collect emails in person</li>
              <li>• <strong>Content upgrades:</strong> Offer exclusive content</li>
              <li>• <strong>Collaborations:</strong> Cross-promote with other artists</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-3">Lead Magnets</h3>
            <p className="text-sm text-muted-foreground mb-3">Offer valuable content in exchange for emails:</p>
            <div className="grid grid-cols-2 gap-2">
              <Badge variant="outline">Exclusive tracks</Badge>
              <Badge variant="outline">Behind-the-scenes content</Badge>
              <Badge variant="outline">Early ticket access</Badge>
              <Badge variant="outline">Merchandise discounts</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertDescription>
          <strong>Legal Compliance:</strong> Always ensure you have proper consent to email your contacts. 
          Include clear unsubscribe options and honor requests immediately.
        </AlertDescription>
      </Alert>
    </div>
  );
}