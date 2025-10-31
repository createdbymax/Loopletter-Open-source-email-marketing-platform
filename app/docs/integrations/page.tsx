import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plug, Code, Webhook, Zap } from 'lucide-react';
export default function IntegrationsPage() {
    return (<div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Integrations</h1>
        <p className="text-xl text-muted-foreground mt-4">
          Connect Loopletter with your favorite tools and platforms to streamline your workflow.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Plug className="h-4 w-4"/>
              Native Integrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Pre-built connections with popular platforms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Code className="h-4 w-4"/>
              API Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              RESTful API for custom integrations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Webhook className="h-4 w-4"/>
              Webhooks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Real-time event notifications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4"/>
              Zapier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Connect with 5000+ apps via Zapier
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Integrations</CardTitle>
          <CardDescription>
            Popular platforms and tools that work with Loopletter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-2">Music Platforms</h3>
              <div className="space-y-1">
                <Badge variant="outline">Spotify</Badge>
                <Badge variant="outline">Bandcamp</Badge>
                <Badge variant="outline">SoundCloud</Badge>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">E-commerce</h3>
              <div className="space-y-1">
                <Badge variant="outline">Shopify</Badge>
                <Badge variant="outline">WooCommerce</Badge>
                <Badge variant="outline">Stripe</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>);
}
