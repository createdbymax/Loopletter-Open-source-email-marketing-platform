"use client";
import { SubscriptionPlan } from "@/lib/subscription";
import { generateFooterHtml } from "./loopletter-footer";
interface EmailWithFooterProps {
    htmlContent: string;
    subscriptionPlan: SubscriptionPlan;
}
export function addFooterToEmail(htmlContent: string, subscriptionPlan: SubscriptionPlan): string {
    if (subscriptionPlan !== "starter") {
        return htmlContent;
    }
    if (htmlContent.includes('<div class="container">')) {
        return htmlContent.replace("</div>\n</body>", `${generateFooterHtml(subscriptionPlan)}\n</div>\n</body>`);
    }
    else {
        return htmlContent.replace("</body>", `${generateFooterHtml(subscriptionPlan)}\n</body>`);
    }
}
