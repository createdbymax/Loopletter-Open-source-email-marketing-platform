import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Target, MapPin, Activity, Heart, Clock, Lightbulb } from 'lucide-react';
export default function SegmentationPage() {
    return (<div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Audience Segmentation</h1>
        <p className="text-xl text-muted-foreground mt-4">
          Create targeted segments to send more relevant emails to your fans, leading to higher engagement and better results.
        </p>
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5"/>
            Why Segment Your Audience?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-2">Better Engagement</h3>
              <p className="text-sm text-muted-foreground">Targeted emails get 2-3x higher open rates and 5x higher click rates.</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Personalized Experience</h3>
              <p className="text-sm text-muted-foreground">Fans receive content that's relevant to their interests and location.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4"/>
              Geographic
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Target fans by location for tour announcements and local events.
            </p>
            <div className="space-y-1">
              <Badge variant="outline" className="text-xs">New York fans</Badge>
              <Badge variant="outline" className="text-xs">West Coast</Badge>
              <Badge variant="outline" className="text-xs">International</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4"/>
              Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Group fans by activity level and email interaction.
            </p>
            <div className="space-y-1">
              <Badge variant="outline" className="text-xs">Super fans</Badge>
              <Badge variant="outline" className="text-xs">Regular fans</Badge>
              <Badge variant="outline" className="text-xs">Inactive</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Heart className="h-4 w-4"/>
              Interest-Based
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Segment by fan preferences and interests.
            </p>
            <div className="space-y-1">
              <Badge variant="outline" className="text-xs">New music</Badge>
              <Badge variant="outline" className="text-xs">Tour dates</Badge>
              <Badge variant="outline" className="text-xs">Merchandise</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4"/>
              Behavioral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Based on fan actions and purchase history.
            </p>
            <div className="space-y-1">
              <Badge variant="outline" className="text-xs">Recent buyers</Badge>
              <Badge variant="outline" className="text-xs">Long-time fans</Badge>
              <Badge variant="outline" className="text-xs">Social active</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Creating Segments</CardTitle>
          <CardDescription>
            Step-by-step guide to building your first audience segment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">1</Badge>
              <div>
                <h3 className="font-medium">Navigate to Segments</h3>
                <p className="text-sm text-muted-foreground">
                  Go to <strong>Audience</strong> → <strong>Segments</strong> → <strong>Create New</strong>
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">2</Badge>
              <div>
                <h3 className="font-medium">Choose Criteria</h3>
                <p className="text-sm text-muted-foreground">
                  Select your segmentation criteria (location, tags, engagement, etc.)
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">3</Badge>
              <div>
                <h3 className="font-medium">Set Conditions</h3>
                <p className="text-sm text-muted-foreground">
                  Define the specific conditions for your segment
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">4</Badge>
              <div>
                <h3 className="font-medium">Name and Save</h3>
                <p className="text-sm text-muted-foreground">
                  Give your segment a descriptive name and save
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Engagement Segmentation</CardTitle>
          <CardDescription>
            Categorize fans based on their email activity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800">Super Fans</Badge>
                <span className="text-sm">80%+ open rate</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Highly engaged subscribers who open every email and frequently click links. 
                Perfect for exclusive content and early access offers.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800">Regular Fans</Badge>
                <span className="text-sm">40-80% open rate</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Moderately engaged fans who regularly open emails. 
                Great for general announcements and newsletters.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-100 text-yellow-800">Casual Fans</Badge>
                <span className="text-sm">10-40% open rate</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Occasionally engaged fans who need more compelling content. 
                Focus on major announcements and special offers.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-gray-100 text-gray-800">Inactive Fans</Badge>
                <span className="text-sm">&lt;10% open rate</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Haven't engaged recently. Target with re-engagement campaigns 
                or consider removing from active lists.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Advanced Segmentation</CardTitle>
          <CardDescription>
            Combine multiple criteria for precise targeting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Example: VIP Segment</h3>
            <div className="bg-muted p-4 rounded-md space-y-2 text-sm">
              <div>Fans who:</div>
              <div>• Have "VIP" tag <strong>OR</strong></div>
              <div>• Opened 80%+ of last 10 emails <strong>AND</strong></div>
              <div>• Clicked a link in last 30 days <strong>AND</strong></div>
              <div>• Subscribed more than 6 months ago</div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Example: Re-engagement Segment</h3>
            <div className="bg-muted p-4 rounded-md space-y-2 text-sm">
              <div>Fans who:</div>
              <div>• Haven't opened an email in 60 days <strong>AND</strong></div>
              <div>• Were previously active (opened 5+ emails) <strong>AND</strong></div>
              <div>• Subscribed more than 3 months ago</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Segment Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-3">Dynamic Segments</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Update automatically based on criteria</li>
                <li>• Fans move in/out as they meet conditions</li>
                <li>• Best for ongoing campaigns</li>
                <li>• Examples: "Active Fans", "Local Fans"</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-3">Static Segments</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Fixed list that doesn't change</li>
                <li>• Manual additions/removals only</li>
                <li>• Best for specific campaigns</li>
                <li>• Examples: "Album Pre-order", "VIP Event"</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Segmentation Strategies by Artist Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">New Artist Strategy</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Badge variant="outline">All Fans</Badge>
              <Badge variant="outline">New Subscribers</Badge>
              <Badge variant="outline">Engaged Fans</Badge>
              <Badge variant="outline">Local Fans</Badge>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Established Artist Strategy</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Badge variant="outline">Super Fans</Badge>
              <Badge variant="outline">Geographic</Badge>
              <Badge variant="outline">Interest-Based</Badge>
              <Badge variant="outline">Lifecycle</Badge>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Multi-Genre Artist Strategy</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Badge variant="outline">Genre Preferences</Badge>
              <Badge variant="outline">Release Types</Badge>
              <Badge variant="outline">Content Types</Badge>
              <Badge variant="outline">Engagement Level</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Measuring Segment Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-2">Key Metrics</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• <strong>Open Rate:</strong> How many fans open emails</li>
                <li>• <strong>Click Rate:</strong> Engagement with content</li>
                <li>• <strong>Conversion Rate:</strong> Actions taken</li>
                <li>• <strong>Unsubscribe Rate:</strong> Fans leaving segment</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2">Optimization</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• <strong>High Performers:</strong> Expand similar segments</li>
                <li>• <strong>Low Performers:</strong> Refine criteria</li>
                <li>• <strong>Unsubscribes:</strong> Analyze why fans leave</li>
                <li>• <strong>Conversions:</strong> Identify most valuable segments</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Lightbulb className="h-4 w-4"/>
        <AlertDescription>
          <strong>Pro Tip:</strong> Start simple with 3-4 basic segments, then add complexity as you learn what works for your audience.
        </AlertDescription>
      </Alert>
    </div>);
}
