import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle, Clock, HelpCircle } from 'lucide-react';
export default function DomainTroubleshootingPage() {
    return (<div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Domain Setup Troubleshooting</h1>
        <p className="text-xl text-muted-foreground mt-4">
          Common issues and solutions for domain verification and DNS configuration problems.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Common Error Messages</CardTitle>
          <CardDescription>
            Understanding what different verification errors mean
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-500 mt-0.5"/>
              <div>
                <h3 className="font-medium text-red-700">Domain verification failed</h3>
                <p className="text-sm text-muted-foreground">
                  The verification TXT record was not found or contains incorrect values.
                </p>
                <div className="mt-2">
                  <Badge variant="outline" className="text-xs">Solution</Badge>
                  <span className="text-sm ml-2">Check that the TXT record is added correctly with the exact verification code.</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-500 mt-0.5"/>
              <div>
                <h3 className="font-medium text-red-700">SPF record not found</h3>
                <p className="text-sm text-muted-foreground">
                  No SPF record exists or it doesn't include the required Amazon SES include.
                </p>
                <div className="mt-2">
                  <Badge variant="outline" className="text-xs">Solution</Badge>
                  <span className="text-sm ml-2">Add or modify SPF record to include "include:amazonses.com".</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-500 mt-0.5"/>
              <div>
                <h3 className="font-medium text-red-700">DKIM records missing</h3>
                <p className="text-sm text-muted-foreground">
                  One or more of the three required DKIM CNAME records are not found.
                </p>
                <div className="mt-2">
                  <Badge variant="outline" className="text-xs">Solution</Badge>
                  <span className="text-sm ml-2">Ensure all three DKIM CNAME records are added with correct tokens.</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-yellow-500 mt-0.5"/>
              <div>
                <h3 className="font-medium text-yellow-700">Verification pending</h3>
                <p className="text-sm text-muted-foreground">
                  DNS records are still propagating or haven't been detected yet.
                </p>
                <div className="mt-2">
                  <Badge variant="outline" className="text-xs">Solution</Badge>
                  <span className="text-sm ml-2">Wait 1-48 hours for DNS propagation, then try verification again.</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SPF Record Issues</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Problem: Multiple SPF Records</h3>
            <p className="text-sm text-muted-foreground mb-3">
              You can only have one SPF record per domain. Multiple SPF records will cause authentication failures.
            </p>
            
            <div className="bg-red-50 border border-red-200 p-3 rounded-md mb-3">
              <div className="text-sm font-medium text-red-800 mb-1">❌ Incorrect (Multiple SPF records):</div>
              <div className="text-sm font-mono text-red-700">
                <div>v=spf1 include:_spf.google.com ~all</div>
                <div>v=spf1 include:amazonses.com ~all</div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 p-3 rounded-md">
              <div className="text-sm font-medium text-green-800 mb-1">✅ Correct (Combined SPF record):</div>
              <div className="text-sm font-mono text-green-700">
                v=spf1 include:_spf.google.com include:amazonses.com ~all
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Problem: SPF Record Too Long</h3>
            <p className="text-sm text-muted-foreground mb-3">
              SPF records have a 255-character limit and a 10 DNS lookup limit.
            </p>
            <Alert>
              <AlertTriangle className="h-4 w-4"/>
              <AlertDescription>
                If your SPF record is too complex, consider using SPF flattening services or contact support for help optimizing it.
              </AlertDescription>
            </Alert>
          </div>

          <div>
            <h3 className="font-medium mb-3">Problem: Wrong SPF Mechanism</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Using the wrong SPF mechanism can cause authentication failures.
            </p>
            
            <div className="grid gap-3 md:grid-cols-2">
              <div className="bg-red-50 border border-red-200 p-3 rounded-md">
                <div className="text-sm font-medium text-red-800 mb-1">❌ Incorrect:</div>
                <div className="text-sm font-mono text-red-700">v=spf1 include:amazonses.com -all</div>
                <div className="text-xs text-red-600 mt-1">Hard fail (-all) is too strict</div>
              </div>

              <div className="bg-green-50 border border-green-200 p-3 rounded-md">
                <div className="text-sm font-medium text-green-800 mb-1">✅ Correct:</div>
                <div className="text-sm font-mono text-green-700">v=spf1 include:amazonses.com ~all</div>
                <div className="text-xs text-green-600 mt-1">Soft fail (~all) is recommended</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>DKIM Record Issues</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Problem: CNAME Record Not Resolving</h3>
            <p className="text-sm text-muted-foreground mb-3">
              DKIM CNAME records must point to the exact values provided by Loopletter.
            </p>
            
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium mb-2">Check Your Record Format:</h4>
                <div className="bg-muted p-3 rounded-md text-sm">
                  <div><strong>Name:</strong> abc123._domainkey (not abc123._domainkey.yourdomain.com)</div>
                  <div><strong>Value:</strong> abc123.dkim.amazonses.com (exactly as provided)</div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Common Mistakes:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Adding your domain name to the CNAME name field</li>
                  <li>• Missing the "_domainkey" suffix</li>
                  <li>• Typos in the DKIM token</li>
                  <li>• Using TXT instead of CNAME record type</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Problem: Only Some DKIM Records Found</h3>
            <p className="text-sm text-muted-foreground mb-3">
              All three DKIM records must be present for verification to succeed.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md">
              <div className="text-sm font-medium text-yellow-800 mb-2">Verification Status:</div>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500"/>
                  <span>DKIM Record 1: Found</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500"/>
                  <span>DKIM Record 2: Found</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500"/>
                  <span>DKIM Record 3: Missing</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>DMARC Record Issues</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Problem: DMARC Policy Too Strict</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Starting with a strict DMARC policy can cause legitimate emails to be rejected.
            </p>
            
            <div className="space-y-3">
              <div className="bg-red-50 border border-red-200 p-3 rounded-md">
                <div className="text-sm font-medium text-red-800 mb-1">❌ Too Strict for Beginners:</div>
                <div className="text-sm font-mono text-red-700">v=DMARC1; p=reject; rua=mailto:dmarc@yourdomain.com</div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md">
                <div className="text-sm font-medium text-yellow-800 mb-1">⚠️ Better Starting Point:</div>
                <div className="text-sm font-mono text-yellow-700">v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com</div>
              </div>

              <div className="bg-green-50 border border-green-200 p-3 rounded-md">
                <div className="text-sm font-medium text-green-800 mb-1">✅ Safest for Testing:</div>
                <div className="text-sm font-mono text-green-700">v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Problem: Invalid DMARC Syntax</h3>
            <p className="text-sm text-muted-foreground mb-3">
              DMARC records must follow exact syntax rules.
            </p>
            
            <div className="space-y-2 text-sm">
              <div><strong>Required tags:</strong> v=DMARC1 and p= (policy)</div>
              <div><strong>Optional tags:</strong> rua= (aggregate reports), ruf= (forensic reports)</div>
              <div><strong>Separator:</strong> Use semicolons (;) between tags</div>
              <div><strong>Spacing:</strong> No spaces around equals signs</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>DNS Propagation Issues</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Understanding Propagation Time</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-sm font-medium mb-2">Typical Propagation Times:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• <strong>Cloudflare:</strong> 1-5 minutes</li>
                  <li>• <strong>Google Domains:</strong> 10-60 minutes</li>
                  <li>• <strong>GoDaddy:</strong> 1-2 hours</li>
                  <li>• <strong>Namecheap:</strong> 30 minutes - 48 hours</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Factors Affecting Speed:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• DNS provider infrastructure</li>
                  <li>• TTL (Time To Live) settings</li>
                  <li>• Geographic location</li>
                  <li>• Local DNS cache</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Checking Propagation Status</h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium mb-2">Online Tools:</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Badge variant="outline">whatsmydns.net</Badge>
                  <Badge variant="outline">dnschecker.org</Badge>
                  <Badge variant="outline">mxtoolbox.com</Badge>
                  <Badge variant="outline">Google Admin Toolbox</Badge>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Command Line Tools:</h4>
                <div className="bg-muted p-3 rounded-md text-sm font-mono">
                  <div>nslookup -type=TXT yourdomain.com</div>
                  <div>dig TXT yourdomain.com</div>
                  <div>dig CNAME token._domainkey.yourdomain.com</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Step-by-Step Troubleshooting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">When Verification Fails:</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">1</Badge>
                <div>
                  <h4 className="text-sm font-medium">Double-check Record Values</h4>
                  <p className="text-sm text-muted-foreground">
                    Verify that all DNS records match exactly what Loopletter provided.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">2</Badge>
                <div>
                  <h4 className="text-sm font-medium">Test DNS Propagation</h4>
                  <p className="text-sm text-muted-foreground">
                    Use online tools to check if records are visible globally.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">3</Badge>
                <div>
                  <h4 className="text-sm font-medium">Wait and Retry</h4>
                  <p className="text-sm text-muted-foreground">
                    If records are correct but not propagated, wait 2-4 hours and try again.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">4</Badge>
                <div>
                  <h4 className="text-sm font-medium">Contact DNS Provider</h4>
                  <p className="text-sm text-muted-foreground">
                    If issues persist after 48 hours, contact your DNS provider's support.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">5</Badge>
                <div>
                  <h4 className="text-sm font-medium">Get Help from Loopletter</h4>
                  <p className="text-sm text-muted-foreground">
                    Contact our support team with your domain and DNS provider details.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Getting Additional Help</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-3">Before Contacting Support</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Note your domain name</li>
                <li>• Identify your DNS provider</li>
                <li>• Screenshot any error messages</li>
                <li>• List which records you've added</li>
                <li>• Note how long you've been waiting</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-3">Support Channels</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Email: support@loopletter.co</li>
                <li>• In-app chat support</li>
                <li>• Help documentation</li>
                <li>• Community forum</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <HelpCircle className="h-4 w-4"/>
        <AlertDescription>
          <strong>Remember:</strong> Domain setup can be complex, and DNS propagation takes time. 
          Don't hesitate to reach out for help if you're stuck - our support team is here to assist you.
        </AlertDescription>
      </Alert>
    </div>);
}
