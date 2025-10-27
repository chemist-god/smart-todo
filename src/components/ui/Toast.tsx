"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Toast {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
    clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Module-level reference to provide a non-hook toast API
let toastApiRef: Pick<ToastContextType, 'addToast'> | undefined;

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = (toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast = { ...toast, id };

        setToasts(prev => [...prev, newToast]);

        // Auto-remove toast after duration
        const duration = toast.duration || 5000;
        setTimeout(() => {
            removeToast(id);
        }, duration);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const clearToasts = () => {
        setToasts([]);
    };

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
            {children}
            <ToastContainer />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    // Keep an imperative reference available for non-hook callers
    if (!toastApiRef || toastApiRef.addToast !== context.addToast) {
        toastApiRef = { addToast: context.addToast };
    }
    return context;
}

function ToastContainer() {
    const { toasts, removeToast } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
            ))}
        </div>
    );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger animation
        setTimeout(() => setIsVisible(true), 10);
    }, []);

    const handleRemove = () => {
        setIsVisible(false);
        setTimeout(() => onRemove(toast.id), 300);
    };

    const getIcon = () => {
        switch (toast.type) {
            case 'success':
                return <CheckCircleIcon className="w-5 h-5 text-success" />;
            case 'error':
                return <ExclamationTriangleIcon className="w-5 h-5 text-destructive" />;
            case 'warning':
                return <ExclamationTriangleIcon className="w-5 h-5 text-warning" />;
            case 'info':
                return <InformationCircleIcon className="w-5 h-5 text-info" />;
        }
    };

    const getBackgroundColor = () => {
        switch (toast.type) {
            case 'success':
                return 'bg-success/10 border-success/20';
            case 'error':
                return 'bg-destructive/10 border-destructive/20';
            case 'warning':
                return 'bg-warning/10 border-warning/20';
            case 'info':
                return 'bg-info/10 border-info/20';
        }
    };

    return (
        <div
            className={`
        max-w-sm w-full bg-card rounded-lg shadow-lg border p-4 transition-all duration-300 transform
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${getBackgroundColor()}
      `}
        >
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    {getIcon()}
                </div>
                <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-foreground">
                        {toast.title}
                    </h3>
                    {toast.message && (
                        <p className="mt-1 text-sm text-muted-foreground">
                            {toast.message}
                        </p>
                    )}
                </div>
                <div className="ml-4 flex-shrink-0">
                    <button
                        onClick={handleRemove}
                        className="inline-flex text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <XMarkIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// Convenience non-hook API that safely calls into the provider
export const toast = {
    success: (title: string, message?: string, duration?: number) => {
        if (!toastApiRef) {
            console.warn('ToastProvider is not mounted; cannot show toast');
            return;
        }
        toastApiRef.addToast({ type: 'success', title, message, duration });
    },
    error: (title: string, message?: string, duration?: number) => {
        if (!toastApiRef) {
            console.warn('ToastProvider is not mounted; cannot show toast');
            return;
        }
        toastApiRef.addToast({ type: 'error', title, message, duration });
    },
    warning: (title: string, message?: string, duration?: number) => {
        if (!toastApiRef) {
            console.warn('ToastProvider is not mounted; cannot show toast');
            return;
        }
        toastApiRef.addToast({ type: 'warning', title, message, duration });
    },
    info: (title: string, message?: string, duration?: number) => {
        if (!toastApiRef) {
            console.warn('ToastProvider is not mounted; cannot show toast');
            return;
        }
        toastApiRef.addToast({ type: 'info', title, message, duration });
    },
};
