import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Mail, Users, BarChart3, Clock, Target } from 'lucide-react';
export default function CreatingCampaignsPage() {
    return (<div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Creating Email Campaigns</h1>
        <p className="text-xl text-muted-foreground mt-4">
          Email campaigns are the heart of your fan engagement strategy. This guide covers everything from basic setup to advanced features.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="h-4 w-4"/>
              Newsletter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Regular updates about your music, tours, and creative process.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4"/>
              Announcement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Important news like album releases, tour dates, or merchandise launches.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4"/>
              Welcome Series
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Automated sequence for new subscribers to introduce them to your music.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4"/>
              Re-engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Target inactive subscribers to win them back.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Creating Your First Campaign</CardTitle>
          <CardDescription>
            Follow these steps to create and send your first email campaign
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">1</Badge>
              <div>
                <h3 className="font-medium">Choose Campaign Type</h3>
                <p className="text-sm text-muted-foreground">
                  Navigate to <strong>Campaigns</strong> → <strong>Create New</strong> and select your campaign type.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">2</Badge>
              <div>
                <h3 className="font-medium">Campaign Settings</h3>
                <ul className="text-sm text-muted-foreground space-y-1 mt-1">
                  <li>• <strong>Campaign Name:</strong> Internal name for organization</li>
                  <li>• <strong>Subject Line:</strong> What fans see in their inbox</li>
                  <li>• <strong>Preview Text:</strong> Additional text shown in email previews</li>
                  <li>• <strong>From Name:</strong> How you want to appear (e.g., "Sarah from The Band")</li>
                </ul>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">3</Badge>
              <div>
                <h3 className="font-medium">Design Your Email</h3>
                <p className="text-sm text-muted-foreground">
                  Use our visual editor or HTML editor to create your content.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">4</Badge>
              <div>
                <h3 className="font-medium">Select Audience</h3>
                <p className="text-sm text-muted-foreground">
                  Choose which fans receive this campaign using segments or your entire list.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">5</Badge>
              <div>
                <h3 className="font-medium">Review and Send</h3>
                <p className="text-sm text-muted-foreground">
                  Preview your email, test it, then schedule or send immediately.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Design Best Practices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Subject Lines</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Keep under 50 characters for mobile</li>
              <li>• Create urgency without being spammy</li>
              <li>• Personalize when possible: "Hey [Name], new song is here!"</li>
              <li>• A/B test different approaches</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-2">Content Structure</h3>
            <div className="bg-muted p-4 rounded-md text-sm space-y-1">
              <div>1. Header with your branding</div>
              <div>2. Personal greeting</div>
              <div>3. Main content (news, updates, stories)</div>
              <div>4. Call-to-action (listen, buy, follow)</div>
              <div>5. Footer with social links and unsubscribe</div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Visual Elements</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Use high-quality images (under 1MB each)</li>
              <li>• Maintain consistent branding</li>
              <li>• Ensure mobile responsiveness</li>
              <li>• Include alt text for accessibility</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personalization</CardTitle>
          <CardDescription>
            Make your emails more engaging with dynamic content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Dynamic Content</h3>
            <p className="text-sm text-muted-foreground mb-3">Insert personalized elements:</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Badge variant="outline">{'{{first_name}}'}</Badge>
              <Badge variant="outline">{'{{location}}'}</Badge>
              <Badge variant="outline">{'{{signup_date}}'}</Badge>
              <Badge variant="outline">Custom fields</Badge>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Example Usage</h3>
            <div className="bg-muted p-3 rounded-md text-sm">
              <div>Hey {'{{first_name}}'},</div>
              <div className="mt-2">Hope you're doing well in {'{{location}}'} !</div>
              <div>Since you joined us {'{{signup_date}}'}, we've released 3 new songs...</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scheduling Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4"/>
                Send Immediately
              </h3>
              <p className="text-sm text-muted-foreground">
                Campaign goes out right away after final review.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4"/>
                Schedule for Later
              </h3>
              <p className="text-sm text-muted-foreground">
                Choose specific date and time with timezone optimization.
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Best Timing Practices</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Consider your audience's time zones</li>
              <li>• Avoid major holidays unless relevant</li>
              <li>• Tuesday-Thursday typically perform best</li>
              <li>• 10 AM - 2 PM often sees higher engagement</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Lightbulb className="h-4 w-4"/>
        <AlertDescription>
          <strong>Industry Benchmarks:</strong> Average open rates for music/entertainment are 20-25%. Click rates typically range from 2-5%.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Common Mistakes to Avoid</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-2">Content Issues</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Too much text, not enough visuals</li>
                <li>• Missing clear call-to-action</li>
                <li>• Broken or suspicious links</li>
                <li>• No mobile optimization</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2">Technical Issues</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Missing unsubscribe link</li>
                <li>• Broken images or formatting</li>
                <li>• No plain text version</li>
                <li>• Poor subject lines</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>);
}
