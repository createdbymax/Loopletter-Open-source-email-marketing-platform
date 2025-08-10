import { createClient } from '@supabase/supabase-js';
import { Notification } from './types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function createNotification(
  artistId: string,
  type: Notification['type'],
  title: string,
  message: string,
  data?: Record<string, any>,
  expiresInDays?: number
): Promise<string> {
  const expiresAt = expiresInDays 
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
    : null;

  const { data: notification, error } = await supabase
    .from('notifications')
    .insert({
      artist_id: artistId,
      type,
      title,
      message,
      data,
      expires_at: expiresAt
    })
    .select('id')
    .single();

  if (error) throw error;
  return notification.id;
}

export async function getNotifications(
  artistId: string,
  limit: number = 50,
  unreadOnly: boolean = false
): Promise<Notification[]> {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('artist_id', artistId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (unreadOnly) {
    query = query.eq('read', false);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function markNotificationAsRead(
  notificationId: string,
  artistId: string
): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .eq('artist_id', artistId);

  if (error) throw error;
}

export async function markAllNotificationsAsRead(artistId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('artist_id', artistId)
    .eq('read', false);

  if (error) throw error;
}

export async function getUnreadNotificationCount(artistId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('artist_id', artistId)
    .eq('read', false);

  if (error) throw error;
  return count || 0;
}