import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Users, Mail, BarChart3, Settings } from 'lucide-react';
export default function GettingStartedPage() {
    return (<div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Getting Started with Loopletter</h1>
        <p className="text-xl text-muted-foreground mt-4">
          Welcome to Loopletter! This guide will help you set up your account and send your first email campaign in minutes.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5"/>
              What is Loopletter?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Loopletter is an email marketing platform built specifically for artists, musicians, and creators. 
              We help you build and manage your fan base, create beautiful campaigns, and track engagement.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5"/>
              Key Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500"/>
                Campaign Management
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500"/>
                Audience Segmentation
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500"/>
                Analytics Dashboard
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500"/>
                Team Collaboration
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Start Checklist</CardTitle>
          <CardDescription>
            Follow these steps to get your email marketing up and running
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">1</Badge>
              <div>
                <h3 className="font-medium">Create Your Account</h3>
                <p className="text-sm text-muted-foreground">
                  Sign up at loopletter.co and complete the onboarding process.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">2</Badge>
              <div>
                <h3 className="font-medium">Set Up Your Profile</h3>
                <p className="text-sm text-muted-foreground">
                  Add your artist name, bio, and branding to personalize your emails.
                </p>
                <Link href="/docs/getting-started/profile-setup" className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-1">
                  Learn more <ArrowRight className="h-3 w-3"/>
                </Link>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">3</Badge>
              <div>
                <h3 className="font-medium">Import Your First Fans</h3>
                <p className="text-sm text-muted-foreground">
                  Upload a CSV file or manually add email addresses to start building your audience.
                </p>
                <Link href="/docs/audience/importing-fans" className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-1">
                  Import guide <ArrowRight className="h-3 w-3"/>
                </Link>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">4</Badge>
              <div>
                <h3 className="font-medium">Verify Your Domain</h3>
                <p className="text-sm text-muted-foreground">
                  Set up email authentication to improve deliverability and build trust.
                </p>
                <Link href="/docs/domain-setup" className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-1">
                  Domain setup <ArrowRight className="h-3 w-3"/>
                </Link>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">5</Badge>
              <div>
                <h3 className="font-medium">Send Your First Campaign</h3>
                <p className="text-sm text-muted-foreground">
                  Create and send your first email to welcome your fans.
                </p>
                <Link href="/docs/campaigns/creating-campaigns" className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-1">
                  Create campaign <ArrowRight className="h-3 w-3"/>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5"/>
              Audience
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Learn how to import, segment, and manage your fan base effectively.
            </p>
            <Link href="/docs/audience/importing-fans" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
              Get started <ArrowRight className="h-3 w-3"/>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5"/>
              Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Create beautiful email campaigns that engage your fans and drive results.
            </p>
            <Link href="/docs/campaigns/creating-campaigns" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
              Learn more <ArrowRight className="h-3 w-3"/>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5"/>
              Setup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Configure your domain and settings for optimal email deliverability.
            </p>
            <Link href="/docs/domain-setup" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
              Setup guide <ArrowRight className="h-3 w-3"/>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/docs/troubleshooting" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
              Troubleshooting Guide <ArrowRight className="h-3 w-3"/>
            </Link>
            <Link href="/docs/troubleshooting/faq" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
              FAQ <ArrowRight className="h-3 w-3"/>
            </Link>
            <Link href="mailto:support@loopletter.co" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
              Contact Support <ArrowRight className="h-3 w-3"/>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>);
}
