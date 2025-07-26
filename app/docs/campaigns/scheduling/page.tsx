import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Globe, Zap, Lightbulb, Target } from 'lucide-react';

export default function SchedulingPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Email Scheduling</h1>
        <p className="text-xl text-muted-foreground mt-4">
          Master the timing of your email campaigns to maximize engagement and reach your fans when they're most likely to open and interact.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4" />
              Send Now
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Send immediately for time-sensitive announcements and breaking news.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" />
              Schedule Later
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Plan campaigns in advance for optimal timing and consistent communication.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-4 w-4" />
              Time Zone Optimization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Send at optimal local times for fans across different time zones.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4" />
              Smart Timing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Use data-driven insights to find the best times for your specific audience.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scheduling Options</CardTitle>
          <CardDescription>
            Different ways to time your email campaigns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Immediate Sending</h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium mb-2">When to Use:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Breaking news or urgent announcements</li>
                  <li>• Last-minute show or event changes</li>
                  <li>• Time-sensitive offers or sales</li>
                  <li>• Real-time engagement (live streams, Q&As)</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Considerations:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• May not reach fans at optimal times</li>
                  <li>• Less time for final review and testing</li>
                  <li>• Good for authentic, spontaneous communication</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Scheduled Sending</h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium mb-2">Benefits:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Send at optimal times for your audience</li>
                  <li>• Plan campaigns in advance</li>
                  <li>• Maintain consistent communication schedule</li>
                  <li>• Time for thorough review and testing</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Scheduling Window:</h4>
                <div className="bg-muted p-3 rounded-md text-sm">
                  <div><strong>Maximum:</strong> 30 days in advance</div>
                  <div><strong>Minimum:</strong> 15 minutes from now</div>
                  <div><strong>Recommended:</strong> 1-7 days for optimal planning</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Optimal Timing Guidelines</CardTitle>
          <CardDescription>
            Industry best practices and data-driven recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Best Days of the Week</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-sm font-medium mb-2 text-green-700">Highest Performance</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">Tuesday</Badge>
                    <span className="text-sm">Peak engagement day</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">Wednesday</Badge>
                    <span className="text-sm">Consistent performance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">Thursday</Badge>
                    <span className="text-sm">Good for announcements</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2 text-red-700">Lower Performance</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-red-100 text-red-800">Monday</Badge>
                    <span className="text-sm">Busy start of week</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-red-100 text-red-800">Friday</Badge>
                    <span className="text-sm">Weekend mindset</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-yellow-100 text-yellow-800">Weekend</Badge>
                    <span className="text-sm">Lower but can work for events</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Best Times of Day</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <h4 className="text-sm font-medium mb-2">Morning (8-11 AM)</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• People checking email at work</li>
                  <li>• Good for newsletters</li>
                  <li>• Professional content</li>
                  <li>• B2B communications</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Midday (11 AM-2 PM)</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Lunch break email checking</li>
                  <li>• Peak engagement window</li>
                  <li>• Great for announcements</li>
                  <li>• High open rates</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Evening (6-8 PM)</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Personal time email checking</li>
                  <li>• Entertainment content</li>
                  <li>• Music and creative content</li>
                  <li>• Social engagement</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Music Industry Specific Timing</h3>
            <div className="bg-muted p-4 rounded-md space-y-2 text-sm">
              <div><strong>New Release Announcements:</strong> Tuesday 10 AM - 2 PM</div>
              <div><strong>Tour Dates:</strong> Wednesday-Thursday 11 AM - 1 PM</div>
              <div><strong>Behind-the-Scenes Content:</strong> Thursday-Friday 6 PM - 8 PM</div>
              <div><strong>Event Reminders:</strong> Day before event, 2 PM - 4 PM</div>
              <div><strong>Merchandise:</strong> Friday 12 PM - 2 PM (payday effect)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Time Zone Considerations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Global Audience Strategy</h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium mb-2">Single Send Time</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Choose one optimal time based on your largest audience segment:
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Analyze your audience geographic distribution</li>
                  <li>• Pick the time zone with most subscribers</li>
                  <li>• Consider 12 PM EST for US-focused campaigns</li>
                  <li>• Use 3 PM GMT for international audiences</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Multiple Send Times</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Send the same campaign at optimal local times:
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Create segments by time zone</li>
                  <li>• Schedule multiple sends of same campaign</li>
                  <li>• Ensure consistent messaging across sends</li>
                  <li>• Monitor performance by region</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Regional Optimization</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-sm font-medium mb-2">North America</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div><strong>EST:</strong> 12 PM - 2 PM</div>
                  <div><strong>CST:</strong> 11 AM - 1 PM</div>
                  <div><strong>MST:</strong> 10 AM - 12 PM</div>
                  <div><strong>PST:</strong> 9 AM - 11 AM</div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">International</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div><strong>UK/Ireland:</strong> 1 PM - 3 PM GMT</div>
                  <div><strong>Europe:</strong> 2 PM - 4 PM CET</div>
                  <div><strong>Australia:</strong> 10 AM - 12 PM AEST</div>
                  <div><strong>Asia:</strong> 11 AM - 1 PM local time</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Campaign-Specific Timing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-3">Content-Based Timing</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium mb-2">Newsletters</h4>
                  <p className="text-sm text-muted-foreground">
                    Tuesday-Thursday, 10 AM - 2 PM. Consistent weekly schedule builds expectation.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Announcements</h4>
                  <p className="text-sm text-muted-foreground">
                    Tuesday-Wednesday, 11 AM - 1 PM. Peak attention and sharing times.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Personal Updates</h4>
                  <p className="text-sm text-muted-foreground">
                    Thursday-Friday, 6 PM - 8 PM. When fans have time for longer reads.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Event-Based Timing</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium mb-2">Concert Announcements</h4>
                  <p className="text-sm text-muted-foreground">
                    Tuesday 10 AM for presale, Wednesday 12 PM for general sale.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Album Releases</h4>
                  <p className="text-sm text-muted-foreground">
                    Friday 12 AM (midnight) for release, Thursday 2 PM for pre-release hype.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Event Reminders</h4>
                  <p className="text-sm text-muted-foreground">
                    1 week before: Tuesday 2 PM. Day before: 3 PM. Day of: 10 AM.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scheduling Best Practices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-3">Planning & Preparation</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Create a content calendar</li>
                <li>• Schedule campaigns 1-3 days in advance</li>
                <li>• Allow time for final reviews and edits</li>
                <li>• Consider holidays and industry events</li>
                <li>• Plan around your tour and release schedule</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-3">Testing & Optimization</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• A/B test different send times</li>
                <li>• Track performance by time and day</li>
                <li>• Adjust based on your audience data</li>
                <li>• Monitor engagement patterns over time</li>
                <li>• Document what works for future campaigns</li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Frequency Guidelines</h3>
            <div className="bg-muted p-4 rounded-md space-y-2 text-sm">
              <div><strong>New Artists:</strong> 1-2 emails per month to start</div>
              <div><strong>Active Artists:</strong> 1 email per week maximum</div>
              <div><strong>Tour Season:</strong> 2-3 emails per week (with valuable content)</div>
              <div><strong>Album Release:</strong> Daily emails for 3-5 days (release week only)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Managing Scheduled Campaigns</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Before Sending</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">✓</Badge>
                <div>
                  <h4 className="text-sm font-medium">Final Review</h4>
                  <p className="text-sm text-muted-foreground">
                    Check content, links, images, and recipient list one last time.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">✓</Badge>
                <div>
                  <h4 className="text-sm font-medium">Test Send</h4>
                  <p className="text-sm text-muted-foreground">
                    Send test emails to yourself and team members.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">✓</Badge>
                <div>
                  <h4 className="text-sm font-medium">Timing Confirmation</h4>
                  <p className="text-sm text-muted-foreground">
                    Verify send time and time zone settings are correct.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Modifying Scheduled Campaigns</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div><strong>Before Processing:</strong> Full editing capabilities</div>
              <div><strong>During Processing:</strong> Limited changes possible</div>
              <div><strong>After Sending:</strong> Cannot be modified</div>
              <div><strong>Cancellation:</strong> Possible up to 15 minutes before send time</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertDescription>
          <strong>Pro Tip:</strong> Your audience's behavior is unique. Use these guidelines as a starting point, 
          then test and optimize based on your specific fan engagement patterns.
        </AlertDescription>
      </Alert>
    </div>
  );
}