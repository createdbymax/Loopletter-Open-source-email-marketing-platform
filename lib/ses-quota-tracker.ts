import { supabase } from './supabase';

interface QuotaRecord {
  date: string;
  emails_sent: number;
  created_at: string;
  updated_at: string;
}

export class SESQuotaTracker {
  private static instance: SESQuotaTracker;
  private todayCount = 0;
  private lastLoadDate = '';

  private constructor() {}

  static getInstance(): SESQuotaTracker {
    if (!SESQuotaTracker.instance) {
      SESQuotaTracker.instance = new SESQuotaTracker();
    }
    return SESQuotaTracker.instance;
  }

  async loadTodayCount(): Promise<number> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // If we already loaded today's count, return cached value
    if (this.lastLoadDate === today) {
      return this.todayCount;
    }

    try {
      const { data, error } = await supabase
        .from('ses_quota_tracking')
        .select('emails_sent')
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error loading SES quota:', error);
        return 0;
      }

      this.todayCount = data?.emails_sent || 0;
      this.lastLoadDate = today;
      return this.todayCount;
    } catch (error) {
      console.error('Error loading SES quota:', error);
      return 0;
    }
  }

  async incrementCount(count = 1): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      // First, try to update existing record
      const { data, error } = await supabase
        .from('ses_quota_tracking')
        .update({ 
          emails_sent: this.todayCount + count,
          updated_at: new Date().toISOString()
        })
        .eq('date', today)
        .select();

      if (error || !data || data.length === 0) {
        // If update failed (no existing record), insert new record
        await supabase
          .from('ses_quota_tracking')
          .insert({
            date: today,
            emails_sent: count,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }

      this.todayCount += count;
    } catch (error) {
      console.error('Error updating SES quota:', error);
      // Still increment local count even if DB update fails
      this.todayCount += count;
    }
  }

  getTodayCount(): number {
    return this.todayCount;
  }

  async getRemainingQuota(maxDailyQuota: number): Promise<number> {
    const todayCount = await this.loadTodayCount();
    return Math.max(0, maxDailyQuota - todayCount);
  }
}

export const sesQuotaTracker = SESQuotaTracker.getInstance();