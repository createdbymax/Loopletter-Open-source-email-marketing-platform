import { Notification } from './types';

/**
 * Utility functions for notification management
 */

export function getNotificationIcon(type: string) {
  const iconMap = {
    import_completed: '✅',
    import_failed: '❌',
    campaign_sent: '📧',
    system_alert: '🔔',
  };
  return iconMap[type as keyof typeof iconMap] || '🔔';
}

export function getNotificationColor(type: string) {
  const colorMap = {
    import_completed: 'green',
    import_failed: 'red',
    campaign_sent: 'blue',
    system_alert: 'yellow',
  };
  return colorMap[type as keyof typeof colorMap] || 'gray';
}

export function formatNotificationTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
  return date.toLocaleDateString();
}

export function getNotificationActionUrl(notification: Notification): string | null {
  switch (notification.type) {
    case 'import_completed':
    case 'import_failed':
      return '/dashboard/fans';
    case 'campaign_sent':
      return '/dashboard/campaigns';
    default:
      return null;
  }
}

export function getNotificationActionText(notification: Notification): string | null {
  switch (notification.type) {
    case 'import_completed':
      return 'View Fans';
    case 'import_failed':
      return 'Try Again';
    case 'campaign_sent':
      return 'View Campaign';
    default:
      return null;
  }
}

export function shouldAutoMarkAsRead(notification: Notification): boolean {
  // Some notifications should be marked as read automatically when viewed
  // Others might require explicit user action
  return ['import_completed', 'campaign_sent', 'system_alert'].includes(notification.type);
}

export function getNotificationPriority(notification: Notification): 'high' | 'medium' | 'low' {
  switch (notification.type) {
    case 'import_failed':
      return 'high';
    case 'import_completed':
    case 'campaign_sent':
      return 'medium';
    default:
      return 'low';
  }
}

export function groupNotificationsByDate(notifications: Notification[]): Record<string, Notification[]> {
  const groups: Record<string, Notification[]> = {};
  
  notifications.forEach(notification => {
    const date = new Date(notification.created_at);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let groupKey: string;
    
    if (date.toDateString() === today.toDateString()) {
      groupKey = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupKey = 'Yesterday';
    } else {
      groupKey = date.toLocaleDateString();
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(notification);
  });
  
  return groups;
}