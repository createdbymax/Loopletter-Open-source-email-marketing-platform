"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { getOrCreateArtistByClerkId } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  ShoppingCart,
  Music,
  Instagram,
  Twitter,
  Zap,
  CreditCard,
  Globe,
  Settings,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import type { Integration } from "@/lib/types";

const AVAILABLE_INTEGRATIONS = [
  {
    type: "shopify",
    name: "Shopify",
    icon: ShoppingCart,
    description: "Sync customers and track purchases from your Shopify store",
    category: "ecommerce",
    features: ["Customer sync", "Purchase tracking", "Abandoned cart emails"],
    setupUrl: "https://www.shopify.com/partners",
  },
  {
    type: "woocommerce",
    name: "WooCommerce",
    icon: ShoppingCart,
    description: "Connect your WordPress WooCommerce store",
    category: "ecommerce",
    features: ["Customer sync", "Order tracking", "Product recommendations"],
    setupUrl: "https://woocommerce.com/products/woocommerce-api/",
  },
  {
    type: "stripe",
    name: "Stripe",
    icon: CreditCard,
    description: "Track payments and customer data from Stripe",
    category: "payments",
    features: ["Payment tracking", "Customer sync", "Revenue attribution"],
    setupUrl: "https://stripe.com/docs/api",
  },
  {
    type: "spotify",
    name: "Spotify for Artists",
    icon: Music,
    description: "Import your Spotify artist data and fan insights",
    category: "music",
    features: ["Fan demographics", "Listening data", "Release notifications"],
    setupUrl: "https://artists.spotify.com/",
  },
  {
    type: "instagram",
    name: "Instagram",
    icon: Instagram,
    description: "Sync followers and promote campaigns on Instagram",
    category: "social",
    features: ["Follower sync", "Story promotion", "Post scheduling"],
    setupUrl: "https://developers.facebook.com/docs/instagram-api/",
  },
  {
    type: "twitter",
    name: "Twitter/X",
    icon: Twitter,
    description: "Auto-tweet campaigns and sync followers",
    category: "social",
    features: ["Auto-tweet", "Follower sync", "Engagement tracking"],
    setupUrl: "https://developer.twitter.com/en/docs/twitter-api",
  },
  {
    type: "zapier",
    name: "Zapier",
    icon: Zap,
    description: "Connect with 5000+ apps through Zapier",
    category: "automation",
    features: ["Custom workflows", "Data sync", "Trigger actions"],
    setupUrl: "https://zapier.com/developer",
  },
];

function IntegrationCard({
  integration,
  connectedIntegration,
  onConnect,
  onDisconnect,
}: {
  integration: (typeof AVAILABLE_INTEGRATIONS)[0];
  connectedIntegration?: Integration;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  const Icon = integration.icon;
  const isConnected = !!connectedIntegration;
  const hasError = connectedIntegration?.status === "error";

  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-lg">{integration.name}</CardTitle>
              <Badge variant="outline" className="text-xs">
                {integration.category}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isConnected && (
              <div className="flex items-center gap-1">
                {hasError ? (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                <Badge
                  variant={hasError ? "destructive" : "default"}
                  className={hasError ? "" : "bg-green-100 text-green-800"}
                >
                  {hasError ? "Error" : "Connected"}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">{integration.description}</p>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Features:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {integration.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-500" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {connectedIntegration && (
          <div className="text-xs text-gray-500">
            Last synced:{" "}
            {connectedIntegration.last_sync_at
              ? new Date(connectedIntegration.last_sync_at).toLocaleString()
              : "Never"}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            size="sm"
            disabled
            onClick={() =>
              alert(
                "Integrations are coming soon! We're working on OAuth flows and proper API connections for all supported platforms."
              )
            }
          >
            <Plus className="w-4 h-4 mr-2" />
            Connect (Coming Soon)
          </Button>

          <Button variant="ghost" size="sm" asChild>
            <a
              href={integration.setupUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Learn More
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function WebhookManager({ artistId }: { artistId: string }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Webhooks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Globe className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Webhooks Coming Soon
            </h3>
            <p className="text-gray-600 mb-4">
              Real-time webhook notifications will be available soon to keep
              your systems in sync.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <h4 className="font-medium text-blue-900 mb-2">
                Planned Webhook Events:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  "campaign.sent",
                  "campaign.opened",
                  "campaign.clicked",
                  "fan.subscribed",
                  "fan.unsubscribed",
                  "email.bounced",
                  "email.complained",
                  "integration.connected",
                ].map((event) => (
                  <div key={event} className="flex items-center gap-2">
                    <code className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {event}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function IntegrationsManager() {
  const { user, isLoaded } = useUser();
  const [artist, setArtist] = useState<unknown>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      setLoading(true);
      try {
        const a = await getOrCreateArtistByClerkId(
          user.id,
          user.primaryEmailAddress?.emailAddress || "",
          user.fullName || user.username || "Artist"
        );
        setArtist(a);

        // Don't load fake integration data - keep empty array
        setIntegrations([]);
      } catch (error) {
        console.error("Error fetching artist:", error);
      } finally {
        setLoading(false);
      }
    }
    if (isLoaded) fetchData();
  }, [user, isLoaded]);

  const handleConnect = async (integrationType: string) => {
    // Show coming soon message for now
    alert(
      "Integration connections are coming soon! We're working on OAuth flows and proper API integrations for all supported platforms."
    );
  };

  const handleDisconnect = async (integrationId: string) => {
    // This function is no longer used since we don't have real integrations
    alert("Integration management is coming soon!");
  };

  const getConnectedIntegration = (type: string) => {
    return integrations.find((i) => i.type === type);
  };

  const groupedIntegrations = AVAILABLE_INTEGRATIONS.reduce(
    (acc, integration) => {
      if (!acc[integration.category]) {
        acc[integration.category] = [];
      }
      acc[integration.category].push(integration);
      return acc;
    },
    {} as Record<string, typeof AVAILABLE_INTEGRATIONS>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Integrations</h1>
        <p className="text-gray-600">
          Connect your favorite tools and services
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {integrations.filter((i) => i.status === "connected").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {AVAILABLE_INTEGRATIONS.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(groupedIntegrations).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {integrations.length > 0 ? "Never" : "-"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="integrations">
        <TabsList>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="api">API Access</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-6">
          {Object.entries(groupedIntegrations).map(
            ([category, categoryIntegrations]) => (
              <div key={category} className="space-y-4">
                <h2 className="text-xl font-semibold capitalize">{category}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryIntegrations.map((integration) => (
                    <IntegrationCard
                      key={integration.type}
                      integration={integration}
                      connectedIntegration={getConnectedIntegration(
                        integration.type
                      )}
                      onConnect={() => handleConnect(integration.type)}
                      onDisconnect={() => {
                        const connected = getConnectedIntegration(
                          integration.type
                        );
                        if (connected) handleDisconnect(connected.id);
                      }}
                    />
                  ))}
                </div>
              </div>
            )
          )}
        </TabsContent>

        <TabsContent value="webhooks">
          <WebhookManager artistId={artist?.id} />
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Access</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  API Access Coming Soon
                </h3>
                <p className="text-gray-600 mb-4">
                  REST API access for developers will be available soon with
                  comprehensive documentation and SDKs.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Planned API Features:
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• RESTful API with comprehensive endpoints</li>
                    <li>• Secure API key authentication</li>
                    <li>• Rate limiting and usage analytics</li>
                    <li>• SDKs for popular programming languages</li>
                    <li>• Webhook support for real-time events</li>
                    <li>• Interactive API documentation</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
