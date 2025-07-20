import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { getOrCreateArtistByClerkId } from '@/lib/db';
import { createCheckoutSession, STRIPE_PRICE_IDS } from '@/lib/stripe.server';

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan, billingInterval, successUrl, cancelUrl } = await req.json();

    // Determine the price ID based on plan and billing interval
    let priceId;
    if (plan === 'independent') {
      priceId = billingInterval === 'year'
        ? STRIPE_PRICE_IDS.independent_annual
        : STRIPE_PRICE_IDS.independent_monthly;
    } else if (plan === 'independent_plus') {
      priceId = STRIPE_PRICE_IDS.independent_plus;
    } else if (plan === 'label') {
      priceId = billingInterval === 'year'
        ? STRIPE_PRICE_IDS.label_annual
        : STRIPE_PRICE_IDS.label_monthly;
    } else {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID not configured for selected plan' },
        { status: 400 }
      );
    }

    // Get artist
    const artist = await getOrCreateArtistByClerkId(
      userId,
      '', // Email will be fetched from Clerk
      '' // Name will be fetched from Clerk
    );

    // Create checkout session
    const session = await createCheckoutSession(
      artist,
      priceId,
      successUrl || `${req.headers.get('origin')}/dashboard/settings?tab=subscription&success=true`,
      cancelUrl || `${req.headers.get('origin')}/dashboard/settings?tab=subscription&canceled=true`
    );

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}