import { supabase } from '../lib/supabase';

async function updateSubscription() {
  try {
    // Update the artist record
    const { data: artist, error: artistError } = await supabase
      .from('artists')
      .update({
        subscription_plan: 'independent',
        subscription_current_period_end: '2025-08-16T02:01:52.064Z',
      })
      .eq('id', '7c4028fd-da9c-4baa-bc72-211fb72d9885')
      .select();
    
    if (artistError) {
      console.error('Error updating artist:', artistError);
      return;
    }
    
    console.log('Artist updated successfully:', artist);
    
    // Update the subscription record
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .update({
        plan: 'independent',
      })
      .eq('artist_id', '7c4028fd-da9c-4baa-bc72-211fb72d9885')
      .select();
    
    if (subscriptionError) {
      console.error('Error updating subscription:', subscriptionError);
      return;
    }
    
    console.log('Subscription updated successfully:', subscription);
  } catch (error) {
    console.error('Error:', error);
  }
}

updateSubscription();