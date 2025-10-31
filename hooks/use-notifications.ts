"use client";
import { useState, useEffect, useCallback } from 'react';
import { Notification } from '@/lib/types';
export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const fetchNotifications = useCallback(async (limit: number = 50, unreadOnly: boolean = false) => {
        try {
            const response = await fetch(`/api/notifications?limit=${limit}&unread_only=${unreadOnly}`);
            if (response.ok) {
                const data = await response.json();
                setNotifications(data.notifications);
                setUnreadCount(data.unread_count);
            }
        }
        catch (error) {
            console.error('Error fetching notifications:', error);
        }
        finally {
            setLoading(false);
        }
    }, []);
    const markAsRead = useCallback(async (notificationId: string) => {
        try {
            const response = await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'POST',
            });
            if (response.ok) {
                setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        }
        catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }, []);
    const markAllAsRead = useCallback(async () => {
        try {
            const response = await fetch('/api/notifications/mark-all-read', {
                method: 'POST',
            });
            if (response.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                setUnreadCount(0);
            }
        }
        catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }, []);
    const markAsViewed = useCallback(async (notificationIds: string[]) => {
        try {
            const response = await fetch('/api/notifications/mark-viewed', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ notification_ids: notificationIds }),
            });
            if (response.ok) {
                setNotifications(prev => prev.map(n => notificationIds.includes(n.id) ? { ...n, read: true } : n));
                setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
            }
        }
        catch (error) {
            console.error('Error marking notifications as viewed:', error);
        }
    }, []);
    const refresh = useCallback(() => {
        fetchNotifications();
    }, [fetchNotifications]);
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(() => {
            fetchNotifications();
        }, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);
    return {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        markAsViewed,
        refresh,
        fetchNotifications
    };
}
