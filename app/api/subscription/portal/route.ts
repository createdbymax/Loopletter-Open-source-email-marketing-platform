import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { getOrCreateArtistByClerkId } from '@/lib/db';
import Stripe from 'stripe';

// Initialize Stripe directly in this file for testing
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as Stripe.LatestApiVersion,
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { returnUrl } = await req.json();
    console.log('Creating portal session with returnUrl:', returnUrl);
    
    // Get artist
    const artist = await getOrCreateArtistByClerkId(
      userId,
      '', // Email will be fetched from Clerk
      '' // Name will be fetched from Clerk
    );
    
    console.log('Artist details:', {
      hasSubscriptionCustomerId: !!artist.subscription?.stripe_customer_id,
      customerId: artist.subscription?.stripe_customer_id,
      subscriptionPlan: artist.subscription?.plan
    });
    
    // Check if artist has a Stripe customer ID
    if (!artist.subscription?.stripe_customer_id) {
      console.log('No Stripe customer ID found for artist');
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 400 }
      );
    }
    
    const customerId = artist.subscription?.stripe_customer_id;
    const finalReturnUrl = returnUrl || `${req.headers.get('origin')}/dashboard/settings?tab=subscription`;
    
    // For development environment, create a mock session if needed
    if (process.env.NODE_ENV !== 'production') {
      try {
        // First, check if the customer exists in Stripe
        try {
          await stripe.customers.retrieve(customerId);
          console.log('Customer exists in Stripe:', customerId);
        } catch {
          console.log('Customer does not exist in Stripe, creating mock session');
          // Return a mock session URL for development
          return NextResponse.json({
            url: finalReturnUrl + '?mock=true',
          });
        }
      } catch (stripeError) {
        console.error('Error checking customer:', stripeError);
      }
    }
    
    try {
      // Try direct Stripe API call
      console.log('Creating portal session with customer ID:', customerId);
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: finalReturnUrl,
      });
      
      console.log('Portal session created successfully:', session.url);
      return NextResponse.json({
        url: session.url,
      });
    } catch (stripeError) {
      console.error('Direct Stripe API error:', stripeError);
      
      // If we're in development and get an error, return a mock URL
      if (process.env.NODE_ENV !== 'production') {
        console.log('Returning mock URL for development');
        return NextResponse.json({
          url: finalReturnUrl + '?mock=true',
        });
      }
      
      throw stripeError;
    }
  } catch (error) {
    console.error('Error creating customer portal session:', error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { error: 'Failed to create customer portal session', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}