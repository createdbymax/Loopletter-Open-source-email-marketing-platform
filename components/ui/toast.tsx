"use client";
import { useState, useEffect } from 'react';
import { CheckCircle, X, AlertCircle, Info } from 'lucide-react';
export interface Toast {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    description?: string;
    duration?: number;
}
interface ToastProps {
    toast: Toast;
    onRemove: (id: string) => void;
}
function ToastComponent({ toast, onRemove }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onRemove(toast.id);
        }, toast.duration || 5000);
        return () => clearTimeout(timer);
    }, [toast.id, toast.duration, onRemove]);
    const icons = {
        success: CheckCircle,
        error: AlertCircle,
        info: Info,
        warning: AlertCircle,
    };
    const colors = {
        success: 'bg-green-500 border-green-600',
        error: 'bg-red-500 border-red-600',
        info: 'bg-blue-500 border-blue-600',
        warning: 'bg-yellow-500 border-yellow-600',
    };
    const Icon = icons[toast.type];
    return (<div className={`${colors[toast.type]} text-white px-6 py-4 rounded-lg shadow-lg border flex items-start gap-3 min-w-[300px] max-w-[500px]`}>
      <Icon className="w-5 h-5 mt-0.5 flex-shrink-0"/>
      <div className="flex-1">
        <div className="font-medium">{toast.title}</div>
        {toast.description && (<div className="text-sm opacity-90 mt-1">{toast.description}</div>)}
      </div>
      <button onClick={() => onRemove(toast.id)} className="text-white/80 hover:text-white transition-colors">
        <X className="w-4 h-4"/>
      </button>
    </div>);
}
interface ToastContainerProps {
    toasts: Toast[];
    onRemove: (id: string) => void;
}
export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
    return (<div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (<ToastComponent key={toast.id} toast={toast} onRemove={onRemove}/>))}
    </div>);
}
export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const addToast = (toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { ...toast, id }]);
    };
    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };
    const success = (title: string, description?: string) => {
        addToast({ type: 'success', title, description });
    };
    const error = (title: string, description?: string) => {
        addToast({ type: 'error', title, description });
    };
    const info = (title: string, description?: string) => {
        addToast({ type: 'info', title, description });
    };
    const warning = (title: string, description?: string) => {
        addToast({ type: 'warning', title, description });
    };
    return {
        toasts,
        addToast,
        removeToast,
        success,
        error,
        info,
        warning,
    };
}
