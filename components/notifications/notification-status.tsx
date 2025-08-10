"use client";

import { useNotifications } from '@/hooks/use-notifications';
import { Badge } from '@/components/ui/badge';
import { Bell, BellRing } from 'lucide-react';

interface NotificationStatusProps {
  showText?: boolean;
  className?: string;
}

export function NotificationStatus({ showText = false, className = "" }: NotificationStatusProps) {
  const { unreadCount, loading } = useNotifications();

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Bell className="h-4 w-4 text-gray-400" />
        {showText && <span className="text-sm text-gray-500">Loading...</span>}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {unreadCount > 0 ? (
        <>
          <BellRing className="h-4 w-4 text-blue-500" />
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {unreadCount} unread
          </Badge>
          {showText && (
            <span className="text-sm text-gray-600">
              You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </span>
          )}
        </>
      ) : (
        <>
          <Bell className="h-4 w-4 text-gray-400" />
          {showText && (
            <span className="text-sm text-gray-500">All caught up!</span>
          )}
        </>
      )}
    </div>
  );
}