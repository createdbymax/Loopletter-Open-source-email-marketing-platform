import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Users, Mail, MousePointer, Eye, Lightbulb } from 'lucide-react';
export default function AnalyticsPage() {
    return (<div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Analytics & Reporting</h1>
        <p className="text-xl text-muted-foreground mt-4">
          Track campaign performance and audience engagement to make data-driven decisions for your email marketing.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Eye className="h-4 w-4"/>
              Open Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.5%</div>
            <p className="text-sm text-muted-foreground">Industry avg: 20-25%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MousePointer className="h-4 w-4"/>
              Click Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2%</div>
            <p className="text-sm text-muted-foreground">Industry avg: 2-5%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4"/>
              Total Subscribers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847</div>
            <p className="text-sm text-muted-foreground">+12% this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="h-4 w-4"/>
              Emails Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15,234</div>
            <p className="text-sm text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dashboard Overview</CardTitle>
          <CardDescription>
            Key metrics and insights at a glance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Key Metrics</h3>
            <p className="text-sm text-muted-foreground mb-3">Your analytics dashboard shows:</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• <strong>Total Subscribers:</strong> Current fan count and growth</li>
              <li>• <strong>Campaign Performance:</strong> Recent campaign results</li>
              <li>• <strong>Engagement Trends:</strong> Open and click rates over time</li>
              <li>• <strong>Top Performing Content:</strong> Best campaigns and links</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-3">Quick Stats</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-sm font-medium mb-2">This Month</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Subscribers added: 342</li>
                  <li>• Emails sent: 15,234</li>
                  <li>• Average open rate: 24.5%</li>
                  <li>• Average click rate: 4.2%</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Last Campaign</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Open rate: 28.3%</li>
                  <li>• Click rate: 5.1%</li>
                  <li>• Unsubscribes: 12</li>
                  <li>• Bounces: 3</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Analytics</CardTitle>
          <CardDescription>
            Detailed performance metrics for your email campaigns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Performance Metrics</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Eye className="h-4 w-4"/>
                  Open Rate
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Percentage of recipients who opened your email.
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Industry Average:</span>
                    <Badge variant="outline">20-25%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Good Performance:</span>
                    <Badge variant="outline">25-35%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Excellent Performance:</span>
                    <Badge className="bg-green-100 text-green-800">35%+</Badge>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <MousePointer className="h-4 w-4"/>
                  Click Rate
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Percentage of recipients who clicked links in your email.
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Industry Average:</span>
                    <Badge variant="outline">2-5%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Good Performance:</span>
                    <Badge variant="outline">5-8%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Excellent Performance:</span>
                    <Badge className="bg-green-100 text-green-800">8%+</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Additional Metrics</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <h4 className="text-sm font-medium mb-2">Click-to-Open Rate</h4>
                <p className="text-sm text-muted-foreground">
                  Percentage of email openers who clicked links. Industry average: 10-15%
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Unsubscribe Rate</h4>
                <p className="text-sm text-muted-foreground">
                  Fans who opted out. Keep below 0.5% for healthy list growth.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Bounce Rate</h4>
                <p className="text-sm text-muted-foreground">
                  Emails that couldn't be delivered. Keep below 2% for good reputation.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Campaign Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-3">Geographic Performance</h3>
              <p className="text-sm text-muted-foreground mb-3">See where your fans are engaging:</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• <strong>Top Countries:</strong> Highest engagement by country</li>
                <li>• <strong>City Breakdown:</strong> Performance in major cities</li>
                <li>• <strong>Time Zone Analysis:</strong> Optimal sending times by region</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-3">Device and Client Analysis</h3>
              <p className="text-sm text-muted-foreground mb-3">How fans read your emails:</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• <strong>Mobile vs. Desktop:</strong> Device preferences</li>
                <li>• <strong>Email Clients:</strong> Gmail, Apple Mail, Outlook performance</li>
                <li>• <strong>Operating Systems:</strong> iOS, Android, Windows engagement</li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Link Performance</h3>
            <p className="text-sm text-muted-foreground mb-3">Track individual link clicks:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Badge variant="outline">Most Clicked Links</Badge>
              <Badge variant="outline">Link Categories</Badge>
              <Badge variant="outline">Click Timing</Badge>
              <Badge variant="outline">Social Shares</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audience Analytics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-3">Subscriber Growth</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Growth Rate:</strong> New subscribers over time</li>
                <li>• <strong>Churn Rate:</strong> Unsubscribes and inactive fans</li>
                <li>• <strong>Net Growth:</strong> Overall list health</li>
                <li>• <strong>Growth Sources:</strong> Where new fans come from</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-3">Engagement Segmentation</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">Super Fans</Badge>
                  <span className="text-sm">80%+ open rate</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-800">Regular Fans</Badge>
                  <span className="text-sm">40-80% open rate</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-yellow-100 text-yellow-800">Casual Fans</Badge>
                  <span className="text-sm">10-40% open rate</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-gray-100 text-gray-800">Inactive Fans</Badge>
                  <span className="text-sm">&lt;10% open rate</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Deliverability Analytics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-3">Inbox Placement</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Inbox Rate:</strong> Emails delivered to inbox vs. spam</li>
                <li>• <strong>Spam Rate:</strong> Percentage going to spam folders</li>
                <li>• <strong>Bounce Rate:</strong> Undeliverable emails</li>
                <li>• <strong>Complaint Rate:</strong> Spam complaints from recipients</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-3">Sender Reputation</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Domain Reputation:</strong> Your sending domain's reputation</li>
                <li>• <strong>IP Reputation:</strong> Sending IP address reputation</li>
                <li>• <strong>Authentication Status:</strong> SPF, DKIM, DMARC pass rates</li>
                <li>• <strong>Blacklist Monitoring:</strong> Any blacklist appearances</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Lightbulb className="h-4 w-4"/>
        <AlertDescription>
          <strong>Pro Tip:</strong> Focus on engagement quality over quantity. A smaller, highly engaged list performs better than a large, unengaged one.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Reporting Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-3">Automated Reports</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Weekly Summaries:</strong> Key metrics and trends</li>
                <li>• <strong>Monthly Reports:</strong> Comprehensive performance review</li>
                <li>• <strong>Campaign Reports:</strong> Individual campaign analysis</li>
                <li>• <strong>Custom Reports:</strong> Tailored to your needs</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-3">Data Export</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>CSV Export:</strong> Raw data for external analysis</li>
                <li>• <strong>Campaign Data:</strong> Detailed campaign performance</li>
                <li>• <strong>Subscriber Data:</strong> Fan information and engagement</li>
                <li>• <strong>Custom Exports:</strong> Specific data sets</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Using Analytics to Improve</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Optimization Strategies</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="text-sm font-medium mb-2">Improve Open Rates</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• A/B test subject lines</li>
                  <li>• Optimize send times</li>
                  <li>• Test different sender names</li>
                  <li>• Improve preview text</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Increase Click Rates</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Test call-to-action buttons</li>
                  <li>• Improve content relevance</li>
                  <li>• Optimize link placement</li>
                  <li>• Ensure mobile-friendly design</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Performance Benchmarking</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Badge variant="outline">Industry Comparison</Badge>
              <Badge variant="outline">Historical Performance</Badge>
              <Badge variant="outline">Segment Comparison</Badge>
              <Badge variant="outline">Campaign Type Analysis</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>);
}
