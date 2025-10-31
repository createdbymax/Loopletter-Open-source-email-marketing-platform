import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Mail, BarChart3, Calendar, ArrowRight, CheckCircle, AlertTriangle, } from "lucide-react";
import { Artist } from "@/lib/types";
import { getUserSubscriptionPlan, getUserLimits, FEATURE_NAMES, FeatureAccess, } from "@/lib/subscription";
import { SubscriberLimitWarning, EmailLimitWarning, } from "@/components/ui/limit-warning";
import Link from "next/link";
interface UsageProps {
    artist: Artist;
}
export default function Usage({ artist }: UsageProps) {
    const [stats, setStats] = useState({
        totalFans: 0,
        activeFans: 0,
        totalEmailsSent: 0,
        monthlyEmailsSent: 0,
        totalCampaigns: 0,
        openRate: 0,
        clickRate: 0,
    });
    const [loading, setLoading] = useState(true);
    const plan = getUserSubscriptionPlan(artist);
    const { maxSubscribers, maxEmailSends } = getUserLimits(artist);
    const subscriberPercentage = Math.min(100, Math.round((stats.totalFans / maxSubscribers) * 100));
    const emailPercentage = maxEmailSends === "unlimited"
        ? 0
        : Math.min(100, Math.round((stats.monthlyEmailsSent / (maxEmailSends as number)) * 100));
    useEffect(() => {
        async function fetchUsageStats() {
            try {
                setLoading(true);
                const fansResponse = await fetch("/api/fans");
                const fansData = await fansResponse.json();
                const fans = fansData.fans || [];
                console.log('Fans API response:', fansData);
                console.log('Fans array:', fans);
                console.log('Sample fan:', fans[0]);
                const campaignsResponse = await fetch("/api/campaigns");
                const campaignsData = await campaignsResponse.json();
                const campaigns = Array.isArray(campaignsData) ? campaignsData : (campaignsData.campaigns || []);
                const analyticsResponse = await fetch("/api/analytics");
                const analytics = await analyticsResponse.json();
                const subscribedFans = fans.filter((f: {
                    status: string;
                }) => f.status === "subscribed");
                console.log('Total fans:', fans.length);
                console.log('Subscribed fans:', subscribedFans.length);
                console.log('Fan statuses:', fans.map((f: any) => ({ email: f.email, status: f.status })));
                setStats({
                    totalFans: fans.length,
                    activeFans: subscribedFans.length,
                    totalEmailsSent: analytics.metrics?.emails_delivered || 0,
                    monthlyEmailsSent: analytics.metrics?.monthly_emails_sent || 0,
                    totalCampaigns: campaigns.length,
                    openRate: analytics.metrics?.open_rate || 0,
                    clickRate: analytics.metrics?.click_rate || 0,
                });
            }
            catch (error) {
                console.error("Error fetching usage stats:", error);
            }
            finally {
                setLoading(false);
            }
        }
        fetchUsageStats();
    }, []);
    return (<div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Usage & Limits</h2>
        <p className="text-gray-500 mt-1">
          Monitor your subscription usage and limits
        </p>
      </div>

      
      <SubscriberLimitWarning artist={artist} currentCount={stats.totalFans}/>

      
      <EmailLimitWarning artist={artist} currentCount={stats.monthlyEmailsSent}/>

      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600"/>
              Subscriber Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (<div className="h-24 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>) : (<div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Total Subscribers
                  </span>
                  <span className="font-medium">
                    {stats.totalFans.toLocaleString()} /{" "}
                    {maxSubscribers.toLocaleString()}
                  </span>
                </div>

                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${subscriberPercentage >= 90
                ? "bg-red-500"
                : subscriberPercentage >= 75
                    ? "bg-amber-500"
                    : "bg-blue-600"}`} style={{ width: `${subscriberPercentage}%` }}></div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>0</span>
                  <span>{maxSubscribers.toLocaleString()}</span>
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">
                      Active Subscribers
                    </span>
                    <span className="font-medium">
                      {stats.activeFans.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Unsubscribed</span>
                    <span className="font-medium">
                      {(stats.totalFans - stats.activeFans).toLocaleString()}
                    </span>
                  </div>
                </div>

                {subscriberPercentage >= 75 && (<div className="pt-2">
                    <Link href="/dashboard/settings?tab=subscription&feature=maxSubscribers">
                      <Button variant="outline" size="sm" className="w-full">
                        Upgrade Subscriber Limit
                        <ArrowRight className="ml-2 h-4 w-4"/>
                      </Button>
                    </Link>
                  </div>)}
              </div>)}
          </CardContent>
        </Card>

        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600"/>
              Email Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (<div className="h-24 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>) : (<div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Monthly Email Sends
                  </span>
                  <span className="font-medium">
                    {stats.monthlyEmailsSent.toLocaleString()} /{" "}
                    {maxEmailSends === "unlimited"
                ? "Unlimited"
                : maxEmailSends.toLocaleString()}
                  </span>
                </div>

                {maxEmailSends !== "unlimited" ? (<>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${emailPercentage >= 90
                    ? "bg-red-500"
                    : emailPercentage >= 75
                        ? "bg-amber-500"
                        : "bg-blue-600"}`} style={{ width: `${emailPercentage}%` }}></div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>0</span>
                      <span>{maxEmailSends.toLocaleString()}</span>
                    </div>
                  </>) : (<div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4"/>
                    <span>Unlimited email sends with your current plan</span>
                  </div>)}

                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">
                      Total Emails Sent
                    </span>
                    <span className="font-medium">
                      {stats.totalEmailsSent.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">
                      Total Campaigns
                    </span>
                    <span className="font-medium">
                      {stats.totalCampaigns.toLocaleString()}
                    </span>
                  </div>
                </div>

                {maxEmailSends !== "unlimited" && emailPercentage >= 75 && (<div className="pt-2">
                    <Link href="/dashboard/settings?tab=subscription&feature=maxEmailSends">
                      <Button variant="outline" size="sm" className="w-full">
                        Upgrade Email Limit
                        <ArrowRight className="ml-2 h-4 w-4"/>
                      </Button>
                    </Link>
                  </div>)}
              </div>)}
          </CardContent>
        </Card>
      </div>

      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600"/>
            Plan Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Your{" "}
              {plan === "starter"
            ? "Starter"
            : plan === "independent"
                ? "Independent"
                : "Label/Agency"}{" "}
              plan includes:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
              {Object.entries(getUserLimits(artist)).map(([key, value]) => (<div key={key} className="flex items-center justify-between py-1 border-b border-gray-100">
                  <span className="text-sm">
                    {key === "maxSubscribers"
                ? "Maximum Subscribers"
                : "Monthly Email Sends"}
                  </span>
                  <span className="font-medium">
                    {value === "unlimited"
                ? "Unlimited"
                : value.toLocaleString()}
                  </span>
                </div>))}

              
              {[
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
        ].map((feature) => {
            const hasFeature = plan === "label" ||
                (plan === "independent" &&
                    ![
                        "prioritySupport",
                        "multiArtistManagement",
                        "multiUserAccess",
                    ].includes(feature));
            if (plan === "starter" &&
                ![
                    "manualCampaignSending",
                    "hostedSignupPage",
                    "autoResponseWelcomeEmail",
                    "basicAnalytics",
                    "communitySupport",
                ].includes(feature)) {
                return null;
            }
            return (<div key={feature} className="flex items-center justify-between py-1 border-b border-gray-100">
                    <span className="text-sm">
                      {FEATURE_NAMES[feature as keyof FeatureAccess]}
                    </span>
                    {hasFeature ? (<CheckCircle className="h-4 w-4 text-green-600"/>) : (<Link href={`/dashboard/settings?tab=subscription&feature=${feature}`}>
                        <span className="text-xs text-blue-600 hover:underline">
                          Upgrade
                        </span>
                      </Link>)}
                  </div>);
        })}
            </div>

            <div className="pt-4">
              <Link href="/dashboard/settings?tab=subscription">
                <Button variant="outline" size="sm">
                  View All Plan Details
                  <ArrowRight className="ml-2 h-4 w-4"/>
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      
      {plan !== "starter" && artist.subscription?.current_period_end && (<Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600"/>
              Billing Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Current Period Ends
                </span>
                <span className="font-medium">
                  {new Date(artist.subscription.current_period_end).toLocaleDateString()}
                </span>
              </div>

              {artist.subscription.cancel_at_period_end && (<div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600"/>
                    <h4 className="text-sm font-medium text-amber-800">
                      Subscription Cancellation
                    </h4>
                  </div>
                  <p className="text-xs text-amber-700 mt-1">
                    Your subscription has been canceled and will end on{" "}
                    {new Date(artist.subscription.current_period_end).toLocaleDateString()}
                    . You'll be downgraded to the Starter plan after this date.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => (window.location.href = "/api/subscription/portal")}>
                    Reactivate Subscription
                  </Button>
                </div>)}

              <Button variant="outline" size="sm" onClick={() => (window.location.href = "/api/subscription/portal")}>
                Manage Billing
              </Button>
            </div>
          </CardContent>
        </Card>)}
    </div>);
}
