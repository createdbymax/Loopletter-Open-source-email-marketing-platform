import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Info, AlertTriangle, Lightbulb } from 'lucide-react';
export default function ProfileSetupPage() {
    return (<div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Setting Up Your Artist Profile</h1>
        <p className="text-xl text-muted-foreground mt-4">
          Your profile is the foundation of your email marketing. It helps fans recognize your emails and builds trust with email providers.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Essential details that appear in your emails and subscription pages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Artist Name</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Your artist or brand name that will appear in email headers and footers.
            </p>
            <div className="bg-muted p-3 rounded-md text-sm font-mono">
              From: Your Artist Name &lt;hello@yourdomain.com&gt;
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Bio and Description</h3>
            <p className="text-sm text-muted-foreground">
              A brief description of your music or creative work. This helps with email footer content, 
              subscription page descriptions, and team member context.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Profile Image</h3>
            <p className="text-sm text-muted-foreground">
              Upload a high-quality image (recommended: 400x400px) that represents your brand.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Branding Settings</CardTitle>
          <CardDescription>
            Customize the visual appearance of your emails and pages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Colors</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Choose primary and secondary colors that match your brand:
            </p>
            <ul className="space-y-1 text-sm">
              <li><Badge variant="outline">Primary Color</Badge> Used for buttons and links</li>
              <li><Badge variant="outline">Secondary Color</Badge> Used for accents and highlights</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-2">Logo</h3>
            <p className="text-sm text-muted-foreground">
              Upload your logo for use in email templates and subscription pages.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>
            Essential contact details for your email campaigns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Reply-To Email</h3>
            <p className="text-sm text-muted-foreground mb-3">
              The email address where fan replies will be sent. This should be:
            </p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• An email you check regularly</li>
              <li>• Professional (avoid generic addresses like noreply@)</li>
              <li>• Consistent with your brand</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-2">Physical Address</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Required by email marketing laws (CAN-SPAM, GDPR). This appears in email footers.
            </p>
            <Alert>
              <Info className="h-4 w-4"/>
              <AlertDescription>
                You can use a P.O. Box or business address. Personal addresses are not recommended for privacy reasons.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social Media Links</CardTitle>
          <CardDescription>
            Add your social media profiles to include in email footers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
            'Instagram', 'Twitter/X', 'TikTok', 'YouTube',
            'Spotify', 'Apple Music', 'SoundCloud', 'Bandcamp'
        ].map((platform) => (<Badge key={platform} variant="outline" className="justify-center py-2">
                {platform}
              </Badge>))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Privacy Settings</CardTitle>
          <CardDescription>
            Configure data collection and consent management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Data Collection</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Configure what information you collect from fans:
            </p>
            <ul className="space-y-1 text-sm">
              <li><Badge>Required</Badge> Email address (always required)</li>
              <li><Badge variant="outline">Optional</Badge> Name, location, birthday, custom fields</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-2">Consent Management</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Set up how you handle subscriber consent:
            </p>
            <ul className="space-y-1 text-sm">
              <li><Badge variant="outline">Double opt-in</Badge> Recommended for better deliverability</li>
              <li><Badge variant="outline">Single opt-in</Badge> Faster signup process</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Once your profile is complete:
          </p>
          <ol className="space-y-2 text-sm">
            <li>1. Set up your domain for better deliverability</li>
            <li>2. Import your first fans</li>
            <li>3. Create your first campaign</li>
          </ol>
        </CardContent>
      </Card>

      <Alert>
        <Lightbulb className="h-4 w-4"/>
        <AlertDescription>
          <strong>Tip:</strong> Complete profile setup improves email deliverability and helps fans recognize your emails in their inbox.
        </AlertDescription>
      </Alert>
    </div>);
}
