import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Mail, Users, CreditCard, Settings, Lightbulb } from 'lucide-react';
export default function FAQPage() {
    return (<div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Frequently Asked Questions</h1>
        <p className="text-xl text-muted-foreground mt-4">
          Quick answers to the most common questions about using Loopletter for your email marketing.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5"/>
            Email Campaigns & Sending
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">How many emails can I send per month?</h3>
            <p className="text-sm text-muted-foreground mb-2">
              This depends on your subscription plan:
            </p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• <strong>Starter:</strong> Up to 10,000 emails/month</li>
              <li>• <strong>Independent:</strong> Up to 50,000 emails/month</li>
              <li>• <strong>Label/Agency:</strong> Up to 200,000 emails/month</li>
              <li>• <strong>Custom plans:</strong> Available for higher volumes</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-2">What's the best time to send emails?</h3>
            <p className="text-sm text-muted-foreground">
              For music/entertainment, Tuesday-Thursday between 10 AM - 2 PM typically performs best. 
              However, test different times with your specific audience to find what works best for your fans.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Can I schedule emails in advance?</h3>
            <p className="text-sm text-muted-foreground">
              Yes! You can schedule campaigns up to 30 days in advance. You can also set up automated sequences 
              that send based on triggers like new subscribers or fan behavior.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Why are my emails going to spam?</h3>
            <p className="text-sm text-muted-foreground">
              Common causes include missing domain authentication, spam trigger words, poor sender reputation, 
              or sending to unengaged lists. Complete your domain setup and maintain good list hygiene to improve deliverability.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Can I use my own domain for sending emails?</h3>
            <p className="text-sm text-muted-foreground">
              Yes, and we highly recommend it! Setting up your own domain improves deliverability and brand recognition. 
              We'll guide you through the DNS configuration process.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5"/>
            Audience Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">How do I import my existing fan list?</h3>
            <p className="text-sm text-muted-foreground">
              You can import fans via CSV upload or manually add them one by one. Make sure you have permission 
              to email all contacts and that the CSV includes at minimum an email column.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">What information can I collect about my fans?</h3>
            <p className="text-sm text-muted-foreground mb-2">
              You can collect various data points:
            </p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Email address (required)</li>
              <li>• Name (first and last)</li>
              <li>• Location (city, state, country)</li>
              <li>• Birthday</li>
              <li>• Custom fields (favorite genre, interests, etc.)</li>
              <li>• Tags for organization</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-2">How do segments work?</h3>
            <p className="text-sm text-muted-foreground">
              Segments are groups of fans based on criteria you set (location, engagement, tags, etc.). 
              Dynamic segments update automatically, while static segments remain fixed until you manually change them.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Can fans update their own preferences?</h3>
            <p className="text-sm text-muted-foreground">
              Yes! Fans can access a preference center to update their information, choose email frequency, 
              select content types they're interested in, or unsubscribe entirely.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">What happens when someone unsubscribes?</h3>
            <p className="text-sm text-muted-foreground">
              Unsubscribed contacts are automatically suppressed from all future campaigns. 
              You cannot re-add them without their explicit consent. This protects your sender reputation and complies with email laws.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5"/>
            Billing & Plans
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">What's included in each plan?</h3>
            <div className="space-y-3">
              <div>
                <Badge className="mb-2">Starter</Badge>
                <p className="text-sm text-muted-foreground">
                  Up to 1,000 subscribers, 10,000 emails/month, basic features, email support
                </p>
              </div>
              <div>
                <Badge className="mb-2">Independent</Badge>
                <p className="text-sm text-muted-foreground">
                  Up to 5,000 subscribers, 50,000 emails/month, advanced features, automation, priority support
                </p>
              </div>
              <div>
                <Badge className="mb-2">Label/Agency</Badge>
                <p className="text-sm text-muted-foreground">
                  Up to 25,000 subscribers, 200,000 emails/month, team collaboration, white-label options, phone support
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Can I change my plan anytime?</h3>
            <p className="text-sm text-muted-foreground">
              Yes! You can upgrade or downgrade your plan at any time. Upgrades take effect immediately, 
              while downgrades take effect at your next billing cycle.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">What happens if I exceed my plan limits?</h3>
            <p className="text-sm text-muted-foreground">
              If you exceed your subscriber or email limits, we'll notify you and may temporarily pause sending 
              until you upgrade your plan or your limits reset next month.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Do you offer refunds?</h3>
            <p className="text-sm text-muted-foreground">
              We offer a 30-day money-back guarantee for new subscribers. For other refund requests, 
              please contact our support team to discuss your specific situation.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Is there a free trial?</h3>
            <p className="text-sm text-muted-foreground">
              Yes! We offer a 14-day free trial with full access to all features. 
              No credit card required to start your trial.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5"/>
            Technical Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Do I need technical knowledge to use Loopletter?</h3>
            <p className="text-sm text-muted-foreground">
              Not at all! Loopletter is designed for artists and creators, not developers. 
              Our visual editor makes it easy to create professional emails without coding knowledge.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Can I use HTML in my emails?</h3>
            <p className="text-sm text-muted-foreground">
              Yes! You can use our HTML editor for complete control over your email design, 
              or stick with the visual editor for a simpler experience.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">How do I set up domain authentication?</h3>
            <p className="text-sm text-muted-foreground">
              We provide step-by-step instructions for adding DNS records to your domain. 
              This involves adding SPF, DKIM, and DMARC records to improve deliverability.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Can I integrate with other tools?</h3>
            <p className="text-sm text-muted-foreground">
              Yes! We offer integrations with popular platforms like Shopify, Bandcamp, and social media platforms. 
              We also provide API access for custom integrations.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Is my data secure?</h3>
            <p className="text-sm text-muted-foreground">
              Absolutely. We use industry-standard encryption, regular security audits, and comply with 
              GDPR and other privacy regulations to keep your data and your fans' information safe.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Analytics & Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">What analytics do you provide?</h3>
            <p className="text-sm text-muted-foreground mb-2">
              We track comprehensive metrics including:
            </p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Open rates and click rates</li>
              <li>• Subscriber growth and churn</li>
              <li>• Geographic and device data</li>
              <li>• Link performance and engagement</li>
              <li>• Deliverability and reputation metrics</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-2">What's a good open rate for music emails?</h3>
            <p className="text-sm text-muted-foreground">
              Industry average for music/entertainment is 20-25%. Anything above 25% is considered good, 
              and above 35% is excellent. Focus on engagement quality over just open rates.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Why do my open rates seem low?</h3>
            <p className="text-sm text-muted-foreground">
              Many email clients now block tracking pixels by default (like Apple Mail), which can make 
              open rates appear lower than they actually are. Focus on clicks and conversions as more reliable metrics.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Can I export my analytics data?</h3>
            <p className="text-sm text-muted-foreground">
              Yes! You can export campaign performance data, subscriber lists, and engagement metrics 
              in CSV format for further analysis or reporting.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Legal & Compliance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Is Loopletter GDPR compliant?</h3>
            <p className="text-sm text-muted-foreground">
              Yes! We provide tools for consent management, data deletion requests, and privacy compliance. 
              You're responsible for obtaining proper consent from your subscribers.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">What about CAN-SPAM compliance?</h3>
            <p className="text-sm text-muted-foreground">
              All emails automatically include required elements like unsubscribe links and your physical address. 
              You must ensure you have permission to email your contacts and honor unsubscribe requests.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Can I email purchased lists?</h3>
            <p className="text-sm text-muted-foreground">
              No! This violates our terms of service and email marketing laws. Only email people who have 
              explicitly opted in to receive your emails. This protects your reputation and ensures better results.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">What if someone reports my email as spam?</h3>
            <p className="text-sm text-muted-foreground">
              We automatically process spam complaints and suppress those contacts from future sends. 
              High complaint rates can hurt your sender reputation, so focus on sending relevant content to engaged subscribers.
            </p>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Lightbulb className="h-4 w-4"/>
        <AlertDescription>
          <strong>Still have questions?</strong> Check our full documentation or contact support at support@loopletter.co. 
          We're here to help you succeed with email marketing!
        </AlertDescription>
      </Alert>
    </div>);
}
