"use client";

import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Bell, FileText } from 'lucide-react';
import { Notification } from '@/lib/types';

interface NotificationToastProps {
  notification: Notification;
  onClose: () => void;
  duration?: number;
}

export function NotificationToast({ notification, onClose, duration = 5000 }: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (notification.type) {
      case 'import_completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'import_failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'campaign_sent':
        return <FileText className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getBorderColor = () => {
    switch (notification.type) {
      case 'import_completed':
        return 'border-l-green-500';
      case 'import_failed':
        return 'border-l-red-500';
      case 'campaign_sent':
        return 'border-l-blue-500';
      default:
        return 'border-l-gray-500';
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full bg-white border-l-4 ${getBorderColor()} shadow-lg rounded-lg transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {notification.title}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {notification.message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}