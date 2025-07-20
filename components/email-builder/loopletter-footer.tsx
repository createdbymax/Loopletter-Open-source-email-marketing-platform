'use client';

import { SubscriptionPlan } from '@/lib/subscription';

interface LoopLetterFooterProps {
  subscriptionPlan: SubscriptionPlan;
}

export function LoopLetterFooter({ subscriptionPlan }: LoopLetterFooterProps) {
  // Only show the footer for the starter plan
  if (subscriptionPlan !== 'starter') {
    return null;
  }

  return (
    <>
      <hr style={{ 
        border: 'none', 
        borderTop: '1px solid #eaeaea', 
        margin: '20px 0' 
      }} />
      <p style={{ 
        fontSize: '12px', 
        color: '#666', 
        textAlign: 'center',
        margin: '10px 0'
      }}>
        Created and sent with <a href="https://loopletter.co" style={{ color: '#2563eb', textDecoration: 'none' }}>Loopletter</a>
      </p>
    </>
  );
}

// Function to generate the footer HTML
export function generateFooterHtml(subscriptionPlan: SubscriptionPlan): string {
  if (subscriptionPlan !== 'starter') {
    return '';
  }

  return `
    <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
    <p style="font-size: 12px; color: #666; text-align: center; margin: 10px 0;">
      Created and sent with <a href="https://loopletter.co" style="color: #2563eb; text-decoration: none;">Loopletter</a>
    </p>
  `;
}