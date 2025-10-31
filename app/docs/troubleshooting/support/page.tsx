import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Mail, Phone, Clock, HelpCircle, FileText, Video, Users } from 'lucide-react';
export default function ContactSupportPage() {
    return (<div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Contact Support</h1>
        <p className="text-xl text-muted-foreground mt-4">
          Get help when you need it. Our support team is here to help you succeed with your email marketing.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageCircle className="h-4 w-4"/>
              Live Chat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Instant help for quick questions and urgent issues.
            </p>
            <Badge variant="outline" className="text-xs">Available 9 AM - 6 PM EST</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="h-4 w-4"/>
              Email Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Detailed help for complex issues and feature requests.
            </p>
            <Badge variant="outline" className="text-xs">24-48 hour response</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Phone className="h-4 w-4"/>
              Phone Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Direct phone support for Label/Agency plan subscribers.
            </p>
            <Badge variant="outline" className="text-xs">Premium plans only</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4"/>
              Community
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Connect with other artists and share best practices.
            </p>
            <Badge variant="outline" className="text-xs">24/7 community help</Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How to Contact Support</CardTitle>
          <CardDescription>
            Choose the best method based on your needs and subscription plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Live Chat Support</h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium mb-2">How to Access:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Click the chat bubble in the bottom-right corner of any page</li>
                  <li>• Available when logged into your Loopletter account</li>
                  <li>• Instant connection with support agents</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Best For:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Quick questions about features</li>
                  <li>• Urgent issues affecting campaigns</li>
                  <li>• Account access problems</li>
                  <li>• Billing questions</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Availability:</h4>
                <div className="bg-muted p-3 rounded-md text-sm">
                  <div><strong>Monday - Friday:</strong> 9 AM - 6 PM EST</div>
                  <div><strong>Response Time:</strong> Usually within 2-5 minutes</div>
                  <div><strong>Languages:</strong> English (primary), Spanish available</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Email Support</h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium mb-2">Contact Information:</h4>
                <div className="bg-muted p-3 rounded-md text-sm">
                  <div><strong>Email:</strong> support@loopletter.co</div>
                  <div><strong>Response Time:</strong> 24-48 hours</div>
                  <div><strong>Availability:</strong> 24/7 (responses during business hours)</div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Best For:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Complex technical issues</li>
                  <li>• Feature requests and feedback</li>
                  <li>• Account setup assistance</li>
                  <li>• Integration help</li>
                  <li>• Detailed troubleshooting</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">What to Include:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Your account email address</li>
                  <li>• Detailed description of the issue</li>
                  <li>• Screenshots or error messages</li>
                  <li>• Steps you've already tried</li>
                  <li>• Browser and device information (if relevant)</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Phone Support</h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium mb-2">Availability:</h4>
                <div className="bg-muted p-3 rounded-md text-sm">
                  <div><strong>Plans:</strong> Label/Agency subscribers only</div>
                  <div><strong>Hours:</strong> Monday - Friday, 10 AM - 5 PM EST</div>
                  <div><strong>Scheduling:</strong> By appointment through support chat or email</div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Best For:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Complex account setup</li>
                  <li>• Strategic email marketing consultation</li>
                  <li>• Urgent issues for high-volume senders</li>
                  <li>• Team training and onboarding</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Support by Subscription Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Support Type</th>
                  <th className="text-center py-2 font-medium">Starter</th>
                  <th className="text-center py-2 font-medium">Independent</th>
                  <th className="text-center py-2 font-medium">Label/Agency</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">Email Support</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Live Chat</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Priority Support</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Phone Support</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Dedicated Account Manager</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Response Time</td>
                  <td className="text-center">48 hours</td>
                  <td className="text-center">24 hours</td>
                  <td className="text-center">4 hours</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Self-Help Resources</CardTitle>
          <CardDescription>
            Find answers quickly with our comprehensive help resources
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4"/>
                Documentation
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <a href="/docs" className="text-primary hover:underline">Complete user guide</a></li>
                <li>• <a href="/docs/troubleshooting" className="text-primary hover:underline">Troubleshooting guide</a></li>
                <li>• <a href="/docs/troubleshooting/faq" className="text-primary hover:underline">Frequently asked questions</a></li>
                <li>• Step-by-step tutorials</li>
                <li>• Best practices guides</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Video className="h-4 w-4"/>
                Video Tutorials
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Getting started walkthrough</li>
                <li>• Campaign creation tutorials</li>
                <li>• Domain setup guide</li>
                <li>• Analytics deep dive</li>
                <li>• Advanced features overview</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Users className="h-4 w-4"/>
                Community Forum
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Connect with other artists</li>
                <li>• Share email marketing tips</li>
                <li>• Get peer advice and feedback</li>
                <li>• Feature requests and discussions</li>
                <li>• Success stories and case studies</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <HelpCircle className="h-4 w-4"/>
                Knowledge Base
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Searchable help articles</li>
                <li>• Common error solutions</li>
                <li>• Feature explanations</li>
                <li>• Integration guides</li>
                <li>• Account management help</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Before Contacting Support</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Information to Gather</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-sm font-medium mb-2">Account Information</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Your account email address</li>
                  <li>• Subscription plan type</li>
                  <li>• Account creation date (if known)</li>
                  <li>• Team member details (if relevant)</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Issue Details</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Exact error messages</li>
                  <li>• When the issue started</li>
                  <li>• Steps to reproduce the problem</li>
                  <li>• What you were trying to accomplish</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Technical Information</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Browser and version</li>
                  <li>• Operating system</li>
                  <li>• Device type (desktop/mobile)</li>
                  <li>• Screenshots of the issue</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Troubleshooting Attempted</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Steps you've already tried</li>
                  <li>• Documentation you've consulted</li>
                  <li>• Whether the issue is consistent</li>
                  <li>• Any workarounds you've found</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Quick Troubleshooting Steps</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">1</Badge>
                <div>
                  <h4 className="text-sm font-medium">Clear Browser Cache</h4>
                  <p className="text-sm text-muted-foreground">
                    Clear your browser cache and cookies, then try again
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">2</Badge>
                <div>
                  <h4 className="text-sm font-medium">Try Different Browser</h4>
                  <p className="text-sm text-muted-foreground">
                    Test in an incognito/private window or different browser
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">3</Badge>
                <div>
                  <h4 className="text-sm font-medium">Check Documentation</h4>
                  <p className="text-sm text-muted-foreground">
                    Search our help docs and FAQ for similar issues
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">4</Badge>
                <div>
                  <h4 className="text-sm font-medium">Verify Account Status</h4>
                  <p className="text-sm text-muted-foreground">
                    Ensure your subscription is active and in good standing
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Response Times & Expectations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-500"/>
                Urgent Issues
              </h3>
              <div className="space-y-2 text-sm">
                <div><strong>Response:</strong> Within 4 hours</div>
                <div><strong>Examples:</strong></div>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Account access issues</li>
                  <li>• Campaign sending failures</li>
                  <li>• Billing problems</li>
                  <li>• Security concerns</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500"/>
                Standard Issues
              </h3>
              <div className="space-y-2 text-sm">
                <div><strong>Response:</strong> Within 24 hours</div>
                <div><strong>Examples:</strong></div>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Feature questions</li>
                  <li>• Integration help</li>
                  <li>• Analytics questions</li>
                  <li>• General troubleshooting</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500"/>
                General Inquiries
              </h3>
              <div className="space-y-2 text-sm">
                <div><strong>Response:</strong> Within 48 hours</div>
                <div><strong>Examples:</strong></div>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Feature requests</li>
                  <li>• Best practice advice</li>
                  <li>• Account optimization</li>
                  <li>• Educational questions</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <MessageCircle className="h-4 w-4"/>
        <AlertDescription>
          <strong>Need immediate help?</strong> Use the live chat feature for the fastest response during business hours. 
          For complex issues, email support provides the most thorough assistance.
        </AlertDescription>
      </Alert>
    </div>);
}
