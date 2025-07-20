'use client';

import { SubscriptionPlan } from '@/lib/subscription';
import { generateFooterHtml } from './loopletter-footer';

interface EmailWithFooterProps {
  htmlContent: string;
  subscriptionPlan: SubscriptionPlan;
}

export function addFooterToEmail(htmlContent: string, subscriptionPlan: SubscriptionPlan): string {
  if (subscriptionPlan !== 'starter') {
    return htmlContent;
  }

  // Check if the HTML content has a container div
  if (htmlContent.includes('<div class="container">')) {
    // Insert the footer before the closing container div
    return htmlContent.replace(
      '</div>\n</body>',
      `${generateFooterHtml(subscriptionPlan)}\n</div>\n</body>`
    );
  } else {
    // If there's no container div, add the footer before the closing body tag
    return htmlContent.replace(
      '</body>',
      `${generateFooterHtml(subscriptionPlan)}\n</body>`
    );
  }
}