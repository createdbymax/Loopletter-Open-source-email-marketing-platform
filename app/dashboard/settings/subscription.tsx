import React, { useState, useEffect } from "react";
import { Artist } from "@/lib/types";
import {
  getUserSubscriptionPlan,
  PLAN_FEATURES,
  FEATURE_NAMES,
  FeatureAccess,
} from "@/lib/subscription";
import {
  CheckCircle,
  XCircle,
  ArrowRight,
  CreditCard,
  Loader2,
  Calendar,
  Download,
  ExternalLink,
} from "lucide-react";
import { PLAN_DETAILS } from "@/lib/stripe";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SubscriptionSettingsProps {
  artist: Artist;
}

interface Invoice {
  id: string;
  stripe_invoice_id: string;
  amount_due: number;
  amount_paid: number;
  currency: string;
  status: string;
  invoice_pdf: string;
  hosted_invoice_url: string;
  invoice_date: string;
  paid_at: string | null;
}

export default function SubscriptionSettings({
  artist,
}: SubscriptionSettingsProps) {
  const searchParams = useSearchParams();
  const highlightedFeature = searchParams.get("feature");
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  const [isLoading, setIsLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  const currentPlan = getUserSubscriptionPlan(artist);

  const plans = [
    {
      id: "starter",
      name: "Starter",
      price: "$0",
      popular: false,
      description: "Perfect for new artists and hobbyists",
      features: PLAN_DETAILS.starter.features,
    },
    {
      id: "independent",
      name: "Independent",
      price: "$29",
      popular: true,
      description: "Ideal for growing artists and indie labels",
      features: PLAN_DETAILS.independent_monthly.features,
    },
    {
      id: "label",
      name: "Label/Agency",
      price: "$99",
      popular: false,
      description: "Built for teams managing multiple artists",
      features: PLAN_DETAILS.label_monthly.features,
    },
  ];

  // Fetch invoices on component mount
  useEffect(() => {
    async function fetchInvoices() {
      if (currentPlan === "starter") return;

      try {
        setLoadingInvoices(true);
        const response = await fetch("/api/subscription/invoices");

        if (!response.ok) {
          throw new Error("Failed to fetch invoices");
        }

        const data = await response.json();
        setInvoices(data);
      } catch (error) {
        console.error("Error fetching invoices:", error);
      } finally {
        setLoadingInvoices(false);
      }
    }

    fetchInvoices();
  }, [currentPlan]);

  // Handle plan upgrade/downgrade
  const handlePlanChange = async (
    planId: string,
    billingInterval: "month" | "year" = "month"
  ) => {
    if (
      planId === currentPlan ||
      (planId === "starter" && currentPlan !== "starter")
    ) {
      // For downgrades to starter or managing current subscription
      handleManageSubscription();
      return;
    }

    try {
      setIsLoading(true);
      setLoadingPlan(planId);

      // Create checkout session
      const response = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: planId,
          billingInterval,
          successUrl: `${window.location.origin}/dashboard/settings?tab=subscription&success=true`,
          cancelUrl: `${window.location.origin}/dashboard/settings?tab=subscription&canceled=true`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();

      // Redirect to checkout
      window.location.href = url;
    } catch (error: unknown) {
      console.error("Error upgrading plan:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      alert(`Failed to process upgrade: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      setLoadingPlan(null);
    }
  };

  // Handle managing existing subscription
  const handleManageSubscription = async () => {
    if (currentPlan === "starter") {
      // No subscription to manage
      return;
    }

    try {
      setIsLoading(true);

      // Create customer portal session
      const response = await fetch("/api/subscription/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/dashboard/settings?tab=subscription`,
        }),
      });

      // Parse the response data first to get any error details
      let responseData;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json();
      } else {
        const textData = await response.text();
        try {
          responseData = JSON.parse(textData);
        } catch {
          responseData = { text: textData };
        }
      }

      if (!response.ok) {
        console.error("Portal session error response:", {
          status: response.status,
          statusText: response.statusText,
          data: responseData,
        });

        // Check if this is a mock session for development
        if (responseData.url && responseData.url.includes("mock=true")) {
          console.log("Using mock portal session for development");
          window.location.href = responseData.url;
          return;
        }

        throw new Error(
          `Failed to create customer portal session: ${response.status} ${response.statusText}`
        );
      }

      console.log("Portal session response:", responseData);

      if (!responseData.url) {
        throw new Error("No URL returned from portal session creation");
      }

      // Redirect to customer portal
      window.location.href = responseData.url;
    } catch (error) {
      console.error("Error managing subscription:", error);

      // Show a more detailed error message
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      if (process.env.NODE_ENV !== "production") {
        alert(
          `Failed to access subscription management: ${errorMessage}. Check the console for more details.`
        );
      } else {
        alert(
          "Failed to access subscription management. Please try again or contact support if the issue persists."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string = "usd") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  // Key features to highlight in the comparison table
  const keyFeatures: (keyof FeatureAccess)[] = [
    "maxSubscribers",
    "maxEmailSends",
    "emailScheduling",
    "advancedAnalytics",
    "segmentation",
    "automations",
    "removeLoopLetterBranding",
    "customSignupDomain",
    "customEmailDesign",
    "premiumSupport",
    "prioritySupport",
    "multiArtistManagement",
    "multiUserAccess",
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Subscription Plan
        </h2>
        <p className="text-gray-500 mt-1">
          Manage your subscription and billing details
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Your subscription has been updated successfully!
          </AlertDescription>
        </Alert>
      )}

      {canceled && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertDescription className="text-amber-800">
            The subscription change was canceled. Your current plan remains
            active.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="plans">
        <TabsList>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-6">
          {/* Current Plan */}
          <Card>
            <CardHeader>
              <CardTitle>
                Current Plan:{" "}
                {plans.find((p) => p.id === currentPlan)?.name || "Starter"}
              </CardTitle>
              <CardDescription>
                {currentPlan === "starter"
                  ? "Free plan with basic features"
                  : currentPlan === "independent"
                    ? "For growing artists and indie labels"
                    : "For teams managing multiple artists"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">
                    {currentPlan === "starter"
                      ? "You are currently on the free plan with limited features."
                      : "Your subscription includes all features of the " +
                        (currentPlan === "independent"
                          ? "Independent"
                          : "Label/Agency") +
                        " plan."}
                  </p>

                  {artist.subscription?.current_period_end && (
                    <p className="text-sm text-gray-600 mt-4 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      Next billing date:{" "}
                      {formatDate(artist.subscription.current_period_end)}
                    </p>
                  )}

                  {artist.subscription?.cancel_at_period_end &&
                    artist.subscription.current_period_end && (
                      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                        <p className="text-sm text-amber-800">
                          Your subscription will end on{" "}
                          {formatDate(artist.subscription.current_period_end)}.
                          You'll be downgraded to the Starter plan after this
                          date.
                        </p>
                      </div>
                    )}
                </div>

                <div className="text-xl font-semibold">
                  {plans.find((p) => p.id === currentPlan)?.price || "$0"}/month
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                {currentPlan === "starter" ? (
                  <Button onClick={() => handlePlanChange("independent")}>
                    Upgrade Plan
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleManageSubscription}
                      disabled={isLoading}
                      variant="outline"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CreditCard className="h-4 w-4 mr-2" />
                      )}
                      Manage Subscription
                    </Button>

                    {currentPlan === "independent" && (
                      <Button
                        onClick={() => handlePlanChange("label")}
                        disabled={isLoading}
                      >
                        Upgrade to Label/Agency
                      </Button>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Plan Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Compare Plans</CardTitle>
              <CardDescription>
                Choose the plan that best fits your needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Feature
                      </th>
                      {plans.map((plan) => (
                        <th
                          key={plan.id}
                          scope="col"
                          className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                            plan.popular ? "text-blue-600" : "text-gray-500"
                          } ${currentPlan === plan.id ? "bg-blue-50" : ""}`}
                        >
                          {plan.name}
                          <div className="font-semibold text-sm mt-1">
                            {plan.price}/mo
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {keyFeatures.map((feature) => (
                      <tr
                        key={feature}
                        className={`hover:bg-gray-50 ${highlightedFeature === feature ? "bg-blue-50" : ""}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {FEATURE_NAMES[feature]}
                        </td>
                        {plans.map((plan) => {
                          const value =
                            PLAN_FEATURES[
                              plan.id as "starter" | "independent" | "label"
                            ][feature];
                          return (
                            <td
                              key={`${plan.id}-${feature}`}
                              className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${
                                currentPlan === plan.id ? "bg-blue-50" : ""
                              }`}
                            >
                              {typeof value === "boolean" ? (
                                value ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-gray-300" />
                                )
                              ) : value === "unlimited" ? (
                                "Unlimited"
                              ) : (
                                value.toLocaleString()
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Upgrade Buttons */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`rounded-lg border p-6 ${
                      plan.popular
                        ? "border-blue-200 bg-blue-50"
                        : "border-gray-200 bg-white"
                    } ${currentPlan === plan.id ? "ring-2 ring-blue-500" : ""}`}
                  >
                    <h4 className="text-lg font-medium text-gray-900">
                      {plan.name}
                    </h4>
                    <p className="text-2xl font-bold mt-2">
                      {plan.price}
                      <span className="text-sm font-normal text-gray-500">
                        /month
                      </span>
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {plan.description}
                    </p>

                    <ul className="mt-4 space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {currentPlan === plan.id ? (
                      <div className="mt-6 inline-block px-4 py-2 bg-gray-100 text-gray-800 rounded-md text-sm font-medium">
                        Current Plan
                      </div>
                    ) : (
                      <Button
                        onClick={() => handlePlanChange(plan.id)}
                        disabled={isLoading || loadingPlan === plan.id}
                        className={`mt-6 w-full ${
                          plan.id === "starter" ||
                          (currentPlan === "label" && plan.id === "independent")
                            ? "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300"
                            : ""
                        }`}
                        variant={
                          plan.id === "starter" ||
                          (currentPlan === "label" && plan.id === "independent")
                            ? "outline"
                            : "default"
                        }
                      >
                        {isLoading && loadingPlan === plan.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : currentPlan === "starter" &&
                          plan.id !== "starter" ? (
                          <>
                            Upgrade <ArrowRight className="ml-1 h-4 w-4" />
                          </>
                        ) : currentPlan !== "starter" &&
                          plan.id === "starter" ? (
                          "Downgrade"
                        ) : currentPlan === "independent" &&
                          plan.id === "label" ? (
                          <>
                            Upgrade <ArrowRight className="ml-1 h-4 w-4" />
                          </>
                        ) : currentPlan === "label" &&
                          plan.id === "independent" ? (
                          "Downgrade"
                        ) : (
                          "Select Plan"
                        )}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Manage your payment methods and billing information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentPlan === "starter" ? (
                <p className="text-gray-600">
                  You're currently on the free plan. No payment method required.
                </p>
              ) : (
                <>
                  <div className="flex items-center justify-between p-4 border rounded-lg mb-4">
                    <div className="flex items-center">
                      <div className="bg-gray-100 p-2 rounded-md mr-3">
                        <CreditCard className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">Credit Card</p>
                        <p className="text-sm text-gray-600">
                          {artist.subscription?.metadata &&
                          "card_last4" in artist.subscription.metadata
                            ? `•••• •••• •••• ${artist.subscription.metadata.card_last4}`
                            : "Card on file"}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleManageSubscription}
                    >
                      Update
                    </Button>
                  </div>

                  <Button onClick={handleManageSubscription} variant="outline">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Manage Payment Methods
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Billing History */}
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>
                View your past invoices and payment history
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentPlan === "starter" ? (
                <p className="text-gray-600">
                  No billing history available on the free plan.
                </p>
              ) : loadingInvoices ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : invoices.length === 0 ? (
                <p className="text-gray-600">
                  No invoices found. Your billing history will appear here once
                  you&apos;ve been billed.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Date
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Amount
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Invoice
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(invoice.invoice_date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(
                              invoice.amount_due,
                              invoice.currency
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              className={
                                invoice.status === "paid"
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : invoice.status === "open"
                                    ? "bg-blue-100 text-blue-800 border-blue-200"
                                    : "bg-red-100 text-red-800 border-red-200"
                              }
                            >
                              {invoice.status === "paid"
                                ? "Paid"
                                : invoice.status === "open"
                                  ? "Pending"
                                  : "Failed"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {invoice.invoice_pdf && (
                              <a
                                href={invoice.invoice_pdf}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-blue-600 hover:text-blue-800"
                              >
                                <Download className="h-4 w-4 mr-1" />
                                PDF
                              </a>
                            )}
                            {invoice.hosted_invoice_url && (
                              <a
                                href={invoice.hosted_invoice_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-blue-600 hover:text-blue-800 mt-1"
                              >
                                <ExternalLink className="h-4 w-4 mr-1" />
                                View
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {currentPlan !== "starter" && (
                <div className="mt-6">
                  <Button onClick={handleManageSubscription} variant="outline">
                    View All Invoices
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
