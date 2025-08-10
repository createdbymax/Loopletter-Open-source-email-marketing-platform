"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { NotificationToast } from './notification-toast';
import { Notification } from '@/lib/types';

interface NotificationContextType {
  showToast: (notification: Notification) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotificationToast() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationToast must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [toasts, setToasts] = useState<(Notification & { id: string })[]>([]);

  const showToast = useCallback((notification: Notification) => {
    const toastId = Math.random().toString(36).substr(2, 9);
    const toast = { ...notification, id: toastId };
    
    setToasts(prev => [...prev, toast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-0 right-0 z-50 p-4 space-y-2">
        {toasts.map((toast) => (
          <NotificationToast
            key={toast.id}
            notification={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}