"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  FileText,
} from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    markAsViewed,
    fetchNotifications,
  } = useNotifications();

  // Fetch recent unread notifications when dropdown opens
  useEffect(() => {
    if (open) {
      fetchNotifications(10, true); // true = unread only
    }
  }, [open, fetchNotifications]);

  // Auto-mark notifications as read when dropdown is opened and viewed
  useEffect(() => {
    if (open && notifications.length > 0) {
      // Since we're only showing unread notifications, all visible ones are unread
      const visibleUnreadNotifications = notifications.filter(n => !n.read);
      if (visibleUnreadNotifications.length > 0) {
        // Mark notifications as viewed after a short delay (user has "seen" them)
        const timer = setTimeout(() => {
          const unreadIds = visibleUnreadNotifications.map(n => n.id);
          markAsViewed(unreadIds);
        }, 3000); // 3 second delay to ensure user has seen them

        return () => clearTimeout(timer);
      }
    }
  }, [open, notifications, markAsViewed]);

  // Show bubble animation when there are new unread notifications
  useEffect(() => {
    if (unreadCount > 0) {
      setShowBubble(true);
      const timer = setTimeout(() => setShowBubble(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "import_completed":
        return <Check className="h-4 w-4 text-green-500" />;
      case "import_failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "campaign_sent":
        return <FileText className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleNotificationClick = (notification: any) => {
    // Close the dropdown
    setOpen(false);
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'import_completed':
      case 'import_failed':
        // Navigate to fans page to see import results
        window.location.href = '/dashboard/fans';
        break;
      case 'campaign_sent':
        // Navigate to campaigns page
        window.location.href = '/dashboard/campaigns';
        break;
      default:
        // For system alerts or other types, just close the dropdown
        break;
    }
  };

  return (
    <div className="relative">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`relative h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 ${className}`}
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs font-medium"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>

        {/* Notification Bubble */}
        {showBubble && unreadCount > 0 && (
          <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-lg animate-bounce z-50">
            {unreadCount} new
          </div>
        )}
        <DropdownMenuContent align="end" side="right" className="w-80">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Unread Notifications</span>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-auto p-1 text-xs"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Loading notifications...
            </div>
          ) : notifications.filter(n => !n.read).length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              <div className="flex flex-col items-center gap-2">
                <Bell className="h-8 w-8 text-gray-300" />
                <p>All caught up!</p>
                <p className="text-xs">No unread notifications</p>
              </div>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {notifications.filter(n => !n.read).map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex items-start gap-3 p-3 cursor-pointer transition-colors hover:bg-gray-50"
                  onClick={() => {
                    // Always mark as read when clicked
                    if (!notification.read) {
                      markAsRead(notification.id);
                    }
                    
                    // Handle navigation based on notification type
                    handleNotificationClick(notification);
                  }}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate text-gray-900">
                        {notification.title}
                      </p>
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center mt-2 text-xs text-gray-400">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTimeAgo(notification.created_at)}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}

          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a
                href="/dashboard/notifications"
                className="text-center text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                View all notifications
              </a>
            </DropdownMenuItem>
          </>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
