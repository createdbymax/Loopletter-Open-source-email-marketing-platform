import React from "react";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Artist } from "@/lib/types";
import { getUserSubscriptionPlan, getUserLimits } from "@/lib/subscription";

interface LimitWarningProps {
  artist: Artist;
  type: "subscribers" | "emails";
  currentCount: number;
  className?: string;
  showButton?: boolean;
}

export function LimitWarning({
  artist,
  type,
  currentCount,
  className = "",
  showButton = true,
}: LimitWarningProps) {
  const plan = getUserSubscriptionPlan(artist);
  const { maxSubscribers, maxEmailSends } = getUserLimits(artist);

  // Calculate limit and percentage
  const limit = type === "subscribers" ? maxSubscribers : maxEmailSends;
  const percentage =
    type === "emails" && limit === "unlimited"
      ? 0
      : Math.min(100, Math.round((currentCount / (limit as number)) * 100));

  // Only show warning if approaching limit (80% or more)
  if ((type === "emails" && limit === "unlimited") || percentage < 80) {
    return null;
  }

  // Determine warning level
  const isAtLimit = percentage >= 95;

  // Determine upgrade feature for URL
  const feature = type === "subscribers" ? "maxSubscribers" : "maxEmailSends";

  // Determine next plan
  const nextPlan = plan === "starter" ? "Independent" : "Label/Agency";

  return (
    <Alert
      className={`${isAtLimit ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"} ${className}`}
    >
      <AlertTriangle
        className={`h-4 w-4 ${isAtLimit ? "text-red-600" : "text-amber-600"}`}
      />
      <AlertDescription className="flex items-center justify-between w-full">
        <div>
          <p
            className={`font-medium ${isAtLimit ? "text-red-800" : "text-amber-800"}`}
          >
            {isAtLimit ? "Limit reached" : "Approaching limit"}:{" "}
            {currentCount.toLocaleString()} /{" "}
            {type === "emails" && limit === "unlimited"
              ? "Unlimited"
              : (limit as number).toLocaleString()}{" "}
            {type === "subscribers" ? "subscribers" : "monthly emails"} (
            {percentage}%)
          </p>
          <p
            className={`text-sm ${isAtLimit ? "text-red-700" : "text-amber-700"}`}
          >
            {isAtLimit
              ? `You've reached your ${plan} plan limit. Upgrade to ${nextPlan} to continue growing.`
              : `You're approaching your ${plan} plan limit. Consider upgrading soon.`}
          </p>
        </div>

        {showButton && (
          <Link
            href={`/dashboard/settings?tab=subscription&feature=${feature}`}
          >
            <Button
              size="sm"
              variant={isAtLimit ? "destructive" : "outline"}
              className="ml-4"
            >
              Upgrade Plan
            </Button>
          </Link>
        )}
      </AlertDescription>
    </Alert>
  );
}

export function SubscriberLimitWarning({
  artist,
  currentCount,
  className = "",
  showButton = true,
}: Omit<LimitWarningProps, "type">) {
  return (
    <LimitWarning
      artist={artist}
      type="subscribers"
      currentCount={currentCount}
      className={className}
      showButton={showButton}
    />
  );
}

export function EmailLimitWarning({
  artist,
  currentCount,
  className = "",
  showButton = true,
}: Omit<LimitWarningProps, "type">) {
  return (
    <LimitWarning
      artist={artist}
      type="emails"
      currentCount={currentCount}
      className={className}
      showButton={showButton}
    />
  );
}
