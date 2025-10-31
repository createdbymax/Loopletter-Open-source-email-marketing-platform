"use client";
import { SubscriptionPlan } from "@/lib/subscription";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
interface FooterPreviewProps {
    subscriptionPlan: SubscriptionPlan;
}
export function FooterPreview({ subscriptionPlan }: FooterPreviewProps) {
    if (subscriptionPlan !== "starter") {
        return null;
    }
    return (<Alert className="mt-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
      <div className="flex items-center">
        <Info className="h-4 w-4 text-blue-500 mr-2"/>
        <AlertDescription className="text-sm text-blue-700 dark:text-blue-400">
          A &quot;Created and sent with Loopletter&quot; footer will be added to your
          email. Upgrade to remove this branding.
        </AlertDescription>
      </div>
    </Alert>);
}
