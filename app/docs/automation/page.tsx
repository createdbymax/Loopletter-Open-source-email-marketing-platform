import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Zap, Mail, Users, Clock, Target, Heart, Lightbulb } from 'lucide-react';

export default function AutomationPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Email Automation</h1>
        <p className="text-xl text-muted-foreground mt-4">
          Set up automated email sequences to engage fans without manual work. Stay connected consistently, even when you're busy creating music or touring.
        </p>
      </div>

      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Why Use Email Automation?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-2">Consistent Engagement</h3>
              <p className="text-sm text-muted-foreground">
                Stay connected with fans automatically, building relationships over time without constant manual effort.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Better Fan Experience</h3>
              <p className="text-sm text-muted-foreground">
                Deliver timely, relevant content based on fan behavior and preferences for higher engagement.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Heart className="h-4 w-4" />
              Welcome Series
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Introduce new subscribers to your music and story with a sequence of welcome emails.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="h-4 w-4" />
              Drip Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Deliver content over time to build relationships and share your musical journey.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4" />
              Behavioral Triggers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Respond to fan actions automatically with relevant follow-up content.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              Re-engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Win back inactive subscribers with targeted campaigns to rekindle their interest.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Setting Up Your First Automation</CardTitle>
          <CardDescription>
            Step-by-step guide to creating automated email sequences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">1</Badge>
              <div>
                <h3 className="font-medium">Choose Trigger</h3>
                <p className="text-sm text-muted-foreground">
                  Select what starts the automation (new subscriber, purchase, email click, etc.)
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">2</Badge>
              <div>
                <h3 className="font-medium">Design Sequence</h3>
                <p className="text-sm text-muted-foreground">
                  Plan your email series with timing and content that tells your story
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">3</Badge>
              <div>
                <h3 className="font-medium">Create Emails</h3>
                <p className="text-sm text-muted-foreground">
                  Write and design each email in the sequence with compelling content
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">4</Badge>
              <div>
                <h3 className="font-medium">Set Timing</h3>
                <p className="text-sm text-muted-foreground">
                  Define delays between emails (hours, days, weeks) for optimal engagement
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">5</Badge>
              <div>
                <h3 className="font-medium">Test and Launch</h3>
                <p className="text-sm text-muted-foreground">
                  Test the sequence with yourself and team members, then activate automation
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Welcome Series Best Practices</CardTitle>
          <CardDescription>
            Create an effective onboarding experience for new fans
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Typical Welcome Sequence:</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Badge className="bg-green-100 text-green-800 mt-0.5">Immediate</Badge>
                <div>
                  <h4 className="text-sm font-medium">Welcome Email</h4>
                  <p className="text-sm text-muted-foreground">
                    Thank them for subscribing, set expectations, provide immediate value (free song, exclusive content)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge className="bg-blue-100 text-blue-800 mt-0.5">Day 2</Badge>
                <div>
                  <h4 className="text-sm font-medium">Your Story</h4>
                  <p className="text-sm text-muted-foreground">
                    Share your musical journey, include personal photos or videos, explain your mission
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge className="bg-purple-100 text-purple-800 mt-0.5">Day 5</Badge>
                <div>
                  <h4 className="text-sm font-medium">Best Music</h4>
                  <p className="text-sm text-muted-foreground">
                    Showcase your top tracks, include streaming links, share stories behind the songs
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge className="bg-orange-100 text-orange-800 mt-0.5">Day 8</Badge>
                <div>
                  <h4 className="text-sm font-medium">Behind the Scenes</h4>
                  <p className="text-sm text-muted-foreground">
                    Studio photos/videos, songwriting process, personal insights, exclusive previews
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge className="bg-pink-100 text-pink-800 mt-0.5">Day 12</Badge>
                <div>
                  <h4 className="text-sm font-medium">Community</h4>
                  <p className="text-sm text-muted-foreground">
                    Connect on social media, join fan communities, upcoming events and shows
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Automation Triggers</CardTitle>
          <CardDescription>
            Different ways to start automated sequences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-3">Subscription Triggers</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>New Subscriber:</strong> Anyone who joins your list</li>
                <li>• <strong>Segment Join:</strong> Fans added to specific segments</li>
                <li>• <strong>Tag Added:</strong> When fans get tagged with specific labels</li>
                <li>• <strong>Import:</strong> Fans added through CSV import</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-3">Behavioral Triggers</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Email Opened:</strong> Fans who open specific campaigns</li>
                <li>• <strong>Link Clicked:</strong> Fans who click specific links</li>
                <li>• <strong>No Engagement:</strong> Fans who haven't engaged recently</li>
                <li>• <strong>High Engagement:</strong> Very active fans</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-3">Date-Based Triggers</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Anniversary:</strong> Subscription anniversary dates</li>
                <li>• <strong>Birthday:</strong> Fan birthday campaigns</li>
                <li>• <strong>Seasonal:</strong> Holiday or seasonal content</li>
                <li>• <strong>Event-Based:</strong> Album releases, tour dates</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-3">Purchase-Based Triggers</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Post-Purchase:</strong> Thank fans for buying music/merch</li>
                <li>• <strong>Abandoned Cart:</strong> Remind about incomplete purchases</li>
                <li>• <strong>VIP Upgrades:</strong> Special content for paying fans</li>
                <li>• <strong>Renewal Reminders:</strong> Subscription renewals</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Timing Best Practices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-3">Optimal Delays</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Welcome Email</span>
                  <Badge variant="outline">Immediate</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Follow-up</span>
                  <Badge variant="outline">2-3 days</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Educational Content</span>
                  <Badge variant="outline">5-7 days</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Promotional</span>
                  <Badge variant="outline">1-2 weeks</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Re-engagement</span>
                  <Badge variant="outline">30-60 days</Badge>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Time Considerations</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Fan Time Zones:</strong> Send at local optimal times</li>
                <li>• <strong>Content Type:</strong> Educational vs. promotional timing</li>
                <li>• <strong>Sequence Length:</strong> Don't overwhelm with too many emails</li>
                <li>• <strong>Frequency:</strong> Balance automation with regular campaigns</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Common Automation Scenarios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">New Album Release</h3>
            <div className="bg-muted p-4 rounded-md space-y-2 text-sm">
              <div><strong>Trigger:</strong> Album announcement</div>
              <div><strong>Sequence:</strong></div>
              <div>1. Announcement: Album coming soon</div>
              <div>2. Behind the Scenes: Creation process (1 week later)</div>
              <div>3. Pre-order: Available for pre-order (2 weeks later)</div>
              <div>4. Release Day: Album is live (release day)</div>
              <div>5. Thank You: Post-release gratitude (1 week after)</div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Tour Announcement</h3>
            <div className="bg-muted p-4 rounded-md space-y-2 text-sm">
              <div><strong>Trigger:</strong> Tour dates announced</div>
              <div><strong>Sequence:</strong></div>
              <div>1. Tour Announcement: Dates and cities</div>
              <div>2. Presale Access: Early ticket access (2 days later)</div>
              <div>3. General Sale: Public tickets available (1 week later)</div>
              <div>4. Sold Out/Last Chance: Create urgency (as needed)</div>
              <div>5. Pre-Show: Day before each show</div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Re-engagement Campaign</h3>
            <div className="bg-muted p-4 rounded-md space-y-2 text-sm">
              <div><strong>Trigger:</strong> 60 days of no engagement</div>
              <div><strong>Sequence:</strong></div>
              <div>1. We Miss You: Acknowledge absence</div>
              <div>2. What's New: Update on recent activities (3 days later)</div>
              <div>3. Exclusive Offer: Special content or discount (1 week later)</div>
              <div>4. Final Chance: Last attempt before removal (2 weeks later)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Advanced Automation Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Conditional Logic</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Create branching paths based on fan behavior:
            </p>
            <div className="bg-muted p-4 rounded-md space-y-2 text-sm">
              <div><strong>If fan opens Email 1:</strong></div>
              <div>→ Send engaging content series</div>
              <div><strong>If fan doesn't open Email 1:</strong></div>
              <div>→ Send re-engagement sequence</div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Personalization</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Make automation feel personal:
            </p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• <strong>Dynamic Content:</strong> Insert fan name, location, interests</li>
              <li>• <strong>Behavioral Data:</strong> Reference past purchases or engagement</li>
              <li>• <strong>Preference-Based:</strong> Content based on stated preferences</li>
              <li>• <strong>Timing:</strong> Send at fan's optimal engagement times</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Measuring Automation Success</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-3">Key Metrics</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Sequence Completion Rate:</strong> Fans who complete entire sequence</li>
                <li>• <strong>Email Performance:</strong> Open/click rates for each email</li>
                <li>• <strong>Conversion Rate:</strong> Actions taken (purchases, social follows)</li>
                <li>• <strong>Unsubscribe Rate:</strong> Fans leaving during sequence</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-3">Optimization</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>A/B Test:</strong> Different subject lines, content, timing</li>
                <li>• <strong>Sequence Length:</strong> Optimal number of emails</li>
                <li>• <strong>Content Performance:</strong> Which emails work best</li>
                <li>• <strong>Timing Optimization:</strong> Best delays between emails</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertDescription>
          <strong>Pro Tip:</strong> Start with a simple welcome series, then gradually add more complex automations as you learn what resonates with your audience.
        </AlertDescription>
      </Alert>
    </div>
  );
}