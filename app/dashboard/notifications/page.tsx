"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Clock, 
  AlertCircle, 
  FileText, 
  Trash2
} from 'lucide-react';
import { useNotifications } from '@/hooks/use-notifications';

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const { notifications, loading, markAsRead, markAllAsRead, markAsViewed, fetchNotifications } = useNotifications();

  useEffect(() => {
    fetchNotifications(100, filter === 'unread');
  }, [filter, fetchNotifications]);

  // Auto-mark unread notifications as read when they're viewed on this page
  useEffect(() => {
    if (notifications.length > 0 && filter === 'all') {
      const unreadNotifications = notifications.filter(n => !n.read);
      if (unreadNotifications.length > 0) {
        // Mark as viewed after user has had time to see them (5 seconds)
        const timer = setTimeout(() => {
          const unreadIds = unreadNotifications.map(n => n.id);
          markAsViewed(unreadIds);
        }, 5000);

        return () => clearTimeout(timer);
      }
    }
  }, [notifications, filter, markAsViewed]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'import_completed':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'import_failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'campaign_sent':
        return <FileText className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)} days ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Notifications</h1>
          <p className="text-gray-600">
            Stay updated with your import progress and system alerts
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unread')}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </Button>
          
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </h3>
            <p className="text-gray-500">
              {filter === 'unread' 
                ? 'All caught up! Check back later for new updates.'
                : 'You\'ll see notifications here when you import fans or complete other actions.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`transition-colors ${
                !notification.read ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-medium ${
                        !notification.read ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.title}
                      </h3>
                      
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            New
                          </Badge>
                        )}
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatTimeAgo(notification.created_at)}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-3">
                      {notification.message}
                    </p>
                    
                    {notification.data && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        {notification.type === 'import_completed' && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-green-600">Imported:</span>
                              <p className="text-gray-900">{notification.data.imported}</p>
                            </div>
                            {notification.data.failed > 0 && (
                              <div>
                                <span className="font-medium text-red-600">Failed:</span>
                                <p className="text-gray-900">{notification.data.failed}</p>
                              </div>
                            )}
                            {notification.data.skipped > 0 && (
                              <div>
                                <span className="font-medium text-yellow-600">Skipped:</span>
                                <p className="text-gray-900">{notification.data.skipped}</p>
                              </div>
                            )}
                            <div>
                              <span className="font-medium text-gray-600">File:</span>
                              <p className="text-gray-900 truncate">{notification.data.filename}</p>
                            </div>
                          </div>
                        )}
                        
                        {notification.type === 'import_failed' && (
                          <div className="text-sm">
                            <span className="font-medium text-red-600">Error:</span>
                            <p className="text-gray-900 mt-1">{notification.data.error_message}</p>
                            <p className="text-gray-600 mt-2">File: {notification.data.filename}</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Mark as read
                        </Button>
                      )}
                      
                      {notification.type === 'import_completed' && (
                        <Button variant="outline" size="sm" asChild>
                          <a href="/dashboard/fans">View Fans</a>
                        </Button>
                      )}
                      
                      {notification.type === 'import_failed' && (
                        <Button variant="outline" size="sm" asChild>
                          <a href="/dashboard/fans/import">Try Again</a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}