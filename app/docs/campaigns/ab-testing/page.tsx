import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { TestTube, Target, BarChart3, Clock, Lightbulb, TrendingUp } from 'lucide-react';
export default function ABTestingPage() {
    return (<div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">A/B Testing</h1>
        <p className="text-xl text-muted-foreground mt-4">
          Test different versions of your emails to optimize performance and increase engagement with your fans.
        </p>
      </div>

      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5"/>
            Why A/B Test Your Emails?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-2">Data-Driven Decisions</h3>
              <p className="text-sm text-muted-foreground">
                Remove guesswork and make decisions based on actual fan behavior and preferences.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Improved Performance</h3>
              <p className="text-sm text-muted-foreground">
                Optimize open rates, click rates, and conversions by testing what works best for your audience.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4"/>
              Subject Lines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Test different subject lines to improve open rates and first impressions.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4"/>
              Send Times
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Find the optimal time to reach your fans when they're most likely to engage.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4"/>
              Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Test different messaging approaches, layouts, and call-to-action buttons.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4"/>
              Sender Name
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Test how you appear in the inbox to maximize recognition and trust.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Setting Up A/B Tests</CardTitle>
          <CardDescription>
            Step-by-step guide to creating effective A/B tests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">1</Badge>
              <div>
                <h3 className="font-medium">Choose What to Test</h3>
                <p className="text-sm text-muted-foreground">
                  Select one element to test at a time for clear results (subject line, send time, content, etc.)
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">2</Badge>
              <div>
                <h3 className="font-medium">Create Variations</h3>
                <p className="text-sm text-muted-foreground">
                  Design version A and version B with only the test element different
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">3</Badge>
              <div>
                <h3 className="font-medium">Set Test Parameters</h3>
                <p className="text-sm text-muted-foreground">
                  Choose test size (% of audience), duration, and success metric
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">4</Badge>
              <div>
                <h3 className="font-medium">Launch Test</h3>
                <p className="text-sm text-muted-foreground">
                  Send both versions simultaneously to randomly selected audience segments
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">5</Badge>
              <div>
                <h3 className="font-medium">Analyze Results</h3>
                <p className="text-sm text-muted-foreground">
                  Wait for statistical significance, then send winning version to remaining audience
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subject Line Testing</CardTitle>
          <CardDescription>
            The most impactful test for improving open rates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">What to Test</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-sm font-medium mb-2">Length</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Short vs. long subject lines</li>
                  <li>• Mobile-optimized length (&lt;50 chars)</li>
                  <li>• Descriptive vs. mysterious</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Tone & Style</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Casual vs. formal language</li>
                  <li>• Questions vs. statements</li>
                  <li>• Emojis vs. text only</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Personalization</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Including fan's name</li>
                  <li>• Location-based content</li>
                  <li>• Interest-based messaging</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Urgency & Scarcity</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Time-sensitive language</li>
                  <li>• Limited availability mentions</li>
                  <li>• Exclusive access offers</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Example Tests</h3>
            <div className="space-y-3">
              <div className="bg-muted p-3 rounded-md">
                <div className="text-sm font-medium mb-1">Version A (Personal):</div>
                <div className="text-sm">"Hey [Name], new song just dropped! 🎵"</div>
              </div>
              <div className="bg-muted p-3 rounded-md">
                <div className="text-sm font-medium mb-1">Version B (Direct):</div>
                <div className="text-sm">"New Single: 'Midnight Dreams' Available Now"</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Send Time Testing</CardTitle>
          <CardDescription>
            Find when your fans are most likely to engage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Testing Approach</h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium mb-2">Day of Week</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Test different days to find when your audience is most active:
                </p>
                <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
                  <Badge variant="outline" className="text-xs">Monday</Badge>
                  <Badge variant="outline" className="text-xs">Tuesday</Badge>
                  <Badge variant="outline" className="text-xs">Wednesday</Badge>
                  <Badge variant="outline" className="text-xs">Thursday</Badge>
                  <Badge variant="outline" className="text-xs">Friday</Badge>
                  <Badge variant="outline" className="text-xs">Saturday</Badge>
                  <Badge variant="outline" className="text-xs">Sunday</Badge>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Time of Day</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Test different hours to optimize engagement:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Badge variant="outline" className="text-xs">Morning (8-10 AM)</Badge>
                  <Badge variant="outline" className="text-xs">Midday (11 AM-1 PM)</Badge>
                  <Badge variant="outline" className="text-xs">Afternoon (2-4 PM)</Badge>
                  <Badge variant="outline" className="text-xs">Evening (6-8 PM)</Badge>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Industry Benchmarks</h3>
            <div className="bg-muted p-4 rounded-md space-y-2 text-sm">
              <div><strong>Best Days:</strong> Tuesday, Wednesday, Thursday</div>
              <div><strong>Best Times:</strong> 10 AM - 2 PM, 6 PM - 8 PM</div>
              <div><strong>Avoid:</strong> Monday mornings, Friday afternoons, weekends (unless event-related)</div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Remember: Your audience may be different! Always test with your specific fans.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content & Design Testing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-3">Email Layout</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Single column vs. multi-column</strong></li>
                <li>• <strong>Image placement:</strong> Top, side, or bottom</li>
                <li>• <strong>Text length:</strong> Short vs. detailed</li>
                <li>• <strong>White space:</strong> Minimal vs. generous</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-3">Call-to-Action (CTA)</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Button text:</strong> "Listen Now" vs. "Check It Out"</li>
                <li>• <strong>Button color:</strong> Brand colors vs. contrasting</li>
                <li>• <strong>Placement:</strong> Top, middle, or bottom</li>
                <li>• <strong>Number:</strong> Single CTA vs. multiple options</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-3">Content Approach</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Personal vs. professional tone</strong></li>
                <li>• <strong>Story-driven vs. announcement style</strong></li>
                <li>• <strong>Behind-the-scenes vs. polished content</strong></li>
                <li>• <strong>Text-heavy vs. visual-focused</strong></li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-3">Sender Information</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Artist name only</strong></li>
                <li>• <strong>"Artist Name Team"</strong></li>
                <li>• <strong>"First Name from Band Name"</strong></li>
                <li>• <strong>Band/project name only</strong></li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Analyzing Test Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Key Metrics to Track</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-sm font-medium mb-2">Primary Metrics</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• <strong>Open Rate:</strong> For subject line tests</li>
                  <li>• <strong>Click Rate:</strong> For content and CTA tests</li>
                  <li>• <strong>Conversion Rate:</strong> For overall effectiveness</li>
                  <li>• <strong>Unsubscribe Rate:</strong> For content relevance</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Secondary Metrics</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• <strong>Time to open:</strong> How quickly fans engage</li>
                  <li>• <strong>Forward rate:</strong> Social sharing indicator</li>
                  <li>• <strong>Reply rate:</strong> Engagement depth</li>
                  <li>• <strong>List growth:</strong> Long-term impact</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Statistical Significance</h3>
            <div className="bg-muted p-4 rounded-md space-y-2 text-sm">
              <div><strong>Minimum Test Size:</strong> At least 1,000 recipients per variation</div>
              <div><strong>Confidence Level:</strong> 95% confidence for reliable results</div>
              <div><strong>Test Duration:</strong> Run for at least 24-48 hours</div>
              <div><strong>Winner Threshold:</strong> Clear performance difference (5%+ improvement)</div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Making Decisions</h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium mb-2">Clear Winner</h4>
                <p className="text-sm text-muted-foreground">
                  When one version significantly outperforms the other, implement the winning approach in future campaigns.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">No Clear Winner</h4>
                <p className="text-sm text-muted-foreground">
                  If results are similar, consider testing other elements or running the test again with a larger sample size.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Unexpected Results</h4>
                <p className="text-sm text-muted-foreground">
                  Sometimes tests reveal surprising insights about your audience. Embrace these learnings for future strategy.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Best Practices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-3">Test Design</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Test one element at a time</li>
                <li>• Use random audience splits</li>
                <li>• Ensure adequate sample sizes</li>
                <li>• Run tests for sufficient duration</li>
                <li>• Document all test parameters</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-3">Ongoing Testing</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Test regularly, not just occasionally</li>
                <li>• Build a testing calendar</li>
                <li>• Share results with your team</li>
                <li>• Apply learnings to future campaigns</li>
                <li>• Re-test winning elements periodically</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Lightbulb className="h-4 w-4"/>
        <AlertDescription>
          <strong>Pro Tip:</strong> Start with subject line testing for the biggest impact, then move to send time optimization. 
          Small improvements compound over time to significantly boost your email performance.
        </AlertDescription>
      </Alert>
    </div>);
}
