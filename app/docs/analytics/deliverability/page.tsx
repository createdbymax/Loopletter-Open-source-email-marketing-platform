import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Mail, AlertTriangle, CheckCircle } from 'lucide-react';
export default function DeliverabilityPage() {
    return (<div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Email Deliverability Analytics</h1>
        <p className="text-xl text-muted-foreground mt-4">
          Monitor your sender reputation and email delivery performance.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="h-4 w-4"/>
              Inbox Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-sm text-muted-foreground">Excellent delivery</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4"/>
              Reputation Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98</div>
            <p className="text-sm text-muted-foreground">Excellent reputation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4"/>
              Bounce Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2%</div>
            <p className="text-sm text-muted-foreground">Within normal range</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle className="h-4 w-4"/>
              Authentication
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
            <p className="text-sm text-muted-foreground">Fully configured</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deliverability Health</CardTitle>
          <CardDescription>
            Monitor your email delivery performance and sender reputation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Track inbox placement rates, spam folder delivery, bounce rates, and authentication status 
            to ensure your emails reach your fans' inboxes.
          </p>
        </CardContent>
      </Card>
    </div>);
}
