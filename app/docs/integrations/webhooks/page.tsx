import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Webhook, Zap, Shield, Clock } from 'lucide-react';
export default function WebhooksPage() {
    return (<div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Webhooks</h1>
        <p className="text-xl text-muted-foreground mt-4">
          Receive real-time notifications about events in your Loopletter account.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Webhook className="h-4 w-4"/>
              Real-time Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Instant notifications when events occur
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4"/>
              Event Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Campaign sends, opens, clicks, and more
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4"/>
              Secure Delivery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              HMAC signature verification
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4"/>
              Retry Logic
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Automatic retries for failed deliveries
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Events</CardTitle>
          <CardDescription>
            Events that can trigger webhook notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-2">Campaign Events</h3>
              <div className="space-y-1">
                <Badge variant="outline">campaign.sent</Badge>
                <Badge variant="outline">campaign.opened</Badge>
                <Badge variant="outline">campaign.clicked</Badge>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Subscriber Events</h3>
              <div className="space-y-1">
                <Badge variant="outline">subscriber.added</Badge>
                <Badge variant="outline">subscriber.unsubscribed</Badge>
                <Badge variant="outline">subscriber.bounced</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>);
}
