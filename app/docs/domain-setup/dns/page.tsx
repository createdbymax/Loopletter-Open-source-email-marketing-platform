import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Settings, Globe, AlertTriangle, CheckCircle, Copy } from 'lucide-react';

export default function DNSConfigurationPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">DNS Configuration</h1>
        <p className="text-xl text-muted-foreground mt-4">
          Detailed guide for configuring DNS records across different providers to authenticate your email domain.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>DNS Provider Instructions</CardTitle>
          <CardDescription>
            Step-by-step instructions for popular DNS providers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">GoDaddy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>1. Log into GoDaddy account</div>
                <div>2. Go to <strong>My Products</strong></div>
                <div>3. Find your domain and click <strong>DNS</strong></div>
                <div>4. Click <strong>Add</strong> to create new records</div>
                <div>5. Select record type (TXT or CNAME)</div>
                <div>6. Enter name and value as provided</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Namecheap</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>1. Log into Namecheap account</div>
                <div>2. Go to <strong>Domain List</strong></div>
                <div>3. Click <strong>Manage</strong> next to your domain</div>
                <div>4. Go to <strong>Advanced DNS</strong> tab</div>
                <div>5. Click <strong>Add New Record</strong></div>
                <div>6. Configure record type and values</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Cloudflare</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>1. Log into Cloudflare dashboard</div>
                <div>2. Select your domain</div>
                <div>3. Go to <strong>DNS</strong> → <strong>Records</strong></div>
                <div>4. Click <strong>Add record</strong></div>
                <div>5. Choose record type</div>
                <div>6. Enter name, content, and TTL</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Google Domains</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>1. Go to Google Domains</div>
                <div>2. Select your domain</div>
                <div>3. Click <strong>DNS</strong> in left sidebar</div>
                <div>4. Scroll to <strong>Custom records</strong></div>
                <div>5. Click <strong>Create new record</strong></div>
                <div>6. Fill in record details</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Record Configuration Examples</CardTitle>
          <CardDescription>
            Exact values to use for each DNS record type
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Domain Verification Record</h3>
            <div className="bg-muted p-4 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                <div><strong>Type:</strong> TXT</div>
                <div><strong>Name/Host:</strong> @ or blank</div>
                <div><strong>Value:</strong> loopletter-verification=abc123xyz</div>
                <div><strong>TTL:</strong> 300 or Auto</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Replace "abc123xyz" with the actual verification code provided by Loopletter.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-3">SPF Record</h3>
            <div className="bg-muted p-4 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                <div><strong>Type:</strong> TXT</div>
                <div><strong>Name/Host:</strong> @ or blank</div>
                <div><strong>Value:</strong> v=spf1 include:amazonses.com ~all</div>
                <div><strong>TTL:</strong> 300 or Auto</div>
              </div>
            </div>
            
            <Alert className="mt-3 border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Existing SPF Records:</strong> If you already have an SPF record, modify it to include 
                <code className="mx-1">include:amazonses.com</code> instead of creating a new one.
              </AlertDescription>
            </Alert>
          </div>

          <div>
            <h3 className="font-medium mb-3">DKIM Records (3 required)</h3>
            <div className="space-y-3">
              <div className="bg-muted p-4 rounded-md">
                <div className="text-sm font-medium mb-2">DKIM Record 1:</div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                  <div><strong>Type:</strong> CNAME</div>
                  <div><strong>Name/Host:</strong> token1._domainkey</div>
                  <div><strong>Value:</strong> token1.dkim.amazonses.com</div>
                  <div><strong>TTL:</strong> 300 or Auto</div>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-md">
                <div className="text-sm font-medium mb-2">DKIM Record 2:</div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                  <div><strong>Type:</strong> CNAME</div>
                  <div><strong>Name/Host:</strong> token2._domainkey</div>
                  <div><strong>Value:</strong> token2.dkim.amazonses.com</div>
                  <div><strong>TTL:</strong> 300 or Auto</div>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-md">
                <div className="text-sm font-medium mb-2">DKIM Record 3:</div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                  <div><strong>Type:</strong> CNAME</div>
                  <div><strong>Name/Host:</strong> token3._domainkey</div>
                  <div><strong>Value:</strong> token3.dkim.amazonses.com</div>
                  <div><strong>TTL:</strong> 300 or Auto</div>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Replace "token1", "token2", and "token3" with the actual DKIM tokens provided by Loopletter.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-3">DMARC Record</h3>
            <div className="bg-muted p-4 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                <div><strong>Type:</strong> TXT</div>
                <div><strong>Name/Host:</strong> _dmarc</div>
                <div><strong>Value:</strong> v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com</div>
                <div><strong>TTL:</strong> 300 or Auto</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Replace "yourdomain.com" with your actual domain name.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Provider-Specific Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-3">GoDaddy Specifics</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Use "@" for root domain records</li>
                <li>• TTL is automatically set</li>
                <li>• Changes take 1-2 hours to propagate</li>
                <li>• CNAME records cannot have "@" as name</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-3">Cloudflare Specifics</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Turn off proxy (gray cloud) for email records</li>
                <li>• Use your domain name for root records</li>
                <li>• TTL can be set to "Auto"</li>
                <li>• Changes propagate within minutes</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-3">Namecheap Specifics</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Use "@" for root domain</li>
                <li>• Automatic TTL is recommended</li>
                <li>• May take up to 48 hours to propagate</li>
                <li>• Check "Advanced DNS" tab for records</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-3">Google Domains Specifics</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Leave name blank for root domain</li>
                <li>• TTL defaults to 3600 seconds</li>
                <li>• Usually propagates within 1 hour</li>
                <li>• Use "Custom records" section</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Common DNS Issues</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Record Format Issues</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium">Wrong Record Type</h4>
                  <p className="text-sm text-muted-foreground">
                    Ensure SPF and DMARC use TXT records, DKIM uses CNAME records.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium">Incorrect Name Field</h4>
                  <p className="text-sm text-muted-foreground">
                    Use "@" or blank for root domain, exact subdomain for DKIM records.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium">Typos in Values</h4>
                  <p className="text-sm text-muted-foreground">
                    Double-check all values for spelling and formatting errors.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Propagation Issues</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium">Wait for Propagation</h4>
                  <p className="text-sm text-muted-foreground">
                    DNS changes can take up to 48 hours to fully propagate worldwide.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium">Clear DNS Cache</h4>
                  <p className="text-sm text-muted-foreground">
                    Clear your local DNS cache or use online DNS checkers.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium">Check Multiple Locations</h4>
                  <p className="text-sm text-muted-foreground">
                    Use tools like whatsmydns.net to check propagation globally.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Verification Tools</CardTitle>
          <CardDescription>
            Tools to check if your DNS records are configured correctly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-2">DNS Lookup Tools</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• whatsmydns.net - Global DNS propagation</li>
                <li>• mxtoolbox.com - Comprehensive DNS tools</li>
                <li>• dnschecker.org - Multi-location DNS check</li>
                <li>• Google Admin Toolbox - Google's DNS tools</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2">Email Authentication Tools</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• DMARC Analyzer - DMARC record checker</li>
                <li>• SPF Record Checker - Validate SPF syntax</li>
                <li>• DKIM Validator - Test DKIM signatures</li>
                <li>• Mail Tester - Overall email setup test</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Settings className="h-4 w-4" />
        <AlertDescription>
          <strong>Pro Tip:</strong> Always test your DNS configuration with multiple tools and from different locations 
          to ensure proper propagation before going live with email campaigns.
        </AlertDescription>
      </Alert>
    </div>
  );
}