import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function cleanupExpiredNotifications() {
  try {
    console.log('Starting notification cleanup...');
    
    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select('id');

    if (error) {
      throw error;
    }

    console.log(`Cleaned up ${data?.length || 0} expired notifications`);
    
    // Also clean up old read notifications (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: oldData, error: oldError } = await supabase
      .from('notifications')
      .delete()
      .eq('read', true)
      .lt('created_at', thirtyDaysAgo.toISOString())
      .select('id');

    if (oldError) {
      throw oldError;
    }

    console.log(`Cleaned up ${oldData?.length || 0} old read notifications`);
    console.log('Notification cleanup completed successfully');
    
  } catch (error) {
    console.error('Error during notification cleanup:', error);
    process.exit(1);
  }
}

// Run cleanup if this script is executed directly
if (require.main === module) {
  cleanupExpiredNotifications();
}

export { cleanupExpiredNotifications };