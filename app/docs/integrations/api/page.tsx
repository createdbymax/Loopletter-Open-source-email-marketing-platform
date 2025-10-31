import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code, Key, Database, Shield } from 'lucide-react';
export default function APIPage() {
    return (<div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">API Documentation</h1>
        <p className="text-xl text-muted-foreground mt-4">
          Build custom integrations with the Loopletter REST API.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Code className="h-4 w-4"/>
              REST API
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              RESTful endpoints for all major features
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Key className="h-4 w-4"/>
              Authentication
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Secure API key authentication
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="h-4 w-4"/>
              Data Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Full CRUD operations on your data
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4"/>
              Rate Limits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Fair usage policies and limits
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
          <CardDescription>
            Available endpoints for integrating with Loopletter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Campaigns</h3>
              <div className="space-y-1 text-sm font-mono">
                <div><Badge variant="outline">GET</Badge> /api/campaigns</div>
                <div><Badge variant="outline">POST</Badge> /api/campaigns</div>
                <div><Badge variant="outline">PUT</Badge> /api/campaigns/:id</div>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Subscribers</h3>
              <div className="space-y-1 text-sm font-mono">
                <div><Badge variant="outline">GET</Badge> /api/subscribers</div>
                <div><Badge variant="outline">POST</Badge> /api/subscribers</div>
                <div><Badge variant="outline">DELETE</Badge> /api/subscribers/:id</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>);
}
