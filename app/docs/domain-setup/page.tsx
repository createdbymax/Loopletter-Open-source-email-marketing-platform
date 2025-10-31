import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Globe, Shield, CheckCircle, AlertTriangle, Lightbulb, Mail } from 'lucide-react';
export default function DomainSetupPage() {
    return (<div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Email Domain Setup</h1>
        <p className="text-xl text-muted-foreground mt-4">
          Set up email authentication to improve deliverability, build trust with your fans, and establish your brand identity.
        </p>
      </div>

      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5"/>
            Why Set Up Your Domain?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-2">Better Deliverability</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Higher inbox placement rates</li>
                <li>• Lower spam folder placement</li>
                <li>• Improved sender reputation</li>
                <li>• Better email authentication</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Brand Recognition</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Emails from your domain</li>
                <li>• Consistent branding</li>
                <li>• Professional appearance</li>
                <li>• Increased fan trust</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prerequisites</CardTitle>
          <CardDescription>
            What you need before starting domain setup
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5"/>
              <div>
                <h3 className="font-medium">Domain Ownership</h3>
                <p className="text-sm text-muted-foreground">
                  A domain name you own (yourdomain.com)
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5"/>
              <div>
                <h3 className="font-medium">DNS Access</h3>
                <p className="text-sm text-muted-foreground">
                  Access to your domain's DNS settings
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5"/>
              <div>
                <h3 className="font-medium">Basic DNS Knowledge</h3>
                <p className="text-sm text-muted-foreground">
                  Understanding of DNS records (we'll guide you through it)
                </p>
              </div>
            </div>
          </div>

          <Alert className="mt-4">
            <Lightbulb className="h-4 w-4"/>
            <AlertDescription>
              If you don't have a domain, you can purchase one from registrars like GoDaddy, Namecheap, or Google Domains.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Domain Setup Process</CardTitle>
          <CardDescription>
            Step-by-step guide to configure your domain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">1</Badge>
              <div>
                <h3 className="font-medium">Add Your Domain</h3>
                <p className="text-sm text-muted-foreground">
                  In Loopletter, go to <strong>Settings</strong> → <strong>Domain Setup</strong> → <strong>Add Domain</strong>
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">2</Badge>
              <div>
                <h3 className="font-medium">Verify Domain Ownership</h3>
                <p className="text-sm text-muted-foreground">
                  Add a TXT record to prove you own the domain
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">3</Badge>
              <div>
                <h3 className="font-medium">Configure DNS Records</h3>
                <p className="text-sm text-muted-foreground">
                  Add SPF, DKIM, and DMARC records to your DNS
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">4</Badge>
              <div>
                <h3 className="font-medium">Verify Setup</h3>
                <p className="text-sm text-muted-foreground">
                  Our system checks that all records are properly configured
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">5</Badge>
              <div>
                <h3 className="font-medium">Start Sending</h3>
                <p className="text-sm text-muted-foreground">
                  Begin sending emails from your verified domain
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>DNS Records Explained</CardTitle>
          <CardDescription>
            Understanding the authentication records you'll need to add
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4"/>
              SPF (Sender Policy Framework)
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Specifies which servers can send email from your domain.
            </p>
            <div className="bg-muted p-3 rounded-md text-sm font-mono">
              <div><strong>Type:</strong> TXT</div>
              <div><strong>Name:</strong> @</div>
              <div><strong>Value:</strong> v=spf1 include:amazonses.com ~all</div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4"/>
              DKIM (DomainKeys Identified Mail)
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Adds a digital signature to verify email authenticity.
            </p>
            <div className="bg-muted p-3 rounded-md text-sm font-mono">
              <div><strong>Type:</strong> CNAME</div>
              <div><strong>Name:</strong> [provided-by-loopletter]._domainkey</div>
              <div><strong>Value:</strong> [provided-by-loopletter].dkim.amazonses.com</div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4"/>
              DMARC (Domain-based Message Authentication)
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Tells email providers what to do with emails that fail authentication.
            </p>
            <div className="bg-muted p-3 rounded-md text-sm font-mono">
              <div><strong>Type:</strong> TXT</div>
              <div><strong>Name:</strong> _dmarc</div>
              <div><strong>Value:</strong> v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Step-by-Step DNS Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">1. Access Your DNS Settings</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Log into your domain registrar or DNS provider:
            </p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• <strong>GoDaddy:</strong> Domain management → DNS</li>
              <li>• <strong>Namecheap:</strong> Domain list → Manage → Advanced DNS</li>
              <li>• <strong>Cloudflare:</strong> DNS → Records</li>
              <li>• <strong>Google Domains:</strong> DNS → Custom records</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-3">2. Add Domain Verification Record</h3>
            <div className="bg-muted p-3 rounded-md text-sm space-y-1">
              <div><strong>Type:</strong> TXT</div>
              <div><strong>Name:</strong> @ (or leave blank)</div>
              <div><strong>Value:</strong> [verification-code-from-loopletter]</div>
              <div><strong>TTL:</strong> 300 (or default)</div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">3. Add SPF Record</h3>
            <div className="bg-muted p-3 rounded-md text-sm space-y-1">
              <div><strong>Type:</strong> TXT</div>
              <div><strong>Name:</strong> @ (or leave blank)</div>
              <div><strong>Value:</strong> v=spf1 include:amazonses.com ~all</div>
              <div><strong>TTL:</strong> 300</div>
            </div>
            
            <Alert className="mt-3 border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600"/>
              <AlertDescription className="text-orange-800">
                If you already have an SPF record, modify it to include <code>include:amazonses.com</code> rather than creating a duplicate.
              </AlertDescription>
            </Alert>
          </div>

          <div>
            <h3 className="font-medium mb-3">4. Add DKIM Records</h3>
            <p className="text-sm text-muted-foreground mb-3">
              You'll receive 3 DKIM records from Loopletter:
            </p>
            <div className="bg-muted p-3 rounded-md text-sm space-y-2">
              <div>
                <div><strong>Type:</strong> CNAME</div>
                <div><strong>Name:</strong> [token1]._domainkey</div>
                <div><strong>Value:</strong> [token1].dkim.amazonses.com</div>
              </div>
              <div className="border-t pt-2">
                <div><strong>Type:</strong> CNAME</div>
                <div><strong>Name:</strong> [token2]._domainkey</div>
                <div><strong>Value:</strong> [token2].dkim.amazonses.com</div>
              </div>
              <div className="border-t pt-2">
                <div><strong>Type:</strong> CNAME</div>
                <div><strong>Name:</strong> [token3]._domainkey</div>
                <div><strong>Value:</strong> [token3].dkim.amazonses.com</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">5. Add DMARC Record</h3>
            <div className="bg-muted p-3 rounded-md text-sm space-y-1">
              <div><strong>Type:</strong> TXT</div>
              <div><strong>Name:</strong> _dmarc</div>
              <div><strong>Value:</strong> v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com</div>
              <div><strong>TTL:</strong> 300</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Verification Process</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">DNS Propagation</h3>
            <p className="text-sm text-muted-foreground mb-3">After adding records:</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Changes can take 5 minutes to 48 hours</li>
              <li>• Most changes propagate within 1-2 hours</li>
              <li>• Use DNS checker tools to verify propagation</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-3">Loopletter Verification</h3>
            <p className="text-sm text-muted-foreground mb-3">Our system checks:</p>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500"/>
                <span className="text-sm">Domain ownership verification</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500"/>
                <span className="text-sm">SPF record presence and format</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500"/>
                <span className="text-sm">All 3 DKIM records</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500"/>
                <span className="text-sm">DMARC record (recommended)</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Verification Status</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                <span className="text-sm">Records not yet detected</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800">Verified</Badge>
                <span className="text-sm">All records found and valid</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-red-100 text-red-800">Failed</Badge>
                <span className="text-sm">Issues with one or more records</span>
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
              <h3 className="font-medium mb-3">Domain Selection</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Use your main brand domain</li>
                <li>• Avoid new or suspicious TLDs</li>
                <li>• Consider domain age and history</li>
                <li>• Ensure domain renewal is current</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-3">DNS Management</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Use reliable DNS providers</li>
                <li>• Set appropriate TTL values</li>
                <li>• Keep records organized</li>
                <li>• Document all changes</li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Gradual Rollout</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Start with small email volumes</li>
              <li>• Monitor deliverability closely</li>
              <li>• Gradually increase sending volume</li>
              <li>• Watch for any reputation issues</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Mail className="h-4 w-4"/>
        <AlertDescription>
          <strong>Success Tip:</strong> Proper domain setup can improve your deliverability by 20-40% and significantly increase fan trust in your emails.
        </AlertDescription>
      </Alert>
    </div>);
}
